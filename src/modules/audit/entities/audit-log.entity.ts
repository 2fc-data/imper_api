import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AuditAction } from '../../../common/enums/crm.enums.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ length: 100 })
  entity: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  entityId: string;

  @Column({ type: 'json', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  changedFields: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Index('idx_audit_user')
  @Column({ type: 'varchar', length: 36, nullable: true })
  userId: string;

  @Index('idx_audit_entity')
  @Column({ length: 100 })
  entityIndex: string;

  @Index('idx_audit_action')
  @Column({ type: 'enum', enum: AuditAction })
  actionIndex: AuditAction;

  @Index('idx_audit_created')
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;
}
