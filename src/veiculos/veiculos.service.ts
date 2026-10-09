import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type LookupCrud,
  LookupService,
} from '../common/services/lookup.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class VeiculosService {
  private readonly tiposVeiculo: LookupCrud;
  private readonly statusVeiculos: LookupCrud;

  constructor(
    private readonly prisma: PrismaService,
    private readonly lookup: LookupService,
  ) {
    this.tiposVeiculo = this.lookup.criarCrud(this.prisma.tipoVeiculo, {
      labelSingular: 'Tipo de veículo',
      duplicateMessage: () => 'Tipo de veículo já cadastrado',
    });
    this.statusVeiculos = this.lookup.criarCrud(this.prisma.statusVeiculo, {
      labelSingular: 'Status de veículo',
      duplicateMessage: () => 'Status de veículo já cadastrado',
    });
  }

  async listar(params?: { q?: string; statusId?: number; tipoId?: number }) {
    const where: Record<string, unknown> = { ativo: true };
    if (params?.q) {
      where.OR = [
        { codigo: { contains: params.q } },
        { placa: { contains: params.q } },
        { modelo: { contains: params.q } },
      ];
    }
    if (params?.statusId) where.statusId = params.statusId;
    if (params?.tipoId) where.tipoId = params.tipoId;

    return this.prisma.veiculo.findMany({
      where,
      include: {
        marca: true,
        cor: true,
        tipo: true,
        status: true,
        responsavel: { select: { id: true, nome: true } },
      },
      orderBy: { codigo: 'asc' },
    });
  }

  async lookups() {
    const [
      tiposVeiculo,
      statusVeiculos,
      marcas,
      cores,
      tiposManutencao,
      responsaveis,
    ] = await Promise.all([
      this.prisma.tipoVeiculo.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.statusVeiculo.findMany({
        where: { ativo: true },
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
      this.prisma.tipoManutencao.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.user.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
      }),
    ]);

    return {
      tiposVeiculo,
      statusVeiculos,
      marcas,
      cores,
      tiposManutencao,
      responsaveis,
    };
  }

  async detalhar(id: number) {
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id },
      include: {
        marca: true,
        cor: true,
        tipo: true,
        status: true,
        responsavel: { select: { id: true, nome: true } },
      },
    });
    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
    }
    return veiculo;
  }

  async proximoCodigo(): Promise<{ codigo: string }> {
    const ultimo = await this.prisma.veiculo.findFirst({
      where: { codigo: { startsWith: 'VCL-' } },
      orderBy: { id: 'desc' },
      select: { codigo: true },
    });

    let proximo = 1;
    if (ultimo) {
      const match = ultimo.codigo.match(/^VCL-(\d+)$/);
      if (match) proximo = Number(match[1]) + 1;
    }
    return { codigo: `VCL-${String(proximo).padStart(2, '0')}` };
  }

  async criar(data: any) {
    const descricao = (data.descricao ?? '').trim();
    if (!descricao) {
      throw new AppError(422, 'Descrição é obrigatória');
    }
    await this.validarLookups(data);

    const codigo = data.codigo?.trim() || (await this.proximoCodigo()).codigo;

    const exists = await this.prisma.veiculo.findFirst({
      where: { OR: [{ codigo }, { placa: data.placa }] },
    });
    if (exists) {
      throw new AppError(409, 'Código ou placa já cadastrado');
    }

    return this.prisma.veiculo.create({
      data: {
        codigo,
        placa: (data.placa ?? '').toUpperCase(),
        descricao: normalize(descricao),
        modelo: data.modelo || null,
        ano: data.ano || null,
        combustivel: data.combustivel || 'GASOLINA',
        odometroAtual: data.odometroAtual || 0,
        observacoes: data.observacoes || null,
        marcaId: data.marcaId || null,
        corId: data.corId || null,
        tipoId: data.tipoId,
        statusId: data.statusId,
        responsavelId: data.responsavelId || null,
      },
      include: {
        marca: true,
        cor: true,
        tipo: true,
        status: true,
        responsavel: { select: { id: true, nome: true } },
      },
    });
  }

  async atualizar(id: number, data: any) {
    await this.detalhar(id);

    if (data.descricao !== undefined) {
      const descricao = (data.descricao ?? '').trim();
      if (!descricao) {
        throw new AppError(422, 'Descrição é obrigatória');
      }
      data.descricao = normalize(descricao);
    }
    if (data.placa !== undefined) {
      data.placa = (data.placa ?? '').toUpperCase();
    }
    await this.validarLookups(data);

    if (data.codigo || data.placa) {
      const exists = await this.prisma.veiculo.findFirst({
        where: {
          OR: [
            ...(data.codigo ? [{ codigo: data.codigo }] : []),
            ...(data.placa ? [{ placa: data.placa }] : []),
          ],
          NOT: { id },
        },
      });
      if (exists) throw new AppError(409, 'Código ou placa já cadastrado');
    }

    return this.prisma.veiculo.update({
      where: { id },
      data: {
        ...(data.codigo !== undefined && { codigo: data.codigo }),
        ...(data.placa !== undefined && { placa: data.placa }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.modelo !== undefined && { modelo: data.modelo }),
        ...(data.ano !== undefined && { ano: data.ano }),
        ...(data.combustivel !== undefined && { combustivel: data.combustivel }),
        ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
        ...(data.marcaId !== undefined && { marcaId: data.marcaId }),
        ...(data.corId !== undefined && { corId: data.corId }),
        ...(data.tipoId !== undefined && { tipoId: data.tipoId }),
        ...(data.statusId !== undefined && { statusId: data.statusId }),
        ...(data.responsavelId !== undefined && {
          responsavelId: data.responsavelId,
        }),
      },
      include: {
        marca: true,
        cor: true,
        tipo: true,
        status: true,
        responsavel: { select: { id: true, nome: true } },
      },
    });
  }

  async excluir(id: number) {
    const veiculo = await this.detalhar(id);
    if (Number(veiculo.odometroAtual) > 0) {
      throw new AppError(409, 'Não é possível excluir veículo com km registrado');
    }
    return this.prisma.veiculo.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async registrarKm(veiculoId: number, data: any, registradoPorId?: number) {
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: veiculoId },
    });
    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${veiculoId} não encontrado`);
    }

    const kmPercorrido = Number(data.kmPercorrido);
    if (isNaN(kmPercorrido) || kmPercorrido <= 0) {
      throw new AppError(422, 'kmPercorrido deve ser maior que zero');
    }

    const dataRegistro = data.data ? new Date(data.data) : this.dataPadraoKm();

    const existeRegistro = await this.prisma.registroKmVeiculo.findUnique({
      where: { veiculoId_data: { veiculoId, data: dataRegistro } },
    });
    if (existeRegistro) {
      throw new AppError(
        409,
        `Já existe registro de km para este veículo em ${dataRegistro.toISOString().slice(0, 10)}`,
      );
    }

    const odometroAnterior = Number(veiculo.odometroAtual);
    const odometro = odometroAnterior + kmPercorrido;

    return this.prisma.$transaction(async (tx) => {
      const registro = await tx.registroKmVeiculo.create({
        data: {
          veiculoId,
          data: dataRegistro,
          kmPercorrido,
          odometro,
          observacao: data.observacao || null,
          registradoPorId: registradoPorId || null,
        },
      });
      await tx.veiculo.update({
        where: { id: veiculoId },
        data: { odometroAtual: odometro },
      });
      return registro;
    });
  }

  async listarRegistrosKm(veiculoId: number, mes?: number, ano?: number) {
    const where: Record<string, unknown> = { veiculoId };
    if (mes && ano) {
      const inicio = new Date(ano, mes - 1, 1);
      const fim = new Date(ano, mes, 0);
      where.data = { gte: inicio, lte: fim };
    }
    return this.prisma.registroKmVeiculo.findMany({
      where,
      include: {
        registradoPor: { select: { id: true, nome: true } },
      },
      orderBy: { data: 'desc' },
    });
  }

  async atualizarRegistroKm(id: number, data: any) {
    const registro = await this.prisma.registroKmVeiculo.findUnique({
      where: { id },
    });
    if (!registro) {
      throw new NotFoundException(`Registro de km com ID ${id} não encontrado`);
    }

    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: registro.veiculoId },
    });
    if (!veiculo) {
      throw new NotFoundException(
        `Veículo com ID ${registro.veiculoId} não encontrado`,
      );
    }

    const kmPercorrido =
      data.kmPercorrido !== undefined
        ? Number(data.kmPercorrido)
        : Number(registro.kmPercorrido);
    if (isNaN(kmPercorrido) || kmPercorrido <= 0) {
      throw new AppError(422, 'kmPercorrido deve ser maior que zero');
    }

    if (data.data !== undefined) {
      const novaData = new Date(data.data);
      const outro = await this.prisma.registroKmVeiculo.findUnique({
        where: {
          veiculoId_data: { veiculoId: registro.veiculoId, data: novaData },
        },
      });
      if (outro && outro.id !== id) {
        throw new AppError(409, 'Já existe registro de km para esta data');
      }
    }

    const odometroAnterior = Number(veiculo.odometroAtual);
    const odometro =
      odometroAnterior + kmPercorrido - Number(registro.kmPercorrido);

    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.registroKmVeiculo.update({
        where: { id },
        data: {
          ...(data.data !== undefined && { data: new Date(data.data) }),
          ...(data.kmPercorrido !== undefined && { kmPercorrido }),
          ...(data.observacao !== undefined && { observacao: data.observacao }),
          odometro,
        },
      });
      await tx.veiculo.update({
        where: { id: registro.veiculoId },
        data: { odometroAtual: odometro },
      });
      return atualizado;
    });
  }

  async excluirRegistroKm(id: number) {
    const registro = await this.prisma.registroKmVeiculo.findUnique({
      where: { id },
    });
    if (!registro) {
      throw new NotFoundException(`Registro de km com ID ${id} não encontrado`);
    }

    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: registro.veiculoId },
    });
    if (!veiculo) {
      throw new NotFoundException(
        `Veículo com ID ${registro.veiculoId} não encontrado`,
      );
    }

    const odometroNovo =
      Number(veiculo.odometroAtual) - Number(registro.kmPercorrido);

    return this.prisma.$transaction(async (tx) => {
      await tx.registroKmVeiculo.delete({ where: { id } });
      await tx.veiculo.update({
        where: { id: registro.veiculoId },
        data: { odometroAtual: odometroNovo },
      });
      return registro;
    });
  }

  private dataPadraoKm(): Date {
    const agora = new Date();
    const ontem = new Date(agora);
    ontem.setDate(agora.getDate() - 1);
    if (ontem.getDay() === 6) ontem.setDate(ontem.getDate() - 1);
    if (ontem.getDay() === 0) ontem.setDate(ontem.getDate() - 2);
    return ontem;
  }

  async criarAbastecimento(
    veiculoId: number,
    data: any,
    registradoPorId?: number,
  ) {
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: veiculoId },
    });
    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${veiculoId} não encontrado`);
    }

    const litros = Number(data.litros);
    const valorTotal = Number(data.valorTotal);
    if (isNaN(litros) || litros <= 0) {
      throw new AppError(422, 'litros deve ser maior que zero');
    }
    if (isNaN(valorTotal) || valorTotal <= 0) {
      throw new AppError(422, 'valorTotal deve ser maior que zero');
    }

    const dataAbastecimento = data.data ? new Date(data.data) : new Date();

    const ultimo = await this.prisma.abastecimentoVeiculo.findFirst({
      where: { veiculoId },
      orderBy: { data: 'desc' },
    });

    const precoLitro = valorTotal / litros;
    const odometro = data.odometro
      ? Number(data.odometro)
      : Number(veiculo.odometroAtual);
    const kmDesdeUltimo =
      ultimo && odometro ? odometro - Number(ultimo.odometro) : null;
    const kmPorLitro = kmDesdeUltimo && litros ? kmDesdeUltimo / litros : null;

    return this.prisma.$transaction(async (tx) => {
      const abastecimento = await tx.abastecimentoVeiculo.create({
        data: {
          veiculoId,
          data: dataAbastecimento,
          litros,
          valorTotal,
          precoLitro,
          odometro,
          kmDesdeUltimo,
          kmPorLitro,
          fornecedorId: data.fornecedorId || null,
          registradoPorId: registradoPorId || null,
        },
      });
      if (odometro && odometro > Number(veiculo.odometroAtual)) {
        await tx.veiculo.update({
          where: { id: veiculoId },
          data: { odometroAtual: odometro },
        });
      }
      return abastecimento;
    });
  }

  async listarAbastecimentos(veiculoId?: number) {
    const where: Record<string, unknown> = {};
    if (veiculoId) where.veiculoId = veiculoId;
    return this.prisma.abastecimentoVeiculo.findMany({
      where,
      include: {
        veiculo: { select: { id: true, codigo: true, placa: true } },
        fornecedor: true,
        registradoPor: { select: { id: true, nome: true } },
      },
      orderBy: { data: 'desc' },
    });
  }

  async atualizarAbastecimento(id: number, data: any) {
    const abastecimento = await this.prisma.abastecimentoVeiculo.findUnique({
      where: { id },
    });
    if (!abastecimento) {
      throw new NotFoundException(`Abastecimento com ID ${id} não encontrado`);
    }

    const litros =
      data.litros !== undefined
        ? Number(data.litros)
        : Number(abastecimento.litros);
    const valorTotal =
      data.valorTotal !== undefined
        ? Number(data.valorTotal)
        : Number(abastecimento.valorTotal);
    if (isNaN(litros) || litros <= 0) {
      throw new AppError(422, 'litros deve ser maior que zero');
    }
    if (isNaN(valorTotal) || valorTotal <= 0) {
      throw new AppError(422, 'valorTotal deve ser maior que zero');
    }

    const precoLitro = valorTotal / litros;
    const odometro =
      data.odometro !== undefined
        ? Number(data.odometro)
        : Number(abastecimento.odometro);

    return this.prisma.abastecimentoVeiculo.update({
      where: { id },
      data: {
        ...(data.data !== undefined && { data: new Date(data.data) }),
        ...(data.litros !== undefined && { litros }),
        ...(data.valorTotal !== undefined && { valorTotal }),
        ...(data.fornecedorId !== undefined && {
          fornecedorId: data.fornecedorId,
        }),
        precoLitro,
        odometro,
      },
    });
  }

  async excluirAbastecimento(id: number) {
    const abastecimento = await this.prisma.abastecimentoVeiculo.findUnique({
      where: { id },
    });
    if (!abastecimento) {
      throw new NotFoundException(`Abastecimento com ID ${id} não encontrado`);
    }
    return this.prisma.abastecimentoVeiculo.delete({ where: { id } });
  }

  async analises(mes?: number, ano?: number) {
    const agora = new Date();
    const m = mes || agora.getMonth() + 1;
    const a = ano || agora.getFullYear();
    const inicio = new Date(a, m - 1, 1);
    const fim = new Date(a, m, 0);

    const [kmAgg, abastAgg, abastCount, manutGroup, veiculosAtivos] =
      await Promise.all([
        this.prisma.registroKmVeiculo.aggregate({
          where: { data: { gte: inicio, lte: fim } },
          _sum: { kmPercorrido: true },
        }),
        this.prisma.abastecimentoVeiculo.aggregate({
          where: { data: { gte: inicio, lte: fim } },
          _sum: { litros: true, valorTotal: true },
        }),
        this.prisma.abastecimentoVeiculo.count({
          where: { data: { gte: inicio, lte: fim } },
        }),
        this.prisma.manutencaoVeiculo.groupBy({
          by: ['status'],
          _count: true,
        }),
        this.prisma.veiculo.findMany({
          where: { ativo: true, status: { nome: 'ATIVO' } },
          select: { id: true, codigo: true, placa: true },
        }),
      ]);

    const veiculosSemKm = await this.calcularVeiculosSemKm(
      veiculosAtivos,
      inicio,
      fim,
    );

    return {
      kmTotalMes: Number(kmAgg._sum.kmPercorrido || 0),
      abastecimentosMes: {
        totalLitros: Number(abastAgg._sum.litros || 0),
        totalValor: Number(abastAgg._sum.valorTotal || 0),
        quantidade: abastCount,
      },
      manutencoesPorStatus: manutGroup.map((g) => ({
        status: g.status,
        quantidade: g._count,
      })),
      veiculosSemKm,
      mes: m,
      ano: a,
    };
  }

  private async calcularVeiculosSemKm(
    veiculos: any[],
    _inicio: Date,
    _fim: Date,
  ) {
    const semKm: any[] = [];
    for (const veiculo of veiculos) {
      const ultimoKm = await this.prisma.registroKmVeiculo.findFirst({
        where: { veiculoId: veiculo.id },
        orderBy: { data: 'desc' },
      });
      if (!ultimoKm) {
        semKm.push({ ...veiculo, motivo: 'Nenhum registro' });
        continue;
      }
      const diasDesdeUltimo = this.diasUteisEntre(
        new Date(ultimoKm.data),
        new Date(),
      );
      if (diasDesdeUltimo > 5) {
        semKm.push({
          ...veiculo,
          ultimoRegistro: ultimoKm.data,
          diasSemRegistro: diasDesdeUltimo,
        });
      }
    }
    return semKm;
  }

  private diasUteisEntre(inicio: Date, fim: Date): number {
    let dias = 0;
    const atual = new Date(inicio);
    while (atual <= fim) {
      const dia = atual.getDay();
      if (dia >= 1 && dia <= 5) dias++;
      atual.setDate(atual.getDate() + 1);
    }
    return dias;
  }

  private async validarLookups(data: any) {
    if (data.tipoId !== undefined) {
      const tipo = await this.prisma.tipoVeiculo.findFirst({
        where: { id: data.tipoId, ativo: true },
      });
      if (!tipo) throw new AppError(422, 'Tipo de veículo inválido');
    }
    if (data.statusId !== undefined) {
      const status = await this.prisma.statusVeiculo.findFirst({
        where: { id: data.statusId, ativo: true },
      });
      if (!status) throw new AppError(422, 'Status de veículo inválido');
    }
    if (data.marcaId) {
      const marca = await this.prisma.marca.findFirst({
        where: { id: data.marcaId, ativo: true },
      });
      if (!marca) throw new AppError(422, 'Marca inválida');
    }
    if (data.corId) {
      const cor = await this.prisma.cor.findFirst({
        where: { id: data.corId, ativo: true },
      });
      if (!cor) throw new AppError(422, 'Cor inválida');
    }
    if (data.responsavelId) {
      const user = await this.prisma.user.findFirst({
        where: { id: data.responsavelId, ativo: true },
      });
      if (!user) throw new AppError(422, 'Responsável inválido');
    }
  }
}
