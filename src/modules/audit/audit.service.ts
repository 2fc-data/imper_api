import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditFilterDto } from './dto/audit-filter.dto';
import { TimelineFilterDto } from './dto/timeline-filter.dto';
import { AuditAction } from '../../common/enums/crm.enums';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async create(data: {
    action: AuditAction;
    entity: string;
    entityId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changedFields?: string[];
    description?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const log = this.auditRepository.create({
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      oldValues: data.oldValues,
      newValues: data.newValues,
      changedFields: data.changedFields,
      description: data.description,
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      entityIndex: data.entity,
      actionIndex: data.action,
    });
    return this.auditRepository.save(log);
  }

  async findAll(filters: AuditFilterDto) {
    const { page = 1, limit = 20, entity, entityId, action, userId } = filters;
    const qb = this.auditRepository.createQueryBuilder('audit');

    if (entity) qb.andWhere('audit.entity = :entity', { entity });
    if (entityId) qb.andWhere('audit.entityId = :entityId', { entityId });
    if (action) qb.andWhere('audit.action = :action', { action });
    if (userId) qb.andWhere('audit.userId = :userId', { userId });

    qb.orderBy('audit.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getTimeline(filters: TimelineFilterDto) {
    const { page = 1, limit = 20, entity, entityId, userId } = filters;
    const qb = this.auditRepository.createQueryBuilder('audit');
    qb.leftJoinAndSelect('audit.user', 'user');

    if (entity) qb.andWhere('audit.entity = :entity', { entity });
    if (entityId) qb.andWhere('audit.entityId = :entityId', { entityId });
    if (userId) qb.andWhere('audit.userId = :userId', { userId });

    qb.orderBy('audit.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
