import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getResumo() {
    const [
      atendimentosNovos,
      orcamentosAbertos,
      osAndamento,
      materiaisLowStock,
    ] = await Promise.all([
      this.prisma.atendimento.count({
        where: { status: 'NOVO' },
      }),
      this.prisma.orcamento.count({
        where: { status: { in: ['RASCUNHO', 'ENVIADO'] } },
      }),
      this.prisma.ordemServico.count({
        where: { status: 'EM_ANDAMENTO' },
      }),
      this.prisma.material.count({
        where: {
          saldo: {
            saldo: { lte: 10 },
          },
        },
      }),
    ]);

    return {
      atendimentosNovos,
      orcamentosAbertos,
      osAndamento,
      baixaEstoque: materiaisLowStock,
    };
  }
}
