import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ConfigCategory } from './config-category.entity.js';
import { ConfigValue } from './config-value.entity.js';

@Entity('config_keys')
export class ConfigKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_config_keys_category')
  @Column({ type: 'varchar', length: 36 })
  categoryId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'text', nullable: true })
  defaultValue: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ConfigCategory, (cat) => cat.keys, { eager: false })
  @JoinColumn({ name: 'categoryId' })
  category: ConfigCategory;

  @OneToMany(() => ConfigValue, (val) => val.configKey)
  values: ConfigValue[];
}
