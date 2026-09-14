import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';

@Injectable()
export class EquipamentosService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listarCategorias() {
    return this.prisma.categoriaEquipamento.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarCategoria(data: any) {
    const exists = await this.prisma.categoriaEquipamento.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Categoria já cadastrada');
    return this.prisma.categoriaEquipamento.create({ data });
  }
  async atualizarCategoria(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.categoriaEquipamento.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Categoria já cadastrada');
    }
    return this.prisma.categoriaEquipamento.update({ where: { id }, data });
  }
  async desativarCategoria(id: number) {
    return this.prisma.categoriaEquipamento.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async listarSubcategorias() {
    return this.prisma.subcategoriaEquipamento.findMany({
      where: { ativo: true },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarSubcategoria(data: any) {
    const exists = await this.prisma.subcategoriaEquipamento.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Subcategoria já cadastrada');
    return this.prisma.subcategoriaEquipamento.create({ data });
  }
  async atualizarSubcategoria(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.subcategoriaEquipamento.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Subcategoria já cadastrada');
    }
    return this.prisma.subcategoriaEquipamento.update({ where: { id }, data });
  }
  async desativarSubcategoria(id: number) {
    return this.prisma.subcategoriaEquipamento.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async listarMarcas() {
    return this.prisma.marca.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarMarca(data: any) {
    const exists = await this.prisma.marca.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Marca já cadastrada');
    return this.prisma.marca.create({ data });
  }
  async atualizarMarca(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.marca.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Marca já cadastrada');
    }
    return this.prisma.marca.update({ where: { id }, data });
  }
  async desativarMarca(id: number) {
    return this.prisma.marca.update({ where: { id }, data: { ativo: false } });
  }

  async listarFornecedores() {
    return this.prisma.fornecedor.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarFornecedor(data: any) {
    const exists = await this.prisma.fornecedor.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Fornecedor já cadastrado');
    return this.prisma.fornecedor.create({ data });
  }
  async atualizarFornecedor(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.fornecedor.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Fornecedor já cadastrado');
    }
    return this.prisma.fornecedor.update({ where: { id }, data });
  }
  async desativarFornecedor(id: number) {
    return this.prisma.fornecedor.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async listarLocalizacoes() {
    return this.prisma.localizacao.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarLocalizacao(data: any) {
    const exists = await this.prisma.localizacao.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Localização já cadastrada');
    return this.prisma.localizacao.create({ data });
  }
  async atualizarLocalizacao(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.localizacao.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Localização já cadastrada');
    }
    return this.prisma.localizacao.update({ where: { id }, data });
  }
  async desativarLocalizacao(id: number) {
    return this.prisma.localizacao.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async listarStatus() {
    return this.prisma.statusEquipamento.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarStatus(data: any) {
    const exists = await this.prisma.statusEquipamento.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Status já cadastrado');
    return this.prisma.statusEquipamento.create({ data });
  }
  async atualizarStatus(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.statusEquipamento.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Status já cadastrado');
    }
    return this.prisma.statusEquipamento.update({ where: { id }, data });
  }
  async desativarStatus(id: number) {
    return this.prisma.statusEquipamento.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async listarEstadosConservacao() {
    return this.prisma.estadoConservacao.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarEstadoConservacao(data: any) {
    const exists = await this.prisma.estadoConservacao.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Estado de conservação já cadastrado');
    return this.prisma.estadoConservacao.create({ data });
  }
  async atualizarEstadoConservacao(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.estadoConservacao.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Estado de conservação já cadastrado');
    }
    return this.prisma.estadoConservacao.update({ where: { id }, data });
  }
  async desativarEstadoConservacao(id: number) {
    return this.prisma.estadoConservacao.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async listarTiposManutencao() {
    return this.prisma.tipoManutencao.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarTipoManutencao(data: any) {
    const exists = await this.prisma.tipoManutencao.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Tipo de manutenção já cadastrado');
    return this.prisma.tipoManutencao.create({ data });
  }
  async atualizarTipoManutencao(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.tipoManutencao.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Tipo de manutenção já cadastrado');
    }
    return this.prisma.tipoManutencao.update({ where: { id }, data });
  }
  async desativarTipoManutencao(id: number) {
    return this.prisma.tipoManutencao.update({
      where: { id },
      data: { ativo: false },
    });
  }

  // --- CRUD Unidades de Medida ---

  async listarUnidadesMedida() {
    return this.prisma.unidadeMedida.findMany({ orderBy: { ordem: 'asc' } });
  }
  async criarUnidadeMedida(data: { nome: string; ordem?: number }) {
    const exists = await this.prisma.unidadeMedida.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Unidade de medida já cadastrada');
    return this.prisma.unidadeMedida.create({ data });
  }
  async atualizarUnidadeMedida(
    id: number,
    data: { nome?: string; ativo?: boolean; ordem?: number },
  ) {
    if (data.nome) {
      const exists = await this.prisma.unidadeMedida.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Unidade de medida já cadastrada');
    }
    return this.prisma.unidadeMedida.update({ where: { id }, data });
  }
  async desativarUnidadeMedida(id: number) {
    return this.prisma.unidadeMedida.update({
      where: { id },
      data: { ativo: false },
    });
  }

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
