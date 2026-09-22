import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import type { CanalAtendimento, Urgencia, StatusAtendimento } from '../schemas/enums.js';

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
      where.OR = [
        { cliente: { nome: { contains: params.q } } },
      ];
    }

    if (params?.status) {
      where.status = params.status;
    }

    return this.prisma.atendimento.findMany({
      where,
      include: { cliente: { select: { id: true, nome: true, telefone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async detalhar(id: number) {
    const item = await this.prisma.atendimento.findUnique({
      where: { id },
      include: { cliente: { select: { id: true, nome: true, telefone: true } } },
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
    clienteId?: number;
    atendenteId?: number;
    clienteNome?: string;
    clienteTelefone?: string;
    clienteEmail?: string;
    clienteCpfCnpj?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      let clienteId = data.clienteId ?? null;

      // Inline client creation: if no clienteId but nome+telefone provided, create user
      if (!clienteId && data.clienteNome && data.clienteTelefone) {
        const telefone = data.clienteTelefone.replace(/\D/g, '');
        const cpfCnpj = data.clienteCpfCnpj?.replace(/\D/g, '') ?? null;

        // Check for existing client by phone, email, or cpf
        const existing = await tx.user.findFirst({
          where: {
            OR: [
              { telefone },
              ...(data.clienteEmail ? [{ email: data.clienteEmail }] : []),
              ...(cpfCnpj ? [{ cpfCnpj }] : []),
            ],
          },
        });

        if (existing) {
          clienteId = existing.id;
        } else {
          const senhaHash = await bcrypt.hash(Math.random().toString(36).slice(2), 10);
          const user = await tx.user.create({
            data: {
              nome: data.clienteNome,
              telefone,
              email: data.clienteEmail ?? null,
              cpfCnpj,
              senhaHash,
            },
          });

          // Assign CLIENTE role if it exists
          const papelCliente = await tx.papelRbac.findFirst({
            where: { nome: 'CLIENTE' },
          });
          if (papelCliente) {
            await tx.usuarioPapel.create({
              data: { userId: user.id, papelId: papelCliente.id },
            });
          }

          clienteId = user.id;
        }
      }

      return tx.atendimento.create({
        data: {
          canal: data.canal,
          urgencia: data.urgencia ?? 'NORMAL',
          status: 'NOVO',
          descricao: data.descricao ?? null,
          clienteId,
          atendenteId: data.atendenteId ?? null,
        },
        include: { cliente: { select: { id: true, nome: true, telefone: true } } },
      });
    });
  }

  async atualizarStatus(id: number, status: StatusAtendimento) {
    return this.prisma.atendimento.update({
      where: { id },
      data: { status },
    });
  }
}