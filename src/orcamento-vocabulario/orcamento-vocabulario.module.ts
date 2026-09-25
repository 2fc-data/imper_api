import { Module } from '@nestjs/common';
import { EtapasController } from './etapas.controller.js';
import { VocabularioController } from './vocabulario.controller.js';
import { VocabularioService } from './vocabulario.service.js';

@Module({
  controllers: [VocabularioController, EtapasController],
  providers: [VocabularioService],
  exports: [VocabularioService],
})
export class OrcamentoVocabularioModule {}
