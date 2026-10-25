import { Module } from '@nestjs/common';
import { ListasComprasController } from './listas-compras.controller.js';
import { ListasComprasService } from './listas-compras.service.js';

@Module({
  controllers: [ListasComprasController],
  providers: [ListasComprasService],
  exports: [ListasComprasService],
})
export class ListasComprasModule {}
