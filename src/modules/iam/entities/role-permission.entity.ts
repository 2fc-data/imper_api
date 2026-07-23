import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Role } from './role.entity.js';
import { Permission } from './permission.entity.js';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_role_permissions_role')
  @Column({ type: 'varchar', length: 36 })
  roleId: string;

  @Index('idx_role_permissions_permission')
  @Column({ type: 'varchar', length: 36 })
  permissionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { eager: false })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(() => Permission, (perm) => perm.rolePermissions, { eager: false })
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;
}
