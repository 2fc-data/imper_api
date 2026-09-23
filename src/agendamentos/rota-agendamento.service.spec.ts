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

function geocodeRes(lat = '-21.79', lon = '-46.56') {
  return {
    ok: true,
    json: async () => [{ lat, lon }],
  };
}

function geocodeEmpty() {
  return { ok: true, json: async () => [] };
}

function osrmRes(distance = 1234.5, duration = 300.2) {
  return {
    ok: true,
    json: async () => ({ routes: [{ distance, duration }] }),
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
      .mockResolvedValueOnce(geocodeRes())
      .mockResolvedValueOnce(osrmRes());

    const result = await service.calcularRota(1);
    expect(result).toEqual({
      disponivel: true,
      distanciaM: 1234.5,
      duracaoSeg: 300.2,
      fonte: 'cep',
      aviso: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const geocodeUrl = String(fetchMock.mock.calls[0][0]);
    expect(geocodeUrl).toContain('postalcode=');
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
    fetchMock
      .mockResolvedValueOnce(geocodeRes())
      .mockResolvedValueOnce(osrmRes(100, 60))
      .mockResolvedValueOnce(geocodeRes());

    const first = await service.calcularRota(1);
    const second = await service.calcularRota(1);

    expect(first.disponivel).toBe(true);
    expect(second.disponivel).toBe(true);
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
      .mockResolvedValueOnce(geocodeRes())
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
      .mockResolvedValueOnce(geocodeRes('-21.78', '-46.55'))
      .mockResolvedValueOnce(osrmRes(500, 120));

    const result = await service.calcularRota(1);
    expect(result.fonte).toBe('cidade');
    expect(result.disponivel).toBe(true);
    const geocodeUrl = String(fetchMock.mock.calls[0][0]);
    expect(geocodeUrl).toContain('city=');
    expect(geocodeUrl).toContain('country=BR');
  });

  it('returns indisponivel when geocode cascade is empty', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        cep: '00000-000',
        cidade: 'Inexistente',
        estado: 'XX',
      }),
    );
    fetchMock.mockResolvedValue(geocodeEmpty());

    const result = await service.calcularRota(1);
    expect(result.disponivel).toBe(false);
    expect(result.fonte).toBe('cep');
    expect(result.aviso).toBeTruthy();
    // postalcode then city — both empty
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to city when postalcode geocode is empty', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        cep: '37701018',
        cidade: 'Poços de Caldas',
        estado: 'MG',
      }),
    );
    fetchMock
      .mockResolvedValueOnce(geocodeEmpty())
      .mockResolvedValueOnce(geocodeRes('-21.79003', '-46.56479'))
      .mockResolvedValueOnce(osrmRes(800, 200));

    const result = await service.calcularRota(1);
    expect(result).toMatchObject({
      disponivel: true,
      fonte: 'cidade',
      distanciaM: 800,
      duracaoSeg: 200,
      aviso: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const postalUrl = String(fetchMock.mock.calls[0][0]);
    expect(postalUrl).toContain('postalcode=37701018');
    const cityUrl = String(fetchMock.mock.calls[1][0]);
    expect(cityUrl).toContain('city=');
    expect(cityUrl).not.toContain('postalcode=');
  });

  it('geocodes street+cep first when logradouro present', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        logradouro: 'Rua Barros Cobra',
        cidade: 'Poços de Caldas',
        estado: 'MG',
        cep: '37701018',
      }),
    );
    fetchMock
      .mockResolvedValueOnce(geocodeRes('-21.79017', '-46.56102'))
      .mockResolvedValueOnce(osrmRes());

    const result = await service.calcularRota(1);
    expect(result).toMatchObject({ disponivel: true, fonte: 'cep' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('street=');
    expect(url).toContain('city=');
    expect(url).toContain('postalcode=37701018');
  });

  it('falls back from street to postalcode when street geocode is empty', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        logradouro: 'Rua Inexistente XYZ',
        cidade: 'Poços de Caldas',
        estado: 'MG',
        cep: '37701018',
      }),
    );
    fetchMock
      .mockResolvedValueOnce(geocodeEmpty())
      .mockResolvedValueOnce(geocodeRes())
      .mockResolvedValueOnce(osrmRes(900, 250));

    const result = await service.calcularRota(1);
    expect(result).toMatchObject({ disponivel: true, fonte: 'cep' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[0][0])).toContain('street=');
    expect(String(fetchMock.mock.calls[1][0])).toContain('postalcode=');
    expect(String(fetchMock.mock.calls[1][0])).not.toContain('street=');
  });

  it('returns indisponivel when only logradouro and no city/cep', async () => {
    mockPrisma.agendamento.findUnique.mockResolvedValue(
      enderecoAgendamento({
        logradouro: 'Rua Guaporé',
        cidade: null,
        cep: null,
      }),
    );
    const result = await service.calcularRota(1);
    expect(result).toMatchObject({
      disponivel: false,
      fonte: 'indisponivel',
    });
    expect(result.aviso).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
