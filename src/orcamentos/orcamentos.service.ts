import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CriarOrcamentoDto } from './dto/orcamentos.dto.js';
import {
  materiaisValor,
  moValorTotal,
  round2,
  valorTotalOrcamento,
} from './orcamento-calculo.js';

const includeResumo = {
  atendimento: {
    select: {
      id: true,
      user: { select: { id: true, nome: true } },
    },
  },
  user: { select: { id: true, nome: true } },
  ordemServico: { select: { id: true, codigo: true, status: true } },
  servicoMarketing: { select: { id: true, titulo: true } },
  _count: { select: { atividades: true } },
} satisfies Prisma.OrcamentoInclude;

const includeDetalhe = {
  atendimento: { include: { user: true } },
  endereco: true,
  ficha: true,
  servicoMarketing: true,
  ordemServico: true,
  user: true,
  atividades: {
    orderBy: { ordem: 'asc' as const },
    include: { materiais: true },
  },
  _count: { select: { atividades: true } },
} satisfies Prisma.OrcamentoInclude;

@Injectable()
export class OrcamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { status?: string; q?: string }) {
    const where: Prisma.OrcamentoWhereInput = {};

    if (params?.status) {
      where.status = params.status as any;
    }

    if (params?.q) {
      where.OR = [
        { codigo: { contains: params.q } },
        { observacoes: { contains: params.q } },
        { atendimento: { user: { nome: { contains: params.q } } } },
      ];
    }

    return this.prisma.orcamento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: includeResumo,
    });
  }

  async detalhar(id: number) {
    const orcamento = await this.prisma.orcamento.findFirst({
      where: { id },
      include: includeDetalhe,
    });
    if (!orcamento) throw new AppError(404, 'Orçamento não encontrado');
    return orcamento;
  }

  async criar(dto: CriarOrcamentoDto, userId: number) {
    const atendimento = await this.prisma.atendimento.findUnique({
      where: { id: dto.atendimentoId },
      select: { userId: true },
    });
    if (!atendimento) throw new AppError(404, 'Atendimento não encontrado');

    const codigo = await this.gerarCodigo();
    const { linhas, total } = await this.montarAtividades(dto);

    const validade = dto.validade
      ? new Date(dto.validade)
      : this.validadePadrao();

    return this.prisma.orcamento.create({
      data: {
        codigo,
        atendimentoId: dto.atendimentoId,
        visitaId: dto.visitaId ?? null,
        userId: atendimento.userId,
        enderecoId: dto.enderecoId ?? null,
        servicoMarketingId: dto.servicoMarketingId ?? null,
        urgencia: dto.urgencia,
        status: 'RASCUNHO',
        areaM2: dto.areaM2 ?? null,
        valorM2: dto.valorM2 ?? null,
        valorTotal: total,
        validade,
        observacoes: dto.observacoes ?? null,
        criadoPorId: userId,
        atividades: { create: linhas },
        ...(dto.ficha ? { ficha: { create: { ...dto.ficha } } } : {}),
      },
      include: includeResumo,
    });
  }

  async atualizar(id: number, dto: CriarOrcamentoDto) {
    const orcamento = await this.prisma.orcamento.findUnique({
      where: { id },
    });
    if (!orcamento) throw new AppError(404, 'Orçamento não encontrado');
    if (orcamento.status !== 'RASCUNHO' && orcamento.status !== 'ENVIADO') {
      throw new AppError(
        409,
        `Orçamento não pode ser editado (status: ${orcamento.status})`,
      );
    }

    const atendimento = await this.prisma.atendimento.findUnique({
      where: { id: dto.atendimentoId },
      select: { userId: true },
    });
    if (!atendimento) throw new AppError(404, 'Atendimento não encontrado');

    const { linhas, total } = await this.montarAtividades(dto);

    return this.prisma.$transaction(async (tx) => {
      await tx.orcamento.update({
        where: { id },
        data: {
          atendimentoId: dto.atendimentoId,
          userId: atendimento.userId,
          visitaId: dto.visitaId ?? null,
          enderecoId: dto.enderecoId ?? null,
          servicoMarketingId: dto.servicoMarketingId ?? null,
          urgencia: dto.urgencia,
          areaM2: dto.areaM2 ?? null,
          valorM2: dto.valorM2 ?? null,
          valorTotal: total,
          observacoes: dto.observacoes ?? null,
          ...(dto.validade ? { validade: new Date(dto.validade) } : {}),
        },
      });

      if (dto.ficha !== undefined) {
        await tx.orcamentoObraFicha.upsert({
          where: { orcamentoId: id },
          update: { ...dto.ficha },
          create: { orcamentoId: id, ...dto.ficha },
        });
      }

      await tx.orcamentoAtividade.deleteMany({ where: { orcamentoId: id } });
      for (const linha of linhas) {
        await tx.orcamentoAtividade.create({
          data: { ...linha, orcamentoId: id },
        });
      }

      return tx.orcamento.findUnique({
        where: { id },
        include: includeDetalhe,
      });
    });
  }

  async remover(id: number) {
    const orcamento = await this.prisma.orcamento.findUnique({
      where: { id },
    });
    if (!orcamento) throw new AppError(404, 'Orçamento não encontrado');
    if (orcamento.status !== 'RASCUNHO')
      throw new AppError(409, 'Só é possível excluir orçamentos em rascunho');

    await this.prisma.$transaction([
      this.prisma.orcamentoObraFicha.deleteMany({
        where: { orcamentoId: id },
      }),
      this.prisma.orcamentoAtividade.deleteMany({ where: { orcamentoId: id } }),
      this.prisma.orcamento.delete({ where: { id } }),
    ]);
    return { ok: true };
  }

  private async gerarCodigo(): Promise<string> {
    const maxCode = await this.prisma.orcamento.findFirst({
      orderBy: { id: 'desc' },
      select: { codigo: true },
    });

    let nextNum = 1;
    if (maxCode) {
      const match = maxCode.codigo.match(/(\d+)$/);
      if (match) nextNum = Number(match[1]) + 1;
    }
    return `ORM-${String(nextNum).padStart(3, '0')}`;
  }

  private validadePadrao(): Date {
    const validade = new Date();
    validade.setDate(validade.getDate() + 30);
    return validade;
  }

  private async montarAtividades(dto: CriarOrcamentoDto) {
    const materialIds = [
      ...new Set(
        dto.atividades.flatMap((a) =>
          a.linhas.flatMap((l) => l.materiais.map((m) => m.materialId)),
        ),
      ),
    ];
    const materiais = materialIds.length
      ? await this.prisma.material.findMany({
          where: { id: { in: materialIds } },
          select: { id: true, custoUnitario: true },
        })
      : [];
    const custo = (materialId: number): number => {
      const m = materiais.find((x) => x.id === materialId);
      return m?.custoUnitario != null ? Number(m.custoUnitario) : 0;
    };

    let ordem = 0;
    const linhasTotais: number[] = [];
    const linhas = dto.atividades.flatMap((a) =>
      a.linhas.map((l) => {
        const mo = moValorTotal(l);
        const matsComCusto = l.materiais.map((m) => ({
          materialId: m.materialId,
          quantidade: m.quantidade,
          custoUnitario: custo(m.materialId),
        }));
        const matsValor = materiaisValor(matsComCusto);
        const totalLinha = round2(mo + matsValor);
        linhasTotais.push(totalLinha);
        return {
          etapaId: a.etapaId,
          subServicoId: a.subServicoId,
          catalogoAtividadeId: a.catalogoAtividadeId,
          descricao: l.descricao,
          verboId: l.verboId,
          objetoId: l.objetoId,
          localId: l.localId ?? null,
          caracteristicaId: l.caracteristicaId ?? null,
          unidadeId: l.unidadeId ?? null,
          quantidade: l.quantidade ?? null,
          areaM2: l.areaM2 ?? null,
          moValorHora: l.moValorHora ?? null,
          moPessoas: l.moPessoas ?? null,
          moHoras: l.moHoras ?? null,
          moValorTotal: mo,
          materiaisValor: matsValor,
          linhaValorTotal: totalLinha,
          ordem: ordem++,
          materiais: { create: matsComCusto },
        };
      }),
    );

    const total = valorTotalOrcamento({
      areaM2: dto.areaM2,
      valorM2: dto.valorM2,
      linhas: linhasTotais,
    });

    return { linhas, total };
  }

  async enviar(id: number) {
    const orcamento = await this.prisma.orcamento.findUnique({
      where: { id },
    });
    if (!orcamento) throw new AppError(404, 'Orçamento não encontrado');
    if (orcamento.status !== 'RASCUNHO')
      throw new AppError(
        409,
        'Apenas orçamentos em rascunho podem ser enviados',
      );

    return this.prisma.orcamento.update({
      where: { id },
      data: { status: 'ENVIADO' },
      include: includeResumo,
    });
  }

  async recusar(id: number, motivo: string) {
    const orcamento = await this.prisma.orcamento.findUnique({
      where: { id },
    });
    if (!orcamento) throw new AppError(404, 'Orçamento não encontrado');
    if (orcamento.status !== 'RASCUNHO' && orcamento.status !== 'ENVIADO')
      throw new AppError(
        409,
        `Orçamento não pode ser recusado (status: ${orcamento.status})`,
      );

    return this.prisma.orcamento.update({
      where: { id },
      data: { status: 'RECUSADO', motivoRejeicao: motivo },
      include: includeResumo,
    });
  }

  async aprovar(id: number, userId: number) {
    const orcamento = await this.prisma.orcamento.findUnique({
      where: { id },
      include: {
        ficha: true,
        ordemServico: { select: { id: true } },
        atividades: { orderBy: { ordem: 'asc' }, include: { materiais: true } },
      },
    });
    if (!orcamento) throw new AppError(404, 'Orçamento não encontrado');
    if (orcamento.status === 'APROVADO' || orcamento.ordemServico)
      throw new AppError(409, 'Orçamento já aprovado');
    if (orcamento.status !== 'RASCUNHO' && orcamento.status !== 'ENVIADO')
      throw new AppError(409, 'Orçamento não está pendente de aprovação');

    const pendencias: string[] = [];
    if (!orcamento.ficha) {
      pendencias.push('ficha-ausente');
    } else {
      const f = orcamento.ficha;
      if (
        (f.risco1 && !f.acao1) ||
        (f.risco2 && !f.acao2) ||
        (f.risco3 && !f.acao3)
      ) {
        pendencias.push('analise-critica-incompleta');
      }
    }
    if (orcamento.areaM2 == null || orcamento.valorM2 == null)
      pendencias.push('medicao-ausentes');
    if (pendencias.length > 0)
      throw new HttpException(
        { codigo: 'ANALISE_CRITICA', pendencias },
        HttpStatus.CONFLICT,
      );

    return this.prisma.$transaction(async (tx) => {
      await tx.orcamento.update({
        where: { id },
        data: {
          status: 'APROVADO',
          aprovadoPorId: userId,
          aprovadoEm: new Date(),
          motivoRejeicao: null,
        },
      });

      const os = await this.criarOsComRetry(tx, {
        orcamentoId: orcamento.id,
        userId: orcamento.userId,
        atendimentoId: orcamento.atendimentoId,
        enderecoId: orcamento.enderecoId,
        urgencia: orcamento.urgencia,
        valorTotal: orcamento.valorTotal,
        observacoes: orcamento.observacoes,
      });

      const etapaIds = [...new Set(orcamento.atividades.map((a) => a.etapaId))];
      const etapas = await tx.etapa.findMany({
        where: { id: { in: etapaIds } },
        orderBy: { ordem: 'asc' },
      });
      const etapaOSPorEtapaId = new Map<
        number,
        { id: number; ordem: number }
      >();
      for (const etapa of etapas) {
        const etapaOS = await tx.etapaOS.create({
          data: {
            ordemServicoId: os.id,
            etapaId: etapa.id,
            nome: etapa.nome,
            ordem: etapa.ordem,
            status: 'PENDENTE',
          },
        });
        etapaOSPorEtapaId.set(etapa.id, { id: etapaOS.id, ordem: etapa.ordem });
      }

      const grupos = new Map<string, typeof orcamento.atividades>();
      for (const atividade of orcamento.atividades) {
        const key = `${atividade.etapaId}|${atividade.subServicoId}|${atividade.catalogoAtividadeId}`;
        const grupo = grupos.get(key);
        if (grupo) grupo.push(atividade);
        else grupos.set(key, [atividade]);
      }

      const catalogoIds = [
        ...new Set(orcamento.atividades.map((a) => a.catalogoAtividadeId)),
      ];
      const catalogos =
        catalogoIds.length > 0
          ? await tx.catalogoAtividade.findMany({
              where: { id: { in: catalogoIds } },
              include: { subSteps: true, recursos: true },
            })
          : [];
      const catalogoPorId = new Map(catalogos.map((c) => [c.id, c]));

      const seqSepPorEtapa = new Map<number, number>();
      for (const grupo of grupos.values()) {
        const primeira = grupo[0];
        const etapaRef = etapaOSPorEtapaId.get(primeira.etapaId);
        if (!etapaRef)
          throw new AppError(409, 'Etapa da atividade não encontrada');

        const atividadeOS = await tx.atividadeOS.create({
          data: {
            osId: os.id,
            etapaOSId: etapaRef.id,
            catalogoAtividadeId: primeira.catalogoAtividadeId,
            status: 'PENDENTE',
          },
        });

        for (const linha of grupo) {
          await tx.atividadeOSLinha.create({
            data: {
              atividadeOSId: atividadeOS.id,
              ordem: linha.ordem,
              descricao: linha.descricao,
              verboId: linha.verboId,
              objetoId: linha.objetoId,
              localId: linha.localId ?? null,
              caracteristicaId: linha.caracteristicaId ?? null,
              unidadeId: linha.unidadeId ?? null,
              quantidade: linha.quantidade ?? null,
              areaM2: linha.areaM2 ?? null,
            },
          });
        }

        const catalogo = catalogoPorId.get(primeira.catalogoAtividadeId);
        if (!catalogo) continue;

        for (const sub of catalogo.subSteps) {
          await tx.checklistExecucao.create({
            data: {
              atividadeOSId: atividadeOS.id,
              subStepAtividadeId: sub.id,
            },
          });
        }

        for (const recurso of catalogo.recursos) {
          if (
            recurso.tipo !== 'MATERIAL' &&
            recurso.tipo !== 'EPI' &&
            recurso.tipo !== 'EQUIPAMENTO'
          )
            continue;
          const seq = (seqSepPorEtapa.get(primeira.etapaId) ?? 0) + 1;
          seqSepPorEtapa.set(primeira.etapaId, seq);
          const item: {
            quantidadeNecessaria: number;
            materialId?: number;
            epiId?: number;
            equipamentoId?: number;
          } = { quantidadeNecessaria: Number(recurso.quantidade) };
          if (recurso.tipo === 'MATERIAL')
            item.materialId = recurso.itemCatalogoId;
          else if (recurso.tipo === 'EPI') item.epiId = recurso.itemCatalogoId;
          else item.equipamentoId = recurso.itemCatalogoId;

          await tx.separacao.create({
            data: {
              codigo: `SEP-${os.id}-${etapaRef.ordem}-${seq}`,
              etapaOsId: etapaRef.id,
              osId: os.id,
              dataNecessidade: new Date(),
              equipeId: null,
              itens: { create: item },
            },
          });
        }
      }

      const materiaisPorEtapa = new Map<
        string,
        { etapaId: number; materialId: number; total: number }
      >();
      for (const atividade of orcamento.atividades) {
        for (const material of atividade.materiais) {
          const key = `${atividade.etapaId}|${material.materialId}`;
          const atual = materiaisPorEtapa.get(key);
          if (atual) atual.total += Number(material.quantidade);
          else
            materiaisPorEtapa.set(key, {
              etapaId: atividade.etapaId,
              materialId: material.materialId,
              total: Number(material.quantidade),
            });
        }
      }
      for (const material of materiaisPorEtapa.values()) {
        const etapaRef = etapaOSPorEtapaId.get(material.etapaId);
        if (!etapaRef) continue;
        await tx.etapaOSMaterial.upsert({
          where: {
            etapaOsId_materialId: {
              etapaOsId: etapaRef.id,
              materialId: material.materialId,
            },
          },
          update: { quantidadePlanejada: { increment: material.total } },
          create: {
            etapaOsId: etapaRef.id,
            materialId: material.materialId,
            quantidadePlanejada: material.total,
          },
        });
      }

      return {
        orcamento: await tx.orcamento.findUnique({
          where: { id },
          include: includeDetalhe,
        }),
        ordemServico: await tx.ordemServico.findUnique({
          where: { id: os.id },
          include: {
            etapas: {
              orderBy: { ordem: 'asc' },
              include: {
                atividadesOS: {
                  include: {
                    linhas: { orderBy: { ordem: 'asc' } },
                  },
                },
              },
            },
          },
        }),
      };
    });
  }

  private async criarOsComRetry(
    tx: Prisma.TransactionClient,
    dados: Omit<Prisma.OrdemServicoUncheckedCreateInput, 'codigo'>,
  ) {
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const codigo = await this.gerarCodigoOs(tx);
      try {
        return await tx.ordemServico.create({
          data: { ...dados, codigo },
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          const rawTarget = (e.meta as { target?: unknown } | undefined)
            ?.target;
          const target = Array.isArray(rawTarget)
            ? rawTarget.join(',')
            : String(rawTarget ?? '');
          if (target.includes('orcamentoId'))
            throw new AppError(409, 'Orçamento já aprovado');
          continue;
        }
        throw e;
      }
    }
    throw new AppError(
      409,
      'Não foi possível gerar o código da ordem de serviço',
    );
  }

  private async gerarCodigoOs(tx: Prisma.TransactionClient) {
    const existentes = await tx.ordemServico.findMany({
      where: { codigo: { startsWith: 'OS-' } },
      orderBy: { codigo: 'desc' },
      select: { codigo: true },
    });
    let max = 0;
    for (const { codigo } of existentes) {
      const m = codigo.match(/^OS-(\d+)$/);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return `OS-${String(max + 1).padStart(3, '0')}`;
  }
}
