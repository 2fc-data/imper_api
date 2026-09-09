import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CriarOrcamentoDto } from './dto/orcamentos.dto.js';

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
        { atendimento: { cliente: { nome: { contains: params.q } } } },
      ];
    }

    return this.prisma.orcamento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        atendimento: {
          select: {
            id: true,
            cliente: { select: { id: true, nome: true } },
          },
        },
        cliente: { select: { id: true, nome: true } },
        ordemServico: {
          select: { id: true, codigo: true, status: true },
        },
        _count: { select: { itens: true } },
      },
    });
  }

  async criar(dto: CriarOrcamentoDto, userId: number) {
    const maxCode = await this.prisma.orcamento.findFirst({
      orderBy: { id: 'desc' },
      select: { codigo: true },
    });

    let nextNum = 1;
    if (maxCode) {
      const match = maxCode.codigo.match(/(\d+)$/);
      if (match) nextNum = Number(match[1]) + 1;
    }
    const codigo = `ORM-${String(nextNum).padStart(3, '0')}`;

    const validade = new Date();
    validade.setDate(validade.getDate() + 30);

    let valorTotal = new Prisma.Decimal(0);
    for (const item of dto.itens) {
      valorTotal = valorTotal.add(
        new Prisma.Decimal(item.quantidade).mul(item.valorUnitario),
      );
    }

    const atendimento = await this.prisma.atendimento.findUnique({
      where: { id: dto.atendimentoId },
      select: { clienteId: true },
    });
    if (!atendimento) throw new AppError(404, 'Atendimento não encontrado');

    return this.prisma.orcamento.create({
      data: {
        codigo,
        atendimentoId: dto.atendimentoId,
        visitaId: dto.visitaId ?? null,
        clienteId: atendimento.clienteId,
        enderecoId: dto.enderecoId ?? null,
        urgencia: 'NORMAL',
        status: 'RASCUNHO',
        valorTotal,
        validade,
        observacoes: dto.observacoes ?? null,
        criadoPorId: userId,
        itens: {
          create: dto.itens.map((item) => ({
            servicoItemId: item.servicoItemId ?? null,
            nome: item.nome,
            tipo: item.tipo,
            quantidade: new Prisma.Decimal(item.quantidade),
            valorUnitario: new Prisma.Decimal(item.valorUnitario),
            valorTotal: new Prisma.Decimal(item.quantidade).mul(
              item.valorUnitario,
            ),
            unidadeId: item.unidadeId,
          })),
        },
      },
      include: {
        atendimento: {
          select: {
            id: true,
            cliente: { select: { id: true, nome: true } },
          },
        },
        cliente: { select: { id: true, nome: true } },
        _count: { select: { itens: true } },
      },
    });
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
      include: {
        atendimento: {
          select: {
            id: true,
            cliente: { select: { id: true, nome: true } },
          },
        },
        cliente: { select: { id: true, nome: true } },
        _count: { select: { itens: true } },
      },
    });
  }
}
