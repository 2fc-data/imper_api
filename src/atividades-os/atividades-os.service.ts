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
        equipe: {
          include: {
            lider: { select: { id: true, nome: true } },
            membros: {
              include: { usuario: { select: { id: true, nome: true } } },
            },
          },
        },
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
        equipe: {
          include: {
            lider: { select: { id: true, nome: true } },
            membros: {
              include: {
                usuario: { select: { id: true, nome: true, telefone: true } },
              },
            },
          },
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

  async planificar(data: {
    osId: number;
    etapaOSId: number;
    atividades: {
      catalogoAtividadeId: string;
      equipeId?: string;
      dataPrevisao?: string;
    }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
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
            equipeId: ativ.equipeId,
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
                codigo: `SEP-${data.osId}-${Date.now()}`,
                etapaOsId: data.etapaOSId,
                dataNecessidade: ativ.dataPrevisao
                  ? new Date(ativ.dataPrevisao)
                  : new Date(),
                osId: data.osId,
                equipeId: ativ.equipeId,
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

  async associarEquipe(id: string, equipeId: string) {
    await this.detalhar(id);
    return this.prisma.atividadeOS.update({
      where: { id },
      data: { equipeId },
    });
  }
}
