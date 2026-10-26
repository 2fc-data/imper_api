import { ConflictException, NotFoundException } from '@nestjs/common';
import { ListasComprasService } from './listas-compras.service.js';

const mockPrisma = {
  $transaction: vi.fn(),
  listaCompra: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  listaCompraItem: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  material: { findFirst: vi.fn() },
  epi: { findFirst: vi.fn() },
  equipamento: { findFirst: vi.fn() },
};

function servico() {
  return new ListasComprasService(mockPrisma as never);
}

const INCLUDE_LISTA = expect.any(Object);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ListasComprasService — obter', () => {
  it('devolve null quando não há lista para o mês', async () => {
    mockPrisma.listaCompra.findFirst.mockResolvedValue(null);
    const r = await servico().obter('SUPERMERCADO', 'LOJA', 3, 2026);
    expect(r).toBeNull();
    expect(mockPrisma.listaCompra.findFirst).toHaveBeenCalledWith({
      where: {
        tipo: 'SUPERMERCADO',
        setor: 'LOJA',
        mes: 3,
        ano: 2026,
      },
      include: INCLUDE_LISTA,
    });
  });
});

describe('ListasComprasService — salvarItens', () => {
  it('cria lista ABERTA com itens quando não existe', async () => {
    mockPrisma.listaCompra.findFirst.mockResolvedValueOnce(null);
    mockPrisma.listaCompra.findUnique.mockResolvedValueOnce({ id: 1, status: 'ABERTA' });
    mockPrisma.material.findFirst.mockResolvedValue({ id: 7 });
    mockPrisma.listaCompra.create.mockResolvedValue({ id: 1 });
    mockPrisma.listaCompraItem.createMany.mockResolvedValue({ count: 1 });

    const r = await servico().salvarItens(
      'SUPERMERCADO',
      'LOJA',
      3,
      2026,
      { itens: [{ itemId: 7, quantidade: 2 }] },
      99,
    );

    expect(mockPrisma.listaCompra.create).toHaveBeenCalledWith({
      data: {
        tipo: 'SUPERMERCADO',
        setor: 'LOJA',
        mes: 3,
        ano: 2026,
        tipoDespesaId: null,
      },
    });
    expect(mockPrisma.listaCompraItem.createMany).toHaveBeenCalledWith({
      data: [
        {
          listaId: 1,
          materialId: 7,
          epiId: null,
          equipamentoId: null,
          quantidade: 2,
          adicionadoPorId: 99,
        },
      ],
    });
    expect(r.id).toBe(1);
  });

  it('rejeita itemId inexistente para o domínio', async () => {
    mockPrisma.listaCompra.findFirst.mockResolvedValue(null);
    mockPrisma.material.findFirst.mockResolvedValue(null);

    await expect(
      servico().salvarItens(
        'SUPERMERCADO',
        'LOJA',
        3,
        2026,
        { itens: [{ itemId: 999, quantidade: 1 }] },
        1,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('lança 409 quando a lista está travada', async () => {
    mockPrisma.listaCompra.findFirst.mockResolvedValue({
      id: 5,
      status: 'ENVIADA',
    });

    await expect(
      servico().salvarItens('MATERIAL', 'LOJA', 3, 2026, { itens: [] }, 1),
    ).rejects.toThrow(ConflictException);
    expect(mockPrisma.listaCompraItem.deleteMany).not.toHaveBeenCalled();
  });

  it('substitui itens (deleteMany + createMany) em lista ABERTA', async () => {
    mockPrisma.listaCompra.findFirst.mockResolvedValue({
      id: 5,
      status: 'ABERTA',
    });
    mockPrisma.listaCompra.findUnique.mockResolvedValue({
      id: 5,
      status: 'ABERTA',
    });
    mockPrisma.epi.findFirst.mockResolvedValue({ id: 3 });
    mockPrisma.listaCompraItem.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.listaCompraItem.createMany.mockResolvedValue({ count: 1 });

    await servico().salvarItens(
      'EPI',
      'ALMOXARIFADO',
      4,
      2026,
      { itens: [{ itemId: 3, quantidade: 10 }] },
      42,
    );

    expect(mockPrisma.listaCompraItem.deleteMany).toHaveBeenCalledWith({
      where: { listaId: 5 },
    });
    expect(mockPrisma.listaCompraItem.createMany).toHaveBeenCalledWith({
      data: [
        {
          listaId: 5,
          materialId: null,
          epiId: 3,
          equipamentoId: null,
          quantidade: 10,
          adicionadoPorId: 42,
        },
      ],
    });
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    const ops = mockPrisma.$transaction.mock.calls[0][0] as unknown[];
    expect(ops).toHaveLength(2);
    expect(ops[0]).toBe(
      mockPrisma.listaCompraItem.deleteMany.mock.results[0].value,
    );
    expect(ops[1]).toBe(
      mockPrisma.listaCompraItem.createMany.mock.results[0].value,
    );
  });
});

describe('transições', () => {
  it('enviar: ABERTA → ENVIADA, zera itens e limpa motivo', async () => {
    mockPrisma.listaCompra.findUnique
      .mockResolvedValueOnce({ id: 5, status: 'ABERTA', itens: [{ id: 1 }] })
      .mockResolvedValueOnce({ id: 5, status: 'ENVIADA' });
    mockPrisma.listaCompra.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.listaCompraItem.updateMany.mockResolvedValue({ count: 1 });

    await servico().enviar(5, 9);

    expect(mockPrisma.listaCompra.updateMany).toHaveBeenCalledWith({
      where: { id: 5, status: { in: ['ABERTA', 'RECUSADA'] } },
      data: {
        status: 'ENVIADA',
        enviadoPorId: 9,
        enviadoEm: expect.any(Date),
        motivoRecusa: null,
      },
    });
    expect(mockPrisma.listaCompraItem.updateMany).toHaveBeenCalledWith({
      where: { listaId: 5, status: { not: 'PENDENTE' } },
      data: {
        status: 'PENDENTE',
        custoReal: null,
        compradoPorId: null,
        compradoEm: null,
      },
    });
  });

  it('enviar: lança 409 se lista não está ABERTA/RECUSADA', async () => {
    mockPrisma.listaCompra.findUnique.mockResolvedValue({
      id: 5,
      status: 'ENVIADA',
    });
    await expect(servico().enviar(5, 9)).rejects.toThrow(ConflictException);
  });

  it('aprovar: ENVIADA → APROVADA e avalia COMPRADA automática', async () => {
    mockPrisma.listaCompra.findUnique
      .mockResolvedValueOnce({ id: 5, status: 'ENVIADA' })
      .mockResolvedValueOnce({ id: 5, status: 'APROVADA' });
    mockPrisma.listaCompra.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.listaCompraItem.findMany.mockResolvedValue([
      { id: 1, status: 'COMPRADO' },
    ]);

    await servico().aprovar(5, 9);

    expect(mockPrisma.listaCompra.updateMany).toHaveBeenCalledWith({
      where: { id: 5, status: 'ENVIADA' },
      data: {
        status: 'APROVADA',
        aprovadoPorId: 9,
        aprovadoEm: expect.any(Date),
      },
    });
    expect(mockPrisma.listaCompra.updateMany).toHaveBeenCalledWith({
      where: { id: 5, status: 'APROVADA' },
      data: { status: 'COMPRADA' },
    });
  });

  it('recusar: exige ENVIADA e grava motivo', async () => {
    mockPrisma.listaCompra.findUnique
      .mockResolvedValueOnce({ id: 5, status: 'ENVIADA' })
      .mockResolvedValueOnce({ id: 5, status: 'RECUSADA' });
    mockPrisma.listaCompra.updateMany.mockResolvedValue({ count: 1 });

    await servico().recusar(5, 'Sem verba', 9);

    expect(mockPrisma.listaCompra.updateMany).toHaveBeenCalledWith({
      where: { id: 5, status: 'ENVIADA' },
      data: {
        status: 'RECUSADA',
        motivoRecusa: 'Sem verba',
        aprovadoPorId: 9,
        aprovadoEm: expect.any(Date),
      },
    });
  });

  it('recusarItem: exige lista ENVIADA e item PENDENTE; reverterItem volta a PENDENTE', async () => {
    // DEVIATION (plan bug): o Step 1 enfileira apenas 2 valores, mas o teste
    // executa 4 chamadas de buscarOuFalhar (guard+retorno em cada método) →
    // 3ª/4ª chamada retornariam undefined e quebrariam com TypeError.
    mockPrisma.listaCompra.findUnique.mockResolvedValue({
      id: 5,
      status: 'ENVIADA',
    });
    mockPrisma.listaCompraItem.updateMany.mockResolvedValue({ count: 1 });

    await servico().recusarItem(5, 11, 9);
    expect(mockPrisma.listaCompraItem.updateMany).toHaveBeenCalledWith({
      where: { id: 11, listaId: 5, status: 'PENDENTE' },
      data: { status: 'RECUSADO' },
    });

    await servico().reverterItem(5, 12);
    expect(mockPrisma.listaCompraItem.updateMany).toHaveBeenCalledWith({
      where: { id: 12, listaId: 5, status: 'RECUSADO' },
      data: { status: 'PENDENTE' },
    });
  });

  it('comprarItem: marca COMPRADO com custo e avalia COMPRADA automática', async () => {
    mockPrisma.listaCompra.findUnique
      .mockResolvedValueOnce({ id: 5, status: 'APROVADA' })
      .mockResolvedValueOnce({ id: 5, status: 'APROVADA' });
    mockPrisma.listaCompraItem.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.listaCompraItem.findMany.mockResolvedValue([
      { id: 1, status: 'COMPRADO' },
    ]);

    await servico().comprarItem(5, 11, 12.5, 9);

    expect(mockPrisma.listaCompraItem.updateMany).toHaveBeenCalledWith({
      where: { id: 11, listaId: 5, status: { not: 'COMPRADO' } },
      data: {
        status: 'COMPRADO',
        custoReal: 12.5,
        compradoPorId: 9,
        compradoEm: expect.any(Date),
      },
    });
    expect(mockPrisma.listaCompra.updateMany).toHaveBeenCalledWith({
      where: { id: 5, status: 'APROVADA' },
      data: { status: 'COMPRADA' },
    });
  });

  it('enviar: lança 409 se a CAS do status perde corrida e NÃO zera itens', async () => {
    mockPrisma.listaCompra.findUnique.mockResolvedValue({
      id: 5,
      status: 'ABERTA',
    });
    mockPrisma.listaCompra.updateMany.mockResolvedValue({ count: 0 });

    await expect(servico().enviar(5, 9)).rejects.toThrow(ConflictException);
    expect(mockPrisma.listaCompraItem.updateMany).not.toHaveBeenCalled();
  });

  it('aprovar: lança 409 se a CAS do status perde corrida e não avalia COMPRADA', async () => {
    mockPrisma.listaCompra.findUnique.mockResolvedValue({
      id: 5,
      status: 'ENVIADA',
    });
    mockPrisma.listaCompra.updateMany.mockResolvedValue({ count: 0 });

    await expect(servico().aprovar(5, 9)).rejects.toThrow(ConflictException);
    expect(mockPrisma.listaCompraItem.findMany).not.toHaveBeenCalled();
  });

  it('recusar: lança 409 se a CAS do status perde corrida', async () => {
    mockPrisma.listaCompra.findUnique.mockResolvedValue({
      id: 5,
      status: 'ENVIADA',
    });
    mockPrisma.listaCompra.updateMany.mockResolvedValue({ count: 0 });

    await expect(servico().recusar(5, 'Sem verba', 9)).rejects.toThrow(
      ConflictException,
    );
    expect(mockPrisma.listaCompra.updateMany).toHaveBeenCalledTimes(1);
  });
});
