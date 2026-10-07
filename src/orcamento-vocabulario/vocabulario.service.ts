import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AtualizarEtapaDto,
  AtualizarSubServicoDto,
  AtualizarTermoDto,
  ComboDto,
  CriarEtapaDto,
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
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      ...(ativo !== undefined && { where: { ativo } }),
      select: { id: true, nome: true, ordem: true, ativo: true },
    });
  }

  async criarEtapa(dto: CriarEtapaDto) {
    const existente = await this.prisma.etapa.findFirst({
      where: { nome: dto.nome },
    });
    if (existente) throw new AppError(409, 'Etapa já cadastrada');
    return this.prisma.etapa.create({
      data: {
        nome: dto.nome,
        ordem: dto.ordem,
        ...(dto.ativo !== undefined && { ativo: dto.ativo }),
      },
      select: { id: true, nome: true, ordem: true, ativo: true },
    });
  }

  async atualizarEtapa(id: number, dto: AtualizarEtapaDto) {
    if (!Number.isInteger(id)) {
      throw new AppError(404, 'Etapa não encontrada');
    }
    const existente = await this.prisma.etapa.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, 'Etapa não encontrada');
    if (dto.nome !== undefined && dto.nome !== existente.nome) {
      const duplicado = await this.prisma.etapa.findFirst({
        where: { nome: dto.nome },
      });
      if (duplicado) throw new AppError(409, 'Etapa já cadastrada');
    }
    return this.prisma.etapa.update({
      where: { id },
      data: { ...dto },
      select: { id: true, nome: true, ordem: true, ativo: true },
    });
  }

  async removerEtapa(id: number) {
    if (!Number.isInteger(id)) {
      throw new AppError(404, 'Etapa não encontrada');
    }
    const existente = await this.prisma.etapa.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, 'Etapa não encontrada');
    return this.prisma.etapa.update({
      where: { id },
      data: { ativo: false },
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

  async listarSubServicos(etapaId?: number, ativo?: boolean) {
    return this.prisma.subServico.findMany({
      where: {
        ...(etapaId !== undefined && { etapaId }),
        ...(ativo !== undefined && { ativo }),
      },
      orderBy: [{ etapa: { ordem: 'asc' } }, { nome: 'asc' }],
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

  async atualizarSubServico(id: number, dto: AtualizarSubServicoDto) {
    if (!Number.isInteger(id)) {
      throw new AppError(404, 'Sub-serviço não encontrado');
    }
    const existente = await this.prisma.subServico.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, 'Sub-serviço não encontrado');

    if (dto.etapaId !== undefined && dto.etapaId !== existente.etapaId) {
      const etapa = await this.prisma.etapa.findUnique({
        where: { id: dto.etapaId },
      });
      if (!etapa) throw new AppError(404, 'Etapa não encontrada');
    }

    if (dto.nome !== undefined && dto.nome !== existente.nome) {
      const etapaIdAlvo = dto.etapaId ?? existente.etapaId;
      const duplicado = await this.prisma.subServico.findFirst({
        where: { etapaId: etapaIdAlvo, nome: dto.nome },
      });
      if (duplicado) throw new AppError(409, 'Sub-serviço já existe nesta etapa');
    }

    return this.prisma.subServico.update({
      where: { id },
      data: { ...dto },
    });
  }

  async removerSubServico(id: number) {
    if (!Number.isInteger(id)) {
      throw new AppError(404, 'Sub-serviço não encontrado');
    }
    const existente = await this.prisma.subServico.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, 'Sub-serviço não encontrado');
    return this.prisma.subServico.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async listarCombos(filtros: { subServicoId?: number; ativo?: boolean } = {}) {
    return this.prisma.subServicoAtividade.findMany({
      where: {
        ...(filtros.subServicoId !== undefined && {
          subServicoId: filtros.subServicoId,
        }),
        ...(filtros.ativo !== undefined && { ativo: filtros.ativo }),
      },
      include: {
        subServico: {
          select: { id: true, etapaId: true, nome: true, ativo: true },
        },
        verbo: { select: { id: true, nome: true } },
        objeto: { select: { id: true, nome: true } },
        local: { select: { id: true, nome: true } },
        caracteristica: { select: { id: true, nome: true } },
      },
      orderBy: [{ subServicoId: 'asc' }, { id: 'asc' }],
    });
  }

  async listarCombosDoSubServico(subServicoId: number, ativo?: boolean) {
    if (!Number.isInteger(subServicoId)) {
      throw new AppError(404, 'Sub-serviço não encontrado');
    }
    const sub = await this.prisma.subServico.findUnique({
      where: { id: subServicoId },
    });
    if (!sub) throw new AppError(404, 'Sub-serviço não encontrado');
    return this.listarCombos({ subServicoId, ativo });
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
      const mapa = new Map(existentes.map((l) => [chave(l as ComboDto), l]));

      const novos: ComboDto[] = [];
      const paraReativar: number[] = [];
      const vistos = new Set<string>();

      for (const c of combos) {
        const k = chave(c);
        if (vistos.has(k)) continue;
        vistos.add(k);
        const existente = mapa.get(k);
        if (!existente) {
          novos.push(c);
        } else if (!existente.ativo) {
          paraReativar.push(existente.id);
        }
      }

      if (paraReativar.length > 0) {
        await tx.subServicoAtividade.updateMany({
          where: { id: { in: paraReativar } },
          data: { ativo: true },
        });
      }
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

      const ignorados = combos.length - novos.length - paraReativar.length;
      return {
        criados: novos.length,
        reativados: paraReativar.length,
        ignorados: Math.max(ignorados, 0),
      };
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

  async reativarCombo(id: number) {
    if (!Number.isInteger(id)) {
      throw new AppError(404, 'Combinação não encontrada');
    }
    const existente = await this.prisma.subServicoAtividade.findUnique({
      where: { id },
    });
    if (!existente) throw new AppError(404, 'Combinação não encontrada');
    return this.prisma.subServicoAtividade.update({
      where: { id },
      data: { ativo: true },
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
