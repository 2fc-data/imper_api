import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ManutencoesVeiculosService } from './manutencoes-veiculos.service.js';

const mockPrisma = {
  manutencaoVeiculo: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  veiculo: { findMany: vi.fn() },
  tipoManutencao: { findMany: vi.fn() },
  user: { findMany: vi.fn() },
};

function servico() {
  return new ManutencoesVeiculosService(mockPrisma as any);
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ManutencoesVeiculosService', () => {
  describe('listar', () => {
    it('deve listar manutenções', async () => {
      const manutencoes = [{ id: 1, veiculoId: 1, descricao: 'Troca de óleo' }];
      mockPrisma.manutencaoVeiculo.findMany.mockResolvedValue(manutencoes);
      const result = await servico().listar();
      expect(result).toEqual(manutencoes);
    });

    it('deve filtrar por veiculoId e status', async () => {
      mockPrisma.manutencaoVeiculo.findMany.mockResolvedValue([]);
      await servico().listar({ veiculoId: 2, status: 'PENDENTE' });
      expect(mockPrisma.manutencaoVeiculo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { veiculoId: 2, status: 'PENDENTE' },
        }),
      );
    });
  });

  describe('detalhar', () => {
    it('deve retornar manutenção', async () => {
      const manutencao = { id: 1, veiculoId: 1 };
      mockPrisma.manutencaoVeiculo.findUnique.mockResolvedValue(manutencao);
      const result = await servico().detalhar(1);
      expect(result).toEqual(manutencao);
    });

    it('deve lançar NotFoundException', async () => {
      mockPrisma.manutencaoVeiculo.findUnique.mockResolvedValue(null);
      await expect(servico().detalhar(999)).rejects.toThrow('não encontrada');
    });
  });

  describe('criar', () => {
    it('deve criar manutenção com custoTotal calculado', async () => {
      const data = {
        veiculoId: 1,
        tipoId: 1,
        data: '2026-10-01',
        descricao: 'Troca',
        custoPecas: 100,
        custoMaoDeObra: 50,
      };
      mockPrisma.manutencaoVeiculo.create.mockResolvedValue({
        id: 1,
        ...data,
        custoTotal: 150,
      });
      const result = await servico().criar(data);
      expect(result.custoTotal).toBe(150);
      expect(mockPrisma.manutencaoVeiculo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            custoTotal: 150,
            status: 'PENDENTE',
          }),
        }),
      );
    });
  });

  describe('excluir', () => {
    it('deve excluir manutenção', async () => {
      mockPrisma.manutencaoVeiculo.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.manutencaoVeiculo.delete.mockResolvedValue({ id: 1 });
      await servico().excluir(1);
      expect(mockPrisma.manutencaoVeiculo.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve lançar NotFoundException ao excluir inexistente', async () => {
      mockPrisma.manutencaoVeiculo.findUnique.mockResolvedValue(null);
      await expect(servico().excluir(999)).rejects.toThrow('não encontrada');
    });
  });

  describe('lookups', () => {
    it('deve excluir usuários CLIENTE dos responsáveis', async () => {
      mockPrisma.veiculo.findMany.mockResolvedValue([]);
      mockPrisma.tipoManutencao.findMany.mockResolvedValue([]);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 1, nome: 'João Técnico' },
      ]);
      const result = await servico().lookups();
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            papeis: {
              some: {
                papel: { nome: { not: 'CLIENTE' } },
              },
            },
          }),
        }),
      );
      expect(result.responsaveis).toEqual([{ id: 1, nome: 'João Técnico' }]);
    });
  });
});
