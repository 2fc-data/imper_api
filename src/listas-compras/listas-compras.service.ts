import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, SetorCompra, TipoListaCompra } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  ComprarItemInput,
  SalvarItensListaInput,
} from '../schemas/listas-compras.js';

export const TRAVADOS = ['ENVIADA', 'APROVADA', 'COMPRADA'] as const;

const INCLUDE_ITEM: Prisma.ListaCompraItemInclude = {
  material: {
    include: {
      unidade: true,
      saldo: true,
      fornecedor: { select: { id: true, nome: true } },
    },
  },
  epi: { include: { unidadeMedida: true } },
  equipamento: { include: { unidadeMedida: true } },
  fornecedor: { select: { id: true, nome: true } },
  adicionadoPor: { select: { id: true, nome: true } },
  compradoPor: { select: { id: true, nome: true } },
};

const INCLUDE_LISTA: Prisma.ListaCompraInclude = {
  tipoDespesa: true,
  itens: { include: INCLUDE_ITEM, orderBy: { id: 'asc' } },
  enviadoPor: { select: { id: true, nome: true } },
  aprovadoPor: { select: { id: true, nome: true } },
};

@Injectable()
export class ListasComprasService {
  constructor(private readonly prisma: PrismaService) {}

  private filtroChave(
    tipo: TipoListaCompra,
    setor: SetorCompra,
    mes: number,
    ano: number,
    tipoDespesaId?: number,
  ): Prisma.ListaCompraWhereInput | null {
    if (tipo === 'DESPESAS_EXTRAS') {
      return tipoDespesaId ? { tipo, setor, mes, ano, tipoDespesaId } : null;
    }
    return { tipo, setor, mes, ano };
  }

  async obter(
    tipo: TipoListaCompra,
    setor: SetorCompra,
    mes: number,
    ano: number,
    tipoDespesaId?: number,
  ) {
    const where = this.filtroChave(tipo, setor, mes, ano, tipoDespesaId);
    if (!where) return null;
    const atual = await this.prisma.listaCompra.findFirst({
      where: { ...where, status: { not: 'COMPRADA' } },
      orderBy: { id: 'desc' },
      include: INCLUDE_LISTA,
    });
    if (atual) return atual;
    return this.prisma.listaCompra.findFirst({
      where,
      orderBy: { id: 'desc' },
      include: INCLUDE_LISTA,
    });
  }

  async listarRodadas(
    tipo: TipoListaCompra,
    setor: SetorCompra,
    mes: number,
    ano: number,
    tipoDespesaId?: number,
  ) {
    const where = this.filtroChave(tipo, setor, mes, ano, tipoDespesaId);
    if (!where) return [];
    const rodadas = await this.prisma.listaCompra.findMany({
      where,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        _count: { select: { itens: true } },
      },
    });
    return rodadas.map((r) => ({
      id: r.id,
      status: r.status,
      createdAt: r.createdAt,
      totalItens: r._count.itens,
    }));
  }

  private async buscarEditavel(
    tipo: TipoListaCompra,
    setor: SetorCompra,
    mes: number,
    ano: number,
    tipoDespesaId?: number,
  ) {
    const where = this.filtroChave(tipo, setor, mes, ano, tipoDespesaId);
    if (!where) return null;
    return this.prisma.listaCompra.findFirst({
      where: { ...where, status: { not: 'COMPRADA' } },
      orderBy: { id: 'desc' },
      include: INCLUDE_LISTA,
    });
  }

  async buscarOuFalhar(id: number) {
    const lista = await this.prisma.listaCompra.findUnique({
      where: { id },
      include: INCLUDE_LISTA,
    });
    if (!lista) throw new NotFoundException('Lista de compras não encontrada');
    return lista;
  }

  async salvarItens(
    tipo: TipoListaCompra,
    setor: SetorCompra,
    mes: number,
    ano: number,
    input: SalvarItensListaInput,
    usuarioId: number,
    tipoDespesaId?: number,
  ) {
    const tDespesaId =
      tipo === 'DESPESAS_EXTRAS'
        ? (tipoDespesaId ?? input.tipoDespesaId ?? null)
        : null;
    const existente = await this.buscarEditavel(
      tipo,
      setor,
      mes,
      ano,
      tDespesaId ?? undefined,
    );
    if (
      existente &&
      (TRAVADOS as readonly string[]).includes(existente.status)
    ) {
      throw new ConflictException(
        'Lista enviada/aprovada não pode ser editada. Reverta o envio antes de alterar.',
      );
    }

    await this.validarFornecedores(input.itens);

    const resolvidos: {
      materialId?: number;
      epiId?: number;
      equipamentoId?: number;
      quantidade: number;
      fornecedorId: number | null;
      valorUnitario: number | null;
      dataCompra: Date | null;
    }[] = [];
    for (const item of input.itens) {
      resolvidos.push({
        ...(await this.resolverItem(tipo, item.itemId)),
        quantidade: item.quantidade,
        fornecedorId: item.fornecedorId ?? null,
        valorUnitario: item.valorUnitario ?? null,
        dataCompra: this.parseDataCompra(item.dataCompra),
      });
    }

    let listaId: number;
    const ops: Prisma.PrismaPromise<{ count: number }>[] = [];
    if (existente) {
      listaId = existente.id;
      ops.push(this.prisma.listaCompraItem.deleteMany({ where: { listaId } }));
    } else {
      const criada = await this.prisma.listaCompra.create({
        data: { tipo, setor, mes, ano, tipoDespesaId: tDespesaId },
      });
      listaId = criada.id;
    }

    if (resolvidos.length > 0) {
      ops.push(
        this.prisma.listaCompraItem.createMany({
          data: resolvidos.map((r) => ({
            listaId,
            materialId: r.materialId ?? null,
            epiId: r.epiId ?? null,
            equipamentoId: r.equipamentoId ?? null,
            quantidade: r.quantidade,
            fornecedorId: r.fornecedorId,
            valorUnitario: r.valorUnitario,
            dataCompra: r.dataCompra,
            adicionadoPorId: usuarioId,
          })),
        }),
      );
    }

    if (ops.length > 0) {
      await this.prisma.$transaction(ops);
    }

    return this.buscarOuFalhar(listaId);
  }

  private async resolverItem(
    tipo: TipoListaCompra,
    itemId: number,
  ): Promise<{ materialId?: number; epiId?: number; equipamentoId?: number }> {
    if (
      tipo === 'DESPESAS_EXTRAS' ||
      (tipo as string) === 'SUPERMERCADO' ||
      tipo === 'MATERIAL'
    ) {
      const tipoMaterial =
        tipo === 'DESPESAS_EXTRAS' || (tipo as string) === 'SUPERMERCADO'
          ? 'DESPESAS_EXTRAS'
          : 'MATERIAL';
      const material = await this.prisma.material.findFirst({
        where: { id: itemId, tipo: tipoMaterial, status: 'ATIVO' },
        select: { id: true },
      });
      if (!material) {
        throw new NotFoundException(
          `Material (${tipo.toLowerCase()}) #${itemId} não encontrado ou inativo`,
        );
      }
      return { materialId: material.id };
    }
    if (tipo === 'EPI') {
      const epi = await this.prisma.epi.findFirst({
        where: { id: itemId, ativo: true },
        select: { id: true },
      });
      if (!epi)
        throw new NotFoundException(`EPI #${itemId} não encontrado ou inativo`);
      return { epiId: epi.id };
    }
    const equipamento = await this.prisma.equipamento.findFirst({
      where: { id: itemId, ativo: true },
      select: { id: true },
    });
    if (!equipamento) {
      throw new NotFoundException(
        `Equipamento #${itemId} não encontrado ou inativo`,
      );
    }
    return { equipamentoId: equipamento.id };
  }

  async enviar(id: number, usuarioId: number) {
    const lista = await this.buscarOuFalhar(id);
    if (lista.status !== 'ABERTA' && lista.status !== 'RECUSADA') {
      throw new ConflictException(
        'Somente listas abertas ou recusadas podem ser enviadas',
      );
    }
    const r = await this.prisma.listaCompra.updateMany({
      where: { id, status: { in: ['ABERTA', 'RECUSADA'] } },
      data: {
        status: 'ENVIADA',
        enviadoPorId: usuarioId,
        enviadoEm: new Date(),
        motivoRecusa: null,
      },
    });
    if (r.count === 0) {
      throw new ConflictException(
        'Somente listas abertas ou recusadas podem ser enviadas',
      );
    }
    await this.prisma.listaCompraItem.updateMany({
      where: { listaId: id, status: { not: 'PENDENTE' } },
      data: {
        status: 'PENDENTE',
        custoReal: null,
        dataCompra: null,
        compradoPorId: null,
        compradoEm: null,
      },
    });
    return this.buscarOuFalhar(id);
  }

  async listarPendentesAprovacao(usuarioId: number) {
    return this.prisma.listaCompra.findMany({
      where: {
        status: 'ENVIADA',
        NOT: { enviadoPorId: usuarioId },
      },
      include: INCLUDE_LISTA,
      orderBy: { enviadoEm: 'asc' },
    });
  }

  async aprovar(id: number, usuarioId: number) {
    const lista = await this.buscarOuFalhar(id);
    if (lista.status !== 'ENVIADA') {
      throw new ConflictException(
        'Somente listas enviadas podem ser aprovadas',
      );
    }
    if (lista.enviadoPorId && lista.enviadoPorId === usuarioId) {
      throw new ForbiddenException(
        'Você não pode aprovar uma lista enviada por você mesmo',
      );
    }

    const agora = new Date();
    await this.prisma.$transaction(async (tx) => {
      const r = await tx.listaCompra.updateMany({
        where: { id, status: 'ENVIADA' },
        data: {
          status: 'APROVADA',
          aprovadoPorId: usuarioId,
          aprovadoEm: agora,
        },
      });
      if (r.count === 0) {
        throw new ConflictException(
          'Somente listas enviadas podem ser aprovadas',
        );
      }

      if (lista.enviadoPorId) {
        await tx.notificacao.create({
          data: {
            userId: lista.enviadoPorId,
            titulo: 'Lista de compras aprovada',
            mensagem: `Sua lista de compras (${lista.tipo} - ${lista.setor}) referente a ${String(lista.mes).padStart(2, '0')}/${lista.ano} foi aprovada.`,
            link: '/compras',
          },
        });
      }
    });

    await this.marcarCompradaSeNecessario(id);
    return this.buscarOuFalhar(id);
  }

  async recusar(id: number, motivo: string, usuarioId: number) {
    const lista = await this.buscarOuFalhar(id);
    if (lista.status !== 'ENVIADA') {
      throw new ConflictException(
        'Somente listas enviadas podem ser recusadas',
      );
    }
    if (lista.enviadoPorId && lista.enviadoPorId === usuarioId) {
      throw new ForbiddenException(
        'Você não pode recusar uma lista enviada por você mesmo',
      );
    }

    const agora = new Date();
    await this.prisma.$transaction(async (tx) => {
      const r = await tx.listaCompra.updateMany({
        where: { id, status: 'ENVIADA' },
        data: {
          status: 'RECUSADA',
          motivoRecusa: motivo,
          aprovadoPorId: usuarioId,
          aprovadoEm: agora,
        },
      });
      if (r.count === 0) {
        throw new ConflictException(
          'Somente listas enviadas podem ser recusadas',
        );
      }

      if (lista.enviadoPorId) {
        await tx.notificacao.create({
          data: {
            userId: lista.enviadoPorId,
            titulo: 'Lista de compras recusada',
            mensagem: `Sua lista de compras (${lista.tipo} - ${lista.setor}) referente a ${String(lista.mes).padStart(2, '0')}/${lista.ano} foi recusada. Motivo: ${motivo}`,
            link: '/compras',
          },
        });
      }
    });

    return this.buscarOuFalhar(id);
  }

  async recusarItem(listaId: number, itemId: number, _usuarioId: number) {
    const lista = await this.buscarOuFalhar(listaId);
    if (lista.status !== 'ENVIADA') {
      throw new ConflictException(
        'Itens só podem ser recusados com a lista enviada',
      );
    }
    const r = await this.prisma.listaCompraItem.updateMany({
      where: { id: itemId, listaId, status: 'PENDENTE' },
      data: { status: 'RECUSADO' },
    });
    if (r.count === 0) {
      throw new BadRequestException(
        'Item não está pendente ou não pertence à lista',
      );
    }
    return this.buscarOuFalhar(listaId);
  }

  async reverterItem(listaId: number, itemId: number) {
    const lista = await this.buscarOuFalhar(listaId);
    if (lista.status !== 'ENVIADA') {
      throw new ConflictException(
        'Itens só podem ser revertidos com a lista enviada',
      );
    }
    const r = await this.prisma.listaCompraItem.updateMany({
      where: { id: itemId, listaId, status: 'RECUSADO' },
      data: { status: 'PENDENTE' },
    });
    if (r.count === 0) {
      throw new BadRequestException(
        'Item não está recusado ou não pertence à lista',
      );
    }
    return this.buscarOuFalhar(listaId);
  }

  async comprarItem(
    listaId: number,
    itemId: number,
    input: ComprarItemInput,
    usuarioId: number,
  ) {
    const lista = await this.buscarOuFalhar(listaId);
    if (lista.status !== 'APROVADA' && lista.status !== 'ENVIADA') {
      throw new ConflictException(
        'Compras só em listas aprovadas (ou enviadas)',
      );
    }
    const item = lista.itens.find((i) => i.id === itemId);
    if (!item) {
      throw new BadRequestException('Item não pertence à lista');
    }
    const quantidade = Number(item.quantidade);
    const valorUnitario =
      input.valorUnitario ??
      (item.valorUnitario != null ? Number(item.valorUnitario) : null);
    const custoReal =
      input.custoReal ??
      (valorUnitario != null
        ? Number((valorUnitario * quantidade).toFixed(2))
        : null);
    const fornecedorId =
      input.fornecedorId !== undefined ? input.fornecedorId : item.fornecedorId;
    const dataCompra = input.dataCompra
      ? new Date(input.dataCompra)
      : (item.dataCompra ?? new Date());
    const r = await this.prisma.listaCompraItem.updateMany({
      where: { id: itemId, listaId, status: { notIn: ['COMPRADO', 'CONFERIDO'] } },
      data: {
        status: 'COMPRADO',
        valorUnitario,
        custoReal,
        fornecedorId,
        dataCompra,
        compradoPorId: usuarioId,
        compradoEm: new Date(),
      },
    });
    if (r.count === 0) {
      throw new BadRequestException('Item já comprado ou não pertence à lista');
    }
    await this.marcarCompradaSeNecessario(listaId);
    return this.buscarOuFalhar(listaId);
  }

  async conferirItem(listaId: number, itemId: number, _usuarioId?: number) {
    const item = await this.prisma.listaCompraItem.findFirst({
      where: { id: itemId, listaId },
    });
    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }
    if (item.status !== 'COMPRADO') {
      throw new BadRequestException(
        'Apenas itens com status COMPRADO podem ser conferidos',
      );
    }
    await this.prisma.listaCompraItem.update({
      where: { id: itemId },
      data: { status: 'CONFERIDO' },
    });
    await this.marcarCompradaSeNecessario(listaId);
    return this.buscarOuFalhar(listaId);
  }

  async reverterConferenciaItem(listaId: number, itemId: number) {
    const item = await this.prisma.listaCompraItem.findFirst({
      where: { id: itemId, listaId },
    });
    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }
    if (item.status !== 'CONFERIDO') {
      throw new BadRequestException(
        'Apenas itens com status CONFERIDO podem ter a conferência revertida',
      );
    }
    await this.prisma.listaCompraItem.update({
      where: { id: itemId },
      data: { status: 'COMPRADO' },
    });
    return this.buscarOuFalhar(listaId);
  }

  private parseDataCompra(valor: string | null | undefined): Date | null {
    if (!valor) return null;
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  private async validarFornecedores(
    itens: { fornecedorId?: number | null }[],
  ): Promise<void> {
    const ids = [
      ...new Set(
        itens
          .map((i) => i.fornecedorId)
          .filter((id): id is number => typeof id === 'number'),
      ),
    ];
    if (ids.length === 0) return;
    const encontrados = await this.prisma.fornecedor.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const existentes = new Set(encontrados.map((f) => f.id));
    const ausente = ids.find((id) => !existentes.has(id));
    if (ausente != null) {
      throw new BadRequestException(`Fornecedor #${ausente} não encontrado`);
    }
  }

  private async itensSemPendencia(listaId: number) {
    const itens = await this.prisma.listaCompraItem.findMany({
      where: { listaId },
      select: { status: true },
    });
    return itens.every((i) => i.status !== 'PENDENTE');
  }

  private async marcarCompradaSeNecessario(listaId: number) {
    if (!(await this.itensSemPendencia(listaId))) return;
    await this.prisma.listaCompra.updateMany({
      where: { id: listaId, status: 'APROVADA' },
      data: { status: 'COMPRADA' },
    });
  }
}
