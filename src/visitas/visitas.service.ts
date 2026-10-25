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

    return this.detalhar(id);
  }

  async detalhar(id: number) {
    const visita = await this.prisma.visitaTecnica.findUnique({
      where: { id },
      include: {
        itens: {
          orderBy: { createdAt: 'asc' },
          include: {
            etapa: { select: { id: true, nome: true, ordem: true } },
            subServico: { select: { id: true, nome: true } },
            verbo: { select: { id: true, nome: true } },
            objeto: { select: { id: true, nome: true } },
            local: { select: { id: true, nome: true } },
            caracteristica: { select: { id: true, nome: true } },
            unidade: { select: { id: true, nome: true } },
          },
        },
      },
    });
    if (!visita) {
      throw new AppError(404, 'Visita não encontrada');
    }
    return visita;
  }

  async adicionarItem(
    visitaId: number,
    dto: import('./dto/visita-itens.dto.js').CriarVisitaItemDto,
  ) {
    const visita = await this.prisma.visitaTecnica.findUnique({
      where: { id: visitaId },
      select: { id: true, status: true },
    });
    if (!visita) {
      throw new AppError(404, 'Visita não encontrada');
    }

    await this.prisma.visitaItem.create({
      data: {
        visitaId,
        etapaId: Number(dto.etapaId),
        subServicoId: Number(dto.subServicoId),
        verboId: Number(dto.verboId),
        objetoId: Number(dto.objetoId),
        localId: dto.localId ? Number(dto.localId) : null,
        caracteristicaId: dto.caracteristicaId
          ? Number(dto.caracteristicaId)
          : null,
        unidadeId: dto.unidadeId ? Number(dto.unidadeId) : null,
        quantidade: dto.quantidade != null ? dto.quantidade : null,
        areaM2: dto.areaM2 != null ? dto.areaM2 : null,
        observacoes: dto.observacoes?.trim() || null,
      },
    });

    return this.detalhar(visitaId);
  }

  async removerItem(visitaId: number, itemId: number) {
    const item = await this.prisma.visitaItem.findFirst({
      where: { id: itemId, visitaId },
      select: { id: true },
    });
    if (!item) {
      throw new AppError(404, 'Item não encontrado na visita');
    }

    await this.prisma.visitaItem.delete({
      where: { id: itemId },
    });

    return this.detalhar(visitaId);
  }
}
