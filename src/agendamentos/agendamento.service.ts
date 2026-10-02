import { Injectable, Logger } from '@nestjs/common';
import { assertAtendimentoAberto } from '../atendimentos/cascata.js';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { StatusAgendamento, TipoAgendamento } from '../schemas/enums.js';

export interface CriarAgendamentoDto {
  userId: number;
  atendimentoId: number;
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
  visita: true,
};

@Injectable()
export class AgendamentoService {
  private readonly logger = new Logger(AgendamentoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the minimum allowed date for scheduling, enforcing a
   * minimum of 2 business days in advance (skips Sat/Sun).
   */
  private calcularDataMinimaAgendamento(): Date {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const DIAS_UTEIS_MINIMOS = 2;
    let diasContados = 0;
    const cursor = new Date(hoje);

    while (diasContados < DIAS_UTEIS_MINIMOS) {
      cursor.setDate(cursor.getDate() + 1);
      const dow = cursor.getDay(); // 0=Dom, 6=Sáb
      if (dow !== 0 && dow !== 6) {
        diasContados++;
      }
    }

    return cursor;
  }

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

  listarDoUsuario(userId: number) {
    return this.listar({ userId });
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
    this.logger.log(
      `[criar] dto=${JSON.stringify(dto)} criadoPorId=${criadoPorId}`,
    );

    if (!dto.userId) {
      this.logger.warn('[criar] userId é obrigatório');
      throw new AppError(400, 'userId é obrigatório');
    }
    if (!dto.dataPrevista) {
      this.logger.warn('[criar] dataPrevista é obrigatória');
      throw new AppError(400, 'dataPrevista é obrigatória');
    }

    // Enforce minimum 2 business days in advance
    const dataMinima = this.calcularDataMinimaAgendamento();
    const dataPrevistaDate = new Date(dto.dataPrevista);
    dataPrevistaDate.setHours(0, 0, 0, 0);
    if (dataPrevistaDate < dataMinima) {
      const fmt = dataMinima.toLocaleDateString('pt-BR');
      this.logger.warn(
        `[criar] dataPrevista=${dto.dataPrevista} anterior à data mínima=${fmt}`,
      );
      throw new AppError(
        400,
        `O agendamento deve ser feito com no mínimo 2 dias úteis de antecedência. Data mínima permitida: ${fmt}`,
      );
    }

    if (dto.enderecoNovo && !dto.enderecoNovo.cep?.trim()) {
      this.logger.warn('[criar] enderecoNovo sem cep');
      throw new AppError(400, 'CEP é obrigatório quando enviado enderecoNovo');
    }

    if (!dto.atendimentoId) {
      this.logger.warn('[criar] atendimentoId é obrigatório');
      throw new AppError(400, 'atendimentoId é obrigatório');
    }

    const atendimento = await this.prisma.atendimento.findUnique({
      where: { id: Number(dto.atendimentoId) },
      select: { status: true, visitaSolicitada: true },
    });
    if (!atendimento) {
      this.logger.warn(
        `[criar] atendimento inexistente id=${dto.atendimentoId}`,
      );
      throw new AppError(404, 'Atendimento não encontrado');
    }
    assertAtendimentoAberto(atendimento.status);
    const tipo = dto.tipo ?? 'VISITA';
    if (tipo === 'VISITA' && !atendimento.visitaSolicitada) {
      this.logger.warn(
        `[criar] atendimento ${dto.atendimentoId} sem visita solicitada`,
      );
      throw new AppError(400, 'Atendimento não tem visita solicitada');
    }

    try {
      const agendamento = await this.prisma.$transaction(async (tx) => {
        let enderecoId: number | null = dto.enderecoId
          ? Number(dto.enderecoId)
          : null;
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
            enderecoId = endereco.id;
          }
        }

        this.logger.log(
          `[criar] enderecoId=${enderecoId}, criando agendamento...`,
        );
        const ag = await tx.agendamento.create({
          data: {
            userId: Number(dto.userId),
            atendimentoId: Number(dto.atendimentoId),
            enderecoId,
            tipo,
            status: dto.status ?? 'PENDENTE',
            dataPrevista: new Date(dto.dataPrevista),
            dataRealizada: dto.dataRealizada
              ? new Date(dto.dataRealizada)
              : null,
            observacoes: dto.observacoes ?? null,
            criadoPorId: criadoPorId ? Number(criadoPorId) : null,
          },
          include: includeStandard,
        });

        if (tipo === 'VISITA') {
          const visitaExistente = await tx.visitaTecnica.findUnique({
            where: { agendamentoId: ag.id },
          });
          if (!visitaExistente) {
            this.logger.log(
              `[criar] Criando VisitaTecnica vinculada ao agendamento id=${ag.id}`,
            );
            await tx.visitaTecnica.create({
              data: {
                atendimentoId: ag.atendimentoId,
                agendamentoId: ag.id,
                dataPrevista: ag.dataPrevista,
                enderecoId: ag.enderecoId,
                status: 'AGENDADA',
              },
            });
          }
        }

        return ag;
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
      data.dataRealizada = dto.dataRealizada
        ? new Date(dto.dataRealizada)
        : null;
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
}
