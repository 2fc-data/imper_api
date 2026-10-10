import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ExecucaoService {
  constructor(private readonly prisma: PrismaService) {}

  listar(obraId?: number) {
    return this.prisma.execucaoAtividade.findMany({
      where: obraId ? { atividade: { obraEtapa: { obraId } } } : undefined,
      include: {
        atividade: { include: { obraEtapa: true } },
        checklist: true,
        separacoes: { include: { itens: true } },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async detalhar(id: string) {
    const item = await this.prisma.execucaoAtividade.findUnique({
      where: { id },
      include: {
        atividade: { include: { obraEtapa: true } },
        checklist: { include: { subStepAtividade: true } },
        separacoes: { include: { itens: true } },
        retiradas: true,
        entregasEpi: true,
      },
    });
    if (!item)
      throw new NotFoundException(`ExecucaoAtividade ${id} não encontrada`);
    return item;
  }

  async planificar(atividadeId: string, userId?: number) {
    const atividade = await this.prisma.obraAtividade.findUnique({
      where: { id: atividadeId },
      include: {
        obraEtapa: { include: { obra: true } },
        materiais: true,
        catalogoAtividade: { include: { subSteps: true, recursos: true } },
      },
    });
    if (!atividade)
      throw new NotFoundException(`ObraAtividade ${atividadeId} não encontrada`);

    const existente = await this.prisma.execucaoAtividade.findFirst({
      where: { atividadeId, status: { not: 'CANCELADA' } },
    });
    if (existente)
      throw new BadRequestException('Atividade já possui execução planejada');

    return this.prisma.$transaction(async (tx) => {
      const execucao = await tx.execucaoAtividade.create({
        data: { atividadeId, criadoPorId: userId, status: 'PENDENTE' },
      });

      const subSteps = atividade.catalogoAtividade.subSteps;
      if (subSteps.length) {
        await tx.checklistAtividade.createMany({
          data: subSteps.map((s) => ({
            executucaoAtividadeId: execucao.id,
            subStepAtividadeId: s.id,
          })),
        });
      }

      const separacao = await tx.separacao.create({
        data: {
          codigo: await this.proximoCodigo(tx),
          executucaoAtividadeId: execucao.id,
          dataNecessidade: new Date(),
          status: 'PENDENTE',
          statusNovo: 'SEPARACAO_PENDENTE',
          criadoPorId: userId,
        },
      });

      const itens: Prisma.SeparacaoItemCreateManyInput[] =
        atividade.materiais.map((m) => ({
          separacaoId: separacao.id,
          materialId: m.materialId,
          quantidadeNecessaria: m.quantidade,
        }));
      for (const r of atividade.catalogoAtividade.recursos) {
        const base = {
          separacaoId: separacao.id,
          quantidadeNecessaria: Number(r.quantidade),
        };
        if (r.tipo === 'MATERIAL')
          itens.push({ ...base, materialId: r.itemCatalogoId });
        if (r.tipo === 'EPI') itens.push({ ...base, epiId: r.itemCatalogoId });
        if (r.tipo === 'EQUIPAMENTO')
          itens.push({ ...base, equipamentoId: r.itemCatalogoId });
      }
      if (itens.length) await tx.separacaoItem.createMany({ data: itens });

      return tx.execucaoAtividade.findUniqueOrThrow({
        where: { id: execucao.id },
        include: { checklist: true, separacoes: { include: { itens: true } } },
      });
    });
  }

  async mudarStatus(
    id: string,
    status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA',
    userId?: number,
  ) {
    await this.detalhar(id);
    return this.prisma.execucaoAtividade.update({
      where: { id },
      data: {
        status,
        dataInicio: status === 'EM_ANDAMENTO' ? new Date() : undefined,
        dataConclusao: status === 'CONCLUIDA' ? new Date() : undefined,
        atribuidoAId: userId,
      },
    });
  }

  private async proximoCodigo(tx: Prisma.TransactionClient) {
    const total = await tx.separacao.count();
    return `SEP-${String(total + 1).padStart(6, '0')}`;
  }
}
