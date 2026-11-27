import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ManutencoesVeiculosService } from './manutencoes-veiculos.service.js';

const mockPrisma = {
  $transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
    callback(mockPrisma),
  ),
  manutencaoVeiculo: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  manutencaoVeiculoPeca: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
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
      const result = await servico().criar(data, 10);
      expect(result.custoTotal).toBe(150);
      expect(mockPrisma.manutencaoVeiculo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            custoTotal: 150,
            status: 'AGUARDANDO_APROVACAO',
            criadoPorId: 10,
          }),
        }),
      );
    });
  });

  describe('peças e saída da oficina', () => {
    it('deve somar peças e calcular o total do serviço ao criar', async () => {
      mockPrisma.manutencaoVeiculo.create.mockResolvedValue({ id: 1 });
      await servico().criar({
        veiculoId: 1,
        tipoId: 1,
        data: '2026-10-01',
        dataSaida: '2026-10-05',
        descricao: 'Revisão',
        custoMaoDeObra: 80,
        pecas: [
          {
            descricao: 'Filtro',
            acao: 'TROCADA',
            origem: 'ORIGINAL_NOVA',
            valor: 100,
          },
          { descricao: 'Solda', acao: 'CONSERTADA', valor: 50 },
        ],
      });

      expect(mockPrisma.manutencaoVeiculo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            custoPecas: 150,
            custoMaoDeObra: 80,
            custoTotal: 230,
            dataSaida: new Date('2026-10-05'),
            pecas: {
              create: [
                {
                  descricao: 'Filtro',
                  acao: 'TROCADA',
                  origem: 'ORIGINAL_NOVA',
                  valor: 100,
                },
                {
                  descricao: 'Solda',
                  acao: 'CONSERTADA',
                  origem: null,
                  valor: 50,
                },
              ],
            },
          }),
        }),
      );
    });

    it('deve exigir origem para peça trocada', async () => {
      await expect(
        servico().criar({
          veiculoId: 1,
          tipoId: 1,
          data: '2026-10-01',
          descricao: 'Revisão',
          pecas: [{ descricao: 'Filtro', acao: 'TROCADA' }],
        }),
      ).rejects.toThrow('Informe a origem da peça trocada "Filtro"');
    });

    it('deve rejeitar saída anterior à entrada', async () => {
      await expect(
        servico().criar({
          veiculoId: 1,
          tipoId: 1,
          data: '2026-10-05',
          dataSaida: '2026-10-01',
          descricao: 'Revisão',
        }),
      ).rejects.toThrow(
        'A data de saída não pode ser anterior à data de entrada',
      );
    });

    it('deve substituir as peças e recalcular o total ao atualizar', async () => {
      mockPrisma.manutencaoVeiculo.findUnique.mockResolvedValue({
        id: 1,
        data: new Date('2026-10-01'),
        custoPecas: 100,
        custoMaoDeObra: 50,
      });
      mockPrisma.manutencaoVeiculo.update.mockResolvedValue({ id: 1 });

      await servico().atualizar(1, {
        pecas: [{ descricao: 'Bomba', acao: 'CONSERTADA', valor: 200 }],
      });

      expect(mockPrisma.manutencaoVeiculoPeca.deleteMany).toHaveBeenCalledWith({
        where: { manutencaoId: 1 },
      });
      expect(mockPrisma.manutencaoVeiculoPeca.createMany).toHaveBeenCalledWith({
        data: [
          {
            descricao: 'Bomba',
            acao: 'CONSERTADA',
            origem: null,
            valor: 200,
            manutencaoId: 1,
          },
        ],
      });
      expect(mockPrisma.manutencaoVeiculo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ custoPecas: 200, custoTotal: 250 }),
        }),
      );
    });

    it('não deve tocar nas peças nem nos totais ao mudar apenas o status', async () => {
      mockPrisma.manutencaoVeiculo.findUnique.mockResolvedValue({
        id: 1,
        status: 'PENDENTE',
        data: new Date('2026-10-01'),
        custoPecas: 100,
        custoMaoDeObra: 50,
        dataSaida: null,
      });
      mockPrisma.manutencaoVeiculo.update.mockResolvedValue({ id: 1 });

      await servico().atualizar(1, { status: 'EM_ANDAMENTO' });

      expect(
        mockPrisma.manutencaoVeiculoPeca.deleteMany,
      ).not.toHaveBeenCalled();
      expect(
        mockPrisma.manutencaoVeiculoPeca.createMany,
      ).not.toHaveBeenCalled();
      const [chamada] = mockPrisma.manutencaoVeiculo.update.mock.calls[0];
      expect(chamada.data).not.toHaveProperty('custoTotal');
      expect(chamada.data).not.toHaveProperty('dataSaida');
      expect(chamada.data).toMatchObject({ status: 'EM_ANDAMENTO' });
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
              none: {
                papel: { nome: 'CLIENTE' },
              },
            },
          }),
        }),
      );
      expect(result.responsaveis).toEqual([{ id: 1, nome: 'João Técnico' }]);
    });
  });
});
