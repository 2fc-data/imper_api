import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CatalogoAtividadesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: {
    q?: string;
    especialidade?: string;
    ativo?: boolean;
  }) {
    const where: Record<string, unknown> = {};
    if (params?.ativo !== undefined) where.ativo = params.ativo;
    else where.ativo = true;
    if (params?.q) {
      where.OR = [
        { nome: { contains: params.q } },
        { descricao: { contains: params.q } },
      ];
    }
    if (params?.especialidade)
      where.especialidadeNecessaria = params.especialidade;

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
    if (!item) throw new NotFoundException(`Atividade ${id} não encontrada`);
    return item;
  }

  async criar(data: {
    nome: string;
    descricao?: string;
    especialidadeNecessaria: string;
    tempoEstimadoHoras?: number;
    subSteps?: { ordem: number; descricao: string; observacao?: string }[];
    recursos?: { tipo: string; itemCatalogoId: number; quantidade?: number }[];
  }) {
    return this.prisma.catalogoAtividade.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        especialidadeNecessaria: data.especialidadeNecessaria as any,
        tempoEstimadoHoras: data.tempoEstimadoHoras,
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
                tipo: r.tipo as any,
                itemCatalogoId: r.itemCatalogoId,
                quantidade: r.quantidade ?? 1,
              })),
            }
          : undefined,
      },
      include: { subSteps: { orderBy: { ordem: 'asc' } }, recursos: true },
    });
  }

  async atualizar(
    id: string,
    data: {
      nome?: string;
      descricao?: string;
      especialidadeNecessaria?: string;
      tempoEstimadoHoras?: number;
      ativo?: boolean;
    },
  ) {
    await this.detalhar(id);
    return this.prisma.catalogoAtividade.update({
      where: { id },
      data: {
        ...data,
        especialidadeNecessaria: data.especialidadeNecessaria as any,
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

  async adicionarSubStep(
    catalogoId: string,
    data: { ordem: number; descricao: string; observacao?: string },
  ) {
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

  async adicionarRecurso(
    catalogoId: string,
    data: { tipo: string; itemCatalogoId: number; quantidade?: number },
  ) {
    await this.detalhar(catalogoId);
    return this.prisma.recursoAtividade.create({
      data: {
        catalogoAtividadeId: catalogoId,
        tipo: data.tipo as any,
        itemCatalogoId: data.itemCatalogoId,
        quantidade: data.quantidade ?? 1,
      },
    });
  }

  async removerRecurso(id: string) {
    return this.prisma.recursoAtividade.delete({ where: { id } });
  }
}
