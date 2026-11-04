import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PlanejamentoService } from './planejamento.service.js';

describe('PlanejamentoService', () => {
  let service: PlanejamentoService;

  const mockTx = {
    obra: { update: vi.fn() },
    execucaoAtividade: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    separacao: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    separacaoItem: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  };

  const mockPrisma = {
    obra: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    veiculo: {
      findMany: vi.fn(),
    },
    epi: {
      findMany: vi.fn(),
    },
    equipamento: {
      findMany: vi.fn(),
    },
    material: {
      findMany: vi.fn(),
    },
    execucaoAtividade: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
  };

  const mockWhatsApp = {
    enviarMensagem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PlanejamentoService(mockPrisma as any, mockWhatsApp as any);
  });

  describe('salvarPlanejamento com múltiplos colaboradores', () => {
    it('cria/atualiza execuções para todos os colaboradores selecionados na atividade', async () => {
      mockPrisma.obra.findUnique.mockResolvedValue({
        id: 1,
        codigo: 'OBR-001',
        statusWhatsapp: 'PENDENTE',
        etapas: [],
      });

      // Simula que para a atividade não havia execuções prévias
      mockTx.execucaoAtividade.findMany.mockResolvedValue([]);
      mockTx.execucaoAtividade.create
        .mockResolvedValueOnce({ id: 'exec-1' })
        .mockResolvedValueOnce({ id: 'exec-2' });
      mockTx.separacao.findFirst.mockResolvedValue(null);
      mockTx.separacao.count.mockResolvedValue(0);
      mockTx.separacao.create.mockResolvedValue({ id: 10 });

      // Mock para a chamada subsequente de obterPlanejamento
      vi.spyOn(service, 'obterPlanejamento').mockResolvedValue({
        obra: { id: 1 } as any,
        catalogos: {} as any,
      });

      const resultado = await service.salvarPlanejamento(
        1,
        {
          dispararAgora: false,
          atividades: [
            {
              atividadeId: 'ativ-100',
              colaboradoresIds: [10, 20],
              colaboradorId: 10,
              dataPrevisao: '2026-11-10',
              veiculoId: 2,
              materiais: [{ materialId: 1, quantidade: 5 }],
              epis: [{ epiId: 2, quantidade: 2 }],
              equipamentos: [{ equipamentoId: 3 }],
            },
          ],
        },
        99,
      );

      // Deve ter criado execução para o colaborador 10 e para o 20
      expect(mockTx.execucaoAtividade.create).toHaveBeenCalledTimes(2);
      expect(mockTx.execucaoAtividade.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            atividadeId: 'ativ-100',
            atribuidoAId: 10,
          }),
        }),
      );
      expect(mockTx.execucaoAtividade.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            atividadeId: 'ativ-100',
            atribuidoAId: 20,
          }),
        }),
      );

      // Separação de insumos é criada vinculada à execução primária (exec-1)
      expect(mockTx.separacao.create).toHaveBeenCalledTimes(1);
      expect(mockTx.separacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            executucaoAtividadeId: 'exec-1',
          }),
        }),
      );

      expect(resultado).toBeDefined();
    });
  });

  describe('obterPlanejamento - catálogo de colaboradores', () => {
    it('filtra catálogo de colaboradores especialistas somente com papéis de Colaboradores', async () => {
      mockPrisma.obra.findUnique.mockResolvedValue({
        id: 1,
        codigo: 'OBR-001',
        status: 'EM_PREPARACAO',
        dataInicioPrevista: null,
        dataDisparoWhatsapp: null,
        statusWhatsapp: 'PENDENTE',
        user: { nome: 'Cliente Teste' },
        endereco: null,
        etapas: [],
      });

      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 5,
          nome: 'Colaborador Um',
          telefone: '1234',
          cargo: { id: 1, nome: 'Impermeabilizador' },
          papeis: [{ papel: { id: 1, nome: 'COLABORADOR' } }],
        },
      ]);
      mockPrisma.veiculo.findMany.mockResolvedValue([]);
      mockPrisma.epi.findMany.mockResolvedValue([]);
      mockPrisma.equipamento.findMany.mockResolvedValue([]);
      mockPrisma.material.findMany.mockResolvedValue([]);

      const resultado = await service.obterPlanejamento(1);

      expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
      const callArg = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArg.where).toEqual(
        expect.objectContaining({
          ativo: true,
          papeis: {
            some: {
              papel: {
                nome: {
                  in: ['COLABORADOR', 'Colaborador', 'Colaboradores', 'COLABORADORES'],
                },
              },
            },
          },
        }),
      );
      // Garante que não inclui filtro genérico por qualquer cargo
      expect(callArg.where.OR).toBeUndefined();
      expect(callArg.where.cargoId).toBeUndefined();

      expect(resultado.catalogos.colaboradores).toHaveLength(1);
      expect(resultado.catalogos.colaboradores[0].nome).toBe('Colaborador Um');
    });
  });
});

