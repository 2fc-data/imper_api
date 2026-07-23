import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ClientStatus } from '../../../common/enums/crm.enums.js';
import { Opportunity } from '../../opportunities/entities/opportunity.entity.js';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  companyName: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, nullable: true })
  whatsapp: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 2, nullable: true })
  state: string;

  @Column({ length: 14, nullable: true })
  cpfCnpj: string;

  @Column({ length: 255, nullable: true })
  contactPerson: string;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    default: ClientStatus.ATIVO,
  })
  status: ClientStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  totalPurchases: number;

  @Column({ type: 'int', default: 0 })
  completedProjects: number;

  @Index('idx_clients_cpf_cnpj')
  @Column({ length: 14, nullable: true })
  cpfCnpjIndex: string;

  @Index('idx_clients_status')
  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.ATIVO })
  statusIndex: ClientStatus;

  @Column({ type: 'varchar', length: 36, nullable: true })
  sourceOpportunityId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Opportunity, (o) => o.client)
  opportunities: Opportunity[];
}
