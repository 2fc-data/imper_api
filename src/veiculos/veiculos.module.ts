import { Module } from '@nestjs/common';
import { AbastecimentosController } from './abastecimentos.controller.js';
import { RegistrosKmController } from './registros-km.controller.js';
import { VeiculosController } from './veiculos.controller.js';
import { VeiculosService } from './veiculos.service.js';

@Module({
  controllers: [
    VeiculosController,
    RegistrosKmController,
    AbastecimentosController,
  ],
  providers: [VeiculosService],
  exports: [VeiculosService],
})
export class VeiculosModule {}
