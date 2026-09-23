import { Injectable, Logger } from '@nestjs/common';
import { config } from '../config.js';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type FonteRota = 'cep' | 'cidade' | 'indisponivel';

export interface RotaResultado {
  disponivel: boolean;
  distanciaM: number | null;
  duracaoSeg: number | null;
  fonte: FonteRota;
  aviso: string | null;
}

interface Coords {
  lat: number;
  lng: number;
}

interface CacheEntry {
  exp: number;
  value: RotaResultado;
}

const GEOCODE_HEADERS = {
  'User-Agent': 'imper-api/1.0 (+route)',
  Accept: 'application/json',
};

@Injectable()
export class RotaAgendamentoService {
  private readonly logger = new Logger(RotaAgendamentoService.name);
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly prisma: PrismaService) {}

  async calcularRota(agendamentoId: number): Promise<RotaResultado> {
    const item = await this.prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: {
        endereco: true,
        user: {
          select: {
            id: true,
            enderecos: { where: { principal: true }, take: 1 },
          },
        },
      },
    });

    if (!item) {
      throw new AppError(404, 'Agendamento não encontrado');
    }

    const endereco =
      item.endereco ??
      (item.user?.enderecos?.[0] as typeof item.endereco | undefined) ??
      null;

    const fonteAttempt: FonteRota = endereco?.cep?.replace(/\D/g, '')
      ? 'cep'
      : endereco?.cidade
        ? 'cidade'
        : 'indisponivel';

    if (fonteAttempt === 'indisponivel' || !endereco) {
      return {
        disponivel: false,
        distanciaM: null,
        duracaoSeg: null,
        fonte: 'indisponivel',
        aviso: 'Endereço sem CEP ou cidade',
      };
    }

    const dest = await this.resolveDestino(endereco);
    if (!dest) {
      return {
        disponivel: false,
        distanciaM: null,
        duracaoSeg: null,
        fonte: fonteAttempt,
        aviso: 'Não foi possível localizar o endereço',
      };
    }

    const cacheKey = this.cacheKey(dest);
    const hit = this.cache.get(cacheKey);
    if (hit && hit.exp > Date.now()) {
      return { ...hit.value, fonte: dest.fonte };
    }
    if (hit) this.cache.delete(cacheKey);

    const rota = await this.fetchRota(dest);
    if (!rota) {
      return {
        disponivel: false,
        distanciaM: null,
        duracaoSeg: null,
        fonte: dest.fonte,
        aviso: 'Falha ao calcular rota',
      };
    }

    const resultado: RotaResultado = {
      disponivel: true,
      distanciaM: rota.distanciaM,
      duracaoSeg: rota.duracaoSeg,
      fonte: dest.fonte,
      aviso: null,
    };
    this.cache.set(cacheKey, {
      exp: Date.now() + config.rotaCacheTtlMs,
      value: resultado,
    });
    return resultado;
  }

  private cacheKey(dest: Coords): string {
    const lat = dest.lat.toFixed(5);
    const lng = dest.lng.toFixed(5);
    return `${config.sedeLat},${config.sedeLng}|${lat},${lng}`;
  }

  private async resolveDestino(endereco: {
    logradouro?: string | null;
    cep?: string | null;
    cidade?: string | null;
    estado?: string | null;
  }): Promise<(Coords & { fonte: FonteRota }) | null> {
    const cep = endereco.cep?.replace(/\D/g, '') ?? '';
    const cepOk = cep.length === 8;
    const cidade = endereco.cidade?.trim() || null;
    const estado = endereco.estado?.trim() || null;
    const logradouro = endereco.logradouro?.trim() || null;

    const attempts: Array<{ params: URLSearchParams; fonte: FonteRota }> = [];
    const base = () =>
      new URLSearchParams({ country: 'BR', format: 'json', limit: '1' });

    if (logradouro && cidade) {
      const p = base();
      p.set('street', logradouro);
      p.set('city', cidade);
      if (estado) p.set('state', estado);
      if (cepOk) p.set('postalcode', cep);
      attempts.push({ params: p, fonte: cepOk ? 'cep' : 'cidade' });
    }

    if (cepOk) {
      const p = base();
      p.set('postalcode', cep);
      attempts.push({ params: p, fonte: 'cep' });
    }

    if (cidade) {
      const p = base();
      p.set('city', cidade);
      if (estado) p.set('state', estado);
      attempts.push({ params: p, fonte: 'cidade' });
    }

    if (attempts.length === 0) return null;

    for (const attempt of attempts) {
      const coords = await this.geocode(attempt.params);
      if (coords) return { ...coords, fonte: attempt.fonte };
    }
    return null;
  }

  private async geocode(params: URLSearchParams): Promise<Coords | null> {
    try {
      const res = await fetch(`${config.geocodeUrl}/search?${params}`, {
        headers: GEOCODE_HEADERS,
        signal: AbortSignal.timeout(config.rotaFetchTimeoutMs),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (!Array.isArray(data) || data.length === 0) return null;
      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { lat, lng };
    } catch (err) {
      this.logger.warn(`geocode falhou: ${err}`);
      return null;
    }
  }

  private async fetchRota(
    dest: Coords,
  ): Promise<{ distanciaM: number; duracaoSeg: number } | null> {
    const url =
      `${config.osrmUrl}/route/v1/driving/` +
      `${config.sedeLng},${config.sedeLat};${dest.lng},${dest.lat}` +
      `?overview=false&alternatives=false`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(config.rotaFetchTimeoutMs),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        routes?: Array<{ distance: number; duration: number }>;
      };
      const route = data.routes?.[0];
      if (
        !route ||
        !Number.isFinite(route.distance) ||
        !Number.isFinite(route.duration)
      ) {
        return null;
      }
      return { distanciaM: route.distance, duracaoSeg: route.duration };
    } catch (err) {
      this.logger.warn(`osrm falhou: ${err}`);
      return null;
    }
  }
}
