import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, StatusManutencao } from '@prisma/client';
import {
  normalizarPecas,
  type PecaManutencaoInput,
  parseDataSaida,
  somarPecas,
} from '../manutencoes/pecas-manutencao.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type ManutencaoVeiculoCriarInput = {
  veiculoId: number;
  tipoId: number;
  data: string | number;
  descricao: string;
  custoPecas?: number | string | null;
  custoMaoDeObra?: number | string | null;
  pecas?: PecaManutencaoInput[];
  dataSaida?: string | number | null;
  local?: string | null;
  proximaManutencao?: string | number | null;
  status?: StatusManutencao;
  responsavelManutencaoId?: number | null;
};

export type ManutencaoVeiculoAtualizarInput = {
  veiculoId?: number;
  tipoId?: number;
  data?: string | number;
  descricao?: string;
  custoPecas?: number | string | null;
  custoMaoDeObra?: number | string | null;
  pecas?: PecaManutencaoInput[];
  dataSaida?: string | number | null;
  local?: string | null;
  proximaManutencao?: string | number | null;
  status?: StatusManutencao;
  responsavelManutencaoId?: number | null;
};

const includeManutencao = {
  veiculo: {
    select: { id: true, codigo: true, nome: true, placa: true },
  },
  tipo: true,
  responsavelManutencao: { select: { id: true, nome: true } },
  pecas: { orderBy: { id: 'asc' } },
} satisfies Prisma.ManutencaoVeiculoInclude;

@Injectable()
export class ManutencoesVeiculosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { veiculoId?: number; status?: StatusManutencao }) {
    const where: Prisma.ManutencaoVeiculoWhereInput = {};
    if (params?.veiculoId) where.veiculoId = params.veiculoId;
    if (params?.status) where.status = params.status;

    return this.prisma.manutencaoVeiculo.findMany({
      where,
      include: includeManutencao,
      orderBy: { data: 'desc' },
    });
  }

  async lookups() {
    const [veiculos, tiposManutencao, responsaveis] = await Promise.all([
      this.prisma.veiculo.findMany({
        where: { ativo: true },
        select: { id: true, codigo: true, nome: true, placa: true },
      }),
      this.prisma.tipoManutencao.findMany({
        where: { ativo: true, tipoInsumo: 'VEICULO' },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.user.findMany({
        where: {
          ativo: true,
          papeis: {
            none: {
              papel: { nome: 'CLIENTE' },
            },
          },
        },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' },
      }),
    ]);
    return { veiculos, tiposManutencao, responsaveis };
  }

  async detalhar(id: number) {
    const item = await this.prisma.manutencaoVeiculo.findUnique({
      where: { id },
      include: includeManutencao,
    });
    if (!item) {
      throw new NotFoundException(
        `Manutenção de veículo com ID ${id} não encontrada`,
      );
    }
    return item;
  }

  async criar(data: ManutencaoVeiculoCriarInput) {
    const pecas = normalizarPecas(data.pecas);
    const custoPecas = pecas
      ? somarPecas(pecas)
      : data.custoPecas != null
        ? Number(data.custoPecas)
        : 0;
    const custoMaoDeObra =
      data.custoMaoDeObra != null ? Number(data.custoMaoDeObra) : 0;
    const custoTotal = custoPecas + custoMaoDeObra;
    const dataSaida = parseDataSaida(data.data, data.dataSaida);

    return this.prisma.manutencaoVeiculo.create({
      data: {
        veiculoId: data.veiculoId,
        tipoId: data.tipoId,
        data: new Date(data.data),
        descricao: data.descricao,
        local: data.local || null,
        custoPecas,
        custoMaoDeObra,
        custoTotal,
        dataSaida: dataSaida ?? null,
        proximaManutencao: data.proximaManutencao
          ? new Date(data.proximaManutencao)
          : null,
        status: data.status || 'PENDENTE',
        responsavelManutencaoId: data.responsavelManutencaoId || null,
        ...(pecas && pecas.length > 0 && { pecas: { create: pecas } }),
      },
      include: includeManutencao,
    });
  }

  async atualizar(id: number, data: ManutencaoVeiculoAtualizarInput) {
    const atual = await this.detalhar(id);
    const pecas = normalizarPecas(data.pecas);

    let custoPecas: number | undefined;
    let custoMaoDeObra: number | undefined;
    let custoTotal: number | undefined;

    if (pecas !== undefined) {
      custoPecas = somarPecas(pecas);
    } else if (data.custoPecas !== undefined) {
      custoPecas = data.custoPecas != null ? Number(data.custoPecas) : 0;
    }

    if (data.custoMaoDeObra !== undefined) {
      custoMaoDeObra =
        data.custoMaoDeObra != null ? Number(data.custoMaoDeObra) : 0;
    }

    if (custoPecas !== undefined || custoMaoDeObra !== undefined) {
      custoTotal =
        (custoPecas ?? Number(atual.custoPecas)) +
        (custoMaoDeObra ?? Number(atual.custoMaoDeObra));
    }

    const dataSaida = parseDataSaida(
      data.data !== undefined ? data.data : atual.data,
      data.dataSaida,
    );

    return this.prisma.$transaction(async (tx) => {
      if (pecas !== undefined) {
        await tx.manutencaoVeiculoPeca.deleteMany({
          where: { manutencaoId: id },
        });
        if (pecas.length > 0) {
          await tx.manutencaoVeiculoPeca.createMany({
            data: pecas.map((peca) => ({ ...peca, manutencaoId: id })),
          });
        }
      }

      return tx.manutencaoVeiculo.update({
        where: { id },
        data: {
          ...(data.veiculoId !== undefined && { veiculoId: data.veiculoId }),
          ...(data.tipoId !== undefined && { tipoId: data.tipoId }),
          ...(data.data !== undefined && { data: new Date(data.data) }),
          ...(data.descricao !== undefined && { descricao: data.descricao }),
          ...(data.local !== undefined && { local: data.local || null }),
          ...(custoPecas !== undefined && { custoPecas }),
          ...(custoMaoDeObra !== undefined && { custoMaoDeObra }),
          ...(custoTotal !== undefined && { custoTotal }),
          ...(dataSaida !== undefined && { dataSaida }),
          ...(data.proximaManutencao !== undefined && {
            proximaManutencao: data.proximaManutencao
              ? new Date(data.proximaManutencao)
              : null,
          }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.responsavelManutencaoId !== undefined && {
            responsavelManutencaoId: data.responsavelManutencaoId,
          }),
        },
        include: includeManutencao,
      });
    });
  }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.manutencaoVeiculo.delete({ where: { id } });
  }
}
