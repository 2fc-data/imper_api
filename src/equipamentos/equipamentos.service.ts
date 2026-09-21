import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { LookupService, type LookupCrud } from '../common/services/lookup.service.js';

@Injectable()
export class EquipamentosService {
  private readonly categorias: LookupCrud;
  private readonly subcategorias: LookupCrud;
  private readonly marcas: LookupCrud;
  private readonly fornecedores: LookupCrud;
  private readonly localizacoes: LookupCrud;
  private readonly statuses: LookupCrud;
  private readonly estadosConservacao: LookupCrud;
  private readonly tiposManutencao: LookupCrud;
  private readonly unidadesMedida: LookupCrud;

  constructor(
    private readonly prisma: PrismaService,
    private readonly lookup: LookupService,
  ) {
    this.categorias = this.lookup.criarCrud(this.prisma.categoriaEquipamento, {
      labelSingular: 'Categoria',
      duplicateMessage: () => 'Categoria já cadastrada',
    });
    this.subcategorias = this.lookup.criarCrud(this.prisma.subcategoriaEquipamento, {
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
    this.statuses = this.lookup.criarCrud(this.prisma.statusEquipamento, {
      labelSingular: 'Status',
      duplicateMessage: () => 'Status já cadastrado',
    });
    this.estadosConservacao = this.lookup.criarCrud(this.prisma.estadoConservacao, {
      labelSingular: 'Estado de conservação',
      duplicateMessage: () => 'Estado de conservação já cadastrado',
    });
    this.tiposManutencao = this.lookup.criarCrud(this.prisma.tipoManutencao, {
      labelSingular: 'Tipo de manutenção',
      duplicateMessage: () => 'Tipo de manutenção já cadastrado',
    });
    this.unidadesMedida = this.lookup.criarCrud(this.prisma.unidadeMedida, {
      labelSingular: 'Unidade de medida',
      orderBy: 'ordem',
      duplicateMessage: () => 'Unidade de medida já cadastrada',
    });
  }

  async listar(params?: {
    q?: string;
    statusId?: number;
    categoriaId?: number;
  }) {
    const where: Record<string, unknown> = { ativo: true };
    if (params?.q) {
      where.OR = [
        { descricao: { contains: params.q } },
        { codigo: { contains: params.q } },
      ];
    }
    if (params?.statusId) where.statusId = params.statusId;
    if (params?.categoriaId) where.categoriaId = params.categoriaId;

    return this.prisma.equipamento.findMany({
      where,
      include: {
        marca: true,
        categoria: true,
        subcategoria: true,
        localizacao: true,
        fornecedor: true,
        status: true,
        estadoConservacao: true,
        responsavel: { select: { id: true, nome: true } },
      },
      orderBy: { descricao: 'asc' },
    });
  }

  async lookups() {
    const [
      marcas,
      categorias,
      subcategorias,
      localizacoes,
      fornecedores,
      statusList,
      estadosConservacao,
      tiposManutencao,
      responsaveis,
      unidadesMedida,
    ] = await Promise.all([
      this.prisma.marca.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.categoriaEquipamento.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.subcategoriaEquipamento.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.localizacao.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.fornecedor.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.statusEquipamento.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.estadoConservacao.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.tipoManutencao.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      this.prisma.user.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.unidadeMedida.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
    ]);

    return {
      marcas,
      categorias,
      subcategorias,
      localizacoes,
      fornecedores,
      statuses: statusList,
      estadosConservacao,
      tiposManutencao,
      responsaveis,
      unidadesMedida,
    };
  }

  // --- CRUD para Lookups Específicos ---

  async listarCategorias() { return this.categorias.listar(); }
  async criarCategoria(data: any) { return this.categorias.criar(data); }
  async atualizarCategoria(id: number, data: any) { return this.categorias.atualizar(id, data); }
  async desativarCategoria(id: number) { return this.categorias.desativar(id); }

  async listarSubcategorias() {
    return this.prisma.subcategoriaEquipamento.findMany({
      where: { ativo: true },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarSubcategoria(data: any) { return this.subcategorias.criar(data); }
  async atualizarSubcategoria(id: number, data: any) { return this.subcategorias.atualizar(id, data); }
  async desativarSubcategoria(id: number) { return this.subcategorias.desativar(id); }

  async listarMarcas() { return this.marcas.listar(); }
  async criarMarca(data: any) { return this.marcas.criar(data); }
  async atualizarMarca(id: number, data: any) { return this.marcas.atualizar(id, data); }
  async desativarMarca(id: number) { return this.marcas.desativar(id); }

  async listarFornecedores() { return this.fornecedores.listar(); }
  async criarFornecedor(data: any) { return this.fornecedores.criar(data); }
  async atualizarFornecedor(id: number, data: any) { return this.fornecedores.atualizar(id, data); }
  async desativarFornecedor(id: number) { return this.fornecedores.desativar(id); }

  async listarLocalizacoes() { return this.localizacoes.listar(); }
  async criarLocalizacao(data: any) { return this.localizacoes.criar(data); }
  async atualizarLocalizacao(id: number, data: any) { return this.localizacoes.atualizar(id, data); }
  async desativarLocalizacao(id: number) { return this.localizacoes.desativar(id); }

  async listarStatus() { return this.statuses.listar(); }
  async criarStatus(data: any) { return this.statuses.criar(data); }
  async atualizarStatus(id: number, data: any) { return this.statuses.atualizar(id, data); }
  async desativarStatus(id: number) { return this.statuses.desativar(id); }

  async listarEstadosConservacao() { return this.estadosConservacao.listar(); }
  async criarEstadoConservacao(data: any) { return this.estadosConservacao.criar(data); }
  async atualizarEstadoConservacao(id: number, data: any) { return this.estadosConservacao.atualizar(id, data); }
  async desativarEstadoConservacao(id: number) { return this.estadosConservacao.desativar(id); }

  async listarTiposManutencao() { return this.tiposManutencao.listar(); }
  async criarTipoManutencao(data: any) { return this.tiposManutencao.criar(data); }
  async atualizarTipoManutencao(id: number, data: any) { return this.tiposManutencao.atualizar(id, data); }
  async desativarTipoManutencao(id: number) { return this.tiposManutencao.desativar(id); }

  // --- CRUD Unidades de Medida ---

  async listarUnidadesMedida() { return this.unidadesMedida.listar(); }
  async criarUnidadeMedida(data: { nome: string; ordem?: number }) { return this.unidadesMedida.criar(data); }
  async atualizarUnidadeMedida(id: number, data: { nome?: string; ativo?: boolean; ordem?: number }) { return this.unidadesMedida.atualizar(id, data); }
  async desativarUnidadeMedida(id: number) { return this.unidadesMedida.desativar(id); }

  // --- CRUD Principal Equipamento ---

  async detalhar(id: number) {
    const equip = await this.prisma.equipamento.findUnique({
      where: { id },
      include: {
        marca: true,
        categoria: true,
        subcategoria: true,
        localizacao: true,
        fornecedor: true,
        status: true,
        estadoConservacao: true,
        responsavel: { select: { id: true, nome: true } },
        retiradas: {
          take: 10,
          orderBy: { dataRetirada: 'desc' },
          include: { colaborador: { select: { id: true, nome: true } } },
        },
        manutencoes: {
          take: 10,
          orderBy: { data: 'desc' },
          include: { tipo: true },
        },
      },
    });
    if (!equip) throw new NotFoundException(`Equipamento ${id} não encontrado`);
    return equip;
  }

  async criar(data: any) {
    if (data.descricao) {
      data.descricao = data.descricao.toUpperCase();
      const exists = await this.prisma.equipamento.findFirst({
        where: { descricao: normalize(data.descricao) },
      });
      if (exists) throw new AppError(409, 'Equipamento já cadastrado');
    }
    return this.prisma.equipamento.create({ data });
  }

  async atualizar(id: number, data: any) {
    await this.detalhar(id);
    if (data.descricao) {
      data.descricao = data.descricao.toUpperCase();
      const exists = await this.prisma.equipamento.findFirst({
        where: { descricao: normalize(data.descricao), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Equipamento já cadastrado');
    }
    return this.prisma.equipamento.update({ where: { id }, data });
  }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.equipamento.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
