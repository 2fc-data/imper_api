import { AtendimentoService } from './atendimento.service.js';

const mockTx = {
  atendimento: { create: vi.fn(), update: vi.fn() },
  atendimentoLog: { create: vi.fn() },
  user: { findFirst: vi.fn() },
  papelRbac: { findFirst: vi.fn() },
  usuarioPapel: { create: vi.fn() },
};

const mockPrisma = {
  atendimento: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  atendimentoLog: { create: vi.fn() },
  visitaTecnica: { findFirst: vi.fn() },
  $transaction: vi.fn(async (fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
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

  describe('atualizarStatus', () => {
    function mockAtual(parcial: Record<string, unknown>) {
      mockPrisma.atendimento.findUnique.mockResolvedValue({
        id: 1,
        status: 'NOVO',
        visitaSolicitada: false,
        ...parcial,
      });
      mockTx.atendimento.update.mockResolvedValue({ id: 1 });
      mockTx.atendimentoLog.create.mockResolvedValue({ id: 10 });
    }

    it('should reject when atendimento is terminal', async () => {
      mockAtual({ status: 'CONCLUIDO' });
      await expect(service.atualizarStatus(1, 'EM_ANDAMENTO')).rejects.toThrow(
        'Atendimento encerrado',
      );
    });

    it('should reject invalid transition NOVO → ORCAMENTAMENTO', async () => {
      mockAtual({ status: 'NOVO' });
      await expect(
        service.atualizarStatus(1, 'ORCAMENTAMENTO'),
      ).rejects.toThrow('Transição inválida: NOVO → ORCAMENTAMENTO');
    });

    it('gate 3: should block ORCAMENTAMENTO without realized visit', async () => {
      mockAtual({ status: 'EM_ANDAMENTO', visitaSolicitada: true });
      mockPrisma.visitaTecnica.findFirst.mockResolvedValue(null);
      await expect(
        service.atualizarStatus(1, 'ORCAMENTAMENTO'),
      ).rejects.toThrow(
        'Visita técnica deve ser realizada antes de iniciar o orçamento',
      );
      expect(mockTx.atendimento.update).not.toHaveBeenCalled();
    });

    it('gate 3: should allow ORCAMENTAMENTO with realized visit', async () => {
      mockAtual({ status: 'EM_ANDAMENTO', visitaSolicitada: true });
      mockPrisma.visitaTecnica.findFirst.mockResolvedValue({ id: 5 });
      const res = await service.atualizarStatus(1, 'ORCAMENTAMENTO', 7);
      expect(mockPrisma.visitaTecnica.findFirst).toHaveBeenCalled();
      expect(mockTx.atendimento.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'ORCAMENTAMENTO' },
      });
      expect(res).toEqual({ id: 1 });
    });

    it('gate 3: not consulted when visitaSolicitada is false', async () => {
      mockAtual({ status: 'EM_ANDAMENTO', visitaSolicitada: false });
      await service.atualizarStatus(1, 'ORCAMENTAMENTO');
      expect(mockPrisma.visitaTecnica.findFirst).not.toHaveBeenCalled();
    });

    it('same status: no transition validation and no STATUS log', async () => {
      mockAtual({ status: 'EM_ANDAMENTO' });
      await service.atualizarStatus(1, 'EM_ANDAMENTO');
      expect(mockTx.atendimento.update).toHaveBeenCalled();
      expect(mockTx.atendimentoLog.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'STATUS' }),
      );
    });

    it('should update and write STATUS log with transition data', async () => {
      mockAtual({ status: 'NOVO' });
      await service.atualizarStatus(1, 'EM_ANDAMENTO', 7);
      expect(mockTx.atendimento.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'EM_ANDAMENTO' },
      });
      expect(mockTx.atendimentoLog.create).toHaveBeenCalledWith({
        data: {
          atendimentoId: 1,
          atendenteId: 7,
          tipo: 'STATUS',
          statusDe: 'NOVO',
          statusPara: 'EM_ANDAMENTO',
        },
      });
    });
  });

  describe('atualizar (visitaSolicitada)', () => {
    it('should throw 404 when not found', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue(null);
      await expect(
        service.atualizar(999, { visitaSolicitada: true }),
      ).rejects.toThrow('Atendimento não encontrado');
      expect(mockPrisma.atendimento.update).not.toHaveBeenCalled();
    });

    it('should toggle visitaSolicitada to true and return detalhar response', async () => {
      mockPrisma.atendimento.findUnique
        .mockResolvedValueOnce(item({}))
        .mockResolvedValueOnce(item({ visitaSolicitada: true }));
      mockPrisma.atendimento.update.mockResolvedValue({});
      const res = await service.atualizar(1, { visitaSolicitada: true });
      expect(mockPrisma.atendimento.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { visitaSolicitada: true },
      });
      expect(res).toHaveProperty('proximasAcoes');
      expect(res.visitaSolicitada).toBe(true);
    });

    it('should toggle visitaSolicitada to false', async () => {
      mockPrisma.atendimento.findUnique
        .mockResolvedValueOnce(item({ visitaSolicitada: true }))
        .mockResolvedValueOnce(item({ visitaSolicitada: false }));
      mockPrisma.atendimento.update.mockResolvedValue({});
      await service.atualizar(1, { visitaSolicitada: false });
      expect(mockPrisma.atendimento.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { visitaSolicitada: false },
      });
    });
  });

  describe('encaminharParaOrcamento', () => {
    function mockAtual(parcial: Record<string, unknown>) {
      mockPrisma.atendimento.findUnique.mockResolvedValue({
        id: 1,
        status: 'NOVO',
        visitaSolicitada: false,
        _count: { visitas: 0, agendamentos: 0 },
        ...parcial,
      });
      mockTx.atendimento.update.mockResolvedValue({ id: 1 });
      mockTx.atendimentoLog.create.mockResolvedValue({ id: 10 });
    }

    it('should throw 404 when not found', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue(null);
      await expect(service.encaminharParaOrcamento(999)).rejects.toThrow(
        'Atendimento não encontrado',
      );
    });

    it('should reject terminal status', async () => {
      mockAtual({ status: 'CONCLUIDO' });
      await expect(service.encaminharParaOrcamento(1)).rejects.toThrow(
        'Atendimento encerrado',
      );
    });

    it('should no-op when already ORCAMENTAMENTO', async () => {
      mockAtual({ status: 'ORCAMENTAMENTO' });
      await service.encaminharParaOrcamento(1);
      expect(mockTx.atendimento.update).not.toHaveBeenCalled();
      expect(mockTx.atendimentoLog.create).not.toHaveBeenCalled();
    });

    it('NOVO + flag=false → two steps with logs in order', async () => {
      mockAtual({ status: 'NOVO' });
      const res = await service.encaminharParaOrcamento(1, 7);
      expect(mockTx.atendimento.update).toHaveBeenCalledTimes(2);
      expect(mockTx.atendimento.update).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
        data: { status: 'EM_ANDAMENTO' },
      });
      expect(mockTx.atendimento.update).toHaveBeenNthCalledWith(2, {
        where: { id: 1 },
        data: { status: 'ORCAMENTAMENTO' },
      });
      expect(mockTx.atendimentoLog.create).toHaveBeenCalledTimes(2);
      expect(mockTx.atendimentoLog.create).toHaveBeenNthCalledWith(1, {
        data: {
          atendimentoId: 1,
          atendenteId: 7,
          tipo: 'STATUS',
          statusDe: 'NOVO',
          statusPara: 'EM_ANDAMENTO',
        },
      });
      expect(mockTx.atendimentoLog.create).toHaveBeenNthCalledWith(2, {
        data: {
          atendimentoId: 1,
          atendenteId: 7,
          tipo: 'STATUS',
          statusDe: 'EM_ANDAMENTO',
          statusPara: 'ORCAMENTAMENTO',
        },
      });
      expect(res).toHaveProperty('proximasAcoes');
    });

    it('EM_ANDAMENTO + flag=false → one step', async () => {
      mockAtual({ status: 'EM_ANDAMENTO' });
      await service.encaminharParaOrcamento(1);
      expect(mockTx.atendimento.update).toHaveBeenCalledTimes(1);
      expect(mockTx.atendimentoLog.create).toHaveBeenCalledTimes(1);
      expect(mockTx.atendimentoLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          statusDe: 'EM_ANDAMENTO',
          statusPara: 'ORCAMENTAMENTO',
        }),
      });
    });

    it('NOVO + flag=true without realized visit → gate 3 and zero transactions', async () => {
      mockAtual({ status: 'NOVO', visitaSolicitada: true });
      mockPrisma.visitaTecnica.findFirst.mockResolvedValue(null);
      await expect(service.encaminharParaOrcamento(1)).rejects.toThrow(
        'Visita técnica deve ser realizada antes de iniciar o orçamento',
      );
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('listarDoUsuario', () => {
    it('filtra por userId, ordena por createdAt desc e take 50', async () => {
      mockPrisma.atendimento.findMany.mockResolvedValue([item({})]);
      await service.listarDoUsuario(7);
      expect(mockPrisma.atendimento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 7 },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: expect.objectContaining({
            _count: expect.objectContaining({ select: expect.any(Object) }),
          }),
        }),
      );
    });

    it('retorna itens mapeados com proximasAcoes', async () => {
      mockPrisma.atendimento.findMany.mockResolvedValue([item({})]);
      const res = await service.listarDoUsuario(7);
      expect(res[0].proximasAcoes).toEqual([
        'MUDAR_STATUS:EM_ANDAMENTO',
        'ENCERRAR',
      ]);
    });
  });

  describe('detalharParaUsuario', () => {
    it('lança 404 sem chamar detalhar quando o atendimento não pertence ao usuário', async () => {
      mockPrisma.atendimento.findFirst.mockResolvedValue(null);
      const spy = vi.spyOn(service, 'detalhar');
      await expect(service.detalharParaUsuario(7, 999)).rejects.toThrow(
        'Atendimento não encontrado',
      );
      expect(mockPrisma.atendimento.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 999, userId: 7 } }),
      );
      expect(spy).not.toHaveBeenCalled();
    });

    it('delega para detalhar quando o usuário é dono', async () => {
      mockPrisma.atendimento.findFirst.mockResolvedValue({ id: 10 });
      const spy = vi
        .spyOn(service, 'detalhar')
        .mockResolvedValue({ id: 10 } as never);
      const res = await service.detalharParaUsuario(7, 10);
      expect(spy).toHaveBeenCalledWith(10);
      expect(res).toEqual({ id: 10 });
    });
  });
});
