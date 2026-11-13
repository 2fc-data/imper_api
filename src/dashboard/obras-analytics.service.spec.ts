import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardObrasQueryInput } from './dto/dashboard.dto.js';
import { ObrasAnalyticsService } from './obras-analytics.service.js';

const DIA = 86_400_000;

function diasAtras(dias: number): Date {
  return new Date(Date.now() - dias * DIA);
}

function criarPrismaMock() {
  return {
    obra: { findMany: vi.fn() },
    execucaoAtividade: { findMany: vi.fn() },
    aditivoObra: { findMany: vi.fn() },
  };
}

function criarObra(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    codigo: 'OB-001',
    status: 'EM_EXECUCAO',
    urgencia: 'NORMAL',
    valorContratado: 10_000,
    areaM2: 100,
    valorM2: 100,
    dataInicioPrevista: null,
    createdAt: diasAtras(10),
    user: { nome: 'Cliente A' },
    endereco: { cidade: 'São Paulo' },
    ...overrides,
  };
}

function criarExecucao(overrides: Record<string, unknown> = {}) {
  return {
    dataPrevisao: null,
    dataInicio: null,
    dataConclusao: null,
    status: 'PENDENTE',
    atividade: { obraEtapa: { obraId: 1 } },
    ...overrides,
  };
}

function criarAditivo(overrides: Record<string, unknown> = {}) {
  return {
    obraId: 1,
    valor: 1_000,
    status: 'PENDENTE',
    aprovadoEm: null,
    createdAt: diasAtras(5),
    ...overrides,
  };
}

function query(
  overrides: Partial<DashboardObrasQueryInput> = {},
): DashboardObrasQueryInput {
  return {
    tudo: false,
    comparar: true,
    ...overrides,
  };
}

describe('ObrasAnalyticsService', () => {
  let prisma: ReturnType<typeof criarPrismaMock>;
  let service: ObrasAnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = criarPrismaMock();
    prisma.execucaoAtividade.findMany.mockResolvedValue([]);
    prisma.aditivoObra.findMany.mockResolvedValue([]);
    service = new ObrasAnalyticsService(prisma as never);
  });

  it('usa período padrão de 90 dias e compara com o período anterior', async () => {
    prisma.obra.findMany.mockResolvedValue([criarObra()]);

    const resultado = await service.obterDashboardObras(query());

    expect(resultado.periodo.dias).toBe(90);
    expect(resultado.periodo.tudo).toBe(false);
    expect(resultado.periodoAnterior?.dias).toBe(90);
    expect(resultado.granularidade).toBe('semana');
    expect(resultado.kpis.obrasCriadas).toBe(1);
    expect(resultado.variacoes).not.toBeNull();
  });

  it('usa a obra mais antiga como início quando tudo=true e desliga comparação', async () => {
    prisma.obra.findMany.mockResolvedValue([
      criarObra({ createdAt: diasAtras(400) }),
    ]);

    const resultado = await service.obterDashboardObras(
      query({ tudo: true, comparar: true }),
    );

    expect(resultado.periodo.tudo).toBe(true);
    expect(resultado.granularidade).toBe('mes');
    const diasDesdeInicio = Math.round(
      (Date.now() - new Date(resultado.periodo.de).getTime()) / DIA,
    );
    expect(diasDesdeInicio).toBeGreaterThanOrEqual(400);
    expect(diasDesdeInicio).toBeLessThanOrEqual(401);
    expect(resultado.periodoAnterior).toBeNull();
    expect(resultado.variacoes).toBeNull();
  });

  it('calcula obras criadas e concluídas na série e nos KPIs', async () => {
    prisma.obra.findMany.mockResolvedValue([
      criarObra({ status: 'CONCLUIDA', createdAt: diasAtras(20) }),
    ]);
    prisma.execucaoAtividade.findMany.mockResolvedValue([
      criarExecucao({
        status: 'CONCLUIDA',
        dataInicio: diasAtras(15),
        dataConclusao: diasAtras(2),
      }),
    ]);

    const resultado = await service.obterDashboardObras(query());

    expect(resultado.kpis.obrasCriadas).toBe(1);
    expect(resultado.kpis.obrasConcluidas).toBe(1);
    expect(
      resultado.serie.reduce((total, item) => total + item.criadas, 0),
    ).toBe(1);
    expect(
      resultado.serie.reduce((total, item) => total + item.concluidas, 0),
    ).toBe(1);
    expect(resultado.kpis.valorContratadoNovas).toBe(10_000);
  });

  it('considera aditivos aprovados no período e pendentes no snapshot', async () => {
    prisma.obra.findMany.mockResolvedValue([criarObra()]);
    prisma.aditivoObra.findMany.mockResolvedValue([
      criarAditivo({
        valor: 1_500,
        status: 'APROVADO',
        aprovadoEm: diasAtras(5),
      }),
      criarAditivo({ valor: 500, status: 'PENDENTE' }),
    ]);

    const resultado = await service.obterDashboardObras(query());

    expect(resultado.kpis.aditivosAprovadosValor).toBe(1_500);
    expect(resultado.kpis.aditivosPendentesValor).toBe(500);
    expect(resultado.kpis.aditivosPendentesQtd).toBe(1);
    expect(resultado.financeiro.totalPrevistoAtivo).toBe(11_500);
  });

  it('destaca obras críticas e gera os três tipos de alerta', async () => {
    prisma.obra.findMany.mockResolvedValue([
      criarObra({ urgencia: 'URGENTISSIMO' }),
    ]);
    prisma.execucaoAtividade.findMany.mockResolvedValue([
      criarExecucao({
        status: 'PENDENTE',
        dataPrevisao: diasAtras(10),
      }),
    ]);
    prisma.aditivoObra.findMany.mockResolvedValue([
      criarAditivo({ valor: 500, status: 'PENDENTE' }),
    ]);

    const resultado = await service.obterDashboardObras(query());

    expect(resultado.obrasCriticas).toHaveLength(1);
    expect(resultado.obrasCriticas[0].diasAtrasoMaximo).toBe(10);
    expect(resultado.alertas.map((alerta) => alerta.tipo)).toEqual(
      expect.arrayContaining([
        'EXECUCAO_ATRASADA',
        'URGENTE_SEM_INICIO',
        'ADITIVO_PENDENTE',
      ]),
    );
  });

  it('escolhe granularidade diária para períodos curtos e mensal para longos', async () => {
    prisma.obra.findMany.mockResolvedValue([criarObra()]);

    const curto = await service.obterDashboardObras(
      query({ de: diasAtras(6), ate: new Date() }),
    );
    const longo = await service.obterDashboardObras(
      query({ de: diasAtras(200), ate: new Date() }),
    );

    expect(curto.granularidade).toBe('dia');
    expect(curto.serie).toHaveLength(7);
    expect(longo.granularidade).toBe('mes');
  });
});
