import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Colaborador } from './entities/colaborador.entity.js';
import { ColaboradorEmergencia } from './entities/colaborador-emergencia.entity.js';
import { EpiRecord } from './entities/epi-record.entity.js';
import { ColaboradoresController } from './colaboradores.controller.js';
import { ColaboradoresService } from './colaboradores.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Colaborador, ColaboradorEmergencia, EpiRecord]),
    AuthModule,
  ],
  controllers: [ColaboradoresController],
  providers: [ColaboradoresService],
  exports: [ColaboradoresService, TypeOrmModule],
})
export class ColaboradoresModule {}
