import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SeparacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { osId?: number; equipeId?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (params?.osId) where.osId = params.osId;
    if (params?.equipeId) where.equipeId = params.equipeId;
    if (params?.status) {
      const statusMap: Record<string, string> = {
        PENDENTE: 'SEPARACAO_PENDENTE',
        CONCLUIDA: 'SEPARACAO_CONCLUIDA',
        SEPARACAO: 'SEPARACAO_CONCLUIDA',
        EQUIPE_NOTIFICADA: 'EQUIPE_NOTIFICADA',
        RETIRADA_PENDENTE: 'RETIRADA_PENDENTE',
        RETIRADA_CONCLUIDA: 'RETIRADA_CONCLUIDA',
        DEVOLUCAO_PENDENTE: 'DEVOLUCAO_PENDENTE',
        DEVOLUCAO_CONCLUIDA: 'DEVOLUCAO_CONCLUIDA',
      };
      where.statusNovo = statusMap[params.status] ?? params.status;
    }

    return this.prisma.separacao.findMany({
      where,
      include: {
        os: { select: { id: true, codigo: true } },
        equipe: {
          include: {
            lider: { select: { id: true, nome: true } },
          },
        },
        confirmadoPor: { select: { id: true, nome: true } },
        itens: { include: { material: true } },
      },
      orderBy: { dataNecessidade: 'asc' },
    });
  }

  async detalhar(id: number) {
    const item = await this.prisma.separacao.findUnique({
      where: { id },
      include: {
        os: { select: { id: true, codigo: true } },
        equipe: {
          include: {
            lider: { select: { id: true, nome: true } },
            membros: {
              include: { usuario: { select: { id: true, nome: true } } },
            },
          },
        },
        confirmadoPor: { select: { id: true, nome: true } },
        itens: { include: { material: true } },
      },
    });
    if (!item) throw new NotFoundException(`Separação ${id} não encontrada`);
    return item;
  }

  async confirmarSeparacao(id: number, usuarioId: number) {
    await this.detalhar(id);
    return this.prisma.separacao.update({
      where: { id },
      data: {
        statusNovo: 'SEPARACAO_CONCLUIDA',
        dataConfirmacao: new Date(),
        confirmadoPorId: usuarioId,
      },
    });
  }

  async notificarEquipe(id: number) {
    await this.detalhar(id);
    return this.prisma.separacao.update({
      where: { id },
      data: { statusNovo: 'EQUIPE_NOTIFICADA' },
    });
  }

  async registrarRetirada(id: number) {
    await this.detalhar(id);
    return this.prisma.separacao.update({
      where: { id },
      data: { statusNovo: 'RETIRADA_CONCLUIDA' },
    });
  }

  async registrarDevolucao(id: number) {
    await this.detalhar(id);
    return this.prisma.separacao.update({
      where: { id },
      data: { statusNovo: 'DEVOLUCAO_CONCLUIDA' },
    });
  }
}
