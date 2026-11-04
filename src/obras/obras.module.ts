import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { WhatsAppService } from '../whatsapp/whatsapp.service.js';
import { ColaboradorController } from './colaborador.controller.js';
import { ObrasController } from './obras.controller.js';
import { ObrasService } from './obras.service.js';
import { PlanejamentoService } from './planejamento.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ObrasController, ColaboradorController],
  providers: [ObrasService, PlanejamentoService, WhatsAppService],
  exports: [ObrasService, PlanejamentoService],
})
export class ObrasModule {}
