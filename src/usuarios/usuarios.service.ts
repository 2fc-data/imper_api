import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';

const selectPublico = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  ativo: true,
  createdAt: true,
  cargoId: true,
  papeis: {
    select: {
      papel: { select: { id: true, nome: true, descricao: true } },
    },
  },
};

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    const users = await this.prisma.user.findMany({
      select: { ...selectPublico, cargo: { select: { id: true, nome: true } } },
      orderBy: { nome: 'asc' },
    });
    return users.map((u) => ({
      ...u,
      papeis: u.papeis.map(
        (up: {
          papel: { id: number; nome: string; descricao: string | null };
        }) => up.papel,
      ),
    }));
  }

  async criar(data: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    papelId: number;
    cargoId?: number | null;
  }) {
    const existente = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existente) throw new AppError(409, 'E-mail já cadastrado');

    const papel = await this.prisma.papelRbac.findUnique({
      where: { id: data.papelId },
    });
    if (!papel) throw new AppError(400, 'Papel inválido');

    const senhaHash = await bcrypt.hash(data.senha, 10);
    const user = await this.prisma.$transaction(async (tx) => {
      const novoUser = await tx.user.create({
        data: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cargoId: data.cargoId ?? null,
          senhaHash,
        },
        select: selectPublico,
      });
      await tx.usuarioPapel.create({
        data: { userId: novoUser.id, papelId: data.papelId },
      });
      return novoUser;
    });
    return { ...user, papeis: [papel] };
  }

  async atualizar(
    id: number,
    data: {
      nome?: string;
      telefone?: string;
      papelId?: number;
      cargoId?: number | null;
      ativo?: boolean;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, 'Usuário não encontrado');

    const updateData: Record<string, unknown> = { ...data };
    if (data.papelId !== undefined) {
      const papel = await this.prisma.papelRbac.findUnique({
        where: { id: data.papelId },
      });
      if (!papel) throw new AppError(400, 'Papel inválido');
      delete updateData.papelId;
      await this.prisma.usuarioPapel.deleteMany({ where: { userId: id } });
      await this.prisma.usuarioPapel.create({
        data: { userId: id, papelId: data.papelId },
      });
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: selectPublico,
    });
    const papeis = await this.prisma.usuarioPapel.findMany({
      where: { userId: id },
      select: { papel: { select: { id: true, nome: true, descricao: true } } },
    });
    return {
      ...updated,
      papeis: papeis.map(
        (up: {
          papel: { id: number; nome: string; descricao: string | null };
        }) => up.papel,
      ),
    };
  }

  async listarPapeis() {
    return this.prisma.papelRbac.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, descricao: true },
      orderBy: { nome: 'asc' },
    });
  }

  async listarCargos() {
    return this.prisma.cargo.findMany({
      select: { id: true, nome: true, descricao: true, ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  async criarCargo(data: { nome: string; descricao?: string }) {
    const existente = await this.prisma.cargo.findFirst({
      where: { nome: data.nome },
    });
    if (existente) throw new AppError(409, 'Já existe um cargo com esse nome');
    return this.prisma.cargo.create({
      data: { nome: data.nome, descricao: data.descricao ?? null },
      select: { id: true, nome: true, descricao: true, ativo: true },
    });
  }

  async atualizarCargo(
    id: number,
    data: { nome?: string; descricao?: string; ativo?: boolean },
  ) {
    const cargo = await this.prisma.cargo.findUnique({ where: { id } });
    if (!cargo) throw new AppError(404, 'Cargo não encontrado');
    if (data.nome && data.nome !== cargo.nome) {
      const existente = await this.prisma.cargo.findFirst({
        where: { nome: data.nome, id: { not: id } },
      });
      if (existente)
        throw new AppError(409, 'Já existe um cargo com esse nome');
    }
    return this.prisma.cargo.update({
      where: { id },
      data,
      select: { id: true, nome: true, descricao: true, ativo: true },
    });
  }

  async resetarSenha(id: number, novaSenha: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, 'Usuário não encontrado');
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await this.prisma.user.update({ where: { id }, data: { senhaHash } });
    return { ok: true };
  }
}
