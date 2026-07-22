import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { CloseOpportunityDto } from './dto/close-opportunity.dto';
import { OpportunityFilterDto } from './dto/opportunity-filter.dto';
import { OpportunityStatus } from '../../common/enums/crm.enums';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
  ) {}

  async create(
    dto: CreateOpportunityDto,
    userId?: string,
  ): Promise<Opportunity> {
    const finalValue =
      dto.value * (1 - (dto.discountPercent ?? 0) / 100);

    const opportunity = this.opportunityRepository.create({
      ...dto,
      finalValue,
      assignedUserId: dto.assignedUserId ?? userId,
    });
    return this.opportunityRepository.save(opportunity);
  }

  async findAll(filters: OpportunityFilterDto) {
    const { page = 1, limit = 20, search, status, assignedUserId, minValue, maxValue } =
      filters;
    const qb = this.opportunityRepository.createQueryBuilder('opp');

    if (search) {
      qb.where(
        '(opp.title LIKE :search OR opp.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('opp.status = :status', { status });
    }

    if (assignedUserId) {
      qb.andWhere('opp.assignedUserId = :assignedUserId', { assignedUserId });
    }

    if (minValue !== undefined) {
      qb.andWhere('opp.value >= :minValue', { minValue });
    }

    if (maxValue !== undefined) {
      qb.andWhere('opp.value <= :maxValue', { maxValue });
    }

    qb.orderBy('opp.createdAt', 'DESC');

    const [data, total] = await qb
      .leftJoinAndSelect('opp.leads', 'leads')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Opportunity> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: {
        assignedUser: true,
        leads: true,
      },
    });
    if (!opportunity)
      throw new NotFoundException(`Opportunity ${id} not found`);
    return opportunity;
  }

  async update(id: string, dto: UpdateOpportunityDto): Promise<Opportunity> {
    const opportunity = await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };
    if (data.value !== undefined || data.discountPercent !== undefined) {
      const value = (data.value as number) ?? opportunity.value;
      const discountPercent =
        (data.discountPercent as number) ?? opportunity.discountPercent;
      data.finalValue = value * (1 - discountPercent / 100);
    }

    Object.assign(opportunity, data);
    return this.opportunityRepository.save(opportunity);
  }

  async close(
    id: string,
    dto: CloseOpportunityDto,
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id);

    if (
      opportunity.status === OpportunityStatus.GANHA ||
      opportunity.status === OpportunityStatus.PERDIDA
    ) {
      throw new BadRequestException('Opportunity is already closed');
    }

    if (
      dto.status === OpportunityStatus.PERDIDA &&
      !dto.lossReason
    ) {
      throw new BadRequestException(
        'lossReason is required when closing as PERDIDA',
      );
    }

    opportunity.status = dto.status;
    opportunity.closedAt = new Date();
    if (dto.lossReason) {
      opportunity.lossReason = dto.lossReason;
    }

    return this.opportunityRepository.save(opportunity);
  }
}
