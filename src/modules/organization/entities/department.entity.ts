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
import { Organization } from './organization.entity.js';
import { Team } from './team.entity.js';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_departments_organization')
  @Column({ type: 'varchar', length: 36 })
  organizationId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index('idx_departments_manager')
  @Column({ type: 'varchar', length: 36, nullable: true })
  managerId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, (org) => org.departments, { eager: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => Team, (team) => team.department)
  teams: Team[];
}
