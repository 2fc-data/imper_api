import { Module } from '@nestjs/common';
import { SeparacaoController } from './separacao.controller.js';
import { SeparacaoService } from './separacao.service.js';

@Module({
  controllers: [SeparacaoController],
  providers: [SeparacaoService],
  exports: [SeparacaoService],
})
export class SeparacaoModule {}
