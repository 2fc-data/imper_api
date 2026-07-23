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
import { Department } from './department.entity.js';
import { Team } from './team.entity.js';

@Entity('cost_centers')
export class CostCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Index('idx_cost_centers_department')
  @Column({ type: 'varchar', length: 36, nullable: true })
  departmentId: string;

  @Index('idx_cost_centers_team')
  @Column({ type: 'varchar', length: 36, nullable: true })
  teamId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @Column({ default: true })
  isActive: boolean;

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
}
