import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(q: string) {
    if (!q || q.trim().length < 3) {
      return [];
    }

    const termo = q.trim();

    return this.prisma.cliente.findMany({
      where: {
        OR: [
          { nome: { contains: termo } },
          { telefone: { contains: termo } },
          { email: { contains: termo } },
          { cpfCnpj: { contains: termo } },
        ],
      },
      take: 10,
      orderBy: { nome: 'asc' },
    });
  }

  async detalhar(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: { enderecos: true },
    });

    if (!cliente) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    return cliente;
  }

  async criar(data: { nome: string; cpfCnpj?: string; telefone?: string; email?: string }) {
    const nomeUpper = data.nome.trim().toUpperCase();

    if (data.cpfCnpj) {
      const exists = await this.prisma.cliente.findFirst({
        where: { cpfCnpj: data.cpfCnpj },
      });
      if (exists) {
        throw new AppError(409, 'CPF/CNPJ já cadastrado');
      }
    }

    return this.prisma.cliente.create({
      data: {
        nome: nomeUpper,
        cpfCnpj: data.cpfCnpj || null,
        telefone: data.telefone || null,
        email: data.email || null,
      },
    });
  }

  async atualizar(id: number, data: { nome?: string; cpfCnpj?: string; telefone?: string; email?: string }) {
    await this.detalhar(id);

    if (data.cpfCnpj) {
      const exists = await this.prisma.cliente.findFirst({
        where: { cpfCnpj: data.cpfCnpj, NOT: { id } },
      });
      if (exists) {
        throw new AppError(409, 'CPF/CNPJ já cadastrado');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.nome !== undefined) updateData.nome = data.nome.trim().toUpperCase();
    if (data.cpfCnpj !== undefined) updateData.cpfCnpj = data.cpfCnpj || null;
    if (data.telefone !== undefined) updateData.telefone = data.telefone || null;
    if (data.email !== undefined) updateData.email = data.email || null;

    return this.prisma.cliente.update({
      where: { id },
      data: updateData,
    });
  }
}
