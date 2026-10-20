import { Injectable, NotFoundException } from '@nestjs/common';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

const ABASTECIMENTO_INCLUDE = {
  veiculo: { select: { id: true, codigo: true, nome: true, placa: true } },
  fornecedor: true,
  registradoPor: { select: { id: true, nome: true } },
  motorista: { select: { id: true, nome: true } },
};

@Injectable()
export class VeiculosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { q?: string; statusId?: number; tipoId?: number }) {
    const where: Record<string, unknown> = { ativo: true };
    if (params?.q) {
      where.OR = [
        { codigo: { contains: params.q } },
        { placa: { contains: params.q } },
        { nome: { contains: params.q } },
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
        fabricante: true,
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
      motoristas,
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
        where: { ativo: true, papeis: { none: { papel: { nome: 'CLIENTE' } } } },
        select: { id: true, nome: true },
      }),
      this.prisma.user.findMany({
        where: {
          ativo: true,
          papeis: { none: { papel: { nome: 'CLIENTE' } } },
        },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' },
      }),
    ]);

    return {
      tiposVeiculo,
      statusVeiculos,
      marcas,
      cores,
      tiposManutencao,
      responsaveis,
      motoristas,
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
        fabricante: true,
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
    const nome = (data.nome ?? '').trim();
    if (!nome) {
      throw new AppError(422, 'Nome é obrigatório');
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
        nome: normalize(nome),
        fabricanteId: data.fabricanteId || null,
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

    if (data.nome !== undefined) {
      const nome = (data.nome ?? '').trim();
      if (!nome) {
        throw new AppError(422, 'Nome é obrigatório');
      }
      data.nome = normalize(nome);
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
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.fabricanteId !== undefined && { fabricanteId: data.fabricanteId }),
        ...(data.modelo !== undefined && { modelo: data.modelo }),
        ...(data.ano !== undefined && { ano: data.ano }),
        ...(data.combustivel !== undefined && {
          combustivel: data.combustivel,
        }),
        ...(data.odometroAtual !== undefined && {
          odometroAtual: data.odometroAtual,
        }),
        ...(data.observacoes !== undefined && {
          observacoes: data.observacoes,
        }),
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
      throw new AppError(
        409,
        'Não é possível excluir veículo com km registrado',
      );
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

    const odometroInformado = Number(data.odometro);
    const odometroAnterior = Number(veiculo.odometroAtual);
    if (Number.isNaN(odometroInformado) || odometroInformado <= odometroAnterior) {
      throw new AppError(
        422,
        `Odômetro informado deve ser maior que o odômetro atual (${odometroAnterior} km)`,
      );
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

    const kmPercorrido = odometroInformado - odometroAnterior;

    return this.prisma.$transaction(async (tx) => {
      const registro = await tx.registroKmVeiculo.create({
        data: {
          veiculoId,
          data: dataRegistro,
          kmPercorrido,
          odometro: odometroInformado,
          observacao: data.observacao || null,
          registradoPorId: registradoPorId || null,
          colaboradorId: data.colaboradorId || null,
        },
      });
      await tx.veiculo.update({
        where: { id: veiculoId },
        data: { odometroAtual: odometroInformado },
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
        colaborador: { select: { id: true, nome: true } },
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

    const odometroNovo = Number(data.odometro);

    // Registro imediatamente anterior (mesmo veículo, data < esta, mais recente)
    const anterior = await this.prisma.registroKmVeiculo.findFirst({
      where: {
        veiculoId: registro.veiculoId,
        data: { lt: registro.data },
      },
      orderBy: { data: 'desc' },
    });
    const odometroAnterior = anterior
      ? Number(anterior.odometro)
      : Number(registro.odometro) - Number(registro.kmPercorrido);

    if (Number.isNaN(odometroNovo) || odometroNovo <= odometroAnterior) {
      throw new AppError(
        422,
        `Odômetro informado deve ser maior que o odômetro anterior (${odometroAnterior} km)`,
      );
    }

    const kmPercorridoNovo = odometroNovo - odometroAnterior;

    // Registros posteriores (mesmo veículo, data > esta, em ordem)
    const posteriores = await this.prisma.registroKmVeiculo.findMany({
      where: {
        veiculoId: registro.veiculoId,
        data: { gt: registro.data },
      },
      orderBy: { data: 'asc' },
    });

    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.registroKmVeiculo.update({
        where: { id },
        data: {
          ...(data.data !== undefined && { data: new Date(data.data) }),
          ...(data.observacao !== undefined && { observacao: data.observacao }),
          ...(data.colaboradorId !== undefined && { colaboradorId: data.colaboradorId }),
          odometro: odometroNovo,
          kmPercorrido: kmPercorridoNovo,
        },
      });

      // Recalcular em cascata os registros posteriores
      let odometroBase = odometroNovo;
      for (const p of posteriores) {
        const pOdometro = Number(p.odometro);
        const pKmNovo = pOdometro - odometroBase;
        await tx.registroKmVeiculo.update({
          where: { id: p.id },
          data: { kmPercorrido: pKmNovo },
        });
        odometroBase = pOdometro;
      }

      // Atualizar odômetro atual do veículo para o último registro
      const ultimo = posteriores.length > 0
        ? Number(posteriores[posteriores.length - 1].odometro)
        : odometroNovo;
      await tx.veiculo.update({
        where: { id: registro.veiculoId },
        data: { odometroAtual: ultimo },
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

  private serializarAbastecimento<T extends Record<string, any>>(a: T): T {
    const out: Record<string, any> = { ...a };
    for (const campo of [
      'odometro',
      'litros',
      'valorTotal',
      'precoLitro',
      'kmDesdeUltimo',
      'kmPorLitro',
    ]) {
      if (out[campo] != null) out[campo] = Number(out[campo]);
    }
    return out as T;
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
    if (Number.isNaN(litros) || litros <= 0) {
      throw new AppError(422, 'litros deve ser maior que zero');
    }
    if (Number.isNaN(valorTotal) || valorTotal <= 0) {
      throw new AppError(422, 'valorTotal deve ser maior que zero');
    }

    const dataAbastecimento = data.data ? new Date(data.data) : new Date();

    const motoristaId = data.motoristaId ? Number(data.motoristaId) : null;
    if (!motoristaId) {
      throw new AppError(422, 'motoristaId é obrigatório');
    }
    await this.validarMotorista(motoristaId);

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
          motoristaId,
        },
        include: ABASTECIMENTO_INCLUDE,
      });
      if (odometro && odometro > Number(veiculo.odometroAtual)) {
        await tx.veiculo.update({
          where: { id: veiculoId },
          data: { odometroAtual: odometro },
        });
      }
      return this.serializarAbastecimento(abastecimento);
    });
  }

  async listarAbastecimentos(veiculoId?: number) {
    const where: Record<string, unknown> = {};
    if (veiculoId) where.veiculoId = veiculoId;
    const abastecimentos = await this.prisma.abastecimentoVeiculo.findMany({
      where,
      include: ABASTECIMENTO_INCLUDE,
      orderBy: { data: 'desc' },
    });
    return abastecimentos.map((a) => this.serializarAbastecimento(a));
  }

  private async validarMotorista(motoristaId: number) {
    const motorista = await this.prisma.user.findUnique({
      where: { id: motoristaId },
      include: { papeis: { include: { papel: true } } },
    });
    if (!motorista?.ativo) {
      throw new AppError(422, 'Motorista inválido ou inativo');
    }
    if (motorista.papeis.some((up) => up.papel.nome === 'CLIENTE')) {
      throw new AppError(422, 'Motorista não pode ser um cliente');
    }
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
    if (Number.isNaN(litros) || litros <= 0) {
      throw new AppError(422, 'litros deve ser maior que zero');
    }
    if (Number.isNaN(valorTotal) || valorTotal <= 0) {
      throw new AppError(422, 'valorTotal deve ser maior que zero');
    }

    const precoLitro = valorTotal / litros;
    const odometro =
      data.odometro !== undefined
        ? Number(data.odometro)
        : Number(abastecimento.odometro);

    let motoristaId: number | null | undefined;
    if (data.motoristaId !== undefined) {
      if (!data.motoristaId) {
        throw new AppError(422, 'motoristaId é obrigatório');
      }
      motoristaId = Number(data.motoristaId);
      await this.validarMotorista(motoristaId);
    }

    return this.serializarAbastecimento(
      await this.prisma.abastecimentoVeiculo.update({
        where: { id },
        data: {
          ...(data.data !== undefined && { data: new Date(data.data) }),
          ...(data.litros !== undefined && { litros }),
          ...(data.valorTotal !== undefined && { valorTotal }),
          ...(data.fornecedorId !== undefined && {
            fornecedorId: data.fornecedorId,
          }),
          ...(data.motoristaId !== undefined && { motoristaId }),
          precoLitro,
          odometro,
        },
        include: ABASTECIMENTO_INCLUDE,
      }),
    );
  }

  async excluirAbastecimento(id: number) {
    const abastecimento = await this.prisma.abastecimentoVeiculo.findUnique({
      where: { id },
    });
    if (!abastecimento) {
      throw new NotFoundException(`Abastecimento com ID ${id} não encontrado`);
    }
    return this.serializarAbastecimento(
      await this.prisma.abastecimentoVeiculo.delete({ where: { id } }),
    );
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
          select: { id: true, codigo: true, nome: true, placa: true },
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
    if (data.marcaId !== undefined) {
      const marca = await this.prisma.marca.findFirst({
        where: { id: data.marcaId, ativo: true },
      });
      if (!marca) throw new AppError(422, 'Marca inválida');
    }
    if (data.corId !== undefined) {
      const cor = await this.prisma.cor.findFirst({
        where: { id: data.corId, ativo: true },
      });
      if (!cor) throw new AppError(422, 'Cor inválida');
    }
    if (data.fabricanteId !== undefined) {
      const marca = await this.prisma.marca.findFirst({
        where: { id: data.fabricanteId, ativo: true },
      });
      if (!marca) throw new AppError(422, 'Fabricante inválido');
    }
    if (data.responsavelId !== undefined) {
      const user = await this.prisma.user.findFirst({
        where: { id: data.responsavelId, ativo: true, papeis: { none: { papel: { nome: 'CLIENTE' } } } },
      });
      if (!user) throw new AppError(422, 'Motorista inválido');
    }
  }
}
