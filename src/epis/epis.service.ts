import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  type LookupCrud,
  LookupService,
} from '../common/services/lookup.service.js';
import {
  calcularProximoCodigo,
  criarComCodigoSequencial,
} from '../lib/codigo-sequencial.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type EpiCriarInput = Partial<Prisma.EpiUncheckedCreateInput> & {
  nome: string;
};

export type EpiAtualizarInput = Partial<
  Omit<Prisma.EpiUncheckedCreateInput, 'id' | 'createdAt' | 'updatedAt'>
>;

@Injectable()
export class EpisService {
  private readonly categorias: LookupCrud;
  private readonly subcategorias: LookupCrud;
  private readonly marcas: LookupCrud;
  private readonly fornecedores: LookupCrud;
  private readonly localizacoes: LookupCrud;
  private readonly cores: LookupCrud;
  private readonly tamanhos: LookupCrud;

  constructor(
    private readonly prisma: PrismaService,
    private readonly lookup: LookupService,
  ) {
    this.categorias = this.lookup.criarCrud(this.prisma.categoria, {
      labelSingular: 'Categoria',
      duplicateMessage: () => 'Categoria já cadastrada',
      tipoInsumo: 'EPI',
    });
    this.subcategorias = this.lookup.criarCrud(this.prisma.subcategoria, {
      labelSingular: 'Subcategoria',
      duplicateMessage: () => 'Subcategoria já cadastrada',
      tipoInsumo: 'EPI',
    });
    this.marcas = this.lookup.criarCrud(this.prisma.marca, {
      labelSingular: 'Marca',
      duplicateMessage: () => 'Marca já cadastrada',
      tipoInsumo: 'EPI',
    });
    this.fornecedores = this.lookup.criarCrud(this.prisma.fornecedor, {
      labelSingular: 'Fornecedor',
      duplicateMessage: () => 'Fornecedor já cadastrado',
      tipoInsumo: 'EPI',
    });
    this.localizacoes = this.lookup.criarCrud(this.prisma.localizacao, {
      labelSingular: 'Localização',
      duplicateMessage: () => 'Localização já cadastrada',
      tipoInsumo: 'EPI',
    });
    this.cores = this.lookup.criarCrud(this.prisma.cor, {
      labelSingular: 'Cor',
      duplicateMessage: () => 'Cor já cadastrada',
      tipoInsumo: 'EPI',
    });
    this.tamanhos = this.lookup.criarCrud(this.prisma.tamanhoEquipamento, {
      labelSingular: 'Tamanho',
      duplicateMessage: () => 'Tamanho já cadastrado',
      tipoInsumo: 'EPI',
    });
  }

  async listar(params?: { q?: string; categoriaId?: number }) {
    const where: Record<string, unknown> = { ativo: true };
    if (params?.q) {
      where.OR = [
        { nome: { contains: params.q } },
        { codigo: { contains: params.q } },
      ];
    }
    if (params?.categoriaId) where.categoriaId = params.categoriaId;

    return this.prisma.epi.findMany({
      where,
      include: {
        marca: true,
        categoria: true,
        subcategoria: true,
        cor: true,
        tamanho: true,
        localizacao: true,
        fornecedor: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async lookups() {
    const [
      marcasRaw,
      categorias,
      subcategorias,
      cores,
      tamanhos,
      localizacoesRaw,
      fornecedores,
      colaboradores,
      unidadesMedida,
    ] = await Promise.all([
      this.prisma.marca.findMany({
        where: {
          ativo: true,
          tipoInsumo: { in: ['EPI', 'EQUIPAMENTO', 'MATERIAL'] },
        },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.categoria.findMany({
        where: { ativo: true, tipoInsumo: 'EPI' },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.subcategoria.findMany({
        where: { ativo: true, tipoInsumo: 'EPI' },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.cor.findMany({
        where: { ativo: true, tipoInsumo: 'EPI' },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.tamanhoEquipamento.findMany({
        where: { ativo: true, tipoInsumo: 'EPI' },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.localizacao.findMany({
        where: {
          ativo: true,
          tipoInsumo: { in: ['EPI', 'EQUIPAMENTO'] },
        },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.fornecedor.findMany({
        where: { ativo: true },
        distinct: ['nome'],
        orderBy: { nome: 'asc' },
      }),
      this.prisma.user.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.unidadeMedida.findMany({
        where: { ativo: true },
        distinct: ['nome'],
        orderBy: { nome: 'asc' },
      }),
    ]);

    const marcasMap = new Map<string, (typeof marcasRaw)[0]>();
    for (const m of marcasRaw) {
      const key = m.nome.trim().toUpperCase();
      if (!marcasMap.has(key) || m.tipoInsumo === 'EPI') {
        marcasMap.set(key, m);
      }
    }
    const marcas = Array.from(marcasMap.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome),
    );

    const localizacoesMap = new Map<string, (typeof localizacoesRaw)[0]>();
    for (const l of localizacoesRaw) {
      const key = l.nome.trim().toUpperCase();
      if (!localizacoesMap.has(key) || l.tipoInsumo === 'EPI') {
        localizacoesMap.set(key, l);
      }
    }
    const localizacoes = Array.from(localizacoesMap.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome),
    );

    return {
      marcas,
      categorias,
      subcategorias,
      cores,
      tamanhos,
      localizacoes,
      fornecedores,
      colaboradores,
      unidadesMedida,
    };
  }

  async listarCategorias() {
    return this.categorias.listar();
  }

  async listarSubcategorias() {
    return this.prisma.subcategoria.findMany({
      where: { ativo: true, tipoInsumo: 'EPI' },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });
  }

  async listarMarcas() {
    const raw = await this.prisma.marca.findMany({
      where: {
        ativo: true,
        tipoInsumo: { in: ['EPI', 'EQUIPAMENTO', 'MATERIAL'] },
      },
      orderBy: { nome: 'asc' },
    });
    const map = new Map<string, (typeof raw)[0]>();
    for (const m of raw) {
      const key = m.nome.trim().toUpperCase();
      if (!map.has(key) || m.tipoInsumo === 'EPI') {
        map.set(key, m);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome),
    );
  }

  async listarFornecedores() {
    return this.prisma.fornecedor.findMany({
      where: { ativo: true },
      distinct: ['nome'],
      orderBy: { nome: 'asc' },
    });
  }

  async listarLocalizacoes() {
    const raw = await this.prisma.localizacao.findMany({
      where: {
        ativo: true,
        tipoInsumo: { in: ['EPI', 'EQUIPAMENTO'] },
      },
      orderBy: { nome: 'asc' },
    });
    const map = new Map<string, (typeof raw)[0]>();
    for (const l of raw) {
      const key = l.nome.trim().toUpperCase();
      if (!map.has(key) || l.tipoInsumo === 'EPI') {
        map.set(key, l);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome),
    );
  }

  async listarCores() {
    return this.cores.listar();
  }

  async listarTamanhos() {
    return this.tamanhos.listar();
  }

  async listarColaboradores() {
    return this.prisma.user.findMany({
      where: {
        ativo: true,
        papeis: {
          some: {
            papel: {
              nome: {
                in: [
                  'COLABORADOR',
                  'Colaborador',
                  'Colaboradores',
                  'COLABORADORES',
                ],
              },
            },
          },
        },
      },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });
  }

  async listarUnidadesMedida() {
    return this.prisma.unidadeMedida.findMany({
      where: { ativo: true },
      distinct: ['nome'],
      orderBy: { nome: 'asc' },
    });
  }

  async detalhar(id: number) {
    const epi = await this.prisma.epi.findUnique({
      where: { id },
      include: {
        marca: true,
        categoria: true,
        subcategoria: true,
        cor: true,
        tamanho: true,
        localizacao: true,
        fornecedor: true,
        entregas: {
          take: 10,
          orderBy: { data: 'desc' },
          include: { colaborador: { select: { id: true, nome: true } } },
        },
      },
    });
    if (!epi) throw new NotFoundException(`EPI ${id} não encontrado`);
    return epi;
  }

  async proximoCodigo(): Promise<{ codigo: string }> {
    const existentes = await this.prisma.epi.findMany({
      where: { codigo: { startsWith: 'EPI-' } },
      select: { codigo: true },
    });

    return { codigo: calcularProximoCodigo(existentes, 'EPI-', 3) };
  }

  async criar(data: EpiCriarInput) {
    const payload = { ...data };
    delete payload.codigo;

    const nomeUpper =
      typeof payload.nome === 'string'
        ? payload.nome.toUpperCase()
        : payload.nome;
    if (payload.nome) {
      const exists = await this.prisma.epi.findFirst({
        where: { nome: normalize(nomeUpper) },
      });
      if (exists) throw new AppError(409, 'EPI já cadastrado');
    }

    return criarComCodigoSequencial(
      async () => (await this.proximoCodigo()).codigo,
      (codigo) =>
        this.prisma.epi.create({
          data: { ...payload, codigo, nome: nomeUpper },
        }),
      'Não foi possível gerar o código do EPI',
    );
  }

  async atualizar(id: number, data: EpiAtualizarInput) {
    await this.detalhar(id);

    const payload = { ...data };
    delete payload.codigo;

    if (payload.nome) {
      const nomeUpper =
        typeof payload.nome === 'string'
          ? payload.nome.toUpperCase()
          : payload.nome;
      const exists = await this.prisma.epi.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'EPI já cadastrado');
    }

    const nomeValue =
      typeof payload.nome === 'string'
        ? payload.nome.toUpperCase()
        : payload.nome;
    return this.prisma.epi.update({
      where: { id },
      data: { ...payload, nome: nomeValue },
    });
  }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.epi.update({ where: { id }, data: { ativo: false } });
  }

  async criarCategoria(data: { nome: string; descricao?: string }) {
    return this.categorias.criar(data);
  }
  async atualizarCategoria(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    return this.categorias.atualizar(id, data);
  }
  async desativarCategoria(id: number) {
    return this.categorias.desativar(id);
  }

  async criarSubcategoria(data: {
    nome: string;
    descricao?: string;
    categoriaId: number;
  }) {
    return this.subcategorias.criar(data);
  }
  async atualizarSubcategoria(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    return this.subcategorias.atualizar(id, data);
  }
  async desativarSubcategoria(id: number) {
    return this.subcategorias.desativar(id);
  }

  async criarMarca(data: { nome: string }) {
    return this.marcas.criar(data);
  }
  async atualizarMarca(id: number, data: { nome?: string; ativo?: boolean }) {
    return this.marcas.atualizar(id, data);
  }
  async desativarMarca(id: number) {
    return this.marcas.desativar(id);
  }

  async criarCor(data: { nome: string }) {
    return this.cores.criar(data);
  }
  async atualizarCor(id: number, data: { nome?: string; ativo?: boolean }) {
    return this.cores.atualizar(id, data);
  }
  async desativarCor(id: number) {
    return this.cores.desativar(id);
  }

  async criarTamanho(data: { nome: string }) {
    return this.tamanhos.criar(data);
  }
  async atualizarTamanho(id: number, data: { nome?: string; ativo?: boolean }) {
    return this.tamanhos.atualizar(id, data);
  }
  async desativarTamanho(id: number) {
    return this.tamanhos.desativar(id);
  }

  async criarLocalizacao(data: { nome: string; descricao?: string }) {
    return this.localizacoes.criar(data);
  }
  async atualizarLocalizacao(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    return this.localizacoes.atualizar(id, data);
  }
  async desativarLocalizacao(id: number) {
    return this.localizacoes.desativar(id);
  }

  async criarFornecedor(data: { nome: string; cnpj?: string }) {
    return this.fornecedores.criar(data);
  }
  async atualizarFornecedor(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    return this.fornecedores.atualizar(id, data);
  }
  async desativarFornecedor(id: number) {
    return this.fornecedores.desativar(id);
  }
}
