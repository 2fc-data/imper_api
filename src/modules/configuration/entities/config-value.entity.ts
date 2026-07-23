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
import { ConfigKey } from './config-key.entity.js';

@Entity('config_values')
export class ConfigValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_config_values_key')
  @Column({ type: 'varchar', length: 36 })
  configKeyId: string;

  @Index('idx_config_values_org')
  @Column({ type: 'varchar', length: 36, nullable: true })
  organizationId: string;

  @Index('idx_config_values_dept')
  @Column({ type: 'varchar', length: 36, nullable: true })
  departmentId: string;

  @Index('idx_config_values_user')
  @Column({ type: 'varchar', length: 36, nullable: true })
  userId: string;

  @Column({ type: 'text' })
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ConfigKey, (key) => key.values, { eager: false })
  @JoinColumn({ name: 'configKeyId' })
  configKey: ConfigKey;
}
