import { Module } from '@nestjs/common';
import { ManutencoesController } from './manutencoes.controller.js';
import { ManutencoesService } from './manutencoes.service.js';

@Module({
  controllers: [ManutencoesController],
  providers: [ManutencoesService],
  exports: [ManutencoesService],
})
export class ManutencoesModule {}
