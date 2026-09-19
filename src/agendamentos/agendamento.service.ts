import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import type { TipoAgendamento, StatusAgendamento } from '../schemas/enums.js';

export interface CriarAgendamentoDto {
  clienteId: number;
  atendimentoId?: number | null;
  enderecoId?: number | null;
  userId?: number | null;
  tipo?: TipoAgendamento;
  status?: StatusAgendamento;
  dataPrevista: string;
  dataRealizada?: string | null;
  observacoes?: string | null;
}

export type AtualizarAgendamentoDto = Partial<CriarAgendamentoDto>;

const includeStandard = {
  cliente: { select: { id: true, nome: true, telefone: true } },
  user: { select: { id: true, nome: true } },
  criadoPor: { select: { id: true, nome: true } },
  endereco: true,
  atendimento: { select: { id: true, descricao: true, urgencia: true } },
};

@Injectable()
export class AgendamentoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: {
    status?: StatusAgendamento;
    tipo?: TipoAgendamento;
    clienteId?: number;
    userId?: number;
    dataDe?: string;
    dataAte?: string;
  }) {
    const where: any = {};

    if (params?.status) where.status = params.status;
    if (params?.tipo) where.tipo = params.tipo;
    if (params?.clienteId) where.clienteId = Number(params.clienteId);
    if (params?.userId) where.userId = Number(params.userId);

    if (params?.dataDe || params?.dataAte) {
      where.dataPrevista = {};
      if (params.dataDe) where.dataPrevista.gte = new Date(params.dataDe);
      if (params.dataAte) where.dataPrevista.lte = new Date(params.dataAte);
    }

    return this.prisma.agendamento.findMany({
      where,
      include: includeStandard,
      orderBy: { dataPrevista: 'asc' },
    });
  }

  async detalhar(id: number) {
    const item = await this.prisma.agendamento.findUnique({
      where: { id },
      include: includeStandard,
    });

    if (!item) {
      throw new AppError(404, 'Agendamento não encontrado');
    }

    return item;
  }

  async criar(dto: CriarAgendamentoDto, criadoPorId?: number) {
    if (!dto.clienteId) {
      throw new AppError(400, 'clienteId é obrigatório');
    }
    if (!dto.dataPrevista) {
      throw new AppError(400, 'dataPrevista é obrigatória');
    }

    return this.prisma.agendamento.create({
      data: {
        clienteId: Number(dto.clienteId),
        atendimentoId: dto.atendimentoId ? Number(dto.atendimentoId) : null,
        enderecoId: dto.enderecoId ? Number(dto.enderecoId) : null,
        userId: dto.userId ? Number(dto.userId) : null,
        tipo: dto.tipo ?? 'VISITA',
        status: dto.status ?? 'PENDENTE',
        dataPrevista: new Date(dto.dataPrevista),
        dataRealizada: dto.dataRealizada ? new Date(dto.dataRealizada) : null,
        observacoes: dto.observacoes ?? null,
        criadoPorId: criadoPorId ? Number(criadoPorId) : null,
      },
      include: includeStandard,
    });
  }

  async atualizar(id: number, dto: AtualizarAgendamentoDto) {
    await this.detalhar(id);

    const data: any = {};
    if (dto.clienteId !== undefined) data.clienteId = Number(dto.clienteId);
    if (dto.atendimentoId !== undefined)
      data.atendimentoId = dto.atendimentoId ? Number(dto.atendimentoId) : null;
    if (dto.enderecoId !== undefined)
      data.enderecoId = dto.enderecoId ? Number(dto.enderecoId) : null;
    if (dto.userId !== undefined)
      data.userId = dto.userId ? Number(dto.userId) : null;
    if (dto.tipo !== undefined) data.tipo = dto.tipo;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.dataPrevista !== undefined)
      data.dataPrevista = new Date(dto.dataPrevista);
    if (dto.dataRealizada !== undefined)
      data.dataRealizada = dto.dataRealizada ? new Date(dto.dataRealizada) : null;
    if (dto.observacoes !== undefined) data.observacoes = dto.observacoes;

    return this.prisma.agendamento.update({
      where: { id },
      data,
      include: includeStandard,
    });
  }

  async atualizarStatus(
    id: number,
    status: StatusAgendamento,
    dataRealizada?: string | null,
  ) {
    await this.detalhar(id);

    const data: any = { status };
    if (dataRealizada !== undefined) {
      data.dataRealizada = dataRealizada ? new Date(dataRealizada) : null;
    } else if (status === 'REALIZADO') {
      data.dataRealizada = new Date();
    }

    return this.prisma.agendamento.update({
      where: { id },
      data,
      include: includeStandard,
    });
  }

  async remover(id: number) {
    await this.detalhar(id);
    await this.prisma.agendamento.delete({ where: { id } });
  }
}
