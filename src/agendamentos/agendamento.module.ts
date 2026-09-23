import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AgendamentoController } from './agendamento.controller.js';
import { AgendamentoService } from './agendamento.service.js';
import { RotaAgendamentoService } from './rota-agendamento.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AgendamentoController],
  providers: [AgendamentoService, RotaAgendamentoService],
  exports: [AgendamentoService, RotaAgendamentoService],
})
export class AgendamentoModule {}
