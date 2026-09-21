import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { LookupService, type LookupCrud } from '../common/services/lookup.service.js';

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
    this.categorias = this.lookup.criarCrud(this.prisma.categoriaEpi, {
      labelSingular: 'Categoria',
      duplicateMessage: () => 'Categoria já cadastrada',
    });
    this.subcategorias = this.lookup.criarCrud(this.prisma.subcategoriaEpi, {
      labelSingular: 'Subcategoria',
      duplicateMessage: () => 'Subcategoria já cadastrada',
    });
    this.marcas = this.lookup.criarCrud(this.prisma.marca, {
      labelSingular: 'Marca',
      duplicateMessage: () => 'Marca já cadastrada',
    });
    this.fornecedores = this.lookup.criarCrud(this.prisma.fornecedor, {
      labelSingular: 'Fornecedor',
      duplicateMessage: () => 'Fornecedor já cadastrado',
    });
    this.localizacoes = this.lookup.criarCrud(this.prisma.localizacao, {
      labelSingular: 'Localização',
      duplicateMessage: () => 'Localização já cadastrada',
    });
    this.cores = this.lookup.criarCrud(this.prisma.cor, {
      labelSingular: 'Cor',
      duplicateMessage: () => 'Cor já cadastrada',
    });
    this.tamanhos = this.lookup.criarCrud(this.prisma.tamanhoEquipamento, {
      labelSingular: 'Tamanho',
      duplicateMessage: () => 'Tamanho já cadastrado',
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
      marcas,
      categorias,
      subcategorias,
      cores,
      tamanhos,
      localizacoes,
      fornecedores,
      colaboradores,
    ] = await Promise.all([
      this.prisma.marca.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.categoriaEpi.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.subcategoriaEpi.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.cor.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.tamanhoEquipamento.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.localizacao.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.fornecedor.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.user.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' },
      }),
    ]);

    return {
      marcas,
      categorias,
      subcategorias,
      cores,
      tamanhos,
      localizacoes,
      fornecedores,
      colaboradores,
    };
  }

  async listarCategorias() { return this.categorias.listar(); }

  async listarSubcategorias() {
    return this.prisma.subcategoriaEpi.findMany({
      where: { ativo: true },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });
  }

  async listarMarcas() { return this.marcas.listar(); }

  async listarFornecedores() { return this.fornecedores.listar(); }

  async listarLocalizacoes() { return this.localizacoes.listar(); }

  async listarCores() { return this.cores.listar(); }

  async listarTamanhos() { return this.tamanhos.listar(); }

  async listarColaboradores() {
    return this.prisma.user.findMany({
      where: { ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });
  }

  async listarUnidadesMedida() {
    return this.prisma.unidadeMedida.findMany({ orderBy: { nome: 'asc' } });
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

  async criar(data: any) {
    const nomeUpper = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
    if (data.nome) {
      const exists = await this.prisma.epi.findFirst({
        where: { nome: normalize(nomeUpper) },
      });
      if (exists) throw new AppError(409, 'EPI já cadastrado');
    }
    return this.prisma.epi.create({ data: { ...data, nome: nomeUpper } });
  }

  async atualizar(id: number, data: any) {
    await this.detalhar(id);
    if (data.nome) {
      const nomeUpper = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
      const exists = await this.prisma.epi.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'EPI já cadastrado');
    }
    const nomeValue = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
    return this.prisma.epi.update({ where: { id }, data: { ...data, nome: nomeValue } });
  }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.epi.update({ where: { id }, data: { ativo: false } });
  }

  async criarCategoria(data: { nome: string; descricao?: string }) { return this.categorias.criar(data); }
  async atualizarCategoria(id: number, data: { nome?: string; ativo?: boolean }) { return this.categorias.atualizar(id, data); }
  async desativarCategoria(id: number) { return this.categorias.desativar(id); }

  async criarSubcategoria(data: { nome: string; descricao?: string; categoriaId: number }) { return this.subcategorias.criar(data); }
  async atualizarSubcategoria(id: number, data: { nome?: string; ativo?: boolean }) { return this.subcategorias.atualizar(id, data); }
  async desativarSubcategoria(id: number) { return this.subcategorias.desativar(id); }

  async criarMarca(data: { nome: string }) { return this.marcas.criar(data); }
  async atualizarMarca(id: number, data: { nome?: string; ativo?: boolean }) { return this.marcas.atualizar(id, data); }
  async desativarMarca(id: number) { return this.marcas.desativar(id); }

  async criarCor(data: { nome: string }) { return this.cores.criar(data); }
  async atualizarCor(id: number, data: { nome?: string; ativo?: boolean }) { return this.cores.atualizar(id, data); }
  async desativarCor(id: number) { return this.cores.desativar(id); }

  async criarTamanho(data: { nome: string }) { return this.tamanhos.criar(data); }
  async atualizarTamanho(id: number, data: { nome?: string; ativo?: boolean }) { return this.tamanhos.atualizar(id, data); }
  async desativarTamanho(id: number) { return this.tamanhos.desativar(id); }

  async criarLocalizacao(data: { nome: string; descricao?: string }) { return this.localizacoes.criar(data); }
  async atualizarLocalizacao(id: number, data: { nome?: string; ativo?: boolean }) { return this.localizacoes.atualizar(id, data); }
  async desativarLocalizacao(id: number) { return this.localizacoes.desativar(id); }

  async criarFornecedor(data: { nome: string; cnpj?: string }) { return this.fornecedores.criar(data); }
  async atualizarFornecedor(id: number, data: { nome?: string; ativo?: boolean }) { return this.fornecedores.atualizar(id, data); }
  async desativarFornecedor(id: number) { return this.fornecedores.desativar(id); }
}
