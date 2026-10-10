import { Injectable } from '@nestjs/common';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AtualizarAtividadeObraInput,
  AtualizarEtapaInput,
  AtualizarObraInput,
  CriarAditivoInput,
  CriarAtividadeInput,
  CriarEtapaInput,
  ListarObrasQueryInput,
} from './dto/obras.dto.js';

@Injectable()
export class ObrasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListarObrasQueryInput) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.clienteId) where.userId = query.clienteId;
    if (query.busca) {
      where.OR = [
        { codigo: { contains: query.busca } },
        { observacoes: { contains: query.busca } },
        { user: { nome: { contains: query.busca } } },
      ];
    }

    const obras = await this.prisma.obra.findMany({
      where,
      include: {
        user: { select: { id: true, nome: true, email: true, telefone: true } },
        aprovadoPor: { select: { id: true, nome: true } },
        _count: { select: { aditivos: true, etapas: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { obras };
  }

  async detalhar(id: number) {
    const obra = await this.prisma.obra.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nome: true, email: true, telefone: true } },
        endereco: true,
        atendimento: true,
        aprovadoPor: { select: { id: true, nome: true } },
        orcamento: {
          select: {
            id: true,
            codigo: true,
            valorTotal: true,
            atividades: {
              orderBy: { ordem: 'asc' },
              include: { materiais: { include: { material: true } } },
            },
          },
        },
        etapas: {
          orderBy: { ordem: 'asc' },
          include: {
            atividades: {
              orderBy: { ordem: 'asc' },
              include: {
                materiais: { include: { material: true } },
                catalogoAtividade: {
                  include: {
                    recursos: true,
                  },
                },
                subServico: true,
                verbo: true,
                objeto: true,
                local: true,
                caracteristica: true,
                execucoes: {
                  orderBy: { criadoEm: 'desc' },
                  include: {
                    checklist: true,
                    separacoes: {
                      include: { itens: true },
                    },
                  },
                },
              },
            },
          },
        },
        aditivos: {
          orderBy: { createdAt: 'desc' },
          include: {
            itens: { include: { servicoItem: true, unidade: true } },
          },
        },
      },
    });

    if (!obra) throw new AppError(404, 'Obra não encontrada');
    return { obra };
  }

  async detalharParaCliente(clienteId: number, id: number) {
    const { obra } = await this.detalhar(id);
    if (obra.userId !== clienteId) {
      throw new AppError(403, 'Acesso negado a esta obra');
    }
    return { obra };
  }

  async listarDoCliente(clienteId: number) {
    return this.listar({ clienteId });
  }

  async atualizar(id: number, data: AtualizarObraInput) {
    const obra = await this.prisma.obra.findUnique({ where: { id } });
    if (!obra) throw new AppError(404, 'Obra não encontrada');

    const atualizada = await this.prisma.obra.update({
      where: { id },
      data,
    });
    return { obra: atualizada };
  }

  async concluir(id: number, userId: number) {
    const obra = await this.prisma.obra.findUnique({
      where: { id },
      include: {
        etapas: {
          include: {
            atividades: {
              include: { execucoes: { select: { id: true, status: true } } },
            },
          },
        },
      },
    });
    if (!obra) throw new AppError(404, 'Obra não encontrada');
    if (obra.status === 'CONCLUIDA' || obra.status === 'CANCELADA') {
      throw new AppError(409, 'Obra já está encerrada');
    }

    const execucoes = obra.etapas.flatMap((e) =>
      e.atividades.flatMap((a) => a.execucoes),
    );
    const pendentes = execucoes.filter(
      (ex) => ex.status !== 'CONCLUIDA' && ex.status !== 'CANCELADA',
    );
    if (pendentes.length > 0) {
      throw new AppError(
        409,
        `Existem ${pendentes.length} execuções pendentes de conclusão nesta Obra`,
      );
    }

    const obraConcluida = await this.prisma.obra.update({
      where: { id },
      data: {
        status: 'CONCLUIDA',
      },
    });

    return { obra: obraConcluida };
  }

  async obterComparacao(id: number) {
    const { obra } = await this.detalhar(id);

    const baseline = obra.orcamento?.atividades ?? [];
    const mestre = obra.etapas.flatMap((e) => e.atividades);
    const aditivosAprovados = obra.aditivos.filter((a) => a.status === 'APROVADO');

    return {
      obraId: obra.id,
      codigo: obra.codigo,
      valorContratado: obra.valorContratado,
      baseline,
      mestre,
      aditivos: aditivosAprovados,
    };
  }

  async criarEtapa(obraId: number, dto: CriarEtapaInput) {
    const obra = await this.prisma.obra.findUnique({ where: { id: obraId } });
    if (!obra) throw new AppError(404, 'Obra não encontrada');

    const ultimaOrdem = await this.prisma.obraEtapa.findFirst({
      where: { obraId },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });

    const etapa = await this.prisma.obraEtapa.create({
      data: {
        obraId,
        etapaId: dto.etapaId,
        nome: dto.nome,
        ordem: (ultimaOrdem?.ordem ?? 0) + 1,
      },
    });

    return { etapa };
  }

  async atualizarEtapa(obraId: number, etapaId: number, dto: AtualizarEtapaInput) {
    const etapa = await this.prisma.obraEtapa.findFirst({
      where: { id: etapaId, obraId },
    });
    if (!etapa) throw new AppError(404, 'Etapa da obra não encontrada');

    const atualizada = await this.prisma.obraEtapa.update({
      where: { id: etapaId },
      data: dto,
    });

    return { etapa: atualizada };
  }

  async excluirEtapa(obraId: number, etapaId: number) {
    const etapa = await this.prisma.obraEtapa.findFirst({
      where: { id: etapaId, obraId },
      include: {
        atividades: {
          include: { execucoes: { select: { id: true } } },
        },
      },
    });
    if (!etapa) throw new AppError(404, 'Etapa da obra não encontrada');

    const comExecucao = etapa.atividades.some((a) => a.execucoes.length > 0);
    if (comExecucao) {
      throw new AppError(409, 'Etapa possui execuções vinculadas e não pode ser excluída');
    }

    await this.prisma.obraEtapa.delete({ where: { id: etapaId } });
    return { ok: true };
  }

  async criarAtividade(obraId: number, dto: CriarAtividadeInput) {
    const etapa = await this.prisma.obraEtapa.findFirst({
      where: { id: dto.obraEtapaId, obraId },
    });
    if (!etapa) throw new AppError(404, 'Etapa da obra não encontrada');

    let catalogoAtividadeId = dto.catalogoAtividadeId;
    if (!catalogoAtividadeId) {
      const cat = await this.prisma.catalogoAtividade.findFirst({
        where: { subServicoId: dto.subServicoId, ativo: true },
        orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
        select: { id: true },
      });
      if (!cat) {
        throw new AppError(400, 'Sub-serviço sem atividade de catálogo');
      }
      catalogoAtividadeId = cat.id;
    }

    const ultimaOrdem = await this.prisma.obraAtividade.findFirst({
      where: { obraEtapaId: dto.obraEtapaId },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });

    return this.prisma.$transaction(async (tx) => {
      const atividade = await tx.obraAtividade.create({
        data: {
          obraEtapaId: dto.obraEtapaId,
          subServicoId: dto.subServicoId,
          catalogoAtividadeId,
          descricao: dto.descricao,
          verboId: dto.verboId,
          objetoId: dto.objetoId,
          localId: dto.localId ?? null,
          caracteristicaId: dto.caracteristicaId ?? null,
          unidadeId: dto.unidadeId ?? null,
          quantidade: dto.quantidade ?? null,
          areaM2: dto.areaM2 ?? null,
          moValorHora: dto.moValorHora ?? null,
          moPessoas: dto.moPessoas ?? null,
          moHoras: dto.moHoras ?? null,
          moValorTotal: dto.moValorTotal ?? 0,
          materiaisValor: dto.materiaisValor ?? 0,
          linhaValorTotal: dto.linhaValorTotal ?? 0,
          ordem: dto.ordem ?? (ultimaOrdem?.ordem ?? 0) + 1,
        },
      });

      if (dto.materiais && dto.materiais.length > 0) {
        for (const mat of dto.materiais) {
          await tx.obraAtividadeMaterial.create({
            data: {
              obraAtividadeId: atividade.id,
              materialId: mat.materialId,
              quantidade: mat.quantidade,
              custoUnitario: mat.custoUnitario ?? 0,
            },
          });
        }
      }

      return { atividade };
    });
  }

  async syncAtividadeObra(
    obraId: number,
    atividadeId: string,
    dto: AtualizarAtividadeObraInput,
  ) {
    const atividade = await this.prisma.obraAtividade.findFirst({
      where: { id: atividadeId, obraEtapa: { obraId } },
    });
    if (!atividade) throw new AppError(404, 'Atividade da obra não encontrada');

    if (atividade.updatedAt.toISOString() !== dto.updatedAt) {
      throw new AppError(409, 'CONFLITO_EDICAO: a atividade foi modificada por outro usuário');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.obraAtividade.update({
        where: { id: atividadeId },
        data: {
          descricao: dto.descricao ?? undefined,
          quantidade: dto.quantidade ?? undefined,
          areaM2: dto.areaM2 ?? undefined,
          moValorHora: dto.moValorHora ?? undefined,
          moPessoas: dto.moPessoas ?? undefined,
          moHoras: dto.moHoras ?? undefined,
        },
      });

      if (dto.materiais) {
        await tx.obraAtividadeMaterial.deleteMany({
          where: { obraAtividadeId: atividadeId },
        });
        for (const m of dto.materiais) {
          await tx.obraAtividadeMaterial.create({
            data: {
              obraAtividadeId: atividadeId,
              materialId: m.materialId,
              quantidade: m.quantidade,
              custoUnitario: m.custoUnitario ?? 0,
            },
          });
        }
      }

      return { atividade: updated };
    });
  }

  async criarAditivo(obraId: number, dto: CriarAditivoInput) {
    const obra = await this.prisma.obra.findUnique({ where: { id: obraId } });
    if (!obra) throw new AppError(404, 'Obra não encontrada');
    if (obra.status === 'CONCLUIDA' || obra.status === 'CANCELADA') {
      throw new AppError(409, 'Não é possível adicionar aditivos a uma obra encerrada');
    }

    const aditivo = await this.prisma.aditivoObra.create({
      data: {
        obraId,
        descricao: dto.descricao,
        valor: dto.valor,
        status: 'PENDENTE',
      },
    });

    return { aditivo };
  }

  async aprovarAditivo(aditivoId: number, userId: number) {
    const aditivo = await this.prisma.aditivoObra.findUnique({
      where: { id: aditivoId },
      include: { obra: true },
    });
    if (!aditivo) throw new AppError(404, 'Aditivo não encontrado');
    if (aditivo.status !== 'PENDENTE') {
      throw new AppError(409, 'Aditivo já foi processado');
    }

    return this.prisma.$transaction(async (tx) => {
      const aprovado = await tx.aditivoObra.update({
        where: { id: aditivoId },
        data: {
          status: 'APROVADO',
          aprovadoPorId: userId,
          aprovadoEm: new Date(),
        },
      });

      await tx.obra.update({
        where: { id: aditivo.obraId },
        data: {
          valorContratado: { increment: aditivo.valor },
        },
      });

      return { aditivo: aprovado };
    });
  }

  async recusarAditivo(aditivoId: number, userId: number) {
    const aditivo = await this.prisma.aditivoObra.findUnique({
      where: { id: aditivoId },
    });
    if (!aditivo) throw new AppError(404, 'Aditivo não encontrado');
    if (aditivo.status !== 'PENDENTE') {
      throw new AppError(409, 'Aditivo já foi processado');
    }

    const recusado = await this.prisma.aditivoObra.update({
      where: { id: aditivoId },
      data: {
        status: 'RECUSADO',
        aprovadoPorId: userId,
        aprovadoEm: new Date(),
      },
    });

    return { aditivo: recusado };
  }
}
