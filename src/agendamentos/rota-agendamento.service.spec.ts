import { AppError } from '../lib/errors.js';
import { RotaAgendamentoService } from './rota-agendamento.service.js';

const mockPrisma = {
  agendamento: { findUnique: vi.fn() },
};

type FetchMock = ReturnType<typeof vi.fn>;
let fetchMock: FetchMock;

function enderecoAgendamento(endereco: unknown, userId = 1) {
  return {
    id: 1,
    endereco,
    user: { id: userId, enderecos: [] },
  };
}

describe('RotaAgendamentoService', () => {
  let service: RotaAgendamentoService;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    service = new RotaAgendamentoService(mockPrisma as any);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws 404 when agendamento not found', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(null);
    await expect(service.calcularRota(999)).rejects.toThrow(AppError);
    try {
      await service.calcularRota(999);
    } catch (e) {
      expect((e as AppError).getStatus()).toBe(404);
    }
  });

  it('returns indisponivel when no address', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento(null),
    );
    const result = await service.calcularRota(1);
    expect(result).toMatchObject({
      disponivel: false,
      distanciaM: null,
      duracaoSeg: null,
      fonte: 'indisponivel',
    });
    expect(result.aviso).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calculates route via CEP with geocode + OSRM', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        cep: '37701-012',
        cidade: 'Poços de Caldas',
        estado: 'MG',
      }),
    );
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ lat: '-21.79', lon: '-46.56' }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distance: 1234.5, duration: 300.2 }],
        }),
      });

    const result = await service.calcularRota(1);
    expect(result).toEqual({
      disponivel: true,
      distanciaM: 1234.5,
      duracaoSeg: 300.2,
      fonte: 'cep',
      aviso: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const osrmUrl = String(fetchMock.mock.calls[1][0]);
    expect(osrmUrl).toContain('/route/v1/driving/');
    expect(osrmUrl).toContain('overview=false');
  });

  it('caches OSRM result for same destination', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        cep: '37701012',
        cidade: 'Poços de Caldas',
        estado: 'MG',
      }),
    );
    const geocodeRes = () => ({
      ok: true,
      json: async () => [{ lat: '-21.79', lon: '-46.56' }],
    });
    fetchMock
      .mockResolvedValueOnce(geocodeRes())
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distance: 100, duration: 60 }],
        }),
      })
      .mockResolvedValueOnce(geocodeRes());

    const first = await service.calcularRota(1);
    const second = await service.calcularRota(1);

    expect(first.disponivel).toBe(true);
    expect(second.disponivel).toBe(true);
    // second call: geocode re-fetched, but OSRM cached
    const osrmCalls = fetchMock.mock.calls.filter((c: any[]) =>
      String(c[0]).includes('/route/v1/driving/'),
    );
    expect(osrmCalls).toHaveLength(1);
  });

  it('returns indisponivel when OSRM fails', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        cep: '37701012',
        cidade: 'Poços de Caldas',
        estado: 'MG',
      }),
    );
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ lat: '-21.79', lon: '-46.56' }],
      })
      .mockRejectedValueOnce(new Error('timeout'));

    const result = await service.calcularRota(1);
    expect(result.disponivel).toBe(false);
    expect(result.fonte).toBe('cep');
    expect(result.aviso).toBeTruthy();
  });

  it('falls back to city geocode when no CEP', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        cep: null,
        cidade: 'Poços de Caldas',
        estado: 'MG',
      }),
    );
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ lat: '-21.78', lon: '-46.55' }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [{ distance: 500, duration: 120 }],
        }),
      });

    const result = await service.calcularRota(1);
    expect(result.fonte).toBe('cidade');
    expect(result.disponivel).toBe(true);
    const geocodeUrl = String(fetchMock.mock.calls[0][0]);
    expect(geocodeUrl).toContain('city=');
    expect(geocodeUrl).toContain('country=BR');
  });

  it('returns indisponivel when geocode returns empty', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        cep: '00000-000',
        cidade: 'Inexistente',
        estado: 'XX',
      }),
    );
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await service.calcularRota(1);
    expect(result.disponivel).toBe(false);
    expect(result.fonte).toBe('cep');
    expect(result.aviso).toBeTruthy();
  });
});
