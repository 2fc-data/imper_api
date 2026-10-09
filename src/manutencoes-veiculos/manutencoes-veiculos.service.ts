import { Injectable, NotFoundException } from '@nestjs/common';
import type { StatusManutencao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ManutencoesVeiculosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { veiculoId?: number; status?: StatusManutencao }) {
    const where: Record<string, unknown> = {};
    if (params?.veiculoId) where.veiculoId = params.veiculoId;
    if (params?.status) where.status = params.status;

    return this.prisma.manutencaoVeiculo.findMany({
      where,
      include: {
        veiculo: { select: { id: true, codigo: true, placa: true } },
        tipo: true,
        responsavelManutencao: { select: { id: true, nome: true } },
      },
      orderBy: { data: 'desc' },
    });
  }

  async lookups() {
    const [veiculos, tiposManutencao, responsaveis] = await Promise.all([
      this.prisma.veiculo.findMany({
        where: { ativo: true },
        select: { id: true, codigo: true, placa: true },
      }),
      this.prisma.tipoManutencao.findMany({ where: { ativo: true } }),
      this.prisma.user.findMany({
        where: {
          ativo: true,
          papeis: {
            some: {
              papel: { nome: { not: 'CLIENTE' } },
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
      include: {
        veiculo: { select: { id: true, codigo: true, placa: true } },
        tipo: true,
        responsavelManutencao: { select: { id: true, nome: true } },
      },
    });
    if (!item) {
      throw new NotFoundException(
        `Manutenção de veículo com ID ${id} não encontrada`,
      );
    }
    return item;
  }

  async criar(data: any) {
    const custoPecas = data.custoPecas != null ? Number(data.custoPecas) : 0;
    const custoMaoDeObra =
      data.custoMaoDeObra != null ? Number(data.custoMaoDeObra) : 0;
    const custoTotal = custoPecas + custoMaoDeObra;

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
        proximaManutencao: data.proximaManutencao
          ? new Date(data.proximaManutencao)
          : null,
        status: data.status || 'PENDENTE',
        responsavelManutencaoId: data.responsavelManutencaoId || null,
      },
      include: {
        veiculo: { select: { id: true, codigo: true, placa: true } },
        tipo: true,
        responsavelManutencao: { select: { id: true, nome: true } },
      },
    });
  }

  async atualizar(id: number, data: any) {
    await this.detalhar(id);

    const custoPecas =
      data.custoPecas !== undefined
        ? data.custoPecas != null
          ? Number(data.custoPecas)
          : 0
        : undefined;
    const custoMaoDeObra =
      data.custoMaoDeObra !== undefined
        ? data.custoMaoDeObra != null
          ? Number(data.custoMaoDeObra)
          : 0
        : undefined;

    let custoTotal: number | undefined;
    if (custoPecas !== undefined || custoMaoDeObra !== undefined) {
      const atual = await this.prisma.manutencaoVeiculo.findUnique({
        where: { id },
      });
      const pecas = custoPecas ?? (atual ? Number(atual.custoPecas) : 0);
      const mao = custoMaoDeObra ?? (atual ? Number(atual.custoMaoDeObra) : 0);
      custoTotal = pecas + mao;
    }

    return this.prisma.manutencaoVeiculo.update({
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
      include: {
        veiculo: { select: { id: true, codigo: true, placa: true } },
        tipo: true,
        responsavelManutencao: { select: { id: true, nome: true } },
      },
    });
  }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.manutencaoVeiculo.delete({ where: { id } });
  }
}
