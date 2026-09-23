import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import type { TipoAgendamento, StatusAgendamento } from '../schemas/enums.js';

export interface CriarAgendamentoDto {
  userId: number;
  atendimentoId?: number | null;
  enderecoId?: number | null;
  tipo?: TipoAgendamento;
  status?: StatusAgendamento;
  dataPrevista: string;
  dataRealizada?: string | null;
  observacoes?: string | null;
  enderecoNovo?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
}

export type AtualizarAgendamentoDto = Partial<CriarAgendamentoDto>;

const includeStandard = {
  user: { select: { id: true, nome: true, telefone: true } },
  criadoPor: { select: { id: true, nome: true } },
  endereco: true,
  atendimento: { select: { id: true, descricao: true, urgencia: true } },
};

@Injectable()
export class AgendamentoService {
  private readonly logger = new Logger(AgendamentoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: {
    status?: StatusAgendamento;
    tipo?: TipoAgendamento;
    userId?: number;
    dataDe?: string;
    dataAte?: string;
  }) {
    const where: any = {};

    if (params?.status) where.status = params.status;
    if (params?.tipo) where.tipo = params.tipo;
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
    this.logger.log(`[criar] dto=${JSON.stringify(dto)} criadoPorId=${criadoPorId}`);

    if (!dto.userId) {
      this.logger.warn('[criar] userId é obrigatório');
      throw new AppError(400, 'userId é obrigatório');
    }
    if (!dto.dataPrevista) {
      this.logger.warn('[criar] dataPrevista é obrigatória');
      throw new AppError(400, 'dataPrevista é obrigatória');
    }

    try {
      const enderecoId = await this.prisma.$transaction(async (tx) => {
        if (dto.enderecoNovo) {
          const e = dto.enderecoNovo;
          if (e.logradouro || e.bairro || e.cidade || e.cep) {
            this.logger.log(`[criar] criando endereco: userId=${dto.userId}`);
            const endereco = await tx.endereco.create({
              data: {
                userId: Number(dto.userId),
                logradouro: e.logradouro ?? '',
                numero: e.numero ?? '',
                complemento: e.complemento ?? '',
                bairro: e.bairro ?? '',
                cidade: e.cidade ?? '',
                estado: e.estado ?? '',
                cep: e.cep ?? '',
                principal: false,
              },
            });
            this.logger.log(`[criar] endereco criado id=${endereco.id}`);
            return endereco.id;
          }
        }
        return dto.enderecoId ? Number(dto.enderecoId) : null;
      });

      this.logger.log(`[criar] enderecoId=${enderecoId}, criando agendamento...`);
      const agendamento = await this.prisma.agendamento.create({
        data: {
          userId: Number(dto.userId),
          atendimentoId: dto.atendimentoId ? Number(dto.atendimentoId) : null,
          enderecoId,
          tipo: dto.tipo ?? 'VISITA',
          status: dto.status ?? 'PENDENTE',
          dataPrevista: new Date(dto.dataPrevista),
          dataRealizada: dto.dataRealizada ? new Date(dto.dataRealizada) : null,
          observacoes: dto.observacoes ?? null,
          criadoPorId: criadoPorId ? Number(criadoPorId) : null,
        },
        include: includeStandard,
      });

      this.logger.log(`[criar] agendamento criado id=${agendamento.id}`);
      return agendamento;
    } catch (err: any) {
      this.logger.error(`[criar] ERRO: ${err?.message}`, err?.stack);
      throw err;
    }
  }

  async atualizar(id: number, dto: AtualizarAgendamentoDto) {
    await this.detalhar(id);

    const data: any = {};
    if (dto.userId !== undefined) data.userId = Number(dto.userId);
    if (dto.atendimentoId !== undefined)
      data.atendimentoId = dto.atendimentoId ? Number(dto.atendimentoId) : null;
    if (dto.enderecoId !== undefined)
      data.enderecoId = dto.enderecoId ? Number(dto.enderecoId) : null;
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
