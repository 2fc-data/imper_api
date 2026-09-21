import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorAtividade(atividadeOSId: string) {
    return this.prisma.checklistExecucao.findMany({
      where: { atividadeOSId },
      include: {
        subStepAtividade: true,
        concluidoPor: { select: { id: true, nome: true } },
      },
      orderBy: { subStepAtividade: { ordem: 'asc' } },
    });
  }

  async concluir(id: string, usuarioId: number) {
    const item = await this.prisma.checklistExecucao.findUnique({
      where: { id },
      include: { atividadeOS: { include: { checklist: true } } },
    });
    if (!item) throw new NotFoundException(`Checklist ${id} não encontrado`);

    const atualizado = await this.prisma.checklistExecucao.update({
      where: { id },
      data: {
        status: 'CONCLUIDA',
        concluidoPorId: usuarioId,
        concluidoEm: new Date(),
      },
    });

    const todosConcluidos = item.atividadeOS.checklist.every(
      (c) => c.id === id || c.status === 'CONCLUIDA',
    );
    if (todosConcluidos) {
      await this.prisma.atividadeOS.update({
        where: { id: item.atividadeOSId },
        data: { status: 'CONCLUIDA' },
      });
    }

    return atualizado;
  }

  async bloquear(id: string, motivo: string) {
    await this.prisma.checklistExecucao.findUniqueOrThrow({ where: { id } });
    return this.prisma.checklistExecucao.update({
      where: { id },
      data: { status: 'BLOQUEADA', observacao: motivo },
    });
  }

  async listarPendentesEquipe(equipeId: string) {
    return this.prisma.checklistExecucao.findMany({
      where: {
        atividadeOS: { equipeId },
        status: 'PENDENTE',
      },
      include: {
        atividadeOS: {
          include: {
            catalogoAtividade: { select: { nome: true } },
            os: { select: { codigo: true } },
          },
        },
        subStepAtividade: true,
      },
      orderBy: { atividadeOS: { criadoEm: 'asc' } },
    });
  }
}
