import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SeparacaoService {
  constructor(private readonly prisma: PrismaService) {}

  private includeComum = {
    executucaoAtividade: {
      include: {
        atividade: {
          include: {
            obraEtapa: {
              select: {
                obraId: true,
                obra: {
                  select: {
                    id: true,
                    codigo: true,
                    user: { select: { nome: true } },
                    endereco: {
                      select: {
                        logradouro: true,
                        numero: true,
                        bairro: true,
                        cidade: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    confirmadoPor: { select: { id: true, nome: true } },
    itens: {
      include: {
        material: true,
        epi: true,
        equipamento: true,
        colaborador: {
          select: {
            id: true,
            nome: true,
            papeis: { select: { papel: { select: { nome: true } } } },
          },
        },
      },
    },
  } as const;

  async listar(params?: { obraId?: number; status?: string }) {
    const where: Record<string, unknown> = {};
    if (params?.obraId) {
      where.executucaoAtividade = {
        atividade: { obraEtapa: { obraId: params.obraId } },
      };
    }
    if (params?.status) {
      const statusMap: Record<string, string> = {
        PENDENTE: 'SEPARACAO_PENDENTE',
        CONCLUIDA: 'SEPARACAO_CONCLUIDA',
        SEPARACAO: 'SEPARACAO_CONCLUIDA',
        RETIRADA_PENDENTE: 'RETIRADA_PENDENTE',
        RETIRADA_CONCLUIDA: 'RETIRADA_CONCLUIDA',
        DEVOLUCAO_PENDENTE: 'DEVOLUCAO_PENDENTE',
        DEVOLUCAO_CONCLUIDA: 'DEVOLUCAO_CONCLUIDA',
      };
      where.statusNovo = statusMap[params.status] ?? params.status;
    }

    return this.prisma.separacao.findMany({
      where,
      include: this.includeComum,
      orderBy: { dataNecessidade: 'asc' },
    });
  }

  async detalhar(id: number) {
    const item = await this.prisma.separacao.findUnique({
      where: { id },
      include: this.includeComum,
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
    dados: {
      colaboradorId: number;
      registradoPorId: number;
      observacao?: string;
    },
  ) {
    const separacao = await this.detalhar(separacaoId);
    if (!dados.colaboradorId)
      throw new AppError(
        400,
        'Informe o colaborador que está retirando o item',
      );
    const item = separacao.itens.find((i) => i.id === itemId);
    if (!item)
      throw new NotFoundException(
        `Item ${itemId} não encontrado na separação ${separacaoId}`,
      );
    if (item.status !== 'PENDENTE')
      throw new AppError(409, 'Item já foi processado');

    const obraId =
      separacao.executucaoAtividade?.atividade?.obraEtapa?.obraId ?? null;

    return this.prisma.$transaction(async (tx) => {
      await this.baixarItemRetirada(tx, {
        separacaoId,
        itemId,
        materialId: item.materialId,
        epiId: item.epiId,
        equipamentoId: item.equipamentoId,
        quantidade: Number(item.quantidadeNecessaria),
        obraId,
        executucaoAtividadeId: separacao.executucaoAtividadeId,
        colaboradorId: dados.colaboradorId,
        registradoPorId: dados.registradoPorId,
        observacao: dados.observacao,
      });

      return tx.separacaoItem.update({
        where: { id: itemId },
        data: {
          status: 'RETIRADO',
          colaboradorId: dados.colaboradorId,
          retiradoPorId: dados.registradoPorId,
          retiradoEm: new Date(),
          observacao: dados.observacao,
        },
      });
    });
  }

  async adicionarItem(
    separacaoId: number,
    dados: {
      materialId?: number;
      epiId?: number;
      equipamentoId?: number;
      quantidade: number;
      colaboradorId?: number;
      registradoPorId: number;
      observacao?: string;
    },
  ) {
    const separacao = await this.detalhar(separacaoId);

    const materialId = dados.materialId ?? null;
    const epiId = dados.epiId ?? null;
    const equipamentoId = dados.equipamentoId ?? null;
    const informados = [materialId, epiId, equipamentoId].filter(
      (valor): valor is number => typeof valor === 'number' && valor > 0,
    );
    if (informados.length !== 1)
      throw new AppError(
        400,
        'Informe exatamente um item: material, EPI ou equipamento',
      );

    const quantidade = Number(dados.quantidade);
    if (!Number.isFinite(quantidade) || quantidade <= 0)
      throw new AppError(400, 'Quantidade deve ser maior que zero');

    if (equipamentoId && quantidade !== 1)
      throw new AppError(400, 'Quantidade de equipamento deve ser 1');

    const retirarAgora = Boolean(dados.colaboradorId);

    const obraId =
      separacao.executucaoAtividade?.atividade?.obraEtapa?.obraId ?? null;
    const agora = new Date();

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.separacaoItem.create({
        data: {
          separacaoId,
          materialId,
          epiId,
          equipamentoId,
          quantidadeNecessaria: quantidade,
          quantidadeSeparada: retirarAgora ? quantidade : 0,
          status: retirarAgora ? 'RETIRADO' : 'PENDENTE',
          colaboradorId: retirarAgora ? dados.colaboradorId : null,
          retiradoPorId: retirarAgora ? dados.registradoPorId : null,
          retiradoEm: retirarAgora ? agora : null,
          observacao: dados.observacao ?? null,
        },
      });

      if (retirarAgora) {
        await this.baixarItemRetirada(tx, {
          separacaoId,
          itemId: item.id,
          materialId,
          epiId,
          equipamentoId,
          quantidade,
          obraId,
          executucaoAtividadeId: separacao.executucaoAtividadeId,
          colaboradorId: dados.colaboradorId as number,
          registradoPorId: dados.registradoPorId,
          observacao: dados.observacao,
        });
      }

      return item;
    });
  }

  private async baixarItemRetirada(
    tx: Prisma.TransactionClient,
    dados: {
      separacaoId: number;
      itemId: number;
      materialId: number | null;
      epiId: number | null;
      equipamentoId: number | null;
      quantidade: number;
      obraId: number | null;
      executucaoAtividadeId: string | null;
      colaboradorId: number;
      registradoPorId: number;
      observacao?: string;
    },
  ) {
    if (dados.materialId) {
      const saldo = await tx.saldoEstoque.findUnique({
        where: { materialId: dados.materialId },
      });
      const saldoAtual = Number(saldo?.saldo ?? 0);
      if (saldoAtual < dados.quantidade) {
        throw new AppError(
          409,
          `Saldo insuficiente para material ${dados.materialId}. Disponível: ${saldoAtual}`,
        );
      }
      const novoSaldo = saldoAtual - dados.quantidade;
      await tx.saldoEstoque.update({
        where: { materialId: dados.materialId },
        data: { saldo: novoSaldo },
      });
      await tx.movimentoEstoque.create({
        data: {
          materialId: dados.materialId,
          tipo: 'SAIDA',
          quantidade: dados.quantidade,
          saldoApos: novoSaldo,
          separacaoItemId: dados.itemId,
          obraId: dados.obraId ?? undefined,
          registradoPorId: dados.registradoPorId,
          observacao:
            dados.observacao ?? `Retirada - Separação ${dados.separacaoId}`,
        },
      });
    }

    if (dados.epiId) {
      await tx.entregaEpi.create({
        data: {
          epiId: dados.epiId,
          colaboradorId: dados.colaboradorId,
          quantidade: dados.quantidade,
          observacao: dados.observacao,
          registradoPorId: dados.registradoPorId,
          executucaoAtividadeId: dados.executucaoAtividadeId,
          separacaoId: dados.separacaoId,
          status: 'EM_USO',
        },
      });
    }

    if (dados.equipamentoId) {
      await tx.retiradaEquipamento.create({
        data: {
          equipamentoId: dados.equipamentoId,
          colaboradorId: dados.colaboradorId,
          observacao: dados.observacao,
          registradoPorId: dados.registradoPorId,
          executucaoAtividadeId: dados.executucaoAtividadeId,
          status: 'EM_USO',
        },
      });
    }
  }

  async registrarDevolucaoItem(
    separacaoId: number,
    itemId: number,
    dados: {
      registradoPorId: number;
      observacao?: string;
      status?: 'DEVOLVIDO' | 'PERDIDO';
    },
  ) {
    const separacao = await this.detalhar(separacaoId);
    const item = separacao.itens.find((i) => i.id === itemId);
    if (!item)
      throw new NotFoundException(
        `Item ${itemId} não encontrado na separação ${separacaoId}`,
      );
    if (item.status !== 'RETIRADO') {
      if (
        item.status === 'DEVOLVIDO' ||
        item.status === 'PERDIDO' ||
        item.status === 'CONFERIDO'
      )
        throw new AppError(
          409,
          `Item já foi finalizado com status ${item.status}; devolução já registrada`,
        );
      throw new AppError(409, 'Item ainda não foi retirado');
    }

    const statusFinal = dados.status ?? 'DEVOLVIDO';
    if (statusFinal !== 'DEVOLVIDO' && statusFinal !== 'PERDIDO')
      throw new AppError(
        400,
        "Status de devolução inválido. Use 'DEVOLVIDO' ou 'PERDIDO'",
      );
    const obraId =
      separacao.executucaoAtividade?.atividade?.obraEtapa?.obraId ?? null;
    const agora = new Date();

    return this.prisma.$transaction(async (tx) => {
      if (item.materialId && statusFinal === 'DEVOLVIDO') {
        const saldo = await tx.saldoEstoque.findUnique({
          where: { materialId: item.materialId },
        });
        const saldoAtual = Number(saldo?.saldo ?? 0);
        const qtd = Number(
          item.quantidadeSeparada || item.quantidadeNecessaria,
        );
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
            obraId: obraId ?? undefined,
            registradoPorId: dados.registradoPorId,
            observacao:
              dados.observacao ?? `Devolução - Separação ${separacaoId}`,
          },
        });
      }

      if (item.epiId) {
        const entrega = await tx.entregaEpi.findFirst({
          where: { separacaoId, epiId: item.epiId, status: 'EM_USO' },
        });
        if (entrega) {
          await tx.entregaEpi.update({
            where: { id: entrega.id },
            data: {
              status: statusFinal as 'DEVOLVIDO' | 'PERDIDO',
              dataDevolucao: agora,
            },
          });
        }
      }

      if (item.equipamentoId) {
        const retirada = await tx.retiradaEquipamento.findFirst({
          where: {
            equipamentoId: item.equipamentoId,
            executucaoAtividadeId: separacao.executucaoAtividadeId,
            status: 'EM_USO',
          },
        });
        if (retirada) {
          await tx.retiradaEquipamento.update({
            where: { id: retirada.id },
            data: {
              status: statusFinal as 'DEVOLVIDO' | 'PERDIDO',
              dataDevolucao: agora,
            },
          });
        }
      }

      return tx.separacaoItem.update({
        where: { id: itemId },
        data: {
          status: statusFinal,
          observacao: dados.observacao,
          ...(statusFinal === 'DEVOLVIDO' ? { devolvidoEm: agora } : {}),
        },
      });
    });
  }

  async removerItem(separacaoId: number, itemId: number) {
    const separacao = await this.detalhar(separacaoId);
    const item = separacao.itens.find((i) => i.id === itemId);
    if (!item)
      throw new NotFoundException(
        `Item ${itemId} não encontrado na separação ${separacaoId}`,
      );

    const statusRemoviveis = new Set(['PENDENTE', 'SEPARADO', 'EM_FALTA']);
    if (!statusRemoviveis.has(item.status))
      throw new AppError(
        409,
        'Só é possível excluir itens que ainda não foram retirados',
      );

    const movimentos = await this.prisma.movimentoEstoque.count({
      where: { separacaoItemId: itemId },
    });
    if (movimentos > 0)
      throw new AppError(
        409,
        'Item já possui movimentação de estoque e não pode ser excluído',
      );

    return this.prisma.separacaoItem.delete({ where: { id: itemId } });
  }

  async excluir(id: number) {
    const separacao = await this.detalhar(id);
    if (separacao.statusNovo !== 'SEPARACAO_PENDENTE') {
      throw new AppError(409, 'Só é possível excluir separações pendentes');
    }
    return this.prisma.separacao.delete({ where: { id } });
  }
}
