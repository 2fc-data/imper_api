import { ObrasService } from './obras.service.js';

const mockTx = {
  obra: { create: vi.fn(), update: vi.fn() },
  obraEtapa: { create: vi.fn() },
  obraAtividade: { create: vi.fn(), update: vi.fn() },
  obraAtividadeMaterial: { create: vi.fn(), deleteMany: vi.fn() },
  ordemServico: { count: vi.fn(), create: vi.fn() },
  etapaOS: { create: vi.fn() },
  atividadeOS: { create: vi.fn() },
  atividadeOSLinha: { create: vi.fn(), updateMany: vi.fn() },
  checklistExecucao: { create: vi.fn() },
  aditivoObra: { update: vi.fn() },
};

const mockPrisma = {
  obra: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  obraEtapa: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  obraAtividade: {
    findFirst: vi.fn(),
  },
  etapaOS: {
    findFirst: vi.fn(),
  },
  aditivoObra: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(async (fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
};

describe('ObrasService', () => {
  let service: ObrasService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ObrasService(mockPrisma as any);
  });

  describe('listar', () => {
    it('retorna a lista de obras formatada', async () => {
      mockPrisma.obra.findMany.mockResolvedValue([
        { id: 1, codigo: 'OBR-0001', status: 'EM_PREPARACAO' },
      ]);

      const result = await service.listar({});
      expect(result.obras).toHaveLength(1);
      expect(result.obras[0].codigo).toBe('OBR-0001');
    });
  });

  describe('detalhar', () => {
    it('lança 404 se a obra não for encontrada', async () => {
      mockPrisma.obra.findUnique.mockResolvedValue(null);
      await expect(service.detalhar(999)).rejects.toThrow('Obra não encontrada');
    });

    it('retorna os detalhes da obra', async () => {
      const mockObra = { id: 1, codigo: 'OBR-0001', etapas: [] };
      mockPrisma.obra.findUnique.mockResolvedValue(mockObra);

      const result = await service.detalhar(1);
      expect(result.obra.codigo).toBe('OBR-0001');
    });
  });

  describe('concluir', () => {
    it('lança 409 se a obra já estiver encerrada', async () => {
      mockPrisma.obra.findUnique.mockResolvedValue({
        id: 1,
        status: 'CONCLUIDA',
        ordensServico: [],
      });
      await expect(service.concluir(1, 1)).rejects.toThrow('Obra já está encerrada');
    });

    it('lança 409 se existirem OSs não concluídas', async () => {
      mockPrisma.obra.findUnique.mockResolvedValue({
        id: 1,
        status: 'EM_EXECUCAO',
        ordensServico: [{ id: 10, status: 'EM_ANDAMENTO' }],
      });
      await expect(service.concluir(1, 1)).rejects.toThrow('Existem 1 OSs pendentes');
    });

    it('conclui a obra com sucesso quando todas as OSs estiverem concluídas', async () => {
      mockPrisma.obra.findUnique.mockResolvedValue({
        id: 1,
        status: 'EM_EXECUCAO',
        ordensServico: [{ id: 10, status: 'CONCLUIDO' }],
      });
      mockPrisma.obra.update.mockResolvedValue({ id: 1, status: 'CONCLUIDA' });

      const result = await service.concluir(1, 1);
      expect(result.obra.status).toBe('CONCLUIDA');
    });
  });

  describe('aditivos', () => {
    it('cria aditivo no status PENDENTE', async () => {
      mockPrisma.obra.findUnique.mockResolvedValue({ id: 1, status: 'EM_EXECUCAO' });
      mockPrisma.aditivoObra.create.mockResolvedValue({
        id: 1,
        obraId: 1,
        descricao: 'Teste',
        valor: 500,
        status: 'PENDENTE',
      });

      const result = await service.criarAditivo(1, { descricao: 'Teste', valor: 500, itens: [{ acrescimo: 'novaEtapa' }] });
      expect(result.aditivo.status).toBe('PENDENTE');
    });

    it('aprova aditivo e incrementa valor contratado da Obra', async () => {
      mockPrisma.aditivoObra.findUnique.mockResolvedValue({
        id: 1,
        obraId: 10,
        valor: 1000,
        status: 'PENDENTE',
      });
      mockTx.aditivoObra.update.mockResolvedValue({ id: 1, status: 'APROVADO' });

      const result = await service.aprovarAditivo(1, 2);
      expect(result.aditivo.status).toBe('APROVADO');
      expect(mockTx.obra.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 10 },
          data: { valorContratado: { increment: 1000 } },
        }),
      );
    });

    it('recusa aditivo alterando status para RECUSADO', async () => {
      mockPrisma.aditivoObra.findUnique.mockResolvedValue({
        id: 1,
        status: 'PENDENTE',
      });
      mockPrisma.aditivoObra.update.mockResolvedValue({ id: 1, status: 'RECUSADO' });

      const result = await service.recusarAditivo(1, 2);
      expect(result.aditivo.status).toBe('RECUSADO');
    });
  });
});
