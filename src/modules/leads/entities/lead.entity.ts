import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { LeadStatus, LeadSource } from '../../../common/enums/crm.enums.js';
import { User } from '../../users/entities/user.entity.js';
import { Opportunity } from '../../opportunities/entities/opportunity.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  companyName: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, nullable: true })
  whatsapp: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NOVO,
  })
  status: LeadStatus;

  @Column({
    type: 'enum',
    enum: LeadSource,
  })
  source: LeadSource;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  estimatedValue: number;

  @Column({ length: 100, nullable: true })
  servico: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Index('idx_leads_assigned_user')
  @Column({ type: 'varchar', length: 36, nullable: true })
  assignedUserId: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  opportunityId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastContactAt: Date;

  @Column({ type: 'int', default: 0 })
  contactAttempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User;

  @ManyToOne(() => Opportunity, (opportunity) => opportunity.leads, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'opportunityId' })
  opportunity: Opportunity;

  @OneToMany(() => Activity, (activity) => activity.lead)
  activities: Activity[];
}
