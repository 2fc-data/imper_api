import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CanalAtendimento,
  StatusAtendimento,
  TipoAtendimento,
  Urgencia,
} from '../schemas/enums.js';

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

    return this.prisma.atendimento.findMany({
      where,
      include: { user: { select: { id: true, nome: true, telefone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async detalhar(id: number) {
    const item = await this.prisma.atendimento.findUnique({
      where: { id },
      include: { user: { select: { id: true, nome: true, telefone: true } } },
    });

    if (!item) {
      throw new AppError(404, 'Atendimento não encontrado');
    }

    return item;
  }

  async criar(data: {
    canal: CanalAtendimento;
    urgencia?: Urgencia;
    descricao?: string;
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
          userId,
          atendenteId: data.atendenteId ?? null,
        },
        include: { user: { select: { id: true, nome: true, telefone: true } } },
      });
    });
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
