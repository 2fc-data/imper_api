import { AtendimentoService } from './atendimento.service.js';

const mockTx = {
  atendimento: { create: vi.fn() },
  user: { findFirst: vi.fn() },
  papelRbac: { findFirst: vi.fn() },
  usuarioPapel: { create: vi.fn() },
};

const mockPrisma = {
  atendimento: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(async (fn: (tx: typeof mockTx) => unknown) =>
    fn(mockTx),
  ),
};

function item(parcial: Record<string, unknown>) {
  return {
    id: 1,
    status: 'NOVO',
    visitaSolicitada: false,
    _count: { visitas: 0, agendamentos: 0 },
    ...parcial,
  };
}

describe('AtendimentoService', () => {
  let service: AtendimentoService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AtendimentoService(mockPrisma as any);
    mockPrisma.atendimento.findMany.mockResolvedValue([]);
  });

  describe('listar', () => {
    it('should list with _count context and proximasAcoes', async () => {
      mockPrisma.atendimento.findMany.mockResolvedValue([item({})]);
      const res = await service.listar();
      expect(mockPrisma.atendimento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          include: expect.objectContaining({
            _count: expect.objectContaining({ select: expect.any(Object) }),
          }),
        }),
      );
      expect(res[0].proximasAcoes).toEqual([
        'MUDAR_STATUS:EM_ANDAMENTO',
        'ENCERRAR',
      ]);
    });

    it('should add CRIAR_AGENDAMENTO when visitaSolicitada without agendamento', async () => {
      mockPrisma.atendimento.findMany.mockResolvedValue([
        item({ visitaSolicitada: true }),
      ]);
      const res = await service.listar();
      expect(res[0].proximasAcoes).toEqual([
        'MUDAR_STATUS:EM_ANDAMENTO',
        'CRIAR_AGENDAMENTO',
        'ENCERRAR',
      ]);
    });

    it('should combine q and status filters', async () => {
      await service.listar({ q: 'Maria', status: 'NOVO' });
      expect(mockPrisma.atendimento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ user: { nome: { contains: 'Maria' } } }],
            status: 'NOVO',
          },
        }),
      );
    });

    it('should return empty proximasAcoes for terminal status', async () => {
      mockPrisma.atendimento.findMany.mockResolvedValue([
        item({ status: 'CONCLUIDO', visitaSolicitada: true }),
      ]);
      const res = await service.listar();
      expect(res[0].proximasAcoes).toEqual([]);
    });
  });

  describe('detalhar', () => {
    it('should throw 404 when not found', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue(null);
      await expect(service.detalhar(999)).rejects.toThrow(
        'Atendimento não encontrado',
      );
    });

    it('should return atendimento with proximasAcoes', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue(
        item({ status: 'EM_ANDAMENTO' }),
      );
      const res = await service.detalhar(1);
      expect(res.proximasAcoes).toEqual([
        'MUDAR_STATUS:ORCAMENTAMENTO',
        'ENCERRAR',
      ]);
    });
  });

  describe('criar', () => {
    it('should create with visitaSolicitada: true', async () => {
      mockTx.atendimento.create.mockResolvedValue({ id: 1 });
      await service.criar({ canal: 'LOJA', userId: 1, visitaSolicitada: true });
      expect(mockTx.atendimento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ visitaSolicitada: true }),
        }),
      );
    });

    it('should default visitaSolicitada to false', async () => {
      mockTx.atendimento.create.mockResolvedValue({ id: 1 });
      await service.criar({ canal: 'LOJA', userId: 1 });
      expect(mockTx.atendimento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ visitaSolicitada: false }),
        }),
      );
    });
  });
});
