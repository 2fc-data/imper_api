import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AtualizarServicoDto,
  CriarServicoDto,
} from './dto/servicos-admin.dto.js';

@Injectable()
export class ServicosAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params?: { q?: string }) {
    const where: Prisma.ServicoMarketingWhereInput = {};
    const q = params?.q?.trim();
    if (q) {
      where.OR = [{ titulo: { contains: q } }, { descricao: { contains: q } }];
    }
    return this.prisma.servicoMarketing.findMany({
      where,
      orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
    });
  }

  async criar(dto: CriarServicoDto) {
    await this.assertTituloLivre(dto.titulo);
    const ultimo = await this.prisma.servicoMarketing.findFirst({
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });
    return this.prisma.servicoMarketing.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        icone: dto.icone,
        ativo: dto.ativo ?? true,
        ordem: (ultimo?.ordem ?? 0) + 1,
      },
    });
  }

  async atualizar(id: number, dto: AtualizarServicoDto) {
    await this.detalhar(id);
    if (dto.titulo !== undefined) {
      await this.assertTituloLivre(dto.titulo, id);
    }
    return this.prisma.servicoMarketing.update({ where: { id }, data: dto });
  }

  async excluir(id: number) {
    await this.detalhar(id);
    try {
      await this.prisma.servicoMarketing.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new AppError(
          409,
          'Serviço vinculado a orçamentos — desative-o em vez de excluir',
        );
      }
      throw error;
    }
    return { ok: true };
  }

  private async detalhar(id: number) {
    const servico = await this.prisma.servicoMarketing.findUnique({
      where: { id },
    });
    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return servico;
  }

  private async assertTituloLivre(titulo: string, ignorarId?: number) {
    const existente = await this.prisma.servicoMarketing.findFirst({
      where: {
        titulo,
        ...(ignorarId !== undefined ? { NOT: { id: ignorarId } } : {}),
      },
      select: { id: true },
    });
    if (existente) {
      throw new AppError(409, 'Já existe serviço com esse título');
    }
  }
}
