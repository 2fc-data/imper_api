import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Colaborador } from './colaborador.entity.js';

@Entity('colaborador_emergencia')
export class ColaboradorEmergencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_colaborador_emergencia_colaborador')
  @Column({ type: 'varchar', length: 36 })
  colaboradorId: string;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 50, nullable: true })
  parentesco: string;

  @Column({ length: 20 })
  telefone: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Colaborador, (c) => c.emergencia, { eager: false })
  @JoinColumn({ name: 'colaboradorId' })
  colaborador: Colaborador;
}
