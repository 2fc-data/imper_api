import { Module } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service.js';
import { NotificacoesController } from './notificacoes.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [NotificacoesController],
  providers: [NotificacoesService],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}