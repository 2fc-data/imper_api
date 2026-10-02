import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CanalAtendimento,
  StatusAtendimento,
  TipoAtendimento,
  Urgencia,
} from '../schemas/enums.js';
import {
  assertAtendimentoAberto,
  type ContextoAcoes,
  calcularProximasAcoes,
  type StatusCascata,
  validarTransicao,
} from './cascata.js';

const includeCtx = {
  user: { select: { id: true, nome: true, telefone: true } },
  _count: {
    select: {
      visitas: { where: { status: { not: 'CANCELADA' } } },
      agendamentos: {
        where: { tipo: 'VISITA', status: { not: 'CANCELADO' } },
      },
    },
  },
} satisfies Prisma.AtendimentoInclude;

function comProximas<
  T extends {
    status: StatusAtendimento;
    visitaSolicitada: boolean;
    _count: { visitas: number; agendamentos: number };
  },
>(item: T) {
  return {
    ...item,
    proximasAcoes: calcularProximasAcoes({
      status: item.status as StatusCascata,
      visitaSolicitada: item.visitaSolicitada,
      temAgendamentoVisita: item._count.agendamentos > 0,
      temVisita: item._count.visitas > 0,
    } satisfies ContextoAcoes),
  };
}

@Injectable()
export class AtendimentoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: {
    q?: string;
    status?: string;
    criadoDe?: string;
    criadoAte?: string;
    atualizadoDe?: string;
    atualizadoAte?: string;
  }) {
    const where: any = {};

    if (params?.q) {
      where.OR = [{ user: { nome: { contains: params.q } } }];
    }

    if (params?.status) {
      where.status = params.status;
    }

    const itens = await this.prisma.atendimento.findMany({
      where,
      include: includeCtx,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return itens.map(comProximas);
  }

  async detalhar(id: number) {
    const item = await this.prisma.atendimento.findUnique({
      where: { id },
      include: includeCtx,
    });

    if (!item) {
      throw new AppError(404, 'Atendimento não encontrado');
    }

    return comProximas(item);
  }

  async listarDoUsuario(userId: number) {
    const itens = await this.prisma.atendimento.findMany({
      where: { userId },
      include: includeCtx,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return itens.map(comProximas);
  }

  async detalharParaUsuario(userId: number, id: number) {
    const dono = await this.prisma.atendimento.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!dono) throw new AppError(404, 'Atendimento não encontrado');
    return this.detalhar(id);
  }

  async criar(data: {
    canal: CanalAtendimento;
    urgencia?: Urgencia;
    descricao?: string;
    visitaSolicitada?: boolean;
    userId?: number;
    atendenteId?: number;
    userName?: string;
    userTelefone?: string;
    userEmail?: string;
    userCpfCnpj?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      let userId = data.userId ?? null;

      // Inline client creation: if no userId but nome+telefone provided, create user
      if (!userId && data.userName && data.userTelefone) {
        const telefone = data.userTelefone.replace(/\D/g, '');
        const cpfCnpj = data.userCpfCnpj?.replace(/\D/g, '') ?? null;

        // Check for existing client by phone, email, or cpf
        const existing = await tx.user.findFirst({
          where: {
            OR: [
              { telefone },
              ...(data.userEmail ? [{ email: data.userEmail }] : []),
              ...(cpfCnpj ? [{ cpfCnpj }] : []),
            ],
          },
        });

        if (existing) {
          userId = existing.id;
        } else {
          const senhaHash = await bcrypt.hash(
            Math.random().toString(36).slice(2),
            10,
          );
          const user = await tx.user.create({
            data: {
              nome: data.userName,
              telefone,
              email: data.userEmail ?? null,
              cpfCnpj,
              senhaHash,
            },
          });

          // Assign CLIENTE role if it exists
          const papelUser = await tx.papelRbac.findFirst({
            where: { nome: 'CLIENTE' },
          });
          if (papelUser) {
            await tx.usuarioPapel.create({
              data: { userId: user.id, papelId: papelUser.id },
            });
          }

          userId = user.id;
        }
      }

      return tx.atendimento.create({
        data: {
          canal: data.canal,
          urgencia: data.urgencia ?? 'NORMAL',
          status: 'NOVO',
          descricao: data.descricao ?? null,
          visitaSolicitada: data.visitaSolicitada ?? false,
          userId,
          atendenteId: data.atendenteId ?? null,
        },
        include: { user: { select: { id: true, nome: true, telefone: true } } },
      });
    });
  }

  async atualizar(id: number, dto: { visitaSolicitada?: boolean }) {
    const item = await this.prisma.atendimento.findUnique({ where: { id } });
    if (!item) {
      throw new AppError(404, 'Atendimento não encontrado');
    }
    if (dto.visitaSolicitada !== undefined) {
      await this.prisma.atendimento.update({
        where: { id },
        data: { visitaSolicitada: dto.visitaSolicitada },
      });
    }
    return this.detalhar(id);
  }

  async encaminharParaOrcamento(id: number, atendenteId?: number) {
    const atual = await this.prisma.atendimento.findUnique({ where: { id } });
    if (!atual) {
      throw new AppError(404, 'Atendimento não encontrado');
    }

    assertAtendimentoAberto(atual.status as StatusCascata);
    if (atual.status === 'ORCAMENTAMENTO') {
      return this.detalhar(id);
    }

    const passos: StatusAtendimento[] =
      atual.status === 'NOVO'
        ? ['EM_ANDAMENTO', 'ORCAMENTAMENTO']
        : atual.status === 'EM_ANDAMENTO'
          ? ['ORCAMENTAMENTO']
          : [];

    let de: StatusCascata = atual.status as StatusCascata;
    for (const para of passos) {
      validarTransicao(de, para as StatusCascata);
      de = para as StatusCascata;
    }

    if (passos.length === 0) {
      throw new AppError(
        400,
        `Transição inválida: ${atual.status} → ORCAMENTAMENTO`,
      );
    }

    if (atual.visitaSolicitada) {
      await this.assertVisitaRealizada(id);
    }

    let statusAtual: StatusAtendimento = atual.status;
    for (const para of passos) {
      await this.prisma.$transaction(async (tx) => {
        await tx.atendimento.update({
          where: { id },
          data: { status: para },
        });
        await tx.atendimentoLog.create({
          data: {
            atendimentoId: id,
            atendenteId: atendenteId ?? null,
            tipo: 'STATUS',
            statusDe: statusAtual,
            statusPara: para,
          },
        });
      });
      statusAtual = para;
    }

    return this.detalhar(id);
  }

  async atualizarStatus(
    id: number,
    status: StatusAtendimento,
    atendenteId?: number,
  ) {
    const atual = await this.prisma.atendimento.findUnique({ where: { id } });
    if (!atual) {
      throw new AppError(404, 'Atendimento não encontrado');
    }

    assertAtendimentoAberto(atual.status as StatusCascata);

    if (atual.status !== status) {
      validarTransicao(atual.status as StatusCascata, status as StatusCascata);
      if (status === 'ORCAMENTAMENTO' && atual.visitaSolicitada) {
        await this.assertVisitaRealizada(id);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.atendimento.update({
        where: { id },
        data: { status },
      });
      if (atual.status !== status) {
        await tx.atendimentoLog.create({
          data: {
            atendimentoId: id,
            atendenteId: atendenteId ?? null,
            tipo: 'STATUS',
            statusDe: atual.status,
            statusPara: status,
          },
        });
      }
      return updated;
    });
  }

  private async assertVisitaRealizada(atendimentoId: number): Promise<void> {
    const visita = await this.prisma.visitaTecnica.findFirst({
      where: {
        atendimentoId,
        status: 'REALIZADA',
        agendamento: { is: { status: 'REALIZADO' } },
      },
      select: { id: true },
    });
    if (!visita) {
      throw new AppError(
        400,
        'Visita técnica deve ser realizada antes de iniciar o orçamento',
      );
    }
  }

  async listarLogs(atendimentoId: number) {
    await this.detalhar(atendimentoId);
    return this.prisma.atendimentoLog.findMany({
      where: { atendimentoId },
      include: { atendente: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async criarLog(
    atendimentoId: number,
    dto: {
      descricao?: string;
      tipo?: TipoAtendimento;
      statusDe?: StatusAtendimento;
      statusPara?: StatusAtendimento;
    },
    atendenteId?: number,
  ) {
    await this.detalhar(atendimentoId);

    const descricao = dto.descricao?.trim();
    const tipo: TipoAtendimento = dto.tipo ?? 'TEXTO';
    if (tipo === 'TEXTO' && !descricao) {
      throw new AppError(400, 'descricao é obrigatória para logs de texto');
    }

    return this.prisma.atendimentoLog.create({
      data: {
        atendimentoId,
        atendenteId: atendenteId ?? null,
        tipo,
        descricao: descricao ?? null,
        statusDe: dto.statusDe ?? null,
        statusPara: dto.statusPara ?? null,
      },
      include: { atendente: { select: { id: true, nome: true } } },
    });
  }
}
