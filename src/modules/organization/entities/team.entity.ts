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

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_teams_department')
  @Column({ type: 'varchar', length: 36 })
  departmentId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index('idx_teams_leader')
  @Column({ type: 'varchar', length: 36, nullable: true })
  leaderId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Department, (dept) => dept.teams, { eager: false })
  @JoinColumn({ name: 'departmentId' })
  department: Department;
}
