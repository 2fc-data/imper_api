import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ManutencoesService } from './manutencoes.service.js';

const mockPrisma = {
  $transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
    callback(mockPrisma),
  ),
  manutencao: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  notificacao: {
    create: vi.fn(),
  },
  manutencaoPeca: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
};

function servico() {
  return new ManutencoesService(mockPrisma as any);
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ManutencoesService', () => {
  describe('criar com peças', () => {
    it('deve somar peças, mão de obra e calcular o custo total', async () => {
      mockPrisma.manutencao.create.mockResolvedValue({ id: 1 });

      await servico().criar({
        equipamentoId: 1,
        tipoId: 1,
        data: '2026-10-01',
        dataSaida: '2026-10-03',
        descricao: 'Reparo',
        custoMaoDeObra: 70,
        pecas: [
          {
            descricao: 'Correia',
            acao: 'TROCADA',
            origem: 'GENERICA_NOVA',
            valor: 30,
          },
          { descricao: 'Motor', acao: 'CONSERTADA', valor: 200 },
        ],
      });

      expect(mockPrisma.manutencao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            custo: 300,
            custoPecas: 230,
            custoMaoDeObra: 70,
            dataSaida: new Date('2026-10-03'),
            pecas: {
              create: [
                {
                  descricao: 'Correia',
                  acao: 'TROCADA',
                  origem: 'GENERICA_NOVA',
                  valor: 30,
                },
                {
                  descricao: 'Motor',
                  acao: 'CONSERTADA',
                  origem: null,
                  valor: 200,
                },
              ],
            },
          }),
        }),
      );
    });

    it('deve ignorar linhas sem descrição', async () => {
      mockPrisma.manutencao.create.mockResolvedValue({ id: 1 });

      await servico().criar({
        equipamentoId: 1,
        tipoId: 1,
        data: '2026-10-01',
        descricao: 'Reparo',
        pecas: [
          {
            descricao: '  ',
            acao: 'TROCADA',
            origem: 'ORIGINAL_NOVA',
            valor: 10,
          },
        ],
      });

      const [chamada] = mockPrisma.manutencao.create.mock.calls[0];
      expect(chamada.data.custoPecas).toBe(0);
      expect(chamada.data).not.toHaveProperty('pecas');
    });

    it('deve exigir ação da peça', async () => {
      await expect(
        servico().criar({
          equipamentoId: 1,
          tipoId: 1,
          data: '2026-10-01',
          descricao: 'Reparo',
          pecas: [{ descricao: 'Correia' } as any],
        }),
      ).rejects.toThrow('Informe a ação da peça "Correia"');
    });

    it('deve rejeitar saída anterior à entrada', async () => {
      await expect(
        servico().criar({
          equipamentoId: 1,
          tipoId: 1,
          data: '2026-10-05',
          dataSaida: '2026-10-01',
          descricao: 'Reparo',
        }),
      ).rejects.toThrow(
        'A data de saída não pode ser anterior à data de entrada',
      );
    });
  });

  describe('atualizar', () => {
    it('deve substituir as peças e recalcular o custo total', async () => {
      mockPrisma.manutencao.findUnique.mockResolvedValue({
        id: 1,
        data: new Date('2026-10-01'),
        custoPecas: 230,
        custoMaoDeObra: 70,
        status: 'PENDENTE',
      });
      mockPrisma.manutencao.update.mockResolvedValue({ id: 1 });

      await servico().atualizar(1, {
        pecas: [{ descricao: 'Correia', acao: 'CONSERTADA', valor: 100 }],
        dataSaida: '2026-10-02',
      });

      expect(mockPrisma.manutencaoPeca.deleteMany).toHaveBeenCalledWith({
        where: { manutencaoId: 1 },
      });
      expect(mockPrisma.manutencaoPeca.createMany).toHaveBeenCalledWith({
        data: [
          {
            descricao: 'Correia',
            acao: 'CONSERTADA',
            origem: null,
            valor: 100,
            manutencaoId: 1,
          },
        ],
      });
      expect(mockPrisma.manutencao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            custoPecas: 100,
            custo: 170,
            dataSaida: new Date('2026-10-02'),
          }),
        }),
      );
    });

    it('deve limpar a saída ao receber null', async () => {
      mockPrisma.manutencao.findUnique.mockResolvedValue({
        id: 1,
        data: new Date('2026-10-01'),
        status: 'PENDENTE',
      });
      mockPrisma.manutencao.update.mockResolvedValue({ id: 1 });

      await servico().atualizar(1, { dataSaida: null });

      const [chamada] = mockPrisma.manutencao.update.mock.calls[0];
      expect(chamada.data.dataSaida).toBeNull();
    });

    it('não deve tocar nas peças ao mudar apenas o status', async () => {
      mockPrisma.manutencao.findUnique.mockResolvedValue({
        id: 1,
        data: new Date('2026-10-01'),
        custoPecas: 230,
        custoMaoDeObra: 70,
        dataSaida: null,
        status: 'PENDENTE',
      });
      mockPrisma.manutencao.update.mockResolvedValue({ id: 1 });

      await servico().atualizar(1, { status: 'EM_ANDAMENTO' });

      expect(mockPrisma.manutencaoPeca.deleteMany).not.toHaveBeenCalled();
      const [chamada] = mockPrisma.manutencao.update.mock.calls[0];
      expect(chamada.data).not.toHaveProperty('custo');
      expect(chamada.data).not.toHaveProperty('dataSaida');
      expect(chamada.data).toMatchObject({ status: 'EM_ANDAMENTO' });
    });
  });

  describe('aprovar e recusar', () => {
    it('deve aprovar manutenção com sucesso e criar notificação', async () => {
      mockPrisma.manutencao.findUnique.mockResolvedValue({
        id: 1,
        status: 'AGUARDANDO_APROVACAO',
        criadoPorId: 2,
        equipamento: { codigo: 'EQ-01', descricao: 'Betoneira' },
      });
      mockPrisma.manutencao.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.manutencao.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        status: 'PENDENTE',
      });

      const res = await servico().aprovar(1, 3);
      expect(res.status).toBe('PENDENTE');
      expect(mockPrisma.manutencao.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, status: 'AGUARDANDO_APROVACAO' },
          data: expect.objectContaining({
            status: 'PENDENTE',
            aprovadoPorId: 3,
          }),
        }),
      );
      expect(mockPrisma.notificacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 2,
            titulo: 'Manutenção de equipamento aprovada',
          }),
        }),
      );
    });

    it('não deve permitir auto-aprovação', async () => {
      mockPrisma.manutencao.findUnique.mockResolvedValue({
        id: 1,
        status: 'AGUARDANDO_APROVACAO',
        criadoPorId: 2,
      });

      await expect(servico().aprovar(1, 2)).rejects.toThrow(
        'Você não pode aprovar sua própria manutenção',
      );
    });

    it('deve recusar com motivo e criar notificação', async () => {
      mockPrisma.manutencao.findUnique.mockResolvedValue({
        id: 1,
        status: 'AGUARDANDO_APROVACAO',
        criadoPorId: 2,
        equipamento: { codigo: 'EQ-01', descricao: 'Betoneira' },
      });
      mockPrisma.manutencao.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.manutencao.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        status: 'CANCELADA',
      });

      const res = await servico().recusar(1, 'Custo muito elevado', 3);
      expect(res.status).toBe('CANCELADA');
      expect(mockPrisma.manutencao.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, status: 'AGUARDANDO_APROVACAO' },
          data: expect.objectContaining({
            status: 'CANCELADA',
            aprovadoPorId: 3,
            motivoDecisao: 'Custo muito elevado',
          }),
        }),
      );
      expect(mockPrisma.notificacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 2,
            titulo: 'Manutenção de equipamento recusada',
          }),
        }),
      );
    });

    it('deve exigir motivo de recusa com no mínimo 5 caracteres', async () => {
      await expect(servico().recusar(1, 'abc', 3)).rejects.toThrow(
        'Informe um motivo com pelo menos 5 caracteres',
      );
    });
  });
});
