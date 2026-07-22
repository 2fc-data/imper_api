import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual, Between } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { Activity } from '../activities/entities/activity.entity';
import { User } from '../users/entities/user.entity';
import { OpportunityStatus, ActivityStatus } from '../../common/enums/crm.enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Opportunity)
    private readonly oppRepo: Repository<Opportunity>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async summary() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    const totalLeads = await this.leadRepo.count({
      where: { createdAt: MoreThanOrEqual(startOfThisMonth) },
    });

    const lastMonthLeads = await this.leadRepo.count({
      where: { createdAt: Between(startOfLastMonth, startOfThisMonth) },
    });

    const leadsGrowth =
      lastMonthLeads > 0
        ? `${Math.round(((totalLeads - lastMonthLeads) / lastMonthLeads) * 100)}%`
        : '+100%';

    const totalOpportunities = await this.oppRepo.count();

    const wonOpps = await this.oppRepo.find({
      where: { status: OpportunityStatus.GANHA },
    });
    const opportunitiesValue = wonOpps.reduce(
      (sum, o) => sum + Number(o.finalValue || o.value),
      0,
    );

    const totalProposals = await this.oppRepo
      .createQueryBuilder('opp')
      .where('opp.status != :status', {
        status: OpportunityStatus.ABERTA,
      })
      .getCount();

    const closedOpps = await this.oppRepo
      .createQueryBuilder('opp')
      .where('opp.status IN (:...statuses)', {
        statuses: [OpportunityStatus.GANHA, OpportunityStatus.PERDIDA],
      })
      .getCount();

    const conversionRate =
      closedOpps > 0
        ? Math.round((wonOpps.length / closedOpps) * 100)
        : 0;

    return {
      totalLeads,
      leadsGrowth,
      totalOpportunities,
      opportunitiesValue,
      totalProposals,
      conversionRate,
    };
  }

  async pipeline() {
    const results = await this.oppRepo
      .createQueryBuilder('opp')
      .select('opp.status', 'status')
      .addSelect('COUNT(opp.id)', 'count')
      .addSelect('COALESCE(SUM(opp.value), 0)', 'value')
      .groupBy('opp.status')
      .getRawMany();

    const stageOrder = [
      'aberta',
      'em_andamento',
      'ganha',
      'perdida',
    ];

    const stages = stageOrder.map((status) => {
      const found = results.find((r) => r.status === status);
      return {
        status,
        count: found ? Number(found.count) : 0,
        value: found ? Number(found.value) : 0,
      };
    });

    return { stages };
  }

  async revenue() {
    const now = new Date();
    const months: { month: string; revenue: number; opportunities: number }[] =
      [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const result = await this.oppRepo
        .createQueryBuilder('opp')
        .select('COALESCE(SUM(opp.finalValue), 0)', 'revenue')
        .addSelect('COUNT(opp.id)', 'opportunities')
        .where('opp.status = :status', { status: OpportunityStatus.GANHA })
        .andWhere('opp.closedAt BETWEEN :start AND :end', { start, end })
        .getRawOne();

      months.push({
        month: yearMonth,
        revenue: Number(result?.revenue || 0),
        opportunities: Number(result?.opportunities || 0),
      });
    }

    return { months };
  }

  async origins() {
    const results = await this.leadRepo
      .createQueryBuilder('lead')
      .select('lead.source', 'source')
      .addSelect('COUNT(lead.id)', 'count')
      .groupBy('lead.source')
      .orderBy('count', 'DESC')
      .getRawMany();

    const total = results.reduce((sum, r) => sum + Number(r.count), 0);

    const origins = results.map((r) => ({
      source: r.source,
      count: Number(r.count),
      percentage:
        total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
    }));

    return { origins };
  }

  async performers() {
    const results = await this.oppRepo
      .createQueryBuilder('opp')
      .innerJoin('opp.assignedUser', 'user')
      .select('user.id', 'userId')
      .addSelect('user.name', 'name')
      .addSelect('COUNT(DISTINCT lead.id)', 'leadsCount')
      .addSelect(
        'COALESCE(SUM(CASE WHEN opp.status = :ganha THEN opp.finalValue ELSE 0 END), 0)',
        'wonValue',
      )
      .setParameter('ganha', OpportunityStatus.GANHA)
      .innerJoin('opp.leads', 'lead')
      .groupBy('user.id')
      .addGroupBy('user.name')
      .orderBy('wonValue', 'DESC')
      .limit(10)
      .getRawMany();

    const performers = results.map((r) => ({
      userId: r.userId,
      name: r.name,
      leadsCount: Number(r.leadsCount),
      wonValue: Number(r.wonValue),
    }));

    return { performers };
  }

  async activities() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

    const overdue = await this.activityRepo.count({
      where: {
        status: ActivityStatus.PENDENTE,
        scheduledAt: LessThan(startOfToday),
      },
    });

    const today = await this.activityRepo.count({
      where: {
        status: ActivityStatus.PENDENTE,
        scheduledAt: Between(startOfToday, endOfToday),
      },
    });

    const thisWeek = await this.activityRepo.count({
      where: {
        status: ActivityStatus.PENDENTE,
        scheduledAt: Between(startOfToday, endOfWeek),
      },
    });

    const recent = await this.activityRepo.find({
      where: { status: ActivityStatus.PENDENTE },
      relations: { lead: true },
      order: { scheduledAt: 'DESC' },
      take: 5,
    });

    return {
      overdue,
      today,
      thisWeek,
      recent: recent.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        leadName: a.lead?.name || null,
        scheduledAt: a.scheduledAt,
      })),
    };
  }
}
