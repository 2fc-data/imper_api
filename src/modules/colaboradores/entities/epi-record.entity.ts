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
import { EpiType, EpiStatus } from '../../../common/enums/crm.enums.js';
import { Colaborador } from './colaborador.entity.js';

@Entity('epi_records')
export class EpiRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_epi_records_colaborador')
  @Column({ type: 'varchar', length: 36 })
  colaboradorId: string;

  @Column({ type: 'enum', enum: EpiType })
  epiType: EpiType;

  @Column({ length: 255, nullable: true })
  descricao: string;

  @Column({ type: 'int', default: 1 })
  quantidade: number;

  @Column({ type: 'date' })
  dataEntrega: Date;

  @Column({ type: 'date', nullable: true })
  dataDevolucao: Date;

  @Index('idx_epi_records_status')
  @Column({ type: 'enum', enum: EpiStatus, default: EpiStatus.ENTREGUE })
  status: EpiStatus;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Colaborador, (c) => c.epis, { eager: false })
  @JoinColumn({ name: 'colaboradorId' })
  colaborador: Colaborador;
}
