import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
      this.prisma.marca.findMany({ where: { ativo: true } }),
      this.prisma.categoriaEquipamento.findMany({
        where: { ativo: true, tipo: 'EPI' },
      }),
      this.prisma.subcategoriaEquipamento.findMany({
        where: { ativo: true, categoria: { tipo: 'EPI' } },
      }),
      this.prisma.cor.findMany({ where: { ativo: true } }),
      this.prisma.tamanhoEquipamento.findMany({ where: { ativo: true } }),
      this.prisma.localizacao.findMany({ where: { ativo: true } }),
      this.prisma.fornecedor.findMany({ where: { ativo: true } }),
      this.prisma.user.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
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
    return this.prisma.categoriaEquipamento.findMany({
      where: { ativo: true, tipo: 'EPI' },
      orderBy: { ordem: 'asc' },
    });
  }

  async listarSubcategorias() {
    return this.prisma.subcategoriaEquipamento.findMany({
      where: { ativo: true, categoria: { tipo: 'EPI' } },
      include: { categoria: true },
      orderBy: { ordem: 'asc' },
    });
  }

  async listarMarcas() {
    return this.prisma.marca.findMany({ where: { ativo: true } });
  }

  async listarFornecedores() {
    return this.prisma.fornecedor.findMany({ where: { ativo: true } });
  }

  async listarLocalizacoes() {
    return this.prisma.localizacao.findMany({ where: { ativo: true } });
  }

  async listarCores() {
    return this.prisma.cor.findMany({ where: { ativo: true } });
  }

  async listarTamanhos() {
    return this.prisma.tamanhoEquipamento.findMany({ where: { ativo: true } });
  }

  async listarColaboradores() {
    return this.prisma.user.findMany({
      where: { ativo: true },
      select: { id: true, nome: true },
    });
  }

  async listarUnidadesMedida() {
    return this.prisma.unidadeMedida.findMany({ orderBy: { ordem: 'asc' } });
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
    return this.prisma.epi.create({ data });
  }

  async atualizar(id: number, data: any) {
    await this.detalhar(id);
    return this.prisma.epi.update({ where: { id }, data });
  }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.epi.update({ where: { id }, data: { ativo: false } });
  }

  async criarCategoria(data: { nome: string; descricao?: string }) {
    return this.prisma.categoriaEquipamento.create({
      data: { ...data, tipo: 'EPI' },
    });
  }
  async atualizarCategoria(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    return this.prisma.categoriaEquipamento.update({ where: { id }, data });
  }
  async desativarCategoria(id: number) {
    return this.prisma.categoriaEquipamento.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async criarSubcategoria(data: {
    nome: string;
    descricao?: string;
    categoriaId: number;
  }) {
    return this.prisma.subcategoriaEquipamento.create({ data });
  }
  async atualizarSubcategoria(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    return this.prisma.subcategoriaEquipamento.update({ where: { id }, data });
  }
  async desativarSubcategoria(id: number) {
    return this.prisma.subcategoriaEquipamento.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async criarMarca(data: { nome: string }) {
    return this.prisma.marca.create({ data });
  }
  async atualizarMarca(id: number, data: { nome?: string; ativo?: boolean }) {
    return this.prisma.marca.update({ where: { id }, data });
  }
  async desativarMarca(id: number) {
    return this.prisma.marca.update({ where: { id }, data: { ativo: false } });
  }

  async criarCor(data: { nome: string }) {
    return this.prisma.cor.create({ data });
  }
  async atualizarCor(id: number, data: { nome?: string; ativo?: boolean }) {
    return this.prisma.cor.update({ where: { id }, data });
  }
  async desativarCor(id: number) {
    return this.prisma.cor.update({ where: { id }, data: { ativo: false } });
  }

  async criarTamanho(data: { nome: string }) {
    return this.prisma.tamanhoEquipamento.create({ data });
  }
  async atualizarTamanho(id: number, data: { nome?: string; ativo?: boolean }) {
    return this.prisma.tamanhoEquipamento.update({ where: { id }, data });
  }
  async desativarTamanho(id: number) {
    return this.prisma.tamanhoEquipamento.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async criarLocalizacao(data: { nome: string; descricao?: string }) {
    return this.prisma.localizacao.create({ data });
  }
  async atualizarLocalizacao(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    return this.prisma.localizacao.update({ where: { id }, data });
  }
  async desativarLocalizacao(id: number) {
    return this.prisma.localizacao.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async criarFornecedor(data: { nome: string; cnpj?: string }) {
    return this.prisma.fornecedor.create({ data });
  }
  async atualizarFornecedor(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    return this.prisma.fornecedor.update({ where: { id }, data });
  }
  async desativarFornecedor(id: number) {
    return this.prisma.fornecedor.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
