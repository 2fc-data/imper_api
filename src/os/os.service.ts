import { Injectable } from '@nestjs/common';
import { Prisma, StatusOS } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CancelarOsDto } from './dto/os.dto.js';

type EnderecoResumo = {
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
};

const selectOs = {
  id: true,
  codigo: true,
  orcamentoId: true,
  userId: true,
  atendimentoId: true,
  urgencia: true,
  status: true,
  valorTotal: true,
  dataInicioPrevista: true,
  tecnicoResponsavelId: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, nome: true } },
  atendimento: { select: { id: true } },
  tecnicoResponsavel: { select: { id: true, nome: true } },
  endereco: {
    select: {
      logradouro: true,
      numero: true,
      complemento: true,
      bairro: true,
    },
  },
  _count: { select: { etapas: true, compras: true } },
} satisfies Prisma.OrdemServicoSelect;

type OsSelecionada = Prisma.OrdemServicoGetPayload<{ select: typeof selectOs }>;

function formatarEndereco(endereco: EnderecoResumo | null): string | null {
  if (!endereco) return null;
  const base = [endereco.logradouro, endereco.numero, endereco.complemento]
    .filter(Boolean)
    .join(', ');
  return endereco.bairro ? `${base} - ${endereco.bairro}` : base;
}

function mapear(os: OsSelecionada) {
  const { endereco, ...resto } = os;
  return { ...resto, endereco: formatarEndereco(endereco) };
}

@Injectable()
export class OsService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { status?: string; q?: string }) {
    const where: Prisma.OrdemServicoWhereInput = {};

    if (params?.status) {
      where.status = params.status as StatusOS;
    }

    if (params?.q) {
      where.OR = [
        { codigo: { contains: params.q } },
        { user: { nome: { contains: params.q } } },
        { tecnicoResponsavel: { nome: { contains: params.q } } },
      ];
    }

    const lista = await this.prisma.ordemServico.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: selectOs,
    });

    return lista.map(mapear);
  }

  async aprovar(id: number, userId: number) {
    return this.transicionar(
      id,
      [StatusOS.AGUARDANDO_APROVACAO],
      StatusOS.AGENDADO,
      { aprovadoPorId: userId, aprovadoEm: new Date() },
    );
  }

  async iniciar(id: number) {
    return this.transicionar(id, [StatusOS.AGENDADO], StatusOS.EM_ANDAMENTO);
  }

  async concluir(id: number) {
    return this.transicionar(id, [StatusOS.EM_ANDAMENTO], StatusOS.CONCLUIDO);
  }

  async cancelar(id: number, dto?: CancelarOsDto) {
    const permitidos = Object.values(StatusOS).filter(
      (status) =>
        status !== StatusOS.CONCLUIDO && status !== StatusOS.CANCELADO,
    );
    const extras: Prisma.OrdemServicoUncheckedUpdateInput = dto?.motivo
      ? { motivoRejeicao: dto.motivo }
      : {};
    return this.transicionar(id, permitidos, StatusOS.CANCELADO, extras);
  }

  private async transicionar(
    id: number,
    permitidos: StatusOS[],
    destino: StatusOS,
    extras: Prisma.OrdemServicoUncheckedUpdateInput = {},
  ) {
    const atual = await this.prisma.ordemServico.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!atual) {
      throw new AppError(404, 'Ordem de serviço não encontrada');
    }

    if (!permitidos.includes(atual.status)) {
      throw new AppError(
        409,
        `Transição inválida: ${atual.status} → ${destino}`,
      );
    }

    await this.prisma.ordemServico.update({
      where: { id },
      data: { status: destino, ...extras },
    });

    return this.buscar(id);
  }

  private async buscar(id: number) {
    const os = await this.prisma.ordemServico.findUnique({
      where: { id },
      select: selectOs,
    });

    if (!os) {
      throw new AppError(404, 'Ordem de serviço não encontrada');
    }

    return mapear(os);
  }
}
