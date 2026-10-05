import { Injectable } from '@nestjs/common';
import { AgendamentoService } from '../agendamentos/agendamento.service.js';
import { AtendimentoService } from '../atendimentos/atendimento.service.js';
import { AppError } from '../lib/errors.js';
import { OrcamentosService } from '../orcamentos/orcamentos.service.js';
import { OsService } from '../os/os.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AtualizarPerfilInput } from '../schemas/portal.js';

@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly atendimentos: AtendimentoService,
    private readonly agendamentos: AgendamentoService,
    private readonly orcamentos: OrcamentosService,
    private readonly os: OsService,
  ) {}

  listarAtendimentos(userId: number) {
    return this.atendimentos.listarDoUsuario(userId);
  }

  async detalharAtendimento(userId: number, id: number) {
    const item = await this.atendimentos.detalharParaUsuario(userId, id);
    const logs = await this.atendimentos.listarLogs(id);
    return { ...item, logs };
  }

  listarAgendamentos(userId: number) {
    return this.agendamentos.listarDoUsuario(userId);
  }

  listarOrcamentos(userId: number) {
    return this.orcamentos.listarDoUsuario(userId);
  }

  detalharOrcamento(userId: number, id: number) {
    return this.orcamentos.detalharParaUsuario(userId, id);
  }

  async aprovarOrcamento(userId: number, id: number) {
    await this.orcamentos.detalharParaUsuario(userId, id);
    return this.orcamentos.aprovar(id, userId);
  }

  listarOs(userId: number) {
    return this.os.listarDoUsuario(userId);
  }

  detalharOs(userId: number, id: number) {
    return this.os.detalharParaUsuario(userId, id);
  }

  async atualizarPerfil(userId: number, data: AtualizarPerfilInput) {
    const usuario = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!usuario) throw new AppError(404, 'Usuário não encontrado');

    const dados: Record<string, string | null> = {};

    if (data.nome !== undefined) {
      const dup = await this.prisma.user.findFirst({
        where: { nome: data.nome, id: { not: userId } },
      });
      if (dup && dup.id !== userId) {
        throw new AppError(409, 'Nome já cadastrado por outro usuário');
      }
      dados.nome = data.nome;
    }

    if (data.email !== undefined) {
      const email = data.email.trim() || null;
      if (email) {
        const dup = await this.prisma.user.findFirst({
          where: { email, id: { not: userId } },
        });
        if (dup && dup.id !== userId) {
          throw new AppError(409, 'E-mail já cadastrado por outro usuário');
        }
      }
      dados.email = email;
    }

    if (data.telefone !== undefined) {
      const digitos = data.telefone.replace(/\D/g, '');
      if (digitos) {
        const dup = await this.prisma.user.findFirst({
          where: {
            OR: [
              { telefone: data.telefone },
              { telefone: digitos },
              { telefone: { contains: digitos } },
            ],
            id: { not: userId },
          },
        });
        if (dup && dup.id !== userId) {
          throw new AppError(409, 'Telefone já cadastrado por outro usuário');
        }
        dados.telefone = digitos;
      } else {
        dados.telefone = null;
      }
    }

    if (data.cpfCnpj !== undefined) {
      const digitos = data.cpfCnpj.replace(/\D/g, '');
      if (digitos) {
        const dup = await this.prisma.user.findUnique({
          where: { cpfCnpj: digitos },
        });
        if (dup && dup.id !== userId) {
          throw new AppError(409, 'CPF/CNPJ já cadastrado');
        }
        dados.cpfCnpj = digitos;
      } else {
        dados.cpfCnpj = null;
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: dados,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpfCnpj: true,
      },
    });
  }
}
