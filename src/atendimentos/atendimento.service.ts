import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import type { CanalAtendimento, Urgencia, StatusAtendimento } from '../schemas/enums.js';

@Injectable()
export class AtendimentoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: {
    q?: string;
    status?: string;
    criadoDe?: string;
    criadoAte?: string;
    atualizadoDe?: string;
    atualizadoAte?: string;
  }) {
    const where: any = {};

    if (params?.q) {
      where.OR = [
        { motivo: { contains: params.q } },
        { cliente: { nome: { contains: params.q } } },
      ];
    }

    if (params?.status) {
      where.status = params.status;
    }

    return this.prisma.atendimento.findMany({
      where,
      include: { cliente: { select: { id: true, nome: true, telefone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async detalhar(id: number) {
    const item = await this.prisma.atendimento.findUnique({
      where: { id },
      include: { cliente: { select: { id: true, nome: true, telefone: true } } },
    });

    if (!item) {
      throw new AppError(404, 'Atendimento não encontrado');
    }

    return item;
  }

  async criar(data: {
    canal: CanalAtendimento;
    motivo: string;
    urgencia?: Urgencia;
    clienteId?: number;
    atendenteId?: number;
  }) {
    return this.prisma.atendimento.create({
      data: {
        canal: data.canal,
        motivo: data.motivo,
        urgencia: data.urgencia ?? 'NORMAL',
        status: 'NOVO',
        clienteId: data.clienteId ?? null,
        atendenteId: data.atendenteId ?? null,
      },
      include: { cliente: { select: { id: true, nome: true, telefone: true } } },
    });
  }

  async atualizarStatus(id: number, status: StatusAtendimento) {
    return this.prisma.atendimento.update({
      where: { id },
      data: { status },
    });
  }
}