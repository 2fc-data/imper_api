import { Injectable } from '@nestjs/common';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AtualizarVisitaDto, CriarVisitaDto } from './dto/visitas.dto.js';

@Injectable()
export class VisitasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CriarVisitaDto) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id: dto.agendamentoId },
      select: {
        id: true,
        atendimentoId: true,
        dataPrevista: true,
        enderecoId: true,
      },
    });
    if (!agendamento) {
      throw new AppError(404, 'Agendamento não encontrado');
    }
    if (!agendamento.atendimentoId) {
      throw new AppError(400, 'Agendamento sem atendimento vinculado');
    }

    const existente = await this.prisma.visitaTecnica.findUnique({
      where: { agendamentoId: dto.agendamentoId },
      select: { id: true },
    });
    if (existente) {
      throw new AppError(400, 'Já existe visita para este agendamento');
    }

    return this.prisma.visitaTecnica.create({
      data: {
        atendimentoId: agendamento.atendimentoId,
        agendamentoId: agendamento.id,
        dataPrevista: agendamento.dataPrevista,
        enderecoId: agendamento.enderecoId,
        status: 'AGENDADA',
        tecnicoId: dto.tecnicoId ?? null,
        resultado: null,
        constatacao: null,
        relatorio: null,
      },
    });
  }

  async listar(params?: { atendimentoId?: number }) {
    const where = params?.atendimentoId
      ? { atendimentoId: params.atendimentoId }
      : {};

    return this.prisma.visitaTecnica.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async atualizar(id: number, dto: AtualizarVisitaDto) {
    const visita = await this.prisma.visitaTecnica.findUnique({
      where: { id },
    });
    if (!visita) {
      throw new AppError(404, 'Visita não encontrada');
    }

    const mudouStatus =
      dto.status !== undefined && dto.status !== visita.status;
    if (mudouStatus) {
      if (visita.status !== 'AGENDADA') {
        throw new AppError(
          400,
          'Somente visitas AGENDADA podem mudar de status',
        );
      }
      if (dto.status !== 'REALIZADA' && dto.status !== 'CANCELADA') {
        throw new AppError(400, 'Status inválido para visita');
      }
    }

    const data: any = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.resultado !== undefined) data.resultado = dto.resultado;
    if (dto.constatacao !== undefined) data.constatacao = dto.constatacao;
    if (dto.relatorio !== undefined) data.relatorio = dto.relatorio;
    if (dto.necessitaOrcamento !== undefined)
      data.necessitaOrcamento = dto.necessitaOrcamento;
    if (dto.necessitaObra !== undefined) data.necessitaObra = dto.necessitaObra;

    const transicionouParaRealizada = mudouStatus && dto.status === 'REALIZADA';
    if (transicionouParaRealizada) {
      data.dataRealizada = new Date();
    }

    const updated = await this.prisma.visitaTecnica.update({
      where: { id },
      data,
    });

    if (transicionouParaRealizada && visita.agendamentoId != null) {
      await this.prisma.agendamento.update({
        where: { id: visita.agendamentoId },
        data: {
          status: 'REALIZADO',
          dataRealizada: updated.dataRealizada,
        },
      });
    }

    return updated;
  }
}
