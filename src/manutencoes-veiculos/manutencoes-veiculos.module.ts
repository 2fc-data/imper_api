import { Module } from '@nestjs/common';
import { ManutencoesVeiculosController } from './manutencoes-veiculos.controller.js';
import { ManutencoesVeiculosService } from './manutencoes-veiculos.service.js';

@Module({
  controllers: [ManutencoesVeiculosController],
  providers: [ManutencoesVeiculosService],
  exports: [ManutencoesVeiculosService],
})
export class ManutencoesVeiculosModule {}
