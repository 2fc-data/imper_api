import { Injectable } from '@nestjs/common';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AdicionarRecursoDto,
  AdicionarSubStepDto,
  AtualizarCatalogoDto,
  CriarCatalogoDto,
} from './dto/catalogo-atividades.dto.js';

@Injectable()
export class CatalogoAtividadesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: {
    q?: string;
    especialidade?: string;
    ativo?: boolean;
    etapaId?: number;
    subServicoId?: number;
  }) {
    const where: Record<string, unknown> = {};
    if (params?.ativo !== undefined) where.ativo = params.ativo;
    if (params?.q) {
      where.OR = [
        { nome: { contains: params.q } },
        { descricao: { contains: params.q } },
      ];
    }
    if (params?.especialidade)
      where.especialidadeNecessaria = params.especialidade;
    if (params?.etapaId !== undefined && Number.isFinite(params.etapaId))
      where.etapaId = params.etapaId;
    if (
      params?.subServicoId !== undefined &&
      Number.isFinite(params.subServicoId)
    )
      where.subServicoId = params.subServicoId;

    return this.prisma.catalogoAtividade.findMany({
      where,
      include: {
        subSteps: { orderBy: { ordem: 'asc' } },
        recursos: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async detalhar(id: string) {
    const item = await this.prisma.catalogoAtividade.findUnique({
      where: { id },
      include: {
        subSteps: { orderBy: { ordem: 'asc' } },
        recursos: true,
      },
    });
    if (!item) throw new AppError(404, 'Atividade não encontrada');
    return item;
  }

  async criar(data: CriarCatalogoDto) {
    const exists = await this.prisma.catalogoAtividade.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Atividade já cadastrada');

    return this.prisma.catalogoAtividade.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        especialidadeNecessaria: data.especialidadeNecessaria,
        tempoEstimadoHoras: data.tempoEstimadoHoras,
        etapaId: data.etapaId ?? null,
        subServicoId: data.subServicoId ?? null,
        subSteps: data.subSteps
          ? {
              create: data.subSteps.map((s) => ({
                ordem: s.ordem,
                descricao: s.descricao,
                observacao: s.observacao,
              })),
            }
          : undefined,
        recursos: data.recursos
          ? {
              create: data.recursos.map((r) => ({
                tipo: r.tipo,
                itemCatalogoId: r.itemCatalogoId,
                quantidade: r.quantidade ?? 1,
              })),
            }
          : undefined,
      },
      include: { subSteps: { orderBy: { ordem: 'asc' } }, recursos: true },
    });
  }

  async atualizar(id: string, data: AtualizarCatalogoDto) {
    await this.detalhar(id);

    if (data.nome) {
      const exists = await this.prisma.catalogoAtividade.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Atividade já cadastrada');
    }

    return this.prisma.catalogoAtividade.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.especialidadeNecessaria !== undefined && {
          especialidadeNecessaria: data.especialidadeNecessaria,
        }),
        ...(data.tempoEstimadoHoras !== undefined && {
          tempoEstimadoHoras: data.tempoEstimadoHoras,
        }),
        ...(data.etapaId !== undefined && { etapaId: data.etapaId }),
        ...(data.subServicoId !== undefined && {
          subServicoId: data.subServicoId,
        }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
      },
      include: { subSteps: { orderBy: { ordem: 'asc' } }, recursos: true },
    });
  }

  async excluir(id: string) {
    await this.detalhar(id);
    return this.prisma.catalogoAtividade.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async adicionarSubStep(catalogoId: string, data: AdicionarSubStepDto) {
    await this.detalhar(catalogoId);
    return this.prisma.subStepAtividade.create({
      data: {
        catalogoAtividadeId: catalogoId,
        ordem: data.ordem,
        descricao: data.descricao,
        observacao: data.observacao,
      },
    });
  }

  async removerSubStep(id: string) {
    return this.prisma.subStepAtividade.delete({ where: { id } });
  }

  async adicionarRecurso(catalogoId: string, data: AdicionarRecursoDto) {
    await this.detalhar(catalogoId);
    return this.prisma.recursoAtividade.create({
      data: {
        catalogoAtividadeId: catalogoId,
        tipo: data.tipo,
        itemCatalogoId: data.itemCatalogoId,
        quantidade: data.quantidade ?? 1,
      },
    });
  }

  async removerRecurso(id: string) {
    return this.prisma.recursoAtividade.delete({ where: { id } });
  }
}
