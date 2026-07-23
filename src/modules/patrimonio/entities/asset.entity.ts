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
import {
  AssetTipo,
  AssetEstado,
  AssetStatus,
  CombustivelTipo,
} from '../../../common/enums/crm.enums.js';
import { CostCenter } from '../../organization/entities/cost-center.entity.js';
import { AssetAssignment } from './asset-assignment.entity.js';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_assets_codigo')
  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ length: 255 })
  nome: string;

  @Index('idx_assets_tipo')
  @Column({ type: 'enum', enum: AssetTipo })
  tipo: AssetTipo;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'date', nullable: true })
  dataAquisicao: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  valorInvestido: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  valorAtual: number;

  @Index('idx_assets_estado')
  @Column({ type: 'enum', enum: AssetEstado, default: AssetEstado.BOM })
  estado: AssetEstado;

  @Index('idx_assets_status')
  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.DISPONIVEL })
  status: AssetStatus;

  @Index('idx_assets_responsible')
  @Column({ type: 'varchar', length: 36, nullable: true })
  responsibleId: string;

  @Index('idx_assets_cost_center')
  @Column({ type: 'varchar', length: 36, nullable: true })
  costCenterId: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ length: 10, nullable: true })
  placa: string;

  @Column({ length: 20, nullable: true })
  chassi: string;

  @Column({ length: 100, nullable: true })
  marca: string;

  @Column({ length: 100, nullable: true })
  modelo: string;

  @Column({ type: 'int', nullable: true })
  ano: number;

  @Column({ length: 11, nullable: true })
  renavam: string;

  @Column({ length: 50, nullable: true })
  cor: string;

  @Column({ type: 'enum', enum: CombustivelTipo, nullable: true })
  combustivel: CombustivelTipo;

  @Column({ type: 'int', nullable: true })
  km: number;

  @Column({ length: 100, nullable: true })
  seguro: string;

  @Column({ type: 'date', nullable: true })
  licenciamento: Date;

  @Column({ type: 'date', nullable: true })
  dataVencSeguro: Date;

  @Column({ length: 100, nullable: true })
  nroSerie: string;

  @Column({ type: 'date', nullable: true })
  garantia: Date;

  @Column({ length: 500, nullable: true })
  manualUrl: string;

  @Column({ length: 500, nullable: true })
  endereco: string;

  @Column({ length: 50, nullable: true })
  matricula: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  area: number;

  @Column({ length: 100, nullable: true })
  finalidade: string;

  @Column({ length: 100, nullable: true })
  situacao: string;

  @Column({ length: 100, nullable: true })
  material: string;

  @Column({ length: 255, nullable: true })
  localizacao: string;

  @Column({ length: 500, nullable: true })
  notaFiscalUrl: string;

  @Column({ length: 500, nullable: true })
  seguroUrl: string;

  @Column({ length: 500, nullable: true })
  fotoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CostCenter, { eager: false })
  @JoinColumn({ name: 'costCenterId' })
  costCenter: CostCenter;

  @OneToMany(() => AssetAssignment, (a) => a.asset)
  assignments: AssetAssignment[];
}
