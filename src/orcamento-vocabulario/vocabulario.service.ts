import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AtualizarTermoDto,
  ComboDto,
  CriarSubServicoDto,
  CriarTermoDto,
} from './dto/vocabulario.dto.js';

export type Dimensao = 'verbos' | 'objetos' | 'locais' | 'caracteristicas';

export type FiltrosCascata = {
  verboId?: number | null;
  objetoId?: number | null;
  localId?: number | null;
  caracteristicaId?: number | null;
};

type TermoDelegate = Prisma.VerboDelegate;

@Injectable()
export class VocabularioService {
  constructor(private readonly prisma: PrismaService) {}

  private delegate(dim: Dimensao): TermoDelegate {
    switch (dim) {
      case 'verbos':
        return this.prisma.verbo;
      case 'objetos':
        return this.prisma.objeto as unknown as TermoDelegate;
      case 'locais':
        return this.prisma.localObra as unknown as TermoDelegate;
      case 'caracteristicas':
        return this.prisma.caracteristica as unknown as TermoDelegate;
    }
  }

  async listarEtapas(ativo?: boolean) {
    return this.prisma.etapa.findMany({
      orderBy: { ordem: 'asc' },
      ...(ativo !== undefined && { where: { ativo } }),
      select: { id: true, nome: true, ordem: true, ativo: true },
    });
  }

  async listarTermos(
    dim: Dimensao,
    filtros: { q?: string; ativo?: boolean } = {},
  ) {
    return this.delegate(dim).findMany({
      orderBy: { nome: 'asc' },
      where: {
        ...(filtros.q ? { nome: { contains: filtros.q } } : {}),
        ...(filtros.ativo !== undefined ? { ativo: filtros.ativo } : {}),
      },
      select: { id: true, nome: true, ativo: true },
    });
  }

  async criarTermo(dim: Dimensao, dto: CriarTermoDto) {
    const t = this.delegate(dim);
    const existente = await t.findFirst({ where: { nome: dto.nome } });
    if (existente) throw new AppError(409, 'Nome já cadastrado');
    return t.create({ data: { nome: dto.nome } });
  }

  async atualizarTermo(dim: Dimensao, id: number, dto: AtualizarTermoDto) {
    const t = this.delegate(dim);
    if (!Number.isInteger(id)) {
      throw new AppError(404, 'Registro não encontrado');
    }
    const existente = await t.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, 'Registro não encontrado');
    if (dto.nome !== undefined && dto.nome !== existente.nome) {
      const duplicado = await t.findFirst({ where: { nome: dto.nome } });
      if (duplicado) throw new AppError(409, 'Nome já cadastrado');
    }
    return t.update({ where: { id }, data: { ...dto } });
  }

  async listarSubServicos(etapaId: number, ativo?: boolean) {
    return this.prisma.subServico.findMany({
      where: { etapaId, ...(ativo !== undefined && { ativo }) },
      orderBy: { nome: 'asc' },
      select: { id: true, etapaId: true, nome: true, ativo: true },
    });
  }

  async criarSubServico(dto: CriarSubServicoDto) {
    const etapa = await this.prisma.etapa.findUnique({
      where: { id: dto.etapaId },
    });
    if (!etapa) throw new AppError(404, 'Etapa não encontrada');
    const existente = await this.prisma.subServico.findFirst({
      where: { etapaId: dto.etapaId, nome: dto.nome },
    });
    if (existente) throw new AppError(409, 'Sub-serviço já existe nesta etapa');
    return this.prisma.subServico.create({
      data: { etapaId: dto.etapaId, nome: dto.nome },
    });
  }

  async criarLote(subServicoId: number, combos: ComboDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const subServico = await tx.subServico.findUnique({
        where: { id: subServicoId },
      });
      if (!subServico) throw new AppError(404, 'Sub-serviço não encontrado');

      const existentes = await tx.subServicoAtividade.findMany({
        where: { subServicoId },
      });
      const chave = (c: ComboDto) =>
        [
          c.verboId,
          c.objetoId,
          c.localId ?? null,
          c.caracteristicaId ?? null,
        ].join('|');
      const set = new Set(existentes.map((l) => chave(l as ComboDto)));
      const novos = combos.filter((c) => {
        const k = chave(c);
        if (set.has(k)) return false;
        set.add(k);
        return true;
      });
      if (novos.length > 0) {
        await tx.subServicoAtividade.createMany({
          data: novos.map((c) => ({
            subServicoId,
            verboId: c.verboId,
            objetoId: c.objetoId,
            localId: c.localId ?? null,
            caracteristicaId: c.caracteristicaId ?? null,
          })),
        });
      }
      return { criados: novos.length, ignorados: combos.length - novos.length };
    });
  }

  async removerCombo(id: number) {
    if (!Number.isInteger(id)) {
      throw new AppError(404, 'Combinação não encontrada');
    }
    const existente = await this.prisma.subServicoAtividade.findUnique({
      where: { id },
    });
    if (!existente) throw new AppError(404, 'Combinação não encontrada');
    return this.prisma.subServicoAtividade.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async cascata(subServicoId: number, filtros: FiltrosCascata) {
    const linhas = await this.prisma.subServicoAtividade.findMany({
      where: { subServicoId, ativo: true },
      include: {
        verbo: { select: { id: true, nome: true } },
        objeto: { select: { id: true, nome: true } },
        local: { select: { id: true, nome: true } },
        caracteristica: { select: { id: true, nome: true } },
      },
    });

    const dimensoes = [
      'verboId',
      'objetoId',
      'localId',
      'caracteristicaId',
    ] as const;

    const satisfaz = (linha: (typeof linhas)[number], exceto: string) =>
      dimensoes
        .filter((d) => d !== exceto)
        .every((d) =>
          filtros[d] === undefined || filtros[d] === null
            ? true
            : linha[d] === filtros[d],
        );

    const dim = <T extends { id: number; nome: string }>(
      d: (typeof dimensoes)[number],
      extrair: (linha: (typeof linhas)[number]) => T | null,
    ): (T | null)[] => {
      const mapa = new Map<number | null, T | null>();
      for (const linha of linhas) {
        if (!satisfaz(linha, d)) continue;
        const valor = extrair(linha);
        const chave = valor ? valor.id : null;
        if (!mapa.has(chave)) mapa.set(chave, valor);
      }
      return [...mapa.values()];
    };

    return {
      verbo: dim('verboId', (l) => l.verbo),
      objeto: dim('objetoId', (l) => l.objeto),
      local: dim('localId', (l) => l.local),
      caracteristica: dim('caracteristicaId', (l) => l.caracteristica),
    };
  }
}
