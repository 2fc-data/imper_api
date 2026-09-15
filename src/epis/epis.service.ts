import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';

@Injectable()
export class EpisService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listarCategorias() {
    return this.prisma.categoriaEpi.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  async listarSubcategorias() {
    return this.prisma.subcategoriaEpi.findMany({
      where: { ativo: true },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });
  }

  async listarMarcas() {
    return this.prisma.marca.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } });
  }

  async listarFornecedores() {
    return this.prisma.fornecedor.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } });
  }

  async listarLocalizacoes() {
    return this.prisma.localizacao.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } });
  }

  async listarCores() {
    return this.prisma.cor.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } });
  }

  async listarTamanhos() {
    return this.prisma.tamanhoEquipamento.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } });
  }

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

  async criarCategoria(data: { nome: string; descricao?: string }) {
    const nomeUpper = data.nome.toUpperCase();
    const exists = await this.prisma.categoriaEpi.findFirst({
      where: { nome: normalize(nomeUpper) },
    });
    if (exists) throw new AppError(409, 'Categoria já cadastrada');
    return this.prisma.categoriaEpi.create({ data: { ...data, nome: nomeUpper } });
  }
  async atualizarCategoria(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    if (data.nome) {
      const nomeUpper = data.nome.toUpperCase();
      const exists = await this.prisma.categoriaEpi.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Categoria já cadastrada');
    }
    const nomeValue = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
    return this.prisma.categoriaEpi.update({ where: { id }, data: { ...data, nome: nomeValue } });
  }
  async desativarCategoria(id: number) {
    return this.prisma.categoriaEpi.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async criarSubcategoria(data: {
    nome: string;
    descricao?: string;
    categoriaId: number;
  }) {
    const nomeUpper = data.nome.toUpperCase();
    const exists = await this.prisma.subcategoriaEpi.findFirst({
      where: { nome: normalize(nomeUpper) },
    });
    if (exists) throw new AppError(409, 'Subcategoria já cadastrada');
    return this.prisma.subcategoriaEpi.create({ data: { ...data, nome: nomeUpper } });
  }
  async atualizarSubcategoria(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    if (data.nome) {
      const nomeUpper = data.nome.toUpperCase();
      const exists = await this.prisma.subcategoriaEpi.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Subcategoria já cadastrada');
    }
    const nomeValue = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
    return this.prisma.subcategoriaEpi.update({ where: { id }, data: { ...data, nome: nomeValue } });
  }
  async desativarSubcategoria(id: number) {
    return this.prisma.subcategoriaEpi.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async criarMarca(data: { nome: string }) {
    const nomeUpper = data.nome.toUpperCase();
    const exists = await this.prisma.marca.findFirst({
      where: { nome: normalize(nomeUpper) },
    });
    if (exists) throw new AppError(409, 'Marca já cadastrada');
    return this.prisma.marca.create({ data: { ...data, nome: nomeUpper } });
  }
  async atualizarMarca(id: number, data: { nome?: string; ativo?: boolean }) {
    if (data.nome) {
      const nomeUpper = data.nome.toUpperCase();
      const exists = await this.prisma.marca.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Marca já cadastrada');
    }
    const nomeValue = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
    return this.prisma.marca.update({ where: { id }, data: { ...data, nome: nomeValue } });
  }
  async desativarMarca(id: number) {
    return this.prisma.marca.update({ where: { id }, data: { ativo: false } });
  }

  async criarCor(data: { nome: string }) {
    const nomeUpper = data.nome.toUpperCase();
    const exists = await this.prisma.cor.findFirst({
      where: { nome: normalize(nomeUpper) },
    });
    if (exists) throw new AppError(409, 'Cor já cadastrada');
    return this.prisma.cor.create({ data: { ...data, nome: nomeUpper } });
  }
  async atualizarCor(id: number, data: { nome?: string; ativo?: boolean }) {
    if (data.nome) {
      const nomeUpper = data.nome.toUpperCase();
      const exists = await this.prisma.cor.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Cor já cadastrada');
    }
    const nomeValue = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
    return this.prisma.cor.update({ where: { id }, data: { ...data, nome: nomeValue } });
  }
  async desativarCor(id: number) {
    return this.prisma.cor.update({ where: { id }, data: { ativo: false } });
  }

  async criarTamanho(data: { nome: string }) {
    const nomeUpper = data.nome.toUpperCase();
    const exists = await this.prisma.tamanhoEquipamento.findFirst({
      where: { nome: normalize(nomeUpper) },
    });
    if (exists) throw new AppError(409, 'Tamanho já cadastrado');
    return this.prisma.tamanhoEquipamento.create({ data: { ...data, nome: nomeUpper } });
  }
  async atualizarTamanho(id: number, data: { nome?: string; ativo?: boolean }) {
    if (data.nome) {
      const nomeUpper = data.nome.toUpperCase();
      const exists = await this.prisma.tamanhoEquipamento.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Tamanho já cadastrado');
    }
    const nomeValue = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
    return this.prisma.tamanhoEquipamento.update({ where: { id }, data: { ...data, nome: nomeValue } });
  }
  async desativarTamanho(id: number) {
    return this.prisma.tamanhoEquipamento.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async criarLocalizacao(data: { nome: string; descricao?: string }) {
    const nomeUpper = data.nome.toUpperCase();
    const exists = await this.prisma.localizacao.findFirst({
      where: { nome: normalize(nomeUpper) },
    });
    if (exists) throw new AppError(409, 'Localização já cadastrada');
    return this.prisma.localizacao.create({ data: { ...data, nome: nomeUpper } });
  }
  async atualizarLocalizacao(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    if (data.nome) {
      const nomeUpper = data.nome.toUpperCase();
      const exists = await this.prisma.localizacao.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Localização já cadastrada');
    }
    const nomeValue = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
    return this.prisma.localizacao.update({ where: { id }, data: { ...data, nome: nomeValue } });
  }
  async desativarLocalizacao(id: number) {
    return this.prisma.localizacao.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async criarFornecedor(data: { nome: string; cnpj?: string }) {
    const nomeUpper = data.nome.toUpperCase();
    const exists = await this.prisma.fornecedor.findFirst({
      where: { nome: normalize(nomeUpper) },
    });
    if (exists) throw new AppError(409, 'Fornecedor já cadastrado');
    return this.prisma.fornecedor.create({ data: { ...data, nome: nomeUpper } });
  }
  async atualizarFornecedor(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    if (data.nome) {
      const nomeUpper = data.nome.toUpperCase();
      const exists = await this.prisma.fornecedor.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Fornecedor já cadastrado');
    }
    const nomeValue = typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
    return this.prisma.fornecedor.update({ where: { id }, data: { ...data, nome: nomeValue } });
  }
  async desativarFornecedor(id: number) {
    return this.prisma.fornecedor.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
