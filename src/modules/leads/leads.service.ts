import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { MoveLeadDto } from './dto/move-lead.dto';
import { AssignLeadDto } from './dto/assign-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationType } from '../../common/enums/crm.enums';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(dto: CreateLeadDto, userId?: string): Promise<Lead> {
    const lead = this.leadsRepository.create({
      ...dto,
      assignedUserId: dto.assignedUserId ?? userId,
    });
    return this.leadsRepository.save(lead);
  }

  async findAll(filters: LeadFilterDto) {
    const { page = 1, limit = 20, search, status, source, assignedUserId, minValue, maxValue } = filters;
    const qb = this.leadsRepository.createQueryBuilder('lead');

    if (search) {
      qb.where('(lead.name LIKE :search OR lead.companyName LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('lead.status = :status', { status });
    }

    if (source) {
      qb.andWhere('lead.source = :source', { source });
    }

    if (assignedUserId) {
      qb.andWhere('lead.assignedUserId = :assignedUserId', { assignedUserId });
    }

    if (minValue !== undefined) {
      qb.andWhere('lead.estimatedValue >= :minValue', { minValue });
    }

    if (maxValue !== undefined) {
      qb.andWhere('lead.estimatedValue <= :maxValue', { maxValue });
    }

    qb.orderBy('lead.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadsRepository.findOne({
      where: { id },
      relations: {
        assignedUser: true,
        opportunity: true,
        activities: true,
      },
    });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    Object.assign(lead, dto);
    return this.leadsRepository.save(lead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadsRepository.remove(lead);
  }

  async move(id: string, dto: MoveLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    const previousStatus = lead.status;
    lead.status = dto.status;
    const saved = await this.leadsRepository.save(lead);

    if (lead.assignedUserId) {
      try {
        const notification = await this.notificationsService.create({
          type: NotificationType.LEAD_MOVIDO,
          title: 'Lead movido de etapa',
          message: `O lead "${lead.name}" foi movido de "${previousStatus}" para "${dto.status}".`,
          userId: lead.assignedUserId,
          relatedId: lead.id,
        });
        this.notificationsGateway.sendNotificationToUser(lead.assignedUserId, notification);
      } catch (err) {
        this.logger.error('Failed to send lead-moved notification', err);
      }
    }

    return saved;
  }

  async assign(id: string, dto: AssignLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.assignedUserId = dto.assignedUserId;
    const saved = await this.leadsRepository.save(lead);

    if (dto.assignedUserId) {
      try {
        const notification = await this.notificationsService.create({
          type: NotificationType.LEAD_ATRIBUIDO,
          title: 'Lead atribuído a você',
          message: `O lead "${lead.name}" foi atribuído para você.`,
          userId: dto.assignedUserId,
          relatedId: lead.id,
        });
        this.notificationsGateway.sendNotificationToUser(dto.assignedUserId, notification);
      } catch (err) {
        this.logger.error('Failed to send lead-assigned notification', err);
      }
    }

    return saved;
  }
}
