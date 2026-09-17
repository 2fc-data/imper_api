import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppError } from '../lib/errors.js';

const DIA_SEMANA_MAP: Record<number, string> = {
  0: 'DOMINGO',
  1: 'SEGUNDA',
  2: 'TERCA',
  3: 'QUARTA',
  4: 'QUINTA',
  5: 'SEXTA',
  6: 'SABADO',
};

@Injectable()
export class DisponibilidadeService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Helpers ----------

  private timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
    return aStart < bEnd && bStart < aEnd;
  }

  private validateTimeRange(horaInicio: string, horaFim: string) {
    if (horaInicio >= horaFim) {
      throw new AppError(400, 'Hora início deve ser anterior à hora fim');
    }
  }

  // ---------- PADRÕES ----------

  async listarPadroes(userId?: number) {
    const where: any = {};
    if (userId) where.userId = userId;
    return this.prisma.disponibilidadePadrao.findMany({
      where,
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  async criarPadrao(data: {
    userId: number;
    diaSemana: number;
    horaInicio: string;
    horaFim: string;
    capacidade?: number;
  }) {
    this.validateTimeRange(data.horaInicio, data.horaFim);

    // Check overlapping patterns for same user/day
    const existing = await this.prisma.disponibilidadePadrao.findMany({
      where: {
        userId: data.userId,
        diaSemana: data.diaSemana,
        ativo: true,
      },
    });

    for (const padrao of existing) {
      if (this.timesOverlap(data.horaInicio, data.horaFim, padrao.horaInicio, padrao.horaFim)) {
        throw new AppError(400, `Conflito com padrão existente: ${padrao.horaInicio}-${padrao.horaFim}`);
      }
    }

    return this.prisma.disponibilidadePadrao.create({
      data: {
        userId: data.userId,
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio,
        horaFim: data.horaFim,
        capacidade: data.capacidade ?? 1,
      },
    });
  }

  async atualizarPadrao(id: number, data: Record<string, any>) {
    const padrao = await this.prisma.disponibilidadePadrao.findUnique({ where: { id } });
    if (!padrao) throw new AppError(404, 'Padrão não encontrado');
    return this.prisma.disponibilidadePadrao.update({ where: { id }, data });
  }

  async excluirPadrao(id: number) {
    const padrao = await this.prisma.disponibilidadePadrao.findUnique({ where: { id } });
    if (!padrao) throw new AppError(404, 'Padrão não encontrado');
    await this.prisma.disponibilidadePadrao.delete({ where: { id } });
  }

  // ---------- DATAS ----------

  async listarDatas(userId?: number, mes?: number, ano?: number) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (mes && ano) {
      where.data = {
        gte: new Date(ano, mes - 1, 1),
        lt: new Date(ano, mes, 1),
      };
    }
    return this.prisma.disponibilidadeData.findMany({
      where,
      orderBy: { data: 'asc' },
    });
  }

  async criarData(data: {
    userId: number;
    data: string;
    horaInicio: string;
    horaFim: string;
    capacidade?: number;
    excluida?: boolean;
  }) {
    this.validateTimeRange(data.horaInicio, data.horaFim);
    return this.prisma.disponibilidadeData.create({
      data: {
        userId: data.userId,
        data: new Date(data.data),
        horaInicio: data.horaInicio,
        horaFim: data.horaFim,
        capacidade: data.capacidade ?? 1,
        excluida: data.excluida ?? false,
      },
    });
  }

  async atualizarData(id: number, data: Record<string, any>) {
    const registro = await this.prisma.disponibilidadeData.findUnique({ where: { id } });
    if (!registro) throw new AppError(404, 'Registro não encontrado');
    return this.prisma.disponibilidadeData.update({ where: { id }, data });
  }

  async excluirData(id: number) {
    const registro = await this.prisma.disponibilidadeData.findUnique({ where: { id } });
    if (!registro) throw new AppError(404, 'Registro não encontrado');
    await this.prisma.disponibilidadeData.delete({ where: { id } });
  }

  // ---------- SLOTS ----------

  async gerarSlots(mes: number, ano: number, userId?: number) {
    if (mes < 1 || mes > 12) {
      throw new AppError(400, 'Mês deve ser entre 1 e 12');
    }

    const primeiroDia = new Date(ano, mes - 1, 1);
    const ultimoDia = new Date(ano, mes, 0);

    // 1. Get recurring patterns
    const padroesWhere: any = { ativo: true };
    if (userId) padroesWhere.userId = userId;
    const padroes = await this.prisma.disponibilidadePadrao.findMany({ where: padroesWhere });

    // 2. Get specific date overrides
    const datasWhere: any = {
      data: { gte: primeiroDia, lte: ultimoDia },
    };
    if (userId) datasWhere.userId = userId;
    const datas = await this.prisma.disponibilidadeData.findMany({ where: datasWhere });

    // 3. Get existing agendamentos for this month
    const agendamentosWhere: any = {
      tipo: 'VISITA',
      status: { not: 'CANCELADO' },
      dataPrevista: { gte: primeiroDia, lte: ultimoDia },
    };
    if (userId) agendamentosWhere.userId = userId;
    const agendamentos = await this.prisma.agendamento.findMany({ where: agendamentosWhere });

    // 4. Generate slots
    const slots: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const dataAtual = new Date(ano, mes - 1, dia);
      if (dataAtual < today) continue;

      const diaSemana = dataAtual.getDay();
      if (diaSemana === 0) continue; // No Sunday slots

      const dataStr = dataAtual.toISOString().split('T')[0];

      // Check specific date override
      const override = datas.find((d) => {
        const dStr = d.data.toISOString().split('T')[0];
        return dStr === dataStr;
      });

      if (override) {
        if (override.excluida) continue;

        const ocupados = agendamentos.filter((a) => {
          const aDate = a.dataPrevista.toISOString().split('T')[0];
          const aTime = a.dataPrevista.toISOString().substring(11, 16);
          return aDate === dataStr && aTime >= override.horaInicio && aTime < override.horaFim;
        }).length;

        const disponivel = override.capacidade === 0 || ocupados < override.capacidade;
        slots.push({
          data: dataStr,
          diaSemana: DIA_SEMANA_MAP[diaSemana],
          horaInicio: override.horaInicio,
          horaFim: override.horaFim,
          capacidade: override.capacidade,
          ocupados,
          disponivel,
        });
      } else {
        // Use recurring patterns
        const padroesDoDia = padroes.filter((p) => p.diaSemana === diaSemana);
        for (const padrao of padroesDoDia) {
          const ocupados = agendamentos.filter((a) => {
            const aDate = a.dataPrevista.toISOString().split('T')[0];
            const aTime = a.dataPrevista.toISOString().substring(11, 16);
            return aDate === dataStr && aTime >= padrao.horaInicio && aTime < padrao.horaFim;
          }).length;

          const disponivel = padrao.capacidade === 0 || ocupados < padrao.capacidade;
          slots.push({
            data: dataStr,
            diaSemana: DIA_SEMANA_MAP[diaSemana],
            horaInicio: padrao.horaInicio,
            horaFim: padrao.horaFim,
            capacidade: padrao.capacidade,
            ocupados,
            disponivel,
          });
        }
      }
    }

    return { slots };
  }
}
