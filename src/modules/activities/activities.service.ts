import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { ActivityFilterDto } from './dto/activity-filter.dto';
import { ActivityStatus, NotificationType } from '../../common/enums/crm.enums';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    dto: CreateActivityDto,
    userId?: string,
  ): Promise<Activity> {
    const activity = this.activityRepository.create({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
      userId: dto.userId ?? userId,
    });
    const saved = await this.activityRepository.save(activity);

    const notifyUserId = dto.userId ?? userId;
    if (notifyUserId) {
      try {
        const notification = await this.notificationsService.create({
          type: NotificationType.ATIVIDADE_AGENDADA,
          title: 'Atividade agendada',
          message: `Atividade "${activity.title}" agendada para ${new Date(activity.scheduledAt).toLocaleDateString('pt-BR')}.`,
          userId: notifyUserId,
          relatedId: activity.id,
        });
        this.notificationsGateway.sendNotificationToUser(notifyUserId, notification);
      } catch (err) {
        this.logger.error('Failed to send activity-scheduled notification', err);
      }
    }

    return saved;
  }

  async findAll(filters: ActivityFilterDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      leadId,
      userId,
      dateFrom,
      dateTo,
    } = filters;
    const qb = this.activityRepository.createQueryBuilder('act');

    if (search) {
      qb.where('(act.title LIKE :search OR act.description LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('act.status = :status', { status });
    }

    if (leadId) {
      qb.andWhere('act.leadId = :leadId', { leadId });
    }

    if (userId) {
      qb.andWhere('act.userId = :userId', { userId });
    }

    if (dateFrom) {
      qb.andWhere('act.scheduledAt >= :dateFrom', {
        dateFrom: new Date(dateFrom),
      });
    }

    if (dateTo) {
      qb.andWhere('act.scheduledAt <= :dateTo', {
        dateTo: new Date(dateTo),
      });
    }

    qb.orderBy('act.scheduledAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: {
        lead: true,
        user: true,
      },
    });
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return activity;
  }

  async update(id: string, dto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.scheduledAt) {
      data.scheduledAt = new Date(dto.scheduledAt);
    }

    Object.assign(activity, data);
    return this.activityRepository.save(activity);
  }

  async complete(
    id: string,
    dto: CompleteActivityDto,
  ): Promise<Activity> {
    const activity = await this.findOne(id);

    if (activity.status === ActivityStatus.CONCLUIDA) {
      throw new BadRequestException('Activity is already completed');
    }

    activity.status = ActivityStatus.CONCLUIDA;
    activity.completedAt = dto.completedAt
      ? new Date(dto.completedAt)
      : new Date();
    const saved = await this.activityRepository.save(activity);

    if (activity.userId) {
      try {
        const notification = await this.notificationsService.create({
          type: NotificationType.META_ATINGIDA,
          title: 'Atividade concluída',
          message: `Atividade "${activity.title}" foi concluída.`,
          userId: activity.userId,
          relatedId: activity.id,
        });
        this.notificationsGateway.sendNotificationToUser(activity.userId, notification);
      } catch (err) {
        this.logger.error('Failed to send activity-completed notification', err);
      }
    }

    return saved;
  }
}
