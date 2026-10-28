import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EquipamentosService } from './equipamentos.service.js';

const mockPrisma = {
  equipamento: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

const mockLookup = { criarCrud: vi.fn(() => ({})) };

function servico() {
  return new EquipamentosService(mockPrisma as any, mockLookup as any);
}

beforeEach(() => {
  vi.resetAllMocks();
  mockLookup.criarCrud.mockReturnValue({});
});

describe('EquipamentosService', () => {
  describe('proximoCodigo', () => {
    it('retorna o maior código sequencial incrementado', async () => {
      mockPrisma.equipamento.findMany.mockResolvedValue([
        { codigo: 'EQP-002' },
        { codigo: 'EQP-010' },
      ]);

      await expect(servico().proximoCodigo()).resolves.toEqual({
        codigo: 'EQP-011',
      });
      expect(mockPrisma.equipamento.findMany).toHaveBeenCalledWith({
        where: { codigo: { startsWith: 'EQP-' } },
        select: { codigo: true },
      });
    });
  });

  describe('criar', () => {
    it('gera o código e ignora o código enviado pelo cliente', async () => {
      mockPrisma.equipamento.findFirst.mockResolvedValue(null);
      mockPrisma.equipamento.findMany.mockResolvedValue([]);
      mockPrisma.equipamento.create.mockResolvedValue({
        id: 1,
        codigo: 'EQP-001',
        descricao: 'BETONEIRA',
      });

      await servico().criar({
        codigo: 'EQP-999',
        descricao: 'betoneira',
      });

      const payload = mockPrisma.equipamento.create.mock.calls[0][0].data;
      expect(payload.codigo).toBe('EQP-001');
      expect(payload.descricao).toBe('BETONEIRA');
    });

    it('mantém a validação de descrição duplicada', async () => {
      mockPrisma.equipamento.findFirst.mockResolvedValue({ id: 2 });

      await expect(servico().criar({ descricao: 'betoneira' })).rejects.toThrow(
        'Equipamento já cadastrado',
      );
    });
  });

  describe('atualizar', () => {
    it('ignora o código enviado no update', async () => {
      mockPrisma.equipamento.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.equipamento.findFirst.mockResolvedValue(null);
      mockPrisma.equipamento.update.mockResolvedValue({ id: 1 });

      await servico().atualizar(1, {
        codigo: 'EQP-999',
        descricao: 'betoneira',
      });

      const payload = mockPrisma.equipamento.update.mock.calls[0][0].data;
      expect(payload).not.toHaveProperty('codigo');
      expect(payload.descricao).toBe('BETONEIRA');
    });
  });
});
