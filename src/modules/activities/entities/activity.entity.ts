import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ActivityType, ActivityStatus } from '../../../common/enums/crm.enums.js';
import { User } from '../../users/entities/user.entity.js';
import { Lead } from '../../leads/entities/lead.entity.js';
import { Opportunity } from '../../opportunities/entities/opportunity.entity.js';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.PENDENTE,
  })
  status: ActivityStatus;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  leadId: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  opportunityId: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Lead, (lead) => lead.activities, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ManyToOne(() => Opportunity, { nullable: true, eager: false })
  @JoinColumn({ name: 'opportunityId' })
  opportunity: Opportunity;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;
}
