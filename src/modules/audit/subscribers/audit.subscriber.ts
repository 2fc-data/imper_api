import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction } from '../../../common/enums/crm.enums';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  private static trackedEntities = new Set([
    'Lead', 'Opportunity', 'Client', 'Activity', 'Proposal',
    'Contact', 'User', 'Notification',
  ]);

  listenTo(): string {
    return '*';
  }

  private getChangedFields(
    oldEntity: any,
    newEntity: any,
  ): { changedFields: string[]; oldValues: Record<string, any>; newValues: Record<string, any> } {
    const changedFields: string[] = [];
    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};

    if (!oldEntity || !newEntity) return { changedFields, oldValues, newValues };

    const allKeys = new Set([
      ...Object.keys(oldEntity),
      ...Object.keys(newEntity),
    ]);

    for (const key of allKeys) {
      if (key.startsWith('_') || key === 'createdAt' || key === 'updatedAt') continue;
      const oldVal = oldEntity[key];
      const newVal = newEntity[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changedFields.push(key);
        oldValues[key] = oldVal;
        newValues[key] = newVal;
      }
    }

    return { changedFields, oldValues, newValues };
  }

  async afterInsert(event: InsertEvent<any>): Promise<void> {
    const entityName = event.metadata.name;
    if (!AuditSubscriber.trackedEntities.has(entityName)) return;

    try {
      const auditRepo = event.connection.getRepository(AuditLog);
      const log = auditRepo.create({
        action: AuditAction.CREATE,
        entity: entityName,
        entityId: event.entity?.id,
        newValues: event.entity,
        entityIndex: entityName,
        actionIndex: AuditAction.CREATE,
      });
      await auditRepo.save(log);
    } catch (err) {
      console.error('AuditSubscriber.afterInsert error:', err);
    }
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    const entityName = event.metadata.name;
    if (!AuditSubscriber.trackedEntities.has(entityName)) return;

    const { changedFields, oldValues, newValues } = this.getChangedFields(
      event.databaseEntity,
      event.entity,
    );

    if (changedFields.length === 0) return;

    try {
      const auditRepo = event.connection.getRepository(AuditLog);
      const log = auditRepo.create({
        action: AuditAction.UPDATE,
        entity: entityName,
        entityId: event.entity?.id,
        oldValues,
        newValues,
        changedFields,
        entityIndex: entityName,
        actionIndex: AuditAction.UPDATE,
      });
      await auditRepo.save(log);
    } catch (err) {
      console.error('AuditSubscriber.afterUpdate error:', err);
    }
  }

  async afterRemove(event: RemoveEvent<any>): Promise<void> {
    const entityName = event.metadata.name;
    if (!AuditSubscriber.trackedEntities.has(entityName)) return;

    try {
      const auditRepo = event.connection.getRepository(AuditLog);
      const log = auditRepo.create({
        action: AuditAction.DELETE,
        entity: entityName,
        entityId: event.entity?.id,
        oldValues: event.entity,
        entityIndex: entityName,
        actionIndex: AuditAction.DELETE,
      });
      await auditRepo.save(log);
    } catch (err) {
      console.error('AuditSubscriber.afterRemove error:', err);
    }
  }
}
