import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { StatusMaterial, TipoMaterial } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { LookupService, type LookupCrud } from '../common/services/lookup.service.js';

export interface MaterialInputDto {
  nome: string;
  tipo: TipoMaterial;
  categoriaId?: number | null;
  unidadeId: number;
  quantidadeMinima?: number;
  custoUnitario?: number;
}

export interface MaterialUpdateDto {
  nome?: string;
  tipo?: TipoMaterial;
  categoriaId?: number | null;
  unidadeId?: number;
  quantidadeMinima?: number | null;
  custoUnitario?: number | null;
  status?: StatusMaterial;
}

export interface MaterialMovimentoDto {
  quantidade: number;
  observacao?: string;
}

@Injectable()
export class MateriaisService {
  private readonly categorias: LookupCrud;
  private readonly subcategorias: LookupCrud;
  private readonly marcas: LookupCrud;
  private readonly cores: LookupCrud;
  private readonly unidadesMedida: LookupCrud;

  constructor(
    private readonly prisma: PrismaService,
    private readonly lookup: LookupService,
  ) {
    this.categorias = this.lookup.criarCrud(this.prisma.categoriaMaterial, {
      labelSingular: 'Categoria',
      duplicateMessage: () => 'Categoria já cadastrada',
    });
    this.subcategorias = this.lookup.criarCrud(this.prisma.subcategoriaMaterial, {
      labelSingular: 'Subcategoria',
      duplicateMessage: () => 'Subcategoria já cadastrada',
    });
    this.marcas = this.lookup.criarCrud(this.prisma.marca, {
      labelSingular: 'Marca',
      duplicateMessage: () => 'Marca já cadastrada',
    });
    this.cores = this.lookup.criarCrud(this.prisma.cor, {
      labelSingular: 'Cor',
      duplicateMessage: () => 'Cor já cadastrada',
    });
    this.unidadesMedida = this.lookup.criarCrud(this.prisma.unidadeMedida, {
      labelSingular: 'Unidade de medida',
      duplicateMessage: () => 'Unidade de medida já cadastrada',
    });
  }

  async listar(params?: { q?: string; tipo?: TipoMaterial }) {
    const where: Record<string, unknown> = {};
    if (params?.q) {
      where.nome = { contains: params.q };
    }
    if (params?.tipo) {
      where.tipo = params.tipo;
    }

    return this.prisma.material.findMany({
      where,
      include: {
        saldo: true,
        categoria: true,
        movimentos: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            registradoPor: {
              select: { id: true, nome: true },
            },
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async lookups() {
    const [categorias, subcategorias, marcas, cores, unidadesMedida] =
      await Promise.all([
        this.prisma.categoriaMaterial.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
        this.prisma.subcategoriaMaterial.findMany({
          where: { ativo: true },
          include: { categoria: true },
          orderBy: { nome: 'asc' },
        }),
        this.prisma.marca.findMany({
          where: { ativo: true },
          orderBy: { nome: 'asc' },
        }),
        this.prisma.cor.findMany({
          where: { ativo: true },
          orderBy: { nome: 'asc' },
        }),
        this.prisma.unidadeMedida.findMany({
          where: { ativo: true },
          orderBy: { ordem: 'asc' },
        }),
      ]);
    return { categorias, subcategorias, marcas, cores, unidadesMedida };
  }

  async detalhar(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        saldo: true,
        categoria: true,
        movimentos: {
          orderBy: { createdAt: 'desc' },
          include: {
            registradoPor: {
              select: { id: true, nome: true },
            },
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException(`Material com ID ${id} não encontrado`);
    }

    return material;
  }

  async criar(dto: MaterialInputDto) {
    const nomeUpper = dto.nome.toUpperCase();
    const exists = await this.prisma.material.findFirst({
      where: { nome: normalize(nomeUpper) },
    });
    if (exists) throw new AppError(409, 'Material já cadastrado');

    return this.prisma.material.create({
      data: {
        nome: nomeUpper,
        tipo: dto.tipo,
        categoriaId: dto.categoriaId ?? null,
        unidadeId: dto.unidadeId,
        quantidadeMinima:
          dto.quantidadeMinima !== undefined ? dto.quantidadeMinima : null,
        custoUnitario:
          dto.custoUnitario !== undefined ? dto.custoUnitario : null,
        saldo: {
          create: {
            saldo: 0,
          },
        },
      },
      include: {
        saldo: true,
        categoria: true,
      },
    });
  }

  async atualizar(id: number, dto: MaterialUpdateDto) {
    await this.detalhar(id);

    if (dto.nome) {
      const nomeUpper = dto.nome.toUpperCase();
      const exists = await this.prisma.material.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Material já cadastrado');
    }

    return this.prisma.material.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome.toUpperCase() }),
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(dto.categoriaId !== undefined && {
          categoriaId: dto.categoriaId ?? null,
        }),
        ...(dto.unidadeId !== undefined && { unidadeId: dto.unidadeId }),
        ...(dto.quantidadeMinima !== undefined && {
          quantidadeMinima: dto.quantidadeMinima,
        }),
        ...(dto.custoUnitario !== undefined && {
          custoUnitario: dto.custoUnitario,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: {
        saldo: true,
        categoria: true,
      },
    });
  }

  async registrarEntrada(
    id: number,
    dto: MaterialMovimentoDto,
    userId?: number,
  ) {
    if (dto.quantidade <= 0) {
      throw new BadRequestException(
        'A quantidade de entrada deve ser maior que zero.',
      );
    }

    await this.detalhar(id);

    return this.prisma.$transaction(async (tx) => {
      const saldoAtualObj = await tx.saldoEstoque.findUnique({
        where: { materialId: id },
      });
      const saldoAtual = saldoAtualObj ? Number(saldoAtualObj.saldo) : 0;
      const novoSaldo = saldoAtual + dto.quantidade;

      await tx.saldoEstoque.upsert({
        where: { materialId: id },
        create: { materialId: id, saldo: novoSaldo },
        update: { saldo: novoSaldo },
      });

      await tx.movimentoEstoque.create({
        data: {
          materialId: id,
          tipo: 'ENTRADA',
          quantidade: dto.quantidade,
          saldoApos: novoSaldo,
          observacao: dto.observacao || null,
          registradoPorId: userId || null,
        },
      });

      return novoSaldo;
    });
  }

  // --- CRUD para Lookups de Materiais ---

  async listarCategorias() { return this.categorias.listar(); }
  async criarCategoria(data: any) { return this.categorias.criar(data); }
  async atualizarCategoria(id: number, data: any) { return this.categorias.atualizar(id, data); }
  async desativarCategoria(id: number) { return this.categorias.desativar(id); }

  async listarSubcategorias() {
    return this.prisma.subcategoriaMaterial.findMany({
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

  async listarCores() { return this.cores.listar(); }
  async criarCor(data: any) { return this.cores.criar(data); }
  async atualizarCor(id: number, data: any) { return this.cores.atualizar(id, data); }
  async desativarCor(id: number) { return this.cores.desativar(id); }

  async listarUnidadesMedida() { return this.unidadesMedida.listar(); }
  async criarUnidadeMedida(data: { nome: string }) { return this.unidadesMedida.criar(data); }
  async atualizarUnidadeMedida(id: number, data: { nome?: string; ativo?: boolean }) { return this.unidadesMedida.atualizar(id, data); }
  async desativarUnidadeMedida(id: number) { return this.unidadesMedida.desativar(id); }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.material.update({ where: { id }, data: { status: 'INATIVO' } });
  }

  async registrarSaida(id: number, dto: MaterialMovimentoDto, userId?: number) {
    if (dto.quantidade <= 0) {
      throw new BadRequestException(
        'A quantidade de saída deve ser maior que zero.',
      );
    }

    await this.detalhar(id);

    return this.prisma.$transaction(async (tx) => {
      const saldoAtualObj = await tx.saldoEstoque.findUnique({
        where: { materialId: id },
      });
      const saldoAtual = saldoAtualObj ? Number(saldoAtualObj.saldo) : 0;
      const novoSaldo = saldoAtual - dto.quantidade;

      await tx.saldoEstoque.upsert({
        where: { materialId: id },
        create: { materialId: id, saldo: novoSaldo },
        update: { saldo: novoSaldo },
      });

      await tx.movimentoEstoque.create({
        data: {
          materialId: id,
          tipo: 'SAIDA',
          quantidade: dto.quantidade,
          saldoApos: novoSaldo,
          observacao: dto.observacao || null,
          registradoPorId: userId || null,
        },
      });

      return novoSaldo;
    });
  }
}
