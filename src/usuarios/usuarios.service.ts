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
  cliente: {
    select: {
      id: true,
      cpfCnpj: true,
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
      const { cliente, ...rest } = u;
      return {
        ...rest,
        papeis: u.papeis.map(
          (up: {
            papel: { id: number; nome: string; descricao: string | null };
          }) => up.papel,
        ),
        cpfCnpj: cliente?.cpfCnpj ?? null,
        endereco: cliente?.enderecos?.[0] ?? null,
      };
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
    if (data.email) {
      const existente = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existente) throw new AppError(409, 'E-mail já cadastrado');
    }

    if (data.cpfCnpj) {
      const cpfLimpo = data.cpfCnpj.replace(/\D/g, '');
      const existente = await this.prisma.cliente.findUnique({
        where: { cpfCnpj: cpfLimpo },
      });
      if (existente) throw new AppError(409, 'CPF/CNPJ já cadastrado');
    }

    const papel = await this.prisma.papelRbac.findUnique({
      where: { id: data.papelId },
    });
    if (!papel) throw new AppError(400, 'Papel inválido');

    const senhaHash = await bcrypt.hash(data.senha, 10);
    const user = await this.prisma.$transaction(async (tx) => {
      let clienteId: number | null = null;

      if (data.cpfCnpj || data.cep) {
        const cliente = await tx.cliente.create({
          data: {
            nome: data.nome,
            cpfCnpj: data.cpfCnpj?.replace(/\D/g, '') ?? null,
            telefone: data.telefone ?? null,
            email: data.email ?? null,
          },
        });
        clienteId = cliente.id;

        if (data.endereco) {
          await tx.endereco.create({
            data: {
              clienteId: cliente.id,
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
      }

      const novoUser = await tx.user.create({
        data: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cargoId: data.cargoId ?? null,
          clienteId,
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
      include: { cliente: { include: { enderecos: { where: { principal: true } } } } },
    });
    if (!user) throw new AppError(404, 'Usuário não encontrado');

    const { cpfCnpj, cep, endereco, bairro, cidade, estado, numero, complemento, ...userData } = data;

    if (data.papelId !== undefined) {
      const papel = await this.prisma.papelRbac.findUnique({
        where: { id: data.papelId },
      });
      if (!papel) throw new AppError(400, 'Papel inválido');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const hasClienteData = cpfCnpj !== undefined || cep !== undefined || endereco !== undefined;

      if (hasClienteData) {
        if (user.clienteId) {
          if (cpfCnpj !== undefined) {
            const cpfLimpo = cpfCnpj.replace(/\D/g, '');
            if (cpfLimpo) {
              const existente = await tx.cliente.findUnique({ where: { cpfCnpj: cpfLimpo } });
              if (existente && existente.id !== user.clienteId) {
                throw new AppError(409, 'CPF/CNPJ já cadastrado');
              }
            }
            await tx.cliente.update({
              where: { id: user.clienteId },
              data: { cpfCnpj: cpfLimpo || null },
            });
          }

          if (endereco !== undefined && endereco) {
            const atual = user.cliente?.enderecos?.[0];
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
            } else if (user.cliente) {
              await tx.endereco.create({
                data: {
                  clienteId: user.clienteId,
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
        } else {
          const cpfLimpo = cpfCnpj?.replace(/\D/g, '') ?? null;
          if (cpfLimpo) {
            const existente = await tx.cliente.findUnique({ where: { cpfCnpj: cpfLimpo } });
            if (existente) throw new AppError(409, 'CPF/CNPJ já cadastrado');
          }

          const cliente = await tx.cliente.create({
            data: {
              nome: userData.nome ?? user.nome,
              cpfCnpj: cpfLimpo,
              telefone: userData.telefone ?? user.telefone,
              email: user.email,
            },
          });

          await tx.user.update({ where: { id }, data: { clienteId: cliente.id } });

          if (endereco) {
            await tx.endereco.create({
              data: {
                clienteId: cliente.id,
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
      }

      if (data.papelId !== undefined) {
        await tx.usuarioPapel.deleteMany({ where: { userId: id } });
        await tx.usuarioPapel.create({
          data: { userId: id, papelId: data.papelId },
        });
      }

      const result = await tx.user.update({
        where: { id },
        data: userData,
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
