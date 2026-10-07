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
  obra: { select: { id: true, codigo: true, status: true } },
  servicoMarketing: { select: { id: true, titulo: true } },
  _count: { select: { atividades: true } },
} satisfies Prisma.OrcamentoInclude;

const includeDetalhe = {
  atendimento: { include: { user: true } },
  endereco: true,
  ficha: true,
  servicoMarketing: true,
  obra: true,
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

  async listarDoUsuario(userId: number) {
    return this.prisma.orcamento.findMany({
      where: { userId },
      include: includeResumo,
      orderBy: { createdAt: 'desc' },
    });
  }

  async detalharParaUsuario(userId: number, id: number) {
    const dono = await this.prisma.orcamento.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!dono) throw new AppError(404, 'Orçamento não encontrado');
    return this.detalhar(id);
  }

  async criar(dto: CriarOrcamentoDto, userId: number) {
    const atendimento = await this.prisma.atendimento.findUnique({
      where: { id: dto.atendimentoId },
      select: { userId: true, status: true, visitaSolicitada: true },
    });
    if (!atendimento) throw new AppError(404, 'Atendimento não encontrado');

    if (atendimento.status !== 'ORCAMENTAMENTO') {
      throw new AppError(
        400,
        'Atendimento deve estar em ORCAMENTAMENTO para gerar orçamento',
      );
    }

    if (atendimento.visitaSolicitada) {
      if (!dto.agendamentoId || !dto.visitaId) {
        throw new AppError(
          400,
          'Informe agendamentoId e visitaId da visita realizada',
        );
      }
      const visita = await this.prisma.visitaTecnica.findUnique({
        where: { id: dto.visitaId },
        select: { atendimentoId: true, agendamentoId: true },
      });
      if (
        !visita ||
        visita.atendimentoId !== dto.atendimentoId ||
        visita.agendamentoId !== dto.agendamentoId
      ) {
        throw new AppError(
          400,
          'Visita não pertence ao atendimento/agendamento informado',
        );
      }
    } else if (dto.agendamentoId != null || dto.visitaId != null) {
      throw new AppError(
        400,
        'Atendimento não tem visita solicitada para vincular agendamento/visita',
      );
    }

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
        agendamentoId: dto.agendamentoId ?? null,
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

  private async resolverCatalogoAtividadeId(
    subServicoIds: number[],
  ): Promise<Map<number, string>> {
    if (subServicoIds.length === 0) return new Map();
    const encontrados = await this.prisma.catalogoAtividade.findMany({
      where: { subServicoId: { in: subServicoIds }, ativo: true },
      orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
      select: { id: true, subServicoId: true },
    });
    const mapa = new Map<number, string>();
    for (const c of encontrados) {
      if (c.subServicoId != null && !mapa.has(c.subServicoId)) {
        mapa.set(c.subServicoId, c.id);
      }
    }
    return mapa;
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

    const subIdsSemCatalogo = [
      ...new Set(
        dto.atividades
          .filter((a) => !a.catalogoAtividadeId)
          .map((a) => a.subServicoId),
      ),
    ];
    const catalogoPorSub =
      await this.resolverCatalogoAtividadeId(subIdsSemCatalogo);
    const catalogosResolvidos = dto.atividades.map((a) => {
      if (a.catalogoAtividadeId) return a.catalogoAtividadeId;
      const id = catalogoPorSub.get(a.subServicoId);
      if (!id) {
        throw new AppError(400, 'Sub-serviço sem atividade de catálogo');
      }
      return id;
    });

    let ordem = 0;
    const linhasTotais: number[] = [];
    const linhas = dto.atividades.flatMap((a, idx) =>
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
          catalogoAtividadeId: catalogosResolvidos[idx],
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
        obra: { select: { id: true } },
        atividades: { orderBy: { ordem: 'asc' }, include: { materiais: true } },
      },
    });
    if (!orcamento) throw new AppError(404, 'Orçamento não encontrado');
    if (orcamento.status === 'APROVADO' || orcamento.obra)
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

      const obra = await this.criarObraComRetry(tx, {
        orcamentoId: orcamento.id,
        userId: orcamento.userId,
        atendimentoId: orcamento.atendimentoId,
        enderecoId: orcamento.enderecoId,
        urgencia: orcamento.urgencia,
        valorContratado: orcamento.valorTotal,
        observacoes: orcamento.observacoes,
        aprovadoPorId: userId,
        aprovadoEm: new Date(),
      });

      const etapasCanonicas = await tx.etapa.findMany({
        orderBy: { ordem: 'asc' },
      });
      const obraEtapaIdPorEtapaId = new Map<number, number>();
      for (const etapa of etapasCanonicas) {
        const obraEtapa = await tx.obraEtapa.create({
          data: {
            obraId: obra.id,
            etapaId: etapa.id,
            nome: etapa.nome,
            ordem: etapa.ordem,
          },
        });
        obraEtapaIdPorEtapaId.set(etapa.id, obraEtapa.id);
      }

      for (const atividade of orcamento.atividades) {
        const obraEtapaId = obraEtapaIdPorEtapaId.get(atividade.etapaId);
        if (obraEtapaId === undefined) continue;
        const criada = await tx.obraAtividade.create({
          data: {
            obraEtapaId,
            subServicoId: atividade.subServicoId,
            catalogoAtividadeId: atividade.catalogoAtividadeId,
            descricao: atividade.descricao,
            verboId: atividade.verboId,
            objetoId: atividade.objetoId,
            localId: atividade.localId ?? null,
            caracteristicaId: atividade.caracteristicaId ?? null,
            unidadeId: atividade.unidadeId ?? null,
            quantidade: atividade.quantidade ?? null,
            areaM2: atividade.areaM2 ?? null,
            moValorHora: atividade.moValorHora ?? null,
            moPessoas: atividade.moPessoas ?? null,
            moHoras: atividade.moHoras ?? null,
            moValorTotal: atividade.moValorTotal ?? 0,
            materiaisValor: atividade.materiaisValor ?? 0,
            linhaValorTotal: atividade.linhaValorTotal ?? 0,
            ordem: atividade.ordem,
            aditivoId: null,
            cancelada: false,
          },
        });
        for (const material of atividade.materiais ?? []) {
          await tx.obraAtividadeMaterial.create({
            data: {
              obraAtividadeId: criada.id,
              materialId: material.materialId,
              quantidade: material.quantidade,
              custoUnitario: material.custoUnitario ?? 0,
            },
          });
        }
      }

      const orcamentoAtualizado = await tx.orcamento.findUnique({
        where: { id },
        select: { id: true, status: true },
      });
      const obraFinal = await tx.obra.findUnique({
        where: { id: obra.id },
      });
      return { orcamento: orcamentoAtualizado, obra: obraFinal };
    });
  }

  private async criarObraComRetry(
    tx: Prisma.TransactionClient,
    dados: Omit<Prisma.ObraUncheckedCreateInput, 'codigo'>,
  ) {
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const codigo = await this.gerarCodigoObra(tx);
      try {
        return await tx.obra.create({
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
    throw new AppError(409, 'Não foi possível gerar o código da obra');
  }

  private async gerarCodigoObra(tx: Prisma.TransactionClient) {
    const existentes = await tx.obra.findMany({
      where: { codigo: { startsWith: 'OBR-' } },
      orderBy: { codigo: 'desc' },
      select: { codigo: true },
    });
    let max = 0;
    for (const { codigo } of existentes) {
      const m = codigo.match(/^OBR-(\d+)$/);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return `OBR-${String(max + 1).padStart(3, '0')}`;
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
