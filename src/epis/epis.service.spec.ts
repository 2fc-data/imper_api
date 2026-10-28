import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EpisService } from './epis.service.js';

const mockPrisma = {
  epi: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

const mockLookup = { criarCrud: vi.fn(() => ({})) };

function servico() {
  return new EpisService(mockPrisma as any, mockLookup as any);
}

beforeEach(() => {
  vi.resetAllMocks();
  mockLookup.criarCrud.mockReturnValue({});
});

describe('EpisService', () => {
  describe('proximoCodigo', () => {
    it('retorna o maior código sequencial incrementado', async () => {
      mockPrisma.epi.findMany.mockResolvedValue([
        { codigo: 'EPI-004' },
        { codigo: 'EPI-012' },
      ]);

      await expect(servico().proximoCodigo()).resolves.toEqual({
        codigo: 'EPI-013',
      });
      expect(mockPrisma.epi.findMany).toHaveBeenCalledWith({
        where: { codigo: { startsWith: 'EPI-' } },
        select: { codigo: true },
      });
    });
  });

  describe('criar', () => {
    it('gera o código e ignora o código enviado pelo cliente', async () => {
      mockPrisma.epi.findFirst.mockResolvedValue(null);
      mockPrisma.epi.findMany.mockResolvedValue([]);
      mockPrisma.epi.create.mockResolvedValue({
        id: 1,
        codigo: 'EPI-001',
        nome: 'LUVA',
      });

      await servico().criar({ codigo: 'EPI-999', nome: 'luva' });

      const payload = mockPrisma.epi.create.mock.calls[0][0].data;
      expect(payload.codigo).toBe('EPI-001');
      expect(payload.nome).toBe('LUVA');
    });

    it('mantém a validação de nome duplicado', async () => {
      mockPrisma.epi.findFirst.mockResolvedValue({ id: 2 });

      await expect(servico().criar({ nome: 'luva' })).rejects.toThrow(
        'EPI já cadastrado',
      );
    });
  });

  describe('atualizar', () => {
    it('ignora o código enviado no update', async () => {
      mockPrisma.epi.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.epi.findFirst.mockResolvedValue(null);
      mockPrisma.epi.update.mockResolvedValue({ id: 1 });

      await servico().atualizar(1, { codigo: 'EPI-999', nome: 'luva' });

      const payload = mockPrisma.epi.update.mock.calls[0][0].data;
      expect(payload).not.toHaveProperty('codigo');
      expect(payload.nome).toBe('LUVA');
    });
  });
});
