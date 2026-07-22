import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProposalStatus } from '../../../common/enums/crm.enums.js';
import { Opportunity } from '../../opportunities/entities/opportunity.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { ProposalItem } from './proposal-item.entity.js';

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 30 })
  number: string;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ nullable: true, length: 64 })
  publicToken: string;

  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.RASCUNHO,
  })
  status: ProposalStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  finalValue: number;

  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ nullable: true })
  validUntil: Date;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  signedAt: Date;

  @Column({ nullable: true, length: 255 })
  signedBy: string;

  @Column({ nullable: true, length: 20 })
  signedDocument: string;

  @Column({ nullable: true })
  signedIp: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @Column({ nullable: true })
  opportunityId: string;

  @Column({ nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Opportunity, (opp) => opp.proposals, { nullable: true })
  @JoinColumn({ name: 'opportunityId' })
  opportunity: Opportunity;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => ProposalItem, (item) => item.proposal, { cascade: true })
  items: ProposalItem[];
}
