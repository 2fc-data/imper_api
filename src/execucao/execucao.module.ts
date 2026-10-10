import { Module } from '@nestjs/common';
import { ExecucaoService } from './execucao.service.js';
import { ExecucaoController } from './execucao.controller.js';

@Module({
  controllers: [ExecucaoController],
  providers: [ExecucaoService],
  exports: [ExecucaoService],
})
export class ExecucaoModule {}
