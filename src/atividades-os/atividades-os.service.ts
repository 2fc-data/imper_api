import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AtividadesOSService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: {
    osId?: number;
    etapaOSId?: number;
    status?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (params?.osId) where.osId = params.osId;
    if (params?.etapaOSId) where.etapaOSId = params.etapaOSId;
    if (params?.status) where.status = params.status;

    return this.prisma.atividadeOS.findMany({
      where,
      include: {
        os: { select: { id: true, codigo: true } },
        etapaOS: { select: { id: true, nome: true } },
        catalogoAtividade: true,
        checklist: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async detalhar(id: string) {
    const item = await this.prisma.atividadeOS.findUnique({
      where: { id },
      include: {
        os: { select: { id: true, codigo: true } },
        etapaOS: { select: { id: true, nome: true } },
        catalogoAtividade: {
          include: { subSteps: { orderBy: { ordem: 'asc' } }, recursos: true },
        },
        checklist: {
          include: {
            subStepAtividade: true,
            concluidoPor: { select: { id: true, nome: true } },
          },
        },
      },
    });
    if (!item) throw new NotFoundException(`AtividadeOS ${id} não encontrada`);
    return item;
  }

  /**
   * @deprecated spec 3.4: superseded pela aprovação do orçamento (T9) —
   * mantido por compatibilidade, não é mais usado pelo wizard.
   */
  async planificar(data: {
    osId: number;
    etapaOSId: number;
    atividades: {
      catalogoAtividadeId: string;
      dataPrevisao?: string;
    }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const etapaOS = await tx.etapaOS.findUnique({
        where: { id: data.etapaOSId },
        select: { ordem: true },
      });
      if (!etapaOS)
        throw new NotFoundException(`EtapaOS ${data.etapaOSId} não encontrada`);

      let seqSep =
        (await tx.separacao.count({
          where: { etapaOsId: data.etapaOSId },
        })) + 1;

      const criadas = [];

      for (const ativ of data.atividades) {
        const catalogo = await tx.catalogoAtividade.findUnique({
          where: { id: ativ.catalogoAtividadeId },
          include: { subSteps: true, recursos: true },
        });
        if (!catalogo)
          throw new NotFoundException(
            `Catálogo ${ativ.catalogoAtividadeId} não encontrado`,
          );

        const atividadeOS = await tx.atividadeOS.create({
          data: {
            osId: data.osId,
            etapaOSId: data.etapaOSId,
            catalogoAtividadeId: ativ.catalogoAtividadeId,
            dataPrevisao: ativ.dataPrevisao
              ? new Date(ativ.dataPrevisao)
              : undefined,
          },
        });

        for (const sub of catalogo.subSteps) {
          await tx.checklistExecucao.create({
            data: {
              atividadeOSId: atividadeOS.id,
              subStepAtividadeId: sub.id,
            },
          });
        }

        for (const recurso of catalogo.recursos) {
          if (
            recurso.tipo === 'MATERIAL' ||
            recurso.tipo === 'EPI' ||
            recurso.tipo === 'EQUIPAMENTO'
          ) {
            const itemData: {
              materialId?: number;
              epiId?: number;
              equipamentoId?: number;
              quantidadeNecessaria: number;
            } = {
              quantidadeNecessaria: Number(recurso.quantidade),
            };
            if (recurso.tipo === 'MATERIAL')
              itemData.materialId = recurso.itemCatalogoId;
            if (recurso.tipo === 'EPI') itemData.epiId = recurso.itemCatalogoId;
            if (recurso.tipo === 'EQUIPAMENTO')
              itemData.equipamentoId = recurso.itemCatalogoId;

            await tx.separacao.create({
              data: {
                codigo: `SEP-${data.osId}-${etapaOS.ordem}-${seqSep++}`,
                etapaOsId: data.etapaOSId,
                dataNecessidade: ativ.dataPrevisao
                  ? new Date(ativ.dataPrevisao)
                  : new Date(),
                osId: data.osId,
                itens: { create: itemData },
              },
            });
          }
        }

        criadas.push(atividadeOS);
      }

      return criadas;
    });
  }

  async atualizarStatus(id: string, status: string) {
    await this.detalhar(id);
    return this.prisma.atividadeOS.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
