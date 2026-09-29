import { Module } from '@nestjs/common';
import { VisitasController } from './visitas.controller.js';
import { VisitasService } from './visitas.service.js';

@Module({
  controllers: [VisitasController],
  providers: [VisitasService],
  exports: [VisitasService],
})
export class VisitasModule {}
