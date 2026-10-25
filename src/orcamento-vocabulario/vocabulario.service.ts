import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AtualizarEtapaDto,
  AtualizarSubServicoDto,
  AtualizarTermoDto,
  CriarEtapaDto,
  CriarSubServicoDto,
  CriarTermoDto,
} from './dto/vocabulario.dto.js';

export type Dimensao = 'verbos' | 'objetos' | 'locais' | 'caracteristicas';

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
        where: { nome: dto.nome, id: { not: id } },
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
      const duplicado = await t.findFirst({
        where: { nome: dto.nome, id: { not: id } },
      });
      if (duplicado) throw new AppError(409, 'Nome já cadastrado');
    }
    return t.update({ where: { id }, data: { ...dto } });
  }

  async removerTermo(dim: Dimensao, id: number) {
    const t = this.delegate(dim);
    if (!Number.isInteger(id)) {
      throw new AppError(404, 'Registro não encontrado');
    }
    const existente = await t.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, 'Registro não encontrado');

    // FKs para verbos/objetos são RESTRICT; para locais/características são
    // SET NULL — em ambos os casos apagar o termo com referências ativas
    // corromperia catálogo ou histórico.
    const fk: Record<
      Dimensao,
      'verboId' | 'objetoId' | 'localId' | 'caracteristicaId'
    > = {
      verbos: 'verboId',
      objetos: 'objetoId',
      locais: 'localId',
      caracteristicas: 'caracteristicaId',
    };
    const campo = fk[dim];
    const [orcamentos, obras] = await Promise.all([
      this.prisma.orcamentoAtividade.count({ where: { [campo]: id } }),
      this.prisma.obraAtividade.count({ where: { [campo]: id } }),
    ]);
    if (orcamentos > 0 || obras > 0) {
      const partes = [
        orcamentos > 0
          ? `${orcamentos} orçamento${orcamentos > 1 ? 's' : ''}`
          : null,
        obras > 0 ? `${obras} obra${obras > 1 ? 's' : ''}` : null,
      ].filter(Boolean);
      const emUso = partes.join(', ');
      throw new AppError(
        409,
        `Termo em uso em ${emUso} — remova as referências antes de excluir`,
      );
    }

    try {
      return await t.delete({ where: { id } });
    } catch (error) {
      // Rede de segurança: corrida entre o count acima e o delete.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new AppError(
          409,
          'Termo em uso por orçamentos ou obras — remova as referências antes de excluir',
        );
      }
      throw error;
    }
  }

  async listarSubServicos(
    etapaId?: number,
    ativo?: boolean,
    servicoMarketingId?: number | null,
  ) {
    return this.prisma.subServico.findMany({
      where: {
        ...(etapaId !== undefined && { etapaId }),
        ...(ativo !== undefined && { ativo }),
        ...(servicoMarketingId !== undefined &&
          (servicoMarketingId === null
            ? { servicoMarketingId: null }
            : {
                OR: [
                  { servicoMarketingId },
                  { servicoMarketingId: null }, // sub-serviços gerais também ficam disponíveis
                ],
              })),
      },
      orderBy: [{ etapa: { ordem: 'asc' } }, { nome: 'asc' }],
      select: {
        id: true,
        etapaId: true,
        servicoMarketingId: true,
        nome: true,
        ativo: true,
      },
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
    const existente = await this.prisma.subServico.findUnique({
      where: { id },
    });
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
        where: { etapaId: etapaIdAlvo, nome: dto.nome, id: { not: id } },
      });
      if (duplicado)
        throw new AppError(409, 'Sub-serviço já existe nesta etapa');
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
    const existente = await this.prisma.subServico.findUnique({
      where: { id },
    });
    if (!existente) throw new AppError(404, 'Sub-serviço não encontrado');

    // FKs de orçamento/obras são RESTRICT: sem essa checagem o delete real
    // estouraria como erro 400 genérico. Conta as referências (ativas e
    // inativas — o RESTRICT vale para todas) para dar um 409 explicativo.
    const [orcamentos, obras] = await Promise.all([
      this.prisma.orcamentoAtividade.count({ where: { subServicoId: id } }),
      this.prisma.obraAtividade.count({ where: { subServicoId: id } }),
    ]);
    if (orcamentos > 0 || obras > 0) {
      const emOrcamentos =
        orcamentos > 0
          ? `${orcamentos} orçamento${orcamentos > 1 ? 's' : ''}`
          : null;
      const emObras = obras > 0 ? `${obras} obra${obras > 1 ? 's' : ''}` : null;
      const emUso = [emOrcamentos, emObras].filter(Boolean).join(' e ');
      throw new AppError(
        409,
        `Sub-serviço em uso em ${emUso} — desative-o em vez de excluir`,
      );
    }

    try {
      return await this.prisma.subServico.delete({ where: { id } });
    } catch (error) {
      // Rede de segurança: corrida entre o count acima e o delete.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new AppError(
          409,
          'Sub-serviço em uso por orçamentos ou obras — desative-o em vez de excluir',
        );
      }
      throw error;
    }
  }
}
