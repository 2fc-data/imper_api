import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { StatusMaterial, TipoMaterial } from '@prisma/client';
import {
  type LookupCrud,
  LookupService,
} from '../common/services/lookup.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface MaterialInputDto {
  nome: string;
  tipo: TipoMaterial;
  categoriaId?: number | null;
  unidadeId: number;
  tipoDespesaId?: number | null;
  obraId?: number | null;
  quantidadeMinima?: number | null;
  custoUnitario?: number | null;
}

export interface MaterialUpdateDto {
  nome?: string;
  tipo?: TipoMaterial;
  categoriaId?: number | null;
  unidadeId?: number;
  tipoDespesaId?: number | null;
  obraId?: number | null;
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
    this.subcategorias = this.lookup.criarCrud(
      this.prisma.subcategoriaMaterial,
      {
        labelSingular: 'Subcategoria',
        duplicateMessage: () => 'Subcategoria já cadastrada',
      },
    );
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

  // --- CRUD Tipos de Despesas Extras ---

  async listarTiposDespesas(ativo?: boolean) {
    return this.prisma.tipoDespesa.findMany({
      where: ativo === undefined ? {} : { ativo },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    });
  }

  async criarTipoDespesa(data: {
    nome: string;
    descricao?: string;
    requerObra?: boolean;
    ordem?: number;
  }) {
    const nomeTrim = data.nome.trim();
    const exists = await this.prisma.tipoDespesa.findFirst({
      where: { nome: normalize(nomeTrim) },
    });
    if (exists) throw new AppError(409, 'Tipo de despesa já cadastrado');

    return this.prisma.tipoDespesa.create({
      data: {
        nome: nomeTrim,
        descricao: data.descricao?.trim() || null,
        requerObra: !!data.requerObra,
        ordem: data.ordem ?? 0,
        ativo: true,
      },
    });
  }

  async atualizarTipoDespesa(
    id: number,
    data: {
      nome?: string;
      descricao?: string;
      requerObra?: boolean;
      ativo?: boolean;
      ordem?: number;
    },
  ) {
    if (data.nome) {
      const nomeTrim = data.nome.trim();
      const exists = await this.prisma.tipoDespesa.findFirst({
        where: { nome: normalize(nomeTrim), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Tipo de despesa já cadastrado');
      data.nome = nomeTrim;
    }

    return this.prisma.tipoDespesa.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.descricao !== undefined && {
          descricao: data.descricao?.trim() || null,
        }),
        ...(data.requerObra !== undefined && { requerObra: data.requerObra }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
        ...(data.ordem !== undefined && { ordem: data.ordem }),
      },
    });
  }

  async desativarTipoDespesa(id: number) {
    return this.prisma.tipoDespesa.update({
      where: { id },
      data: { ativo: false },
    });
  }

  private async validarRegrasDespesaExtra(
    tipo: TipoMaterial,
    tipoDespesaId?: number | null,
    obraId?: number | null,
  ) {
    if (tipo !== 'DESPESAS_EXTRAS') return;

    if (tipoDespesaId) {
      const td = await this.prisma.tipoDespesa.findUnique({
        where: { id: tipoDespesaId },
      });
      if (!td) {
        throw new BadRequestException('Tipo de despesa informado não foi encontrado');
      }
      if (td.requerObra) {
        if (!obraId) {
          throw new BadRequestException(
            `O tipo de despesa "${td.nome}" exige o vínculo com uma Obra`,
          );
        }
        const obra = await this.prisma.obra.findUnique({
          where: { id: obraId },
        });
        if (!obra) {
          throw new BadRequestException('Obra informada não foi encontrada');
        }
      }
    }
  }

  async listar(params?: {
    q?: string;
    tipo?: TipoMaterial;
    tipoDespesaId?: number;
    obraId?: number;
  }) {
    const where: Record<string, unknown> = {};
    if (params?.q) {
      where.nome = { contains: params.q };
    }
    if (params?.tipo) {
      where.tipo = params.tipo;
    }
    if (params?.tipoDespesaId) {
      where.tipoDespesaId = params.tipoDespesaId;
    }
    if (params?.obraId) {
      where.obraId = params.obraId;
    }

    return this.prisma.material.findMany({
      where,
      include: {
        saldo: true,
        categoria: true,
        unidade: true,
        tipoDespesa: true,
        obra: {
          select: {
            id: true,
            codigo: true,
            atendimento: {
              select: {
                id: true,
                user: {
                  select: { id: true, nome: true },
                },
              },
            },
          },
        },
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
    const [
      categorias,
      subcategorias,
      marcas,
      cores,
      unidadesMedida,
      tiposDespesas,
      obras,
    ] = await Promise.all([
      this.prisma.categoriaMaterial.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' },
      }),
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
      this.prisma.tipoDespesa.findMany({
        where: { ativo: true },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      }),
      this.prisma.obra.findMany({
        where: { status: { in: ['EM_PREPARACAO', 'EM_EXECUCAO'] } },
        select: {
          id: true,
          codigo: true,
          atendimento: {
            select: {
              id: true,
              user: { select: { id: true, nome: true } },
            },
          },
        },
        orderBy: { codigo: 'desc' },
      }),
    ]);
    return {
      categorias,
      subcategorias,
      marcas,
      cores,
      unidadesMedida,
      tiposDespesas,
      obras,
    };
  }

  async detalhar(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        saldo: true,
        categoria: true,
        unidade: true,
        tipoDespesa: true,
        obra: {
          select: {
            id: true,
            codigo: true,
            atendimento: {
              select: {
                id: true,
                user: {
                  select: { id: true, nome: true },
                },
              },
            },
          },
        },
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

    await this.validarRegrasDespesaExtra(dto.tipo, dto.tipoDespesaId, dto.obraId);

    return this.prisma.material.create({
      data: {
        nome: nomeUpper,
        tipo: dto.tipo,
        categoriaId: dto.categoriaId ?? null,
        unidadeId: dto.unidadeId,
        tipoDespesaId: dto.tipoDespesaId ?? null,
        obraId: dto.obraId ?? null,
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
        unidade: true,
        tipoDespesa: true,
        obra: {
          select: {
            id: true,
            codigo: true,
            atendimento: {
              select: {
                id: true,
                user: {
                  select: { id: true, nome: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async atualizar(id: number, dto: MaterialUpdateDto) {
    const atual = await this.detalhar(id);

    if (dto.nome) {
      const nomeUpper = dto.nome.toUpperCase();
      const exists = await this.prisma.material.findFirst({
        where: { nome: normalize(nomeUpper), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Material já cadastrado');
    }

    const tipoFinal = dto.tipo ?? atual.tipo;
    const tipoDespesaFinal =
      dto.tipoDespesaId !== undefined ? dto.tipoDespesaId : atual.tipoDespesaId;
    const obraFinal = dto.obraId !== undefined ? dto.obraId : atual.obraId;

    await this.validarRegrasDespesaExtra(tipoFinal, tipoDespesaFinal, obraFinal);

    return this.prisma.material.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome.toUpperCase() }),
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(dto.categoriaId !== undefined && {
          categoriaId: dto.categoriaId ?? null,
        }),
        ...(dto.unidadeId !== undefined && { unidadeId: dto.unidadeId }),
        ...(dto.tipoDespesaId !== undefined && {
          tipoDespesaId: dto.tipoDespesaId ?? null,
        }),
        ...(dto.obraId !== undefined && {
          obraId: dto.obraId ?? null,
        }),
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
        unidade: true,
        tipoDespesa: true,
        obra: {
          select: {
            id: true,
            codigo: true,
            atendimento: {
              select: {
                id: true,
                user: {
                  select: { id: true, nome: true },
                },
              },
            },
          },
        },
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
    return this.categorias.listar();
  }
  async criarCategoria(data: any) {
    return this.categorias.criar(data);
  }
  async atualizarCategoria(id: number, data: any) {
    return this.categorias.atualizar(id, data);
  }
  async desativarCategoria(id: number) {
    return this.categorias.desativar(id);
  }

  async listarSubcategorias() {
    return this.prisma.subcategoriaMaterial.findMany({
      where: { ativo: true },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });
  }
  async criarSubcategoria(data: any) {
    return this.subcategorias.criar(data);
  }
  async atualizarSubcategoria(id: number, data: any) {
    return this.subcategorias.atualizar(id, data);
  }
  async desativarSubcategoria(id: number) {
    return this.subcategorias.desativar(id);
  }

  async listarMarcas() {
    return this.marcas.listar();
  }
  async criarMarca(data: any) {
    return this.marcas.criar(data);
  }
  async atualizarMarca(id: number, data: any) {
    return this.marcas.atualizar(id, data);
  }
  async desativarMarca(id: number) {
    return this.marcas.desativar(id);
  }

  async listarCores() {
    return this.cores.listar();
  }
  async criarCor(data: any) {
    return this.cores.criar(data);
  }
  async atualizarCor(id: number, data: any) {
    return this.cores.atualizar(id, data);
  }
  async desativarCor(id: number) {
    return this.cores.desativar(id);
  }

  async listarUnidadesMedida() {
    return this.unidadesMedida.listar();
  }
  async criarUnidadeMedida(data: { nome: string }) {
    return this.unidadesMedida.criar(data);
  }
  async atualizarUnidadeMedida(
    id: number,
    data: { nome?: string; ativo?: boolean },
  ) {
    return this.unidadesMedida.atualizar(id, data);
  }
  async desativarUnidadeMedida(id: number) {
    return this.unidadesMedida.desativar(id);
  }

  async excluir(id: number) {
    await this.detalhar(id);
    return this.prisma.material.update({
      where: { id },
      data: { status: 'INATIVO' },
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
