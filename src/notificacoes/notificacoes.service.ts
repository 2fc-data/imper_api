import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    userId: number,
    params: { status?: 'LIDA' | 'NAO_LIDA'; limit?: number } = {},
  ) {
    const where: Prisma.NotificacaoWhereInput = { userId };
    if (params.status) where.status = params.status;

    return this.prisma.notificacao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 50,
    });
  }

  async naoLidasCount(userId: number) {
    return this.prisma.notificacao.count({
      where: { userId, status: 'NAO_LIDA' },
    });
  }

  async marcarLida(userId: number, id: number) {
    const notif = await this.prisma.notificacao.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) {
      throw new NotFoundException('Notificação não encontrada');
    }
    return this.prisma.notificacao.update({
      where: { id },
      data: { status: 'LIDA' },
    });
  }

  async marcarTodasLidas(userId: number) {
    return this.prisma.notificacao.updateMany({
      where: { userId, status: 'NAO_LIDA' },
      data: { status: 'LIDA' },
    });
  }
}