import { Module } from '@nestjs/common';
import { DisponibilidadeController } from './disponibilidade.controller.js';
import { DisponibilidadeService } from './disponibilidade.service.js';

@Module({
  controllers: [DisponibilidadeController],
  providers: [DisponibilidadeService],
})
export class DisponibilidadeModule {}
