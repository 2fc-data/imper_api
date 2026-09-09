import { Module } from '@nestjs/common';
import { OrcamentosController } from './orcamentos.controller.js';
import { OrcamentosService } from './orcamentos.service.js';

@Module({
  controllers: [OrcamentosController],
  providers: [OrcamentosService],
  exports: [OrcamentosService],
})
export class OrcamentosModule {}
