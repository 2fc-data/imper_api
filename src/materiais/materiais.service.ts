import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { StatusMaterial, TipoMaterial } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';

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
  constructor(private readonly prisma: PrismaService) {}

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
    const exists = await this.prisma.material.findFirst({
      where: { nome: normalize(dto.nome) },
    });
    if (exists) throw new AppError(409, 'Material já cadastrado');

    return this.prisma.material.create({
      data: {
        nome: dto.nome,
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
      const exists = await this.prisma.material.findFirst({
        where: { nome: normalize(dto.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Material já cadastrado');
    }

    return this.prisma.material.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
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

  async listarCategorias() {
    return this.prisma.categoriaMaterial.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarCategoria(data: any) {
    const exists = await this.prisma.categoriaMaterial.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Categoria já cadastrada');
    return this.prisma.categoriaMaterial.create({ data });
  }
  async atualizarCategoria(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.categoriaMaterial.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Categoria já cadastrada');
    }
    return this.prisma.categoriaMaterial.update({ where: { id }, data });
  }
  async desativarCategoria(id: number) {
    return this.prisma.categoriaMaterial.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async listarSubcategorias() {
    return this.prisma.subcategoriaMaterial.findMany({
      where: { ativo: true },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarSubcategoria(data: any) {
    const exists = await this.prisma.subcategoriaMaterial.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Subcategoria já cadastrada');
    return this.prisma.subcategoriaMaterial.create({ data });
  }
  async atualizarSubcategoria(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.subcategoriaMaterial.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Subcategoria já cadastrada');
    }
    return this.prisma.subcategoriaMaterial.update({ where: { id }, data });
  }
  async desativarSubcategoria(id: number) {
    return this.prisma.subcategoriaMaterial.update({
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

  async listarCores() {
    return this.prisma.cor.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarCor(data: any) {
    const exists = await this.prisma.cor.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Cor já cadastrada');
    return this.prisma.cor.create({ data });
  }
  async atualizarCor(id: number, data: any) {
    if (data.nome) {
      const exists = await this.prisma.cor.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Cor já cadastrada');
    }
    return this.prisma.cor.update({ where: { id }, data });
  }
  async desativarCor(id: number) {
    return this.prisma.cor.update({ where: { id }, data: { ativo: false } });
  }

  async listarUnidadesMedida() {
    return this.prisma.unidadeMedida.findMany({ orderBy: { nome: 'asc' } });
  }
  async criarUnidadeMedida(data: { nome: string }) {
    const exists = await this.prisma.unidadeMedida.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Unidade de medida já cadastrada');
    return this.prisma.unidadeMedida.create({ data });
  }
  async atualizarUnidadeMedida(
    id: number,
    data: { nome?: string; ativo?: boolean },
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
