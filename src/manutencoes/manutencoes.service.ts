import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, StatusManutencao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  normalizarPecas,
  type PecaManutencaoInput,
  parseDataSaida,
  somarPecas,
} from './pecas-manutencao.js';

export type ManutencaoCriarInput = {
  equipamentoId: number;
  tipoId: number;
  data: string | number;
  descricao: string;
  custo?: number | string | null;
  custoMaoDeObra?: number | string | null;
  pecas?: PecaManutencaoInput[];
  dataSaida?: string | number | null;
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
  custoMaoDeObra?: number | string | null;
  pecas?: PecaManutencaoInput[];
  dataSaida?: string | number | null;
  responsavelManutencaoId?: number | null;
  proximaManutencao?: string | number | null;
  status?: StatusManutencao;
};

const includeManutencao = {
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
  pecas: { orderBy: { id: 'asc' } },
} satisfies Prisma.ManutencaoInclude;

@Injectable()
export class ManutencoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { equipamentoId?: number; status?: StatusManutencao }) {
    const where: Prisma.ManutencaoWhereInput = {};
    if (params?.equipamentoId) where.equipamentoId = params.equipamentoId;
    if (params?.status) where.status = params.status;

    return this.prisma.manutencao.findMany({
      where,
      include: includeManutencao,
      orderBy: { data: 'desc' },
    });
  }

  async lookups() {
    const [equipamentos, tiposManutencao, responsaveis] = await Promise.all([
      this.prisma.equipamento.findMany({
        where: { ativo: true },
        select: { id: true, codigo: true, descricao: true },
      }),
      this.prisma.tipoManutencao.findMany({
        where: { ativo: true, tipoInsumo: 'EQUIPAMENTO' },
      }),
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
      include: includeManutencao,
    });

    if (!item) {
      throw new NotFoundException(`Manutenção com ID ${id} não encontrada`);
    }

    return item;
  }

  async criar(data: ManutencaoCriarInput) {
    const pecas = normalizarPecas(data.pecas);
    const custoPecas = pecas ? somarPecas(pecas) : 0;
    const custoMaoDeObra =
      data.custoMaoDeObra != null ? Number(data.custoMaoDeObra) : 0;
    const custo =
      pecas !== undefined || data.custoMaoDeObra !== undefined
        ? custoPecas + custoMaoDeObra
        : data.custo !== undefined
          ? data.custo
          : null;
    const dataSaida = parseDataSaida(data.data, data.dataSaida);

    return this.prisma.manutencao.create({
      data: {
        equipamentoId: data.equipamentoId,
        tipoId: data.tipoId,
        data: new Date(data.data),
        descricao: data.descricao,
        custo,
        custoPecas,
        custoMaoDeObra,
        dataSaida: dataSaida ?? null,
        responsavelManutencaoId: data.responsavelManutencaoId || null,
        proximaManutencao: data.proximaManutencao
          ? new Date(data.proximaManutencao)
          : null,
        status: data.status || 'PENDENTE',
        ...(pecas && pecas.length > 0 && { pecas: { create: pecas } }),
      },
      include: includeManutencao,
    });
  }

  async atualizar(id: number, data: ManutencaoAtualizarInput) {
    const atual = await this.detalhar(id);
    const pecas = normalizarPecas(data.pecas);

    let custoPecas: number | undefined;
    let custoMaoDeObra: number | undefined;
    let custo: number | null | undefined;

    if (pecas !== undefined) {
      custoPecas = somarPecas(pecas);
    }
    if (data.custoMaoDeObra !== undefined) {
      custoMaoDeObra =
        data.custoMaoDeObra != null ? Number(data.custoMaoDeObra) : 0;
    }

    if (custoPecas !== undefined || custoMaoDeObra !== undefined) {
      custo =
        (custoPecas ?? Number(atual.custoPecas)) +
        (custoMaoDeObra ?? Number(atual.custoMaoDeObra));
    } else if (data.custo !== undefined) {
      custo = data.custo != null ? Number(data.custo) : null;
    }

    const dataSaida = parseDataSaida(
      data.data !== undefined ? data.data : atual.data,
      data.dataSaida,
    );

    return this.prisma.$transaction(async (tx) => {
      if (pecas !== undefined) {
        await tx.manutencaoPeca.deleteMany({ where: { manutencaoId: id } });
        if (pecas.length > 0) {
          await tx.manutencaoPeca.createMany({
            data: pecas.map((peca) => ({ ...peca, manutencaoId: id })),
          });
        }
      }

      return tx.manutencao.update({
        where: { id },
        data: {
          ...(data.equipamentoId !== undefined && {
            equipamentoId: data.equipamentoId,
          }),
          ...(data.tipoId !== undefined && { tipoId: data.tipoId }),
          ...(data.data !== undefined && { data: new Date(data.data) }),
          ...(data.descricao !== undefined && { descricao: data.descricao }),
          ...(custoPecas !== undefined && { custoPecas }),
          ...(custoMaoDeObra !== undefined && { custoMaoDeObra }),
          ...(custo !== undefined && { custo }),
          ...(dataSaida !== undefined && { dataSaida }),
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
        include: includeManutencao,
      });
    });
  }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.manutencao.delete({ where: { id } });
  }
}
