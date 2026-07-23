import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity.js';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_user_roles_user')
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @Index('idx_user_roles_role')
  @Column({ type: 'varchar', length: 36 })
  roleId: string;

  @Index('idx_user_roles_org')
  @Column({ type: 'varchar', length: 36, nullable: true })
  organizationId: string;

  @Index('idx_user_roles_dept')
  @Column({ type: 'varchar', length: 36, nullable: true })
  departmentId: string;

  @Index('idx_user_roles_team')
  @Column({ type: 'varchar', length: 36, nullable: true })
  teamId: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.userRoles, { eager: false })
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
