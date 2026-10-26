import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, SetorCompra, TipoListaCompra } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { SalvarItensListaInput } from '../schemas/listas-compras.js';

export const TRAVADOS = ['ENVIADA', 'APROVADA', 'COMPRADA'] as const;

const INCLUDE_ITEM: Prisma.ListaCompraItemInclude = {
  material: { include: { unidade: true, saldo: true } },
  epi: { include: { unidadeMedida: true } },
  equipamento: { include: { unidadeMedida: true } },
  adicionadoPor: { select: { id: true, nome: true } },
  compradoPor: { select: { id: true, nome: true } },
};

const INCLUDE_LISTA: Prisma.ListaCompraInclude = {
  itens: { include: INCLUDE_ITEM, orderBy: { id: 'asc' } },
  enviadoPor: { select: { id: true, nome: true } },
  aprovadoPor: { select: { id: true, nome: true } },
};

@Injectable()
export class ListasComprasService {
  constructor(private readonly prisma: PrismaService) {}

  async obter(
    tipo: TipoListaCompra,
    setor: SetorCompra,
    mes: number,
    ano: number,
  ) {
    return this.prisma.listaCompra.findUnique({
      where: { tipo_setor_mes_ano: { tipo, setor, mes, ano } },
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
  ) {
    const existente = await this.obter(tipo, setor, mes, ano);
    if (
      existente &&
      (TRAVADOS as readonly string[]).includes(existente.status)
    ) {
      throw new ConflictException(
        'Lista enviada/aprovada não pode ser editada. Reverta o envio antes de alterar.',
      );
    }

    const resolvidos: {
      materialId?: number;
      epiId?: number;
      equipamentoId?: number;
      quantidade: number;
    }[] = [];
    for (const item of input.itens) {
      resolvidos.push({
        ...(await this.resolverItem(tipo, item.itemId)),
        quantidade: item.quantidade,
      });
    }

    let listaId: number;
    const ops: Prisma.PrismaPromise<{ count: number }>[] = [];
    if (existente) {
      listaId = existente.id;
      ops.push(this.prisma.listaCompraItem.deleteMany({ where: { listaId } }));
    } else {
      const criada = await this.prisma.listaCompra.create({
        data: { tipo, setor, mes, ano },
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
        compradoPorId: null,
        compradoEm: null,
      },
    });
    return this.buscarOuFalhar(id);
  }

  async aprovar(id: number, usuarioId: number) {
    const lista = await this.buscarOuFalhar(id);
    if (lista.status !== 'ENVIADA') {
      throw new ConflictException(
        'Somente listas enviadas podem ser aprovadas',
      );
    }
    const r = await this.prisma.listaCompra.updateMany({
      where: { id, status: 'ENVIADA' },
      data: {
        status: 'APROVADA',
        aprovadoPorId: usuarioId,
        aprovadoEm: new Date(),
      },
    });
    if (r.count === 0) {
      throw new ConflictException(
        'Somente listas enviadas podem ser aprovadas',
      );
    }
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
    const r = await this.prisma.listaCompra.updateMany({
      where: { id, status: 'ENVIADA' },
      data: {
        status: 'RECUSADA',
        motivoRecusa: motivo,
        aprovadoPorId: usuarioId,
        aprovadoEm: new Date(),
      },
    });
    if (r.count === 0) {
      throw new ConflictException(
        'Somente listas enviadas podem ser recusadas',
      );
    }
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
    custoReal: number | undefined,
    usuarioId: number,
  ) {
    const lista = await this.buscarOuFalhar(listaId);
    if (lista.status !== 'APROVADA' && lista.status !== 'ENVIADA') {
      throw new ConflictException(
        'Compras só em listas aprovadas (ou enviadas)',
      );
    }
    const r = await this.prisma.listaCompraItem.updateMany({
      where: { id: itemId, listaId, status: { not: 'COMPRADO' } },
      data: {
        status: 'COMPRADO',
        custoReal: custoReal ?? null,
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
