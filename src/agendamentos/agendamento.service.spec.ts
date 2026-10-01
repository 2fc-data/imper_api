import { AgendamentoService } from './agendamento.service.js';

const mockTx = {
  endereco: { create: vi.fn() },
};

const mockPrisma = {
  agendamento: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  atendimento: { findUnique: vi.fn() },
  endereco: { create: vi.fn() },
  $transaction: vi.fn(async (fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
};

function dto(parcial: Record<string, unknown>) {
  return {
    userId: 1,
    atendimentoId: 10,
    dataPrevista: '2026-10-15T10:00:00.000Z',
    ...parcial,
  } as any;
}

describe('AgendamentoService (gate 1)', () => {
  let service: AgendamentoService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AgendamentoService(mockPrisma as any);
    mockPrisma.atendimento.findUnique.mockResolvedValue({
      id: 10,
      status: 'EM_ANDAMENTO',
      visitaSolicitada: true,
    });
    mockPrisma.agendamento.create.mockResolvedValue({ id: 100 });
    mockTx.endereco.create.mockResolvedValue({ id: 55 });
  });

  it('dto sem atendimentoId → 400 atendimentoId é obrigatório', async () => {
    await expect(
      service.criar(dto({ atendimentoId: undefined })),
    ).rejects.toThrow('atendimentoId é obrigatório');
    expect(mockPrisma.agendamento.create).not.toHaveBeenCalled();
  });

  it('atendimento inexistente → 404 Atendimento não encontrado', async () => {
    mockPrisma.atendimento.findUnique.mockResolvedValue(null);
    await expect(service.criar(dto({}))).rejects.toThrow(
      'Atendimento não encontrado',
    );
    expect(mockPrisma.agendamento.create).not.toHaveBeenCalled();
  });

  it('atendimento CONCLUIDO → 400 Atendimento encerrado', async () => {
    mockPrisma.atendimento.findUnique.mockResolvedValue({
      id: 10,
      status: 'CONCLUIDO',
      visitaSolicitada: true,
    });
    await expect(service.criar(dto({}))).rejects.toThrow(
      'Atendimento encerrado',
    );
    expect(mockPrisma.agendamento.create).not.toHaveBeenCalled();
  });

  it('tipo VISITA sem visitaSolicitada → 400 Atendimento não tem visita solicitada', async () => {
    mockPrisma.atendimento.findUnique.mockResolvedValue({
      id: 10,
      status: 'EM_ANDAMENTO',
      visitaSolicitada: false,
    });
    await expect(service.criar(dto({ tipo: 'VISITA' }))).rejects.toThrow(
      'Atendimento não tem visita solicitada',
    );
    expect(mockPrisma.agendamento.create).not.toHaveBeenCalled();
  });

  it('tipo omitido (default VISITA) sem visitaSolicitada → 400', async () => {
    mockPrisma.atendimento.findUnique.mockResolvedValue({
      id: 10,
      status: 'EM_ANDAMENTO',
      visitaSolicitada: false,
    });
    await expect(service.criar(dto({}))).rejects.toThrow(
      'Atendimento não tem visita solicitada',
    );
  });

  it('tipo VISITA + flag=true → cria com atendimentoId e include visita', async () => {
    await service.criar(dto({ tipo: 'VISITA' }));
    expect(mockPrisma.agendamento.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ atendimentoId: 10 }),
        include: expect.objectContaining({ visita: true }),
      }),
    );
  });

  it('tipo ≠ VISITA + flag=false → cria (gate só cobre VISITA)', async () => {
    mockPrisma.atendimento.findUnique.mockResolvedValue({
      id: 10,
      status: 'EM_ANDAMENTO',
      visitaSolicitada: false,
    });
    const res = await service.criar(dto({ tipo: 'ORCAMENTO' }));
    expect(res).toEqual({ id: 100 });
    expect(mockPrisma.agendamento.create).toHaveBeenCalled();
  });
});

describe('AgendamentoService (portal)', () => {
  let service: AgendamentoService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AgendamentoService(mockPrisma as any);
    mockPrisma.agendamento.findMany.mockResolvedValue([]);
  });

  it('listarDoUsuario filtra por userId', async () => {
    await service.listarDoUsuario(7);
    expect(mockPrisma.agendamento.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 7 },
        include: expect.objectContaining({
          user: expect.anything(),
        }),
        orderBy: { dataPrevista: 'asc' },
      }),
    );
  });

  it('listarDoUsuario devolve o retorno de listar', async () => {
    const itens = [{ id: 1, userId: 7 }];
    mockPrisma.agendamento.findMany.mockResolvedValue(itens);
    const res = await service.listarDoUsuario(7);
    expect(res).toEqual(itens);
  });
});
