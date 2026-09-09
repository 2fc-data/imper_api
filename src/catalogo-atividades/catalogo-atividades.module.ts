import { Module } from '@nestjs/common';
import { CatalogoAtividadesController } from './catalogo-atividades.controller.js';
import { CatalogoAtividadesService } from './catalogo-atividades.service.js';

@Module({
  controllers: [CatalogoAtividadesController],
  providers: [CatalogoAtividadesService],
  exports: [CatalogoAtividadesService],
})
export class CatalogoAtividadesModule {}
