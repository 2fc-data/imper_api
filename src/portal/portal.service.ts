import { Injectable } from '@nestjs/common';
import { AgendamentoService } from '../agendamentos/agendamento.service.js';
import { AtendimentoService } from '../atendimentos/atendimento.service.js';
import { AppError } from '../lib/errors.js';
import { notificarPapeis } from '../lib/notificacao.js';
import { OrcamentosService } from '../orcamentos/orcamentos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AtualizarPerfilInput, AvaliarAtividadePortalInput } from '../schemas/portal.js';

@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly atendimentos: AtendimentoService,
    private readonly agendamentos: AgendamentoService,
    private readonly orcamentos: OrcamentosService,
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
    const orcamento = await this.orcamentos.detalharParaUsuario(userId, id);
    if (orcamento.status !== 'ENVIADO') {
      throw new AppError(
        409,
        'Somente orçamentos enviados podem ser aprovados pelo cliente',
      );
    }
    const resultado = await this.orcamentos.aprovar(id, userId);
    await this.notificarDecisaoOrcamento(
      orcamento.codigo,
      'APROVADO',
      id,
      resultado.obra?.id,
    );
    return resultado;
  }

  async recusarOrcamento(userId: number, id: number, motivo?: string) {
    const orcamento = await this.orcamentos.detalharParaUsuario(userId, id);
    if (orcamento.status !== 'ENVIADO') {
      throw new AppError(
        409,
        'Somente orçamentos enviados podem ser recusados pelo cliente',
      );
    }
    const resultado = await this.orcamentos.recusar(id, motivo);
    await this.notificarDecisaoOrcamento(
      orcamento.codigo,
      'RECUSADO',
      id,
      undefined,
      motivo,
    );
    return resultado;
  }

  private async notificarDecisaoOrcamento(
    codigo: string,
    decisao: 'APROVADO' | 'RECUSADO',
    orcamentoId: number,
    obraId?: number,
    motivo?: string,
  ) {
    const aprovadores = await this.prisma.user.findMany({
      where: {
        ativo: true,
        papeis: {
          some: {
            papel: {
              nome: 'ADMINISTRATIVO',
            },
          },
        },
      },
      select: { id: true },
    });
    if (aprovadores.length === 0) return;

    const titulo =
      decisao === 'APROVADO'
        ? `Orçamento ${codigo} aprovado pelo cliente`
        : `Orçamento ${codigo} recusado pelo cliente`;
    const motivoLimpo = motivo?.trim();
    const mensagem =
      decisao === 'APROVADO'
        ? `O cliente aprovou o orçamento ${codigo}${obraId ? ` e a obra #${obraId} foi gerada` : ''}.`
        : motivoLimpo
          ? `O cliente recusou o orçamento ${codigo}. Motivo: ${motivoLimpo}`
          : `O cliente recusou o orçamento ${codigo} sem informar motivo.`;
    const link =
      decisao === 'APROVADO' && obraId
        ? `/obras/${obraId}`
        : `/orcamentos?abrir=${orcamentoId}`;

    await this.prisma.notificacao.createMany({
      data: aprovadores.map((u) => ({
        userId: u.id,
        titulo,
        mensagem,
        link,
      })),
    });
  }

  listarObras(userId: number) {
    return this.prisma.obra.findMany({
      where: {
        OR: [{ userId }, { acessos: { some: { userId, ativo: true } } }],
      },
      include: {
        endereco: true,
        etapas: {
          include: {
            atividades: {
              include: { execucoes: { select: { status: true } } },
            },
          },
        },
      },
    });
  }

  async detalharObra(userId: number, id: number) {
    const obra = await this.prisma.obra.findFirst({
      where: {
        id,
        OR: [{ userId }, { acessos: { some: { userId, ativo: true } } }],
      },
      include: {
        endereco: true,
        etapas: {
          include: {
            atividades: {
              include: {
                execucoes: { include: { checklist: true, separacoes: true } },
              },
            },
          },
        },
      },
    });
    if (!obra) throw new AppError(404, 'Obra não encontrada');
    return obra;
  }

  async avaliarAtividade(
    userId: number,
    obraId: number,
    atividadeId: string,
    data: AvaliarAtividadePortalInput,
  ) {
    const obra = await this.prisma.obra.findFirst({
      where: {
        id: obraId,
        OR: [{ userId }, { acessos: { some: { userId, ativo: true } } }],
      },
      select: {
        id: true,
        codigo: true,
        user: { select: { nome: true } },
      },
    });
    if (!obra) throw new AppError(404, 'Obra não encontrada');

    const atividade = await this.prisma.obraAtividade.findFirst({
      where: {
        id: atividadeId,
        obraEtapa: { obraId },
      },
      include: {
        execucoes: true,
        obraEtapa: true,
      },
    });
    if (!atividade) throw new AppError(404, 'Atividade não encontrada na obra');

    // Valida se está concluída ou se tem execução
    const estaConcluida = atividade.execucoes.some(
      (e) => e.status === 'CONCLUIDA',
    );
    if (!estaConcluida) {
      throw new AppError(
        400,
        'Apenas atividades concluídas podem ser avaliadas pelo cliente',
      );
    }

    const agora = new Date();
    const precisaRefazer = data.nota <= 3;

    // Atualiza a atividade
    const atividadeAtualizada = await this.prisma.$transaction(async (tx) => {
      const ativ = await tx.obraAtividade.update({
        where: { id: atividadeId },
        data: {
          avaliacaoCliente: data.nota,
          comentarioAvaliacao: data.comentario?.trim() || null,
          avaliadoEm: agora,
        },
      });

      // Se a nota for <= 3, atualiza a execução para REFAZER
      if (precisaRefazer) {
        await tx.execucaoAtividade.updateMany({
          where: { atividadeId },
          data: { status: 'REFAZER' },
        });
      }

      return ativ;
    });

    // Se nota <= 3, dispara notificação para Admin e Supervisor de Obras
    if (precisaRefazer) {
      const nomeCliente = obra.user?.nome || 'Cliente';
      const motivoTxt = data.comentario?.trim()
        ? ` Motivo: "${data.comentario.trim()}"`
        : '';
      await notificarPapeis(
        this.prisma,
        ['ADMIN', 'ADMINISTRATIVO', 'SUPERVISOR', 'SUPERVISOR OBRAS'],
        {
          titulo: `Atividade precisa ser refeita (Nota ${data.nota}/5) — Obra ${obra.codigo}`,
          mensagem: `${nomeCliente} avaliou a atividade "${atividade.descricao}" com nota ${data.nota}/5.${motivoTxt} Verifique a obra e oriente o retrabalho.`,
          link: `/obras/${obra.id}`,
          obraId: obra.id,
        },
      );
    }

    return atividadeAtualizada;
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
