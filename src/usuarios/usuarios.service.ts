import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

const selectPublico = {
  id: true,
  nome: true,
  email: true,
  cpfCnpj: true,
  telefone: true,
  ativo: true,
  createdAt: true,
  cargoId: true,
  papeis: {
    select: {
      papel: { select: { id: true, nome: true, descricao: true } },
    },
  },
  enderecos: {
    where: { principal: true },
    take: 1,
    select: {
      id: true,
      logradouro: true,
      numero: true,
      complemento: true,
      bairro: true,
      cidade: true,
      estado: true,
      cep: true,
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
    return users.map((u) => {
      const { enderecos, ...rest } = u;
      return {
        ...rest,
        papeis: u.papeis.map(
          (up: {
            papel: { id: number; nome: string; descricao: string | null };
          }) => up.papel,
        ),
        endereco: enderecos[0] ?? null,
      };
    });
  }

  async buscar(q: string) {
    const where: any = {
      OR: [
        { nome: { contains: q } },
        { email: { contains: q } },
        { telefone: { contains: q } },
        { cpfCnpj: { contains: q } },
      ],
    };
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpfCnpj: true,
      },
      orderBy: { nome: 'asc' },
      take: 20,
    });
  }

  async criar(data: {
    nome: string;
    email?: string;
    senha: string;
    telefone?: string;
    papelId: number;
    cargoId?: number | null;
    cpfCnpj?: string;
    cep?: string;
    endereco?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    numero?: string;
    complemento?: string;
  }) {
    if (data.nome) {
      const nomeTrimmed = data.nome.trim();
      const existenteNome = await this.prisma.user.findFirst({
        where: { nome: { equals: nomeTrimmed, mode: 'insensitive' } },
      });
      if (existenteNome) throw new AppError(409, 'Nome já cadastrado');
    }

    if (data.email) {
      const emailTrimmed = data.email.trim();
      const existenteEmail = await this.prisma.user.findFirst({
        where: { email: { equals: emailTrimmed, mode: 'insensitive' } },
      });
      if (existenteEmail) throw new AppError(409, 'E-mail já cadastrado');
    }

    if (data.telefone) {
      const telLimpo = data.telefone.replace(/\D/g, '');
      if (telLimpo) {
        const existenteTel = await this.prisma.user.findFirst({
          where: {
            OR: [
              { telefone: data.telefone },
              { telefone: telLimpo },
              { telefone: { contains: telLimpo } },
            ],
          },
        });
        if (existenteTel) throw new AppError(409, 'Telefone já cadastrado');
      }
    }

    if (data.cpfCnpj) {
      const cpfLimpo = data.cpfCnpj.replace(/\D/g, '');
      if (cpfLimpo) {
        const existenteCpf = await this.prisma.user.findFirst({
          where: { cpfCnpj: cpfLimpo },
        });
        if (existenteCpf) throw new AppError(409, 'CPF/CNPJ já cadastrado');
      }
    }

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
          cpfCnpj: data.cpfCnpj?.replace(/\D/g, '') ?? null,
          senhaHash,
        },
        select: selectPublico,
      });
      await tx.usuarioPapel.create({
        data: { userId: novoUser.id, papelId: data.papelId },
      });

      if (data.endereco) {
        await tx.endereco.create({
          data: {
            userId: novoUser.id,
            logradouro: data.endereco,
            numero: data.numero ?? null,
            complemento: data.complemento ?? null,
            bairro: data.bairro ?? null,
            cidade: data.cidade ?? null,
            estado: data.estado ?? null,
            cep: data.cep?.replace(/\D/g, '') ?? null,
            principal: true,
          },
        });
      }

      return novoUser;
    });
    return { ...user, papeis: [papel] };
  }

  async atualizar(
    id: number,
    data: {
      nome?: string;
      email?: string;
      telefone?: string;
      papelId?: number;
      cargoId?: number | null;
      ativo?: boolean;
      cpfCnpj?: string;
      cep?: string;
      endereco?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      numero?: string;
      complemento?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { enderecos: { where: { principal: true } } },
    });
    if (!user) throw new AppError(404, 'Usuário não encontrado');

    const { cpfCnpj, cep, endereco, bairro, cidade, estado, numero, complemento, papelId: _papelId, ...userData } = data;

    if (data.nome !== undefined && data.nome) {
      const nomeTrimmed = data.nome.trim();
      const existenteNome = await this.prisma.user.findFirst({
        where: {
          nome: { equals: nomeTrimmed, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (existenteNome) throw new AppError(409, 'Nome já cadastrado por outro usuário');
    }

    if (data.email !== undefined && data.email) {
      const emailTrimmed = data.email.trim();
      const existenteEmail = await this.prisma.user.findFirst({
        where: {
          email: { equals: emailTrimmed, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (existenteEmail) throw new AppError(409, 'E-mail já cadastrado por outro usuário');
    }

    if (data.telefone !== undefined && data.telefone) {
      const telLimpo = data.telefone.replace(/\D/g, '');
      if (telLimpo) {
        const existenteTel = await this.prisma.user.findFirst({
          where: {
            id: { not: id },
            OR: [
              { telefone: data.telefone },
              { telefone: telLimpo },
              { telefone: { contains: telLimpo } },
            ],
          },
        });
        if (existenteTel) throw new AppError(409, 'Telefone já cadastrado por outro usuário');
      }
    }

    if (data.papelId !== undefined) {
      const papel = await this.prisma.papelRbac.findUnique({
        where: { id: data.papelId },
      });
      if (!papel) throw new AppError(400, 'Papel inválido');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      let cpfCnpjFinal: string | null | undefined = undefined;

      if (cpfCnpj !== undefined) {
        const cpfLimpo = cpfCnpj.replace(/\D/g, '');
        if (cpfLimpo) {
          const existente = await tx.user.findUnique({ where: { cpfCnpj: cpfLimpo } });
          if (existente && existente.id !== id) {
            throw new AppError(409, 'CPF/CNPJ já cadastrado');
          }
        }
        cpfCnpjFinal = cpfLimpo || null;
      }

      if (endereco !== undefined && endereco) {
        const atual = user.enderecos?.[0];
        if (atual) {
          await tx.endereco.update({
            where: { id: atual.id },
            data: {
              logradouro: endereco,
              numero: numero ?? null,
              complemento: complemento ?? null,
              bairro: bairro ?? null,
              cidade: cidade ?? null,
              estado: estado ?? null,
              cep: cep?.replace(/\D/g, '') ?? atual.cep,
            },
          });
        } else {
          await tx.endereco.create({
            data: {
            userId: id,
              logradouro: endereco,
              numero: numero ?? null,
              complemento: complemento ?? null,
              bairro: bairro ?? null,
              cidade: cidade ?? null,
              estado: estado ?? null,
              cep: cep?.replace(/\D/g, '') ?? null,
              principal: true,
            },
          });
        }
      }

      if (data.papelId !== undefined) {
        await tx.usuarioPapel.deleteMany({ where: { userId: id } });
        await tx.usuarioPapel.create({
          data: { userId: id, papelId: data.papelId },
        });
      }

      const result = await tx.user.update({
        where: { id },
        data: { ...userData, ...(cpfCnpjFinal !== undefined && { cpfCnpj: cpfCnpjFinal }) },
        select: selectPublico,
      });

      const papeis = await tx.usuarioPapel.findMany({
        where: { userId: id },
        select: { papel: { select: { id: true, nome: true, descricao: true } } },
      });

      return {
        ...result,
        papeis: papeis.map(
          (up: { papel: { id: number; nome: string; descricao: string | null } }) => up.papel,
        ),
      };
    });

    return updated;
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
      where: { nome: normalize(data.nome) },
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
    if (data.nome) {
      const existente = await this.prisma.cargo.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
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
