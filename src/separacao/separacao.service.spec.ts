import { AppError } from '../lib/errors.js';
import { SeparacaoService } from './separacao.service.js';

const mockTx = {
  saldoEstoque: { findUnique: vi.fn(), update: vi.fn() },
  movimentoEstoque: { create: vi.fn() },
  entregaEpi: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  retiradaEquipamento: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  separacaoItem: { update: vi.fn() },
};

const mockPrisma = {
  separacao: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(async (fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
};

function item(overrides: Record<string, unknown> = {}) {
  return {
    id: 2,
    separacaoId: 1,
    materialId: 10,
    epiId: null,
    equipamentoId: null,
    quantidadeNecessaria: 5,
    quantidadeSeparada: 3,
    status: 'PENDENTE',
    colaboradorId: null,
    retiradoPorId: null,
    observacao: null,
    ...overrides,
  };
}

function separacaoCom(itemOverrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    executucaoAtividadeId: 'exec-1',
    statusNovo: 'RETIRADA_CONCLUIDA',
    executucaoAtividade: {
      atividade: { obraEtapa: { obraId: 5 } },
    },
    itens: [item(itemOverrides)],
  };
}

async function capturarErro(fn: () => Promise<unknown>): Promise<AppError> {
  try {
    await fn();
  } catch (e) {
    return e as AppError;
  }
  throw new Error('deveria ter lançado');
}

describe('SeparacaoService', () => {
  let service: SeparacaoService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SeparacaoService(mockPrisma as any);
  });

  describe('registrarDevolucaoItem', () => {
    it('item RETIRADO → DEVOLVIDO: credita estoque uma vez e grava o status', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(
        separacaoCom({ status: 'RETIRADO' }),
      );
      mockTx.saldoEstoque.findUnique.mockResolvedValue({ saldo: 7 });

      await service.registrarDevolucaoItem(1, 2, { registradoPorId: 9 });

      expect(mockTx.saldoEstoque.findUnique).toHaveBeenCalledTimes(1);
      expect(mockTx.saldoEstoque.update).toHaveBeenCalledTimes(1);
      expect(mockTx.saldoEstoque.update).toHaveBeenCalledWith({
        where: { materialId: 10 },
        data: { saldo: 10 },
      });
      expect(mockTx.movimentoEstoque.create).toHaveBeenCalledTimes(1);
      expect(mockTx.movimentoEstoque.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          materialId: 10,
          tipo: 'ENTRADA',
          quantidade: 3,
          saldoApos: 10,
          separacaoItemId: 2,
          registradoPorId: 9,
        }),
      });
      expect(mockTx.separacaoItem.update).toHaveBeenCalledTimes(1);
      expect(mockTx.separacaoItem.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({ status: 'DEVOLVIDO' }),
      });
    });

    it('status PERDIDO: grava PERDIDO e não credita estoque', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(
        separacaoCom({ status: 'RETIRADO' }),
      );

      await service.registrarDevolucaoItem(1, 2, {
        registradoPorId: 9,
        status: 'PERDIDO',
      });

      expect(mockTx.saldoEstoque.findUnique).not.toHaveBeenCalled();
      expect(mockTx.saldoEstoque.update).not.toHaveBeenCalled();
      expect(mockTx.movimentoEstoque.create).not.toHaveBeenCalled();
      expect(mockTx.separacaoItem.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({ status: 'PERDIDO' }),
      });
    });

    it('segunda devolução (item já DEVOLVIDO) lança 409 e não abre transação', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(
        separacaoCom({ status: 'DEVOLVIDO' }),
      );

      const erro = await capturarErro(() =>
        service.registrarDevolucaoItem(1, 2, { registradoPorId: 9 }),
      );

      expect(erro).toBeInstanceOf(AppError);
      expect(erro.getStatus()).toBe(409);
      expect(erro.message).toContain('devolução já registrada');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('item ainda não retirado lança 409', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(
        separacaoCom({ status: 'PENDENTE' }),
      );

      const erro = await capturarErro(() =>
        service.registrarDevolucaoItem(1, 2, { registradoPorId: 9 }),
      );

      expect(erro.getStatus()).toBe(409);
      expect(erro.message).toContain('ainda não foi retirado');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('status fora de DEVOLVIDO/PERDIDO lança 400', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(
        separacaoCom({ status: 'RETIRADO' }),
      );

      const erro = await capturarErro(() =>
        service.registrarDevolucaoItem(1, 2, {
          registradoPorId: 9,
          status: 'QUALQUER' as 'DEVOLVIDO',
        }),
      );

      expect(erro.getStatus()).toBe(400);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('devolução de EPI atualiza a entrega EM_USO para PERDIDO', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(
        separacaoCom({
          status: 'RETIRADO',
          materialId: null,
          epiId: 33,
        }),
      );
      mockTx.entregaEpi.findFirst.mockResolvedValue({
        id: 30,
        status: 'EM_USO',
      });

      await service.registrarDevolucaoItem(1, 2, {
        registradoPorId: 9,
        status: 'PERDIDO',
      });

      expect(mockTx.entregaEpi.update).toHaveBeenCalledWith({
        where: { id: 30 },
        data: expect.objectContaining({ status: 'PERDIDO' }),
      });
      expect(mockTx.separacaoItem.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({ status: 'PERDIDO' }),
      });
    });
  });

  describe('registrarRetiradaItem', () => {
    it('sem colaboradorId lança 400', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());

      const erro = await capturarErro(() =>
        service.registrarRetiradaItem(1, 2, { registradoPorId: 9 } as any),
      );

      expect(erro).toBeInstanceOf(AppError);
      expect(erro.getStatus()).toBe(400);
      expect(erro.message).toContain('colaborador');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('grava RETIRADO com colaboradorId e retiradoPorId e debita estoque', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());
      mockTx.saldoEstoque.findUnique.mockResolvedValue({ saldo: 5 });

      await service.registrarRetiradaItem(1, 2, {
        colaboradorId: 4,
        registradoPorId: 9,
      });

      expect(mockTx.saldoEstoque.update).toHaveBeenCalledTimes(1);
      expect(mockTx.saldoEstoque.update).toHaveBeenCalledWith({
        where: { materialId: 10 },
        data: { saldo: 0 },
      });
      expect(mockTx.movimentoEstoque.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          materialId: 10,
          tipo: 'SAIDA',
          quantidade: 5,
          saldoApos: 0,
          registradoPorId: 9,
        }),
      });
      expect(mockTx.separacaoItem.update).toHaveBeenCalledTimes(1);
      expect(mockTx.separacaoItem.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({
          status: 'RETIRADO',
          colaboradorId: 4,
          retiradoPorId: 9,
          retiradoEm: expect.any(Date),
        }),
      });
    });

    it('item já processado lança 409', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(
        separacaoCom({ status: 'RETIRADO' }),
      );

      const erro = await capturarErro(() =>
        service.registrarRetiradaItem(1, 2, {
          colaboradorId: 4,
          registradoPorId: 9,
        }),
      );

      expect(erro.getStatus()).toBe(409);
      expect(erro.message).toContain('já foi processado');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('saldo insuficiente lança 409 sem alterar o item', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());
      mockTx.saldoEstoque.findUnique.mockResolvedValue({ saldo: 1 });

      const erro = await capturarErro(() =>
        service.registrarRetiradaItem(1, 2, {
          colaboradorId: 4,
          registradoPorId: 9,
        }),
      );

      expect(erro.getStatus()).toBe(409);
      expect(erro.message).toContain('Saldo insuficiente');
      expect(mockTx.saldoEstoque.update).not.toHaveBeenCalled();
      expect(mockTx.separacaoItem.update).not.toHaveBeenCalled();
    });
  });
});
