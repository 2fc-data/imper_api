import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';

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
        itens: {
          include: {
            material: true,
            epi: true,
            equipamento: true,
          },
        },
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
        itens: {
          include: {
            material: true,
            epi: true,
            equipamento: true,
          },
        },
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

  async registrarRetiradaItem(
    separacaoId: number,
    itemId: number,
    dados: { colaboradorId: number; registradoPorId: number; observacao?: string },
  ) {
    const separacao = await this.detalhar(separacaoId);
    const item = separacao.itens.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException(`Item ${itemId} não encontrado na separação ${separacaoId}`);
    if (item.status !== 'PENDENTE') throw new AppError(409, 'Item já foi processado');

    return this.prisma.$transaction(async (tx) => {
      // MATERIAL: criar movimento de estoque (saída)
      if (item.materialId) {
        const saldo = await tx.saldoEstoque.findUnique({
          where: { materialId: item.materialId },
        });
        const saldoAtual = Number(saldo?.saldo ?? 0);
        const qtd = Number(item.quantidadeNecessaria);
        if (saldoAtual < qtd) {
          throw new AppError(409, `Saldo insuficiente para material ${item.materialId}. Disponível: ${saldoAtual}`);
        }
        const novoSaldo = saldoAtual - qtd;
        await tx.saldoEstoque.update({
          where: { materialId: item.materialId },
          data: { saldo: novoSaldo },
        });
        await tx.movimentoEstoque.create({
          data: {
            materialId: item.materialId,
            tipo: 'SAIDA',
            quantidade: qtd,
            saldoApos: novoSaldo,
            separacaoItemId: itemId,
            ordemServicoId: separacao.osId ?? undefined,
            registradoPorId: dados.registradoPorId,
            observacao: dados.observacao ?? `Retirada - Separação ${separacaoId}`,
          },
        });
      }

      // EPI: criar entrega
      if (item.epiId) {
        await tx.entregaEpi.create({
          data: {
            epiId: item.epiId,
            colaboradorId: dados.colaboradorId,
            quantidade: item.quantidadeNecessaria,
            observacao: dados.observacao,
            registradoPorId: dados.registradoPorId,
            osId: separacao.osId ?? undefined,
            separacaoId,
            status: 'EM_USO',
          },
        });
      }

      // EQUIPAMENTO: criar retirada
      if (item.equipamentoId) {
        await tx.retiradaEquipamento.create({
          data: {
            equipamentoId: item.equipamentoId,
            colaboradorId: dados.colaboradorId,
            observacao: dados.observacao,
            registradoPorId: dados.registradoPorId,
            osId: separacao.osId ?? undefined,
            status: 'EM_USO',
          },
        });
      }

      // Atualizar item
      return tx.separacaoItem.update({
        where: { id: itemId },
        data: {
          status: 'CONFERIDO',
          retiradoPorId: dados.registradoPorId,
          retiradoEm: new Date(),
          observacao: dados.observacao,
        },
      });
    });
  }

  async registrarDevolucaoItem(
    separacaoId: number,
    itemId: number,
    dados: { registradoPorId: number; observacao?: string; status?: 'DEVOLVIDO' | 'PERDIDO' },
  ) {
    const separacao = await this.detalhar(separacaoId);
    const item = separacao.itens.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException(`Item ${itemId} não encontrado na separação ${separacaoId}`);
    if (item.status !== 'CONFERIDO') throw new AppError(409, 'Item ainda não foi retirado');

    const statusFinal = dados.status ?? 'DEVOLVIDO';

    return this.prisma.$transaction(async (tx) => {
      // MATERIAL: criar movimento de estoque (entrada) — apenas se devolvido
      if (item.materialId && statusFinal === 'DEVOLVIDO') {
        const saldo = await tx.saldoEstoque.findUnique({
          where: { materialId: item.materialId },
        });
        const saldoAtual = Number(saldo?.saldo ?? 0);
        const qtd = Number(item.quantidadeSeparada || item.quantidadeNecessaria);
        const novoSaldo = saldoAtual + qtd;
        await tx.saldoEstoque.update({
          where: { materialId: item.materialId },
          data: { saldo: novoSaldo },
        });
        await tx.movimentoEstoque.create({
          data: {
            materialId: item.materialId,
            tipo: 'ENTRADA',
            quantidade: qtd,
            saldoApos: novoSaldo,
            separacaoItemId: itemId,
            ordemServicoId: separacao.osId ?? undefined,
            registradoPorId: dados.registradoPorId,
            observacao: dados.observacao ?? `Devolução - Separação ${separacaoId}`,
          },
        });
      }

      // EPI: atualizar entrega existente
      if (item.epiId) {
        const entrega = await tx.entregaEpi.findFirst({
          where: { separacaoId, epiId: item.epiId, status: 'EM_USO' },
        });
        if (entrega) {
          await tx.entregaEpi.update({
            where: { id: entrega.id },
            data: {
              status: statusFinal as 'DEVOLVIDO' | 'PERDIDO',
              dataDevolucao: new Date(),
            },
          });
        }
      }

      // EQUIPAMENTO: atualizar retirada existente
      if (item.equipamentoId) {
        const retirada = await tx.retiradaEquipamento.findFirst({
          where: { equipamentoId: item.equipamentoId, osId: separacao.osId, status: 'EM_USO' },
        });
        if (retirada) {
          await tx.retiradaEquipamento.update({
            where: { id: retirada.id },
            data: {
              status: statusFinal as 'DEVOLVIDO' | 'PERDIDO',
              dataDevolucao: new Date(),
            },
          });
        }
      }

      return tx.separacaoItem.update({
        where: { id: itemId },
        data: {
          observacao: dados.observacao,
        },
      });
    });
  }

  async excluir(id: number) {
    const separacao = await this.detalhar(id);
    if (separacao.statusNovo !== 'SEPARACAO_PENDENTE') {
      throw new AppError(409, 'Só é possível excluir separações pendentes');
    }
    return this.prisma.separacao.delete({ where: { id } });
  }
}
