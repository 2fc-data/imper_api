import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Role } from './role.entity.js';

@Entity('delegations')
export class Delegation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_delegations_delegator')
  @Column({ type: 'varchar', length: 36 })
  delegatorId: string;

  @Index('idx_delegations_delegate')
  @Column({ type: 'varchar', length: 36 })
  delegateId: string;

  @Index('idx_delegations_role')
  @Column({ type: 'varchar', length: 36 })
  roleId: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Role, (role) => role.delegations, { eager: false })
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
