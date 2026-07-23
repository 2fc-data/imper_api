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
  ColaboradorTipo,
  ColaboradorStatus,
  ColaboradorContrato,
} from '../../../common/enums/crm.enums.js';
import { Department } from '../../organization/entities/department.entity.js';
import { Team } from '../../organization/entities/team.entity.js';
import { ColaboradorEmergencia } from './colaborador-emergencia.entity.js';
import { EpiRecord } from './epi-record.entity.js';

@Entity('colaboradores')
export class Colaborador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nome: string;

  @Index('idx_colaboradores_tipo')
  @Column({ type: 'enum', enum: ColaboradorTipo, default: ColaboradorTipo.FUNCIONARIO })
  tipo: ColaboradorTipo;

  @Index('idx_colaboradores_cpf')
  @Column({ length: 14, nullable: true })
  cpf: string;

  @Column({ length: 20, nullable: true })
  rg: string;

  @Column({ length: 20, nullable: true })
  cnh: string;

  @Column({ type: 'date', nullable: true })
  dataNascimento: Date;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  razaoSocial: string;

  @Column({ length: 18, nullable: true })
  cnpj: string;

  @Column({ length: 255, nullable: true })
  responsavel: string;

  @Column({ length: 5, nullable: true })
  tipoSanguineo: string;

  @Column({ type: 'text', nullable: true })
  alergias: string;

  @Column({ type: 'date', nullable: true })
  dataInicio: Date;

  @Column({ type: 'date', nullable: true })
  dataFim: Date;

  @Column({ type: 'enum', enum: ColaboradorContrato, nullable: true })
  tipoContrato: ColaboradorContrato;

  @Index('idx_colaboradores_status')
  @Column({ type: 'enum', enum: ColaboradorStatus, default: ColaboradorStatus.ATIVO })
  status: ColaboradorStatus;

  @Index('idx_colaboradores_department')
  @Column({ type: 'varchar', length: 36, nullable: true })
  departmentId: string;

  @Index('idx_colaboradores_team')
  @Column({ type: 'varchar', length: 36, nullable: true })
  teamId: string;

  @Index('idx_colaboradores_supervisor')
  @Column({ type: 'varchar', length: 36, nullable: true })
  supervisorId: string;

  @Column({ length: 500, nullable: true })
  cnhUrl: string;

  @Column({ length: 500, nullable: true })
  rgUrl: string;

  @Column({ length: 500, nullable: true })
  fotoUrl: string;

  @Column({ length: 9, nullable: true })
  cep: string;

  @Column({ length: 2, nullable: true })
  estado: string;

  @Column({ length: 100, nullable: true })
  cidade: string;

  @Column({ length: 100, nullable: true })
  bairro: string;

  @Column({ length: 255, nullable: true })
  logradouro: string;

  @Column({ length: 10, nullable: true })
  numero: string;

  @Column({ length: 100, nullable: true })
  complemento: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Department, { eager: false })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @ManyToOne(() => Team, { eager: false })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @OneToMany(() => ColaboradorEmergencia, (e) => e.colaborador)
  emergencia: ColaboradorEmergencia[];

  @OneToMany(() => EpiRecord, (e) => e.colaborador)
  epis: EpiRecord[];
}
