import { Module } from '@nestjs/common';
import { AtendimentoController } from './atendimento.controller.js';
import { AtendimentoService } from './atendimento.service.js';

@Module({
  controllers: [AtendimentoController],
  providers: [AtendimentoService],
  exports: [AtendimentoService],
})
export class AtendimentoModule {}