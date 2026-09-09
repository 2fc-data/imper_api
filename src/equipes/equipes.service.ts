import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EquipesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { osId?: number; status?: string }) {
    const where: Record<string, unknown> = {};
    if (params?.osId) where.osId = params.osId;
    if (params?.status) where.status = params.status;

    return this.prisma.equipe.findMany({
      where,
      include: {
        os: { select: { id: true, codigo: true } },
        lider: { select: { id: true, nome: true } },
        membros: {
          include: {
            usuario: { select: { id: true, nome: true, telefone: true } },
          },
        },
        atividades: {
          include: { catalogoAtividade: { select: { nome: true } } },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async detalhar(id: string) {
    const equipe = await this.prisma.equipe.findUnique({
      where: { id },
      include: {
        os: { select: { id: true, codigo: true } },
        lider: { select: { id: true, nome: true } },
        membros: {
          include: {
            usuario: { select: { id: true, nome: true, telefone: true } },
          },
        },
        atividades: {
          include: {
            catalogoAtividade: { select: { nome: true } },
            checklist: true,
          },
        },
      },
    });
    if (!equipe) throw new NotFoundException(`Equipe ${id} não encontrada`);
    return equipe;
  }

  async criar(data: {
    nome: string;
    osId: number;
    liderId: number;
    membros?: { usuarioId: number; funcao?: string }[];
  }) {
    return this.prisma.equipe.create({
      data: {
        nome: data.nome,
        osId: data.osId,
        liderId: data.liderId,
        membros: data.membros
          ? {
              create: data.membros.map((m) => ({
                usuarioId: m.usuarioId,
                funcao: m.funcao,
              })),
            }
          : undefined,
      },
      include: {
        lider: { select: { id: true, nome: true } },
        membros: { include: { usuario: { select: { id: true, nome: true } } } },
      },
    });
  }

  async atualizar(
    id: string,
    data: {
      nome?: string;
      liderId?: number;
      status?: string;
    },
  ) {
    await this.detalhar(id);
    return this.prisma.equipe.update({
      where: { id },
      data: {
        ...data,
        status: data.status as any,
      },
      include: {
        lider: { select: { id: true, nome: true } },
        membros: { include: { usuario: { select: { id: true, nome: true } } } },
      },
    });
  }

  async adicionarMembro(
    equipeId: string,
    data: { usuarioId: number; funcao?: string },
  ) {
    await this.detalhar(equipeId);
    return this.prisma.membroEquipe.create({
      data: {
        equipeId,
        usuarioId: data.usuarioId,
        funcao: data.funcao,
      },
      include: { usuario: { select: { id: true, nome: true } } },
    });
  }

  async removerMembro(membroId: string) {
    return this.prisma.membroEquipe.delete({ where: { id: membroId } });
  }

  async excluir(id: string) {
    const equipe = await this.detalhar(id);
    if (equipe.status === 'EM_EXECUCAO') {
      throw new Error('Não é possível excluir equipe em execução');
    }
    await this.prisma.membroEquipe.deleteMany({ where: { equipeId: id } });
    return this.prisma.equipe.delete({ where: { id } });
  }
}
