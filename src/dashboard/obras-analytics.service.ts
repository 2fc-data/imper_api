import { Injectable } from '@nestjs/common';
import type { Prisma, StatusObra, Urgencia } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  DashboardObraAlerta,
  DashboardObraCritica,
  DashboardObrasDistribuicaoItem,
  DashboardObrasDistribuicoes,
  DashboardObrasFinanceiro,
  DashboardObrasGranularidade,
  DashboardObrasKpis,
  DashboardObrasKpisAnterior,
  DashboardObrasPeriodo,
  DashboardObrasQueryInput,
  DashboardObrasResponse,
  DashboardObrasSerieItem,
  DashboardObrasVariacoes,
} from './dto/dashboard.dto.js';

const DIA_MS = 86_400_000;
const TIME_ZONE = 'America/Sao_Paulo';
const OFFSET_SP = '-03:00';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const moedaFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

const STATUS_LABEL: Record<StatusObra, string> = {
  EM_PREPARACAO: 'Em preparação',
  EM_EXECUCAO: 'Em execução',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const URGENCIA_LABEL: Record<Urgencia, string> = {
  NORMAL: 'Normal',
  URGENTE: 'Urgente',
  URGENTISSIMO: 'Urgentíssimo',
};

const URGENCIA_PESO: Record<Urgencia, number> = {
  NORMAL: 0,
  URGENTE: 1,
  URGENTISSIMO: 2,
};

const STATUS_ATIVOS: StatusObra[] = ['EM_PREPARACAO', 'EM_EXECUCAO'];

interface ObraRow {
  id: number;
  codigo: string;
  status: StatusObra;
  urgencia: Urgencia;
  valorContratado: unknown;
  areaM2: unknown;
  valorM2: unknown;
  dataInicioPrevista: Date | null;
  createdAt: Date;
  user: { nome: string } | null;
  endereco: { cidade: string | null } | null;
}

interface ExecucaoRow {
  dataPrevisao: Date | null;
  dataInicio: Date | null;
  dataConclusao: Date | null;
  status: string;
  atividade: { obraEtapa: { obraId: number } };
}

interface AditivoRow {
  obraId: number;
  valor: unknown;
  status: string;
  aprovadoEm: Date | null;
  createdAt: Date;
}

interface ResumoObra {
  obra: ObraRow;
  execucoes: ExecucaoRow[];
  aditivos: AditivoRow[];
  concluidaEm: Date | null;
  execucoesTotal: number;
  execucoesConcluidas: number;
  execucoesPendentes: number;
  execucoesAtrasadas: number;
  diasAtrasoMaximo: number;
  proximaPrevisao: Date | null;
  temExecucaoIniciada: boolean;
  aditivosAprovadosValor: number;
  aditivosPendentesValor: number;
  aditivosPendentesQtd: number;
}

interface PeriodoCalculado {
  de: Date;
  ate: Date;
  tudo: boolean;
  dias: number;
}

interface MetricasPeriodo {
  obrasCriadas: number;
  obrasConcluidas: number;
  valorContratadoNovas: number;
  aditivosAprovadosValor: number;
  ticketMedioNovas: number;
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  if (typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

function ymdSP(date: Date): string {
  return dateFormatter.format(date);
}

function inicioDiaSP(date: Date): Date {
  return new Date(`${ymdSP(date)}T00:00:00${OFFSET_SP}`);
}

function fimDiaSP(date: Date): Date {
  return new Date(`${ymdSP(date)}T23:59:59.999${OFFSET_SP}`);
}

function somarDias(date: Date, dias: number): Date {
  return new Date(date.getTime() + dias * DIA_MS);
}

function diferencaEmDias(de: Date, ate: Date): number {
  return Math.round(
    (inicioDiaSP(ate).getTime() - inicioDiaSP(de).getTime()) / DIA_MS,
  );
}

function chaveSemana(date: Date): string {
  const inicio = inicioDiaSP(date);
  const diaSemana = inicio.getUTCDay();
  const deslocamento = diaSemana === 0 ? 6 : diaSemana - 1;
  return ymdSP(somarDias(inicio, -deslocamento));
}

function chaveMes(date: Date): string {
  return ymdSP(date).slice(0, 7);
}

function labelDia(chave: string): string {
  const [, mes, dia] = chave.split('-');
  return `${dia}/${mes}`;
}

function labelMes(chave: string): string {
  const [ano, mes] = chave.split('-');
  return `${MESES_CURTOS[Number(mes) - 1]}/${ano.slice(2)}`;
}

function obterGranularidade(dias: number): DashboardObrasGranularidade {
  if (dias <= 31) return 'dia';
  if (dias <= 180) return 'semana';
  return 'mes';
}

function chaveBucket(
  date: Date,
  granularidade: DashboardObrasGranularidade,
): string {
  if (granularidade === 'dia') return ymdSP(date);
  if (granularidade === 'semana') return chaveSemana(date);
  return chaveMes(date);
}

function gerarBuckets(
  de: Date,
  ate: Date,
  granularidade: DashboardObrasGranularidade,
): Map<string, DashboardObrasSerieItem> {
  const buckets = new Map<string, DashboardObrasSerieItem>();
  const limite = fimDiaSP(ate);

  let cursor: Date;
  if (granularidade === 'dia') {
    cursor = inicioDiaSP(de);
  } else if (granularidade === 'semana') {
    cursor = new Date(`${chaveSemana(de)}T00:00:00${OFFSET_SP}`);
  } else {
    cursor = new Date(`${ymdSP(de).slice(0, 7)}-01T00:00:00${OFFSET_SP}`);
  }

  while (cursor <= limite) {
    const chave = chaveBucket(cursor, granularidade);
    buckets.set(chave, {
      chave,
      label: granularidade === 'mes' ? labelMes(chave) : labelDia(chave),
      criadas: 0,
      concluidas: 0,
      valorContratado: 0,
      aditivosAprovados: 0,
    });

    if (granularidade === 'dia') {
      cursor = somarDias(cursor, 1);
    } else if (granularidade === 'semana') {
      cursor = somarDias(cursor, 7);
    } else {
      cursor = new Date(
        `${chaveMes(somarDias(cursor, 32))}-01T00:00:00${OFFSET_SP}`,
      );
    }
  }

  return buckets;
}

function dentroDoPeriodo(
  date: Date | null | undefined,
  periodo: PeriodoCalculado,
): boolean {
  if (!date) return false;
  return date >= periodo.de && date <= periodo.ate;
}

function calcularVariacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return ((atual - anterior) / anterior) * 100;
}

function distribuicaoTop(
  itens: Map<string, number>,
  limite = 5,
): DashboardObrasDistribuicaoItem[] {
  const ordenados = [...itens.entries()]
    .filter(([, valor]) => valor > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  if (ordenados.length <= limite) {
    return ordenados.map(([chave, valor]) => ({ chave, label: chave, valor }));
  }

  const principais = ordenados.slice(0, limite);
  const restante = ordenados
    .slice(limite)
    .reduce((total, [, valor]) => total + valor, 0);

  return [
    ...principais.map(([chave, valor]) => ({
      chave,
      label: chave,
      valor,
    })),
    { chave: 'OUTROS', label: 'Outros', valor: restante },
  ];
}

@Injectable()
export class ObrasAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async obterDashboardObras(
    query: DashboardObrasQueryInput,
  ): Promise<DashboardObrasResponse> {
    const where: Prisma.ObraWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.urgencia) where.urgencia = query.urgencia;
    if (query.clienteId) where.userId = query.clienteId;
    if (query.obraId) where.id = query.obraId;

    const obras = (await this.prisma.obra.findMany({
      where,
      select: {
        id: true,
        codigo: true,
        status: true,
        urgencia: true,
        valorContratado: true,
        areaM2: true,
        valorM2: true,
        dataInicioPrevista: true,
        createdAt: true,
        user: { select: { nome: true } },
        endereco: { select: { cidade: true } },
      },
      orderBy: { createdAt: 'desc' },
    })) as ObraRow[];

    const periodo = this.resolverPeriodo(query, obras);
    const granularidade = obterGranularidade(periodo.dias);

    const obraIds = obras.map((obra) => obra.id);

    const [execucoes, aditivos] = await Promise.all([
      obraIds.length
        ? (this.prisma.execucaoAtividade.findMany({
            where: {
              atividade: { obraEtapa: { obraId: { in: obraIds } } },
            },
            select: {
              dataPrevisao: true,
              dataInicio: true,
              dataConclusao: true,
              status: true,
              atividade: {
                select: { obraEtapa: { select: { obraId: true } } },
              },
            },
          }) as Promise<ExecucaoRow[]>)
        : Promise.resolve([] as ExecucaoRow[]),
      obraIds.length
        ? (this.prisma.aditivoObra.findMany({
            where: { obraId: { in: obraIds } },
            select: {
              obraId: true,
              valor: true,
              status: true,
              aprovadoEm: true,
              createdAt: true,
            },
          }) as Promise<AditivoRow[]>)
        : Promise.resolve([] as AditivoRow[]),
    ]);

    const execucoesPorObra = new Map<number, ExecucaoRow[]>();
    for (const execucao of execucoes) {
      const obraId = execucao.atividade.obraEtapa.obraId;
      const lista = execucoesPorObra.get(obraId) ?? [];
      lista.push(execucao);
      execucoesPorObra.set(obraId, lista);
    }

    const aditivosPorObra = new Map<number, AditivoRow[]>();
    for (const aditivo of aditivos) {
      const lista = aditivosPorObra.get(aditivo.obraId) ?? [];
      lista.push(aditivo);
      aditivosPorObra.set(aditivo.obraId, lista);
    }

    const agora = new Date();
    const resumos = obras.map((obra) =>
      this.resumirObra(
        obra,
        execucoesPorObra.get(obra.id) ?? [],
        aditivosPorObra.get(obra.id) ?? [],
        agora,
      ),
    );

    const kpis = this.calcularKpis(resumos, periodo);
    const periodoAnterior =
      query.comparar && !periodo.tudo
        ? this.calcularPeriodoAnterior(periodo)
        : null;
    const kpisAnterior = periodoAnterior
      ? this.calcularMetricasPeriodo(resumos, periodoAnterior)
      : null;
    const variacoes =
      kpisAnterior && periodoAnterior
        ? this.calcularVariacoes(kpis, kpisAnterior)
        : null;

    return {
      periodo: this.serializarPeriodo(periodo),
      periodoAnterior: periodoAnterior
        ? this.serializarPeriodo(periodoAnterior)
        : null,
      granularidade,
      kpis,
      kpisAnterior,
      variacoes,
      serie: this.montarSerie(resumos, periodo, granularidade),
      distribuicoes: this.montarDistribuicoes(resumos),
      financeiro: this.montarFinanceiro(resumos, periodo),
      obrasCriticas: this.montarObrasCriticas(resumos),
      alertas: this.montarAlertas(resumos),
    };
  }

  private resolverPeriodo(
    query: DashboardObrasQueryInput,
    obras: ObraRow[],
  ): PeriodoCalculado {
    const agora = new Date();
    const ate = query.ate ? fimDiaSP(query.ate) : fimDiaSP(agora);

    if (query.tudo) {
      const maisAntiga = obras.reduce<Date | null>((menor, obra) => {
        if (!menor || obra.createdAt < menor) return obra.createdAt;
        return menor;
      }, null);
      const de = inicioDiaSP(maisAntiga ?? agora);
      return {
        de,
        ate,
        tudo: true,
        dias: Math.max(1, diferencaEmDias(de, ate) + 1),
      };
    }

    const de = query.de
      ? inicioDiaSP(query.de)
      : inicioDiaSP(somarDias(ate, -89));

    return {
      de,
      ate,
      tudo: false,
      dias: Math.max(1, diferencaEmDias(de, ate) + 1),
    };
  }

  private calcularPeriodoAnterior(periodo: PeriodoCalculado): PeriodoCalculado {
    const de = somarDias(inicioDiaSP(periodo.de), -periodo.dias);
    const ate = new Date(inicioDiaSP(periodo.de).getTime() - 1);
    return {
      de,
      ate,
      tudo: false,
      dias: Math.max(1, diferencaEmDias(de, ate) + 1),
    };
  }

  private serializarPeriodo(periodo: PeriodoCalculado): DashboardObrasPeriodo {
    return {
      de: periodo.de.toISOString(),
      ate: periodo.ate.toISOString(),
      tudo: periodo.tudo,
      dias: periodo.dias,
    };
  }

  private resumirObra(
    obra: ObraRow,
    execucoes: ExecucaoRow[],
    aditivos: AditivoRow[],
    agora: Date,
  ): ResumoObra {
    const relevantes = execucoes.filter(
      (execucao) => execucao.status !== 'CANCELADA',
    );

    let concluidaEm: Date | null = null;
    let execucoesConcluidas = 0;
    let execucoesPendentes = 0;
    let execucoesAtrasadas = 0;
    let diasAtrasoMaximo = 0;
    let proximaPrevisao: Date | null = null;
    let temExecucaoIniciada = false;

    for (const execucao of execucoes) {
      if (execucao.status === 'CONCLUIDA') {
        execucoesConcluidas += 1;
      }
      if (execucao.dataConclusao) {
        if (!concluidaEm || execucao.dataConclusao > concluidaEm) {
          concluidaEm = execucao.dataConclusao;
        }
      }
      if (
        execucao.dataInicio ||
        execucao.dataConclusao ||
        execucao.status === 'EM_ANDAMENTO' ||
        execucao.status === 'CONCLUIDA'
      ) {
        temExecucaoIniciada = true;
      }
      if (execucao.status === 'PENDENTE') {
        execucoesPendentes += 1;
      }

      const ativa =
        execucao.status === 'PENDENTE' || execucao.status === 'EM_ANDAMENTO';

      if (ativa && execucao.dataPrevisao) {
        if (execucao.dataPrevisao < agora) {
          execucoesAtrasadas += 1;
          const dias = Math.max(
            1,
            Math.floor(
              (inicioDiaSP(agora).getTime() -
                inicioDiaSP(execucao.dataPrevisao).getTime()) /
                DIA_MS,
            ),
          );
          diasAtrasoMaximo = Math.max(diasAtrasoMaximo, dias);
        } else if (
          !proximaPrevisao ||
          execucao.dataPrevisao < proximaPrevisao
        ) {
          proximaPrevisao = execucao.dataPrevisao;
        }
      }
    }

    let aditivosAprovadosValor = 0;
    let aditivosPendentesValor = 0;
    let aditivosPendentesQtd = 0;

    for (const aditivo of aditivos) {
      const valor = toNumber(aditivo.valor);
      if (aditivo.status === 'APROVADO') {
        aditivosAprovadosValor += valor;
      } else if (aditivo.status === 'PENDENTE') {
        aditivosPendentesValor += valor;
        aditivosPendentesQtd += 1;
      }
    }

    return {
      obra,
      execucoes: relevantes,
      aditivos,
      concluidaEm,
      execucoesTotal: relevantes.length,
      execucoesConcluidas,
      execucoesPendentes,
      execucoesAtrasadas,
      diasAtrasoMaximo,
      proximaPrevisao,
      temExecucaoIniciada,
      aditivosAprovadosValor,
      aditivosPendentesValor,
      aditivosPendentesQtd,
    };
  }

  private calcularKpis(
    resumos: ResumoObra[],
    periodo: PeriodoCalculado,
  ): DashboardObrasKpis {
    const ativos = resumos.filter((resumo) =>
      STATUS_ATIVOS.includes(resumo.obra.status),
    );
    const metricas = this.calcularMetricasPeriodo(resumos, periodo);

    let valorContratadoAtivo = 0;
    let areaTotalM2 = 0;
    let aditivosPendentesValor = 0;
    let aditivosPendentesQtd = 0;
    let execucoesAtrasadas = 0;
    let execucoesPendentes = 0;

    for (const resumo of ativos) {
      valorContratadoAtivo += toNumber(resumo.obra.valorContratado);
      areaTotalM2 += toNumber(resumo.obra.areaM2);
      aditivosPendentesValor += resumo.aditivosPendentesValor;
      aditivosPendentesQtd += resumo.aditivosPendentesQtd;
      execucoesAtrasadas += resumo.execucoesAtrasadas;
      execucoesPendentes += resumo.execucoesPendentes;
    }

    return {
      obrasAtivas: ativos.length,
      obrasEmExecucao: ativos.filter(
        (resumo) => resumo.obra.status === 'EM_EXECUCAO',
      ).length,
      obrasEmPreparacao: ativos.filter(
        (resumo) => resumo.obra.status === 'EM_PREPARACAO',
      ).length,
      obrasCriadas: metricas.obrasCriadas,
      obrasConcluidas: metricas.obrasConcluidas,
      valorContratadoNovas: metricas.valorContratadoNovas,
      aditivosAprovadosValor: metricas.aditivosAprovadosValor,
      aditivosPendentesValor,
      aditivosPendentesQtd,
      ticketMedioNovas: metricas.ticketMedioNovas,
      areaTotalM2,
      valorMedioM2: areaTotalM2 > 0 ? valorContratadoAtivo / areaTotalM2 : 0,
      execucoesAtrasadas,
      execucoesPendentes,
    };
  }

  private calcularMetricasPeriodo(
    resumos: ResumoObra[],
    periodo: PeriodoCalculado,
  ): MetricasPeriodo {
    let obrasCriadas = 0;
    let obrasConcluidas = 0;
    let valorContratadoNovas = 0;
    let aditivosAprovadosValor = 0;

    for (const resumo of resumos) {
      if (dentroDoPeriodo(resumo.obra.createdAt, periodo)) {
        obrasCriadas += 1;
        valorContratadoNovas += toNumber(resumo.obra.valorContratado);
      }

      if (
        resumo.obra.status === 'CONCLUIDA' &&
        dentroDoPeriodo(resumo.concluidaEm, periodo)
      ) {
        obrasConcluidas += 1;
      }

      for (const aditivo of resumo.aditivos) {
        if (
          aditivo.status === 'APROVADO' &&
          dentroDoPeriodo(aditivo.aprovadoEm, periodo)
        ) {
          aditivosAprovadosValor += toNumber(aditivo.valor);
        }
      }
    }

    return {
      obrasCriadas,
      obrasConcluidas,
      valorContratadoNovas,
      aditivosAprovadosValor,
      ticketMedioNovas:
        obrasCriadas > 0 ? valorContratadoNovas / obrasCriadas : 0,
    };
  }

  private calcularVariacoes(
    kpis: DashboardObrasKpis,
    anterior: DashboardObrasKpisAnterior,
  ): DashboardObrasVariacoes {
    return {
      obrasCriadas: calcularVariacao(kpis.obrasCriadas, anterior.obrasCriadas),
      obrasConcluidas: calcularVariacao(
        kpis.obrasConcluidas,
        anterior.obrasConcluidas,
      ),
      valorContratadoNovas: calcularVariacao(
        kpis.valorContratadoNovas,
        anterior.valorContratadoNovas,
      ),
      aditivosAprovadosValor: calcularVariacao(
        kpis.aditivosAprovadosValor,
        anterior.aditivosAprovadosValor,
      ),
      ticketMedioNovas: calcularVariacao(
        kpis.ticketMedioNovas,
        anterior.ticketMedioNovas,
      ),
    };
  }

  private montarSerie(
    resumos: ResumoObra[],
    periodo: PeriodoCalculado,
    granularidade: DashboardObrasGranularidade,
  ): DashboardObrasSerieItem[] {
    const buckets = gerarBuckets(periodo.de, periodo.ate, granularidade);

    for (const resumo of resumos) {
      if (dentroDoPeriodo(resumo.obra.createdAt, periodo)) {
        const bucket = buckets.get(
          chaveBucket(resumo.obra.createdAt, granularidade),
        );
        if (bucket) {
          bucket.criadas += 1;
          bucket.valorContratado += toNumber(resumo.obra.valorContratado);
        }
      }

      if (
        resumo.obra.status === 'CONCLUIDA' &&
        dentroDoPeriodo(resumo.concluidaEm, periodo) &&
        resumo.concluidaEm
      ) {
        const bucket = buckets.get(
          chaveBucket(resumo.concluidaEm, granularidade),
        );
        if (bucket) bucket.concluidas += 1;
      }

      for (const aditivo of resumo.aditivos) {
        if (
          aditivo.status === 'APROVADO' &&
          dentroDoPeriodo(aditivo.aprovadoEm, periodo) &&
          aditivo.aprovadoEm
        ) {
          const bucket = buckets.get(
            chaveBucket(aditivo.aprovadoEm, granularidade),
          );
          if (bucket) bucket.aditivosAprovados += toNumber(aditivo.valor);
        }
      }
    }

    return [...buckets.values()];
  }

  private montarDistribuicoes(
    resumos: ResumoObra[],
  ): DashboardObrasDistribuicoes {
    const ativos = resumos.filter((resumo) =>
      STATUS_ATIVOS.includes(resumo.obra.status),
    );

    const status = new Map<string, number>();
    for (const resumo of resumos) {
      status.set(resumo.obra.status, (status.get(resumo.obra.status) ?? 0) + 1);
    }

    const urgencia = new Map<string, number>();
    for (const resumo of ativos) {
      urgencia.set(
        resumo.obra.urgencia,
        (urgencia.get(resumo.obra.urgencia) ?? 0) + 1,
      );
    }

    const clientes = new Map<string, number>();
    const cidades = new Map<string, number>();
    for (const resumo of ativos) {
      const cliente = resumo.obra.user?.nome?.trim() || 'Sem cliente';
      const cidade = resumo.obra.endereco?.cidade?.trim() || 'Sem cidade';
      clientes.set(cliente, (clientes.get(cliente) ?? 0) + 1);
      cidades.set(cidade, (cidades.get(cidade) ?? 0) + 1);
    }

    return {
      porStatus: [...status.entries()]
        .filter(([, valor]) => valor > 0)
        .map(([chave, valor]) => ({
          chave,
          label: STATUS_LABEL[chave as StatusObra] ?? chave,
          valor,
        })),
      porUrgencia: [...urgencia.entries()]
        .filter(([, valor]) => valor > 0)
        .map(([chave, valor]) => ({
          chave,
          label: URGENCIA_LABEL[chave as Urgencia] ?? chave,
          valor,
        })),
      porCliente: distribuicaoTop(clientes),
      porCidade: distribuicaoTop(cidades),
    };
  }

  private montarFinanceiro(
    resumos: ResumoObra[],
    periodo: PeriodoCalculado,
  ): DashboardObrasFinanceiro {
    const ativos = resumos.filter((resumo) =>
      STATUS_ATIVOS.includes(resumo.obra.status),
    );
    const metricas = this.calcularMetricasPeriodo(resumos, periodo);

    let contratadoAtivo = 0;
    let aditivosAprovadosAtivo = 0;
    let aditivosPendentesAtivo = 0;

    for (const resumo of ativos) {
      contratadoAtivo += toNumber(resumo.obra.valorContratado);
      aditivosAprovadosAtivo += resumo.aditivosAprovadosValor;
      aditivosPendentesAtivo += resumo.aditivosPendentesValor;
    }

    return {
      contratadoAtivo,
      aditivosAprovadosAtivo,
      aditivosPendentesAtivo,
      totalPrevistoAtivo: contratadoAtivo + aditivosAprovadosAtivo,
      contratadoNovas: metricas.valorContratadoNovas,
      aditivosAprovadosPeriodo: metricas.aditivosAprovadosValor,
    };
  }

  private montarObrasCriticas(resumos: ResumoObra[]): DashboardObraCritica[] {
    return resumos
      .filter((resumo) => {
        if (!STATUS_ATIVOS.includes(resumo.obra.status)) return false;
        const urgente = resumo.obra.urgencia !== 'NORMAL';
        const semInicio = urgente && !resumo.temExecucaoIniciada;
        return (
          resumo.execucoesAtrasadas > 0 ||
          semInicio ||
          resumo.aditivosPendentesQtd > 0
        );
      })
      .sort((a, b) => {
        return (
          b.diasAtrasoMaximo - a.diasAtrasoMaximo ||
          URGENCIA_PESO[b.obra.urgencia] - URGENCIA_PESO[a.obra.urgencia] ||
          toNumber(b.obra.valorContratado) - toNumber(a.obra.valorContratado)
        );
      })
      .slice(0, 12)
      .map((resumo) => ({
        id: resumo.obra.id,
        codigo: resumo.obra.codigo,
        clienteNome: resumo.obra.user?.nome?.trim() || 'Sem cliente',
        cidade: resumo.obra.endereco?.cidade?.trim() || 'Sem cidade',
        status: resumo.obra.status,
        urgencia: resumo.obra.urgencia,
        valorContratado: toNumber(resumo.obra.valorContratado),
        execucoesTotal: resumo.execucoesTotal,
        execucoesConcluidas: resumo.execucoesConcluidas,
        execucoesAtrasadas: resumo.execucoesAtrasadas,
        progresso:
          resumo.execucoesTotal > 0
            ? Math.round(
                (resumo.execucoesConcluidas / resumo.execucoesTotal) * 100,
              )
            : 0,
        dataInicioPrevista:
          resumo.obra.dataInicioPrevista?.toISOString() ?? null,
        proximaPrevisao: resumo.proximaPrevisao?.toISOString() ?? null,
        diasAtrasoMaximo: resumo.diasAtrasoMaximo,
      }));
  }

  private montarAlertas(resumos: ResumoObra[]): DashboardObraAlerta[] {
    const alertas: DashboardObraAlerta[] = [];

    for (const resumo of resumos) {
      if (!STATUS_ATIVOS.includes(resumo.obra.status)) continue;

      if (resumo.execucoesAtrasadas > 0) {
        alertas.push({
          tipo: 'EXECUCAO_ATRASADA',
          severidade: resumo.diasAtrasoMaximo > 7 ? 'alta' : 'media',
          obraId: resumo.obra.id,
          codigo: resumo.obra.codigo,
          mensagem: `${resumo.execucoesAtrasadas} execução(ões) atrasada(s), maior atraso de ${resumo.diasAtrasoMaximo} dia(s).`,
        });
      }

      const urgente = resumo.obra.urgencia !== 'NORMAL';
      if (urgente && !resumo.temExecucaoIniciada) {
        alertas.push({
          tipo: 'URGENTE_SEM_INICIO',
          severidade:
            resumo.obra.urgencia === 'URGENTISSIMO' ? 'alta' : 'media',
          obraId: resumo.obra.id,
          codigo: resumo.obra.codigo,
          mensagem: `Obra ${URGENCIA_LABEL[resumo.obra.urgencia].toLowerCase()} sem execução iniciada.`,
        });
      }

      if (resumo.aditivosPendentesQtd > 0) {
        alertas.push({
          tipo: 'ADITIVO_PENDENTE',
          severidade: 'media',
          obraId: resumo.obra.id,
          codigo: resumo.obra.codigo,
          mensagem: `${resumo.aditivosPendentesQtd} aditivo(s) pendente(s) de aprovação (${moedaFormatter.format(resumo.aditivosPendentesValor)}).`,
        });
      }
    }

    const peso = { alta: 0, media: 1, baixa: 2 } as const;
    return alertas
      .sort(
        (a, b) =>
          peso[a.severidade] - peso[b.severidade] ||
          a.codigo.localeCompare(b.codigo),
      )
      .slice(0, 20);
  }
}
