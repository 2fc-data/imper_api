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
  separacaoItem: { update: vi.fn(), create: vi.fn() },
};

const mockPrisma = {
  separacao: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  separacaoItem: { delete: vi.fn() },
  movimentoEstoque: { count: vi.fn() },
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
    it('item RETIRADO → DEVOLVIDO: credita estoque uma vez e grava status/data', async () => {
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
        data: expect.objectContaining({
          status: 'DEVOLVIDO',
          devolvidoEm: expect.any(Date),
        }),
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
      expect(
        mockTx.separacaoItem.update.mock.calls[0][0].data,
      ).not.toHaveProperty('devolvidoEm');
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

  describe('adicionarItem', () => {
    it('exige exatamente um item (material, EPI ou equipamento)', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());

      const erro = await capturarErro(() =>
        service.adicionarItem(1, { quantidade: 1, registradoPorId: 9 }),
      );

      expect(erro.getStatus()).toBe(400);
      expect(erro.message).toContain('exatamente um item');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('quantidade inválida lança 400', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());

      const erro = await capturarErro(() =>
        service.adicionarItem(1, {
          materialId: 10,
          quantidade: 0,
          registradoPorId: 9,
        }),
      );

      expect(erro.getStatus()).toBe(400);
      expect(erro.message).toContain('Quantidade');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('equipamento com quantidade diferente de 1 lança 400', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());

      const erro = await capturarErro(() =>
        service.adicionarItem(1, {
          equipamentoId: 7,
          quantidade: 2,
          registradoPorId: 9,
        }),
      );

      expect(erro.getStatus()).toBe(400);
      expect(erro.message).toContain('equipamento');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('sem colaborador cria item PENDENTE sem movimentar estoque', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());
      mockTx.separacaoItem.create.mockResolvedValue({ id: 3 });

      await service.adicionarItem(1, {
        materialId: 10,
        quantidade: 2,
        registradoPorId: 9,
      });

      expect(mockTx.separacaoItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          separacaoId: 1,
          materialId: 10,
          epiId: null,
          equipamentoId: null,
          quantidadeNecessaria: 2,
          quantidadeSeparada: 0,
          status: 'PENDENTE',
          colaboradorId: null,
          retiradoEm: null,
        }),
      });
      expect(mockTx.saldoEstoque.findUnique).not.toHaveBeenCalled();
      expect(mockTx.movimentoEstoque.create).not.toHaveBeenCalled();
    });

    it('com colaborador cria RETIRADO e debita estoque', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());
      mockTx.separacaoItem.create.mockResolvedValue({ id: 3 });
      mockTx.saldoEstoque.findUnique.mockResolvedValue({ saldo: 5 });

      await service.adicionarItem(1, {
        materialId: 10,
        quantidade: 2,
        colaboradorId: 4,
        registradoPorId: 9,
      });

      expect(mockTx.separacaoItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          quantidadeNecessaria: 2,
          quantidadeSeparada: 2,
          status: 'RETIRADO',
          colaboradorId: 4,
          retiradoPorId: 9,
          retiradoEm: expect.any(Date),
        }),
      });
      expect(mockTx.saldoEstoque.update).toHaveBeenCalledWith({
        where: { materialId: 10 },
        data: { saldo: 3 },
      });
      expect(mockTx.movimentoEstoque.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          materialId: 10,
          tipo: 'SAIDA',
          quantidade: 2,
          saldoApos: 3,
          separacaoItemId: 3,
          registradoPorId: 9,
        }),
      });
    });

    it('EPI com colaborador registra entrega EM_USO', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());
      mockTx.separacaoItem.create.mockResolvedValue({ id: 3 });

      await service.adicionarItem(1, {
        epiId: 33,
        quantidade: 1,
        colaboradorId: 4,
        registradoPorId: 9,
      });

      expect(mockTx.entregaEpi.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          epiId: 33,
          colaboradorId: 4,
          quantidade: 1,
          status: 'EM_USO',
          separacaoId: 1,
        }),
      });
    });
  });

  describe('removerItem', () => {
    it('exclui item PENDENTE sem movimentação de estoque', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());
      mockPrisma.movimentoEstoque.count.mockResolvedValue(0);
      mockPrisma.separacaoItem.delete.mockResolvedValue({ id: 2 });

      await service.removerItem(1, 2);

      expect(mockPrisma.movimentoEstoque.count).toHaveBeenCalledWith({
        where: { separacaoItemId: 2 },
      });
      expect(mockPrisma.separacaoItem.delete).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });

    it('item já retirado lança 409 e não exclui', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(
        separacaoCom({ status: 'RETIRADO' }),
      );

      const erro = await capturarErro(() => service.removerItem(1, 2));

      expect(erro.getStatus()).toBe(409);
      expect(erro.message).toContain('ainda não foram retirados');
      expect(mockPrisma.separacaoItem.delete).not.toHaveBeenCalled();
    });

    it('item com movimentação de estoque lança 409 e não exclui', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());
      mockPrisma.movimentoEstoque.count.mockResolvedValue(1);

      const erro = await capturarErro(() => service.removerItem(1, 2));

      expect(erro.getStatus()).toBe(409);
      expect(erro.message).toContain('movimentação de estoque');
      expect(mockPrisma.separacaoItem.delete).not.toHaveBeenCalled();
    });

    it('item inexistente lança 404', async () => {
      mockPrisma.separacao.findUnique.mockResolvedValue(separacaoCom());

      await expect(service.removerItem(1, 99)).rejects.toThrow(
        /não encontrado/,
      );
      expect(mockPrisma.separacaoItem.delete).not.toHaveBeenCalled();
    });
  });
});
