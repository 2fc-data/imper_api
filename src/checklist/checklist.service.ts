import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorExecucao(executucaoAtividadeId: string) {
    return this.prisma.checklistAtividade.findMany({
      where: { executucaoAtividadeId },
      include: {
        subStepAtividade: true,
        concluidoPor: { select: { id: true, nome: true } },
      },
      orderBy: { subStepAtividade: { ordem: 'asc' } },
    });
  }

  async concluir(id: string, usuarioId: number) {
    const item = await this.prisma.checklistAtividade.findUnique({
      where: { id },
      include: {
        executucaoAtividade: { include: { checklist: true } },
      },
    });
    if (!item) throw new NotFoundException(`Checklist ${id} não encontrado`);

    const atualizado = await this.prisma.checklistAtividade.update({
      where: { id },
      data: {
        status: 'CONCLUIDA',
        concluidoPorId: usuarioId,
        concluidoEm: new Date(),
      },
    });

    const todosConcluidos = item.executucaoAtividade.checklist.every(
      (c) => c.id === id || c.status === 'CONCLUIDA',
    );
    if (todosConcluidos) {
      await this.prisma.execucaoAtividade.update({
        where: { id: item.executucaoAtividadeId },
        data: { status: 'CONCLUIDA', dataConclusao: new Date() },
      });
    }

    return atualizado;
  }

  async bloquear(id: string, motivo: string) {
    await this.prisma.checklistAtividade.findUniqueOrThrow({ where: { id } });
    return this.prisma.checklistAtividade.update({
      where: { id },
      data: { status: 'BLOQUEADA', observacao: motivo },
    });
  }
}
