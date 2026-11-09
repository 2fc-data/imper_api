import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, StatusManutencao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export type ManutencaoCriarInput = {
  equipamentoId: number;
  tipoId: number;
  data: string | number;
  descricao: string;
  custo?: number | string | null;
  responsavelManutencaoId?: number | null;
  proximaManutencao?: string | number | null;
  status?: StatusManutencao;
};

export type ManutencaoAtualizarInput = {
  equipamentoId?: number;
  tipoId?: number;
  data?: string | number;
  descricao?: string;
  custo?: number | string | null;
  responsavelManutencaoId?: number | null;
  proximaManutencao?: string | number | null;
  status?: StatusManutencao;
};

@Injectable()
export class ManutencoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { equipamentoId?: number; status?: StatusManutencao }) {
    const where: Prisma.ManutencaoWhereInput = {};
    if (params?.equipamentoId) where.equipamentoId = params.equipamentoId;
    if (params?.status) where.status = params.status;

    return this.prisma.manutencao.findMany({
      where,
      include: {
        equipamento: {
          select: {
            id: true,
            codigo: true,
            descricao: true,
            numeroPatrimonio: true,
          },
        },
        tipo: true,
        responsavelManutencao: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { data: 'desc' },
    });
  }

  async lookups() {
    const [equipamentos, tiposManutencao, responsaveis] = await Promise.all([
      this.prisma.equipamento.findMany({
        where: { ativo: true },
        select: { id: true, codigo: true, descricao: true },
      }),
      this.prisma.tipoManutencao.findMany({ where: { ativo: true } }),
      this.prisma.user.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
      }),
    ]);

    return {
      equipamentos,
      tiposManutencao,
      responsaveis,
    };
  }

  async detalhar(id: number) {
    const item = await this.prisma.manutencao.findUnique({
      where: { id },
      include: {
        equipamento: {
          select: {
            id: true,
            codigo: true,
            descricao: true,
            numeroPatrimonio: true,
          },
        },
        tipo: true,
        responsavelManutencao: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Manutenção com ID ${id} não encontrada`);
    }

    return item;
  }

  async criar(data: ManutencaoCriarInput) {
    return this.prisma.manutencao.create({
      data: {
        equipamentoId: data.equipamentoId,
        tipoId: data.tipoId,
        data: new Date(data.data),
        descricao: data.descricao,
        custo: data.custo !== undefined ? data.custo : null,
        responsavelManutencaoId: data.responsavelManutencaoId || null,
        proximaManutencao: data.proximaManutencao
          ? new Date(data.proximaManutencao)
          : null,
        status: data.status || 'PENDENTE',
      },
      include: {
        equipamento: {
          select: {
            id: true,
            codigo: true,
            descricao: true,
            numeroPatrimonio: true,
          },
        },
        tipo: true,
        responsavelManutencao: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async atualizar(id: number, data: ManutencaoAtualizarInput) {
    await this.detalhar(id);

    return this.prisma.manutencao.update({
      where: { id },
      data: {
        ...(data.equipamentoId !== undefined && {
          equipamentoId: data.equipamentoId,
        }),
        ...(data.tipoId !== undefined && { tipoId: data.tipoId }),
        ...(data.data !== undefined && { data: new Date(data.data) }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.custo !== undefined && { custo: data.custo }),
        ...(data.responsavelManutencaoId !== undefined && {
          responsavelManutencaoId: data.responsavelManutencaoId,
        }),
        ...(data.proximaManutencao !== undefined && {
          proximaManutencao: data.proximaManutencao
            ? new Date(data.proximaManutencao)
            : null,
        }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        equipamento: {
          select: {
            id: true,
            codigo: true,
            descricao: true,
            numeroPatrimonio: true,
          },
        },
        tipo: true,
        responsavelManutencao: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.manutencao.delete({ where: { id } });
  }
}
