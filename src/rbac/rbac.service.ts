import { Injectable } from '@nestjs/common';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPapeis() {
    const papeis = await this.prisma.papelRbac.findMany({
      include: { permissoes: { include: { permissao: true } } },
      orderBy: { nome: 'asc' },
    });
    return {
      papeis: papeis.map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        permissoes: p.permissoes.map((pp) => ({
          id: pp.permissao.id,
          chave: pp.permissao.chave,
          descricao: pp.permissao.descricao,
          categoria: pp.permissao.categoria,
        })),
      })),
    };
  }

  async criarPapel(data: { nome: string; descricao?: string }) {
    const exists = await this.prisma.papelRbac.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, 'Papel já existe');
    const papel = await this.prisma.papelRbac.create({
      data: { nome: normalize(data.nome), descricao: data.descricao },
    });
    return { papel };
  }

  async atualizarPapel(
    id: number,
    data: { nome?: string; descricao?: string },
  ) {
    if (data.nome) {
      const exists = await this.prisma.papelRbac.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, 'Papel já existe');
    }
    const papel = await this.prisma.papelRbac.update({
      where: { id },
      data: {
        nome: data.nome ? normalize(data.nome) : undefined,
        descricao: data.descricao,
      },
    });
    return { papel };
  }

  async excluirPapel(id: number) {
    const hasUsers = await this.prisma.usuarioPapel.findFirst({
      where: { papelId: id },
    });
    if (hasUsers)
      throw new AppError(409, 'Papel vinculado a usuários — remova-os antes');
    await this.prisma.papelPermissao.deleteMany({ where: { papelId: id } });
    return this.prisma.papelRbac.delete({ where: { id } });
  }

  async listarPermissoes() {
    const permissoes = await this.prisma.permissao.findMany({
      orderBy: { categoria: 'asc' },
    });
    return { permissoes };
  }

  async listarPermissoesPorPapel(papelId: number) {
    const papel = await this.prisma.papelRbac.findUnique({
      where: { id: papelId },
      include: { permissoes: { select: { permissaoId: true } } },
    });
    if (!papel) throw new AppError(404, 'Papel não encontrado');
    const permissoesIds = papel.permissoes.map((pp) => pp.permissaoId);
    return { permissoesIds };
  }

  async definirPermissoes(papelId: number, permissoesIds: number[]) {
    const papel = await this.prisma.papelRbac.findUnique({
      where: { id: papelId },
    });
    if (!papel) throw new AppError(404, 'Papel não encontrado');
    await this.prisma.papelPermissao.deleteMany({ where: { papelId } });
    if (permissoesIds.length === 0) return { ok: true };
    await this.prisma.papelPermissao.createMany({
      data: permissoesIds.map((permissaoId) => ({ papelId, permissaoId })),
    });
    return { ok: true };
  }
}
