import { Module } from '@nestjs/common';
import { AtividadesOSController } from './atividades-os.controller.js';
import { AtividadesOSService } from './atividades-os.service.js';

@Module({
  controllers: [AtividadesOSController],
  providers: [AtividadesOSService],
  exports: [AtividadesOSService],
})
export class AtividadesOSModule {}
