import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Asset } from './asset.entity.js';
import { Colaborador } from '../../colaboradores/entities/colaborador.entity.js';

@Entity('asset_assignments')
export class AssetAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_asset_assignments_asset')
  @Column({ type: 'varchar', length: 36 })
  assetId: string;

  @Index('idx_asset_assignments_colaborador')
  @Column({ type: 'varchar', length: 36 })
  colaboradorId: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Asset, (a) => a.assignments, { eager: false })
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

  @ManyToOne(() => Colaborador, { eager: false })
  @JoinColumn({ name: 'colaboradorId' })
  colaborador: Colaborador;
}
