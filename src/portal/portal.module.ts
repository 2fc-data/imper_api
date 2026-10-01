import { Module } from '@nestjs/common';
import { AgendamentoModule } from '../agendamentos/agendamento.module.js';
import { AtendimentoModule } from '../atendimentos/atendimento.module.js';
import { OrcamentosModule } from '../orcamentos/orcamentos.module.js';
import { OsModule } from '../os/os.module.js';
import { PortalController } from './portal.controller.js';
import { PortalService } from './portal.service.js';

@Module({
  imports: [AtendimentoModule, AgendamentoModule, OrcamentosModule, OsModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
