import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Lead } from '../../leads/entities/lead.entity.js';
import { Opportunity } from '../../opportunities/entities/opportunity.entity.js';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, nullable: true })
  whatsapp: string;

  @Column({ length: 255, nullable: true })
  companyName: string;

  @Column({ length: 255, nullable: true })
  role: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Index('idx_contacts_lead')
  @Column({ type: 'varchar', length: 36, nullable: true })
  leadId: string;

  @Index('idx_contacts_opportunity')
  @Column({ type: 'varchar', length: 36, nullable: true })
  opportunityId: string;

  @Index('idx_contacts_assigned_user')
  @Column({ type: 'varchar', length: 36, nullable: true })
  assignedUserId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Lead, { nullable: true, eager: false })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ManyToOne(() => Opportunity, { nullable: true, eager: false })
  @JoinColumn({ name: 'opportunityId' })
  opportunity: Opportunity;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User;
}
