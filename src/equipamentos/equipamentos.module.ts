import { Module } from '@nestjs/common';
import { EquipamentosController } from './equipamentos.controller.js';
import { EquipamentosService } from './equipamentos.service.js';

@Module({
  controllers: [EquipamentosController],
  providers: [EquipamentosService],
  exports: [EquipamentosService],
})
export class EquipamentosModule {}
