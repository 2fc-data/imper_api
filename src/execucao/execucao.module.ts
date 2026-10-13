import { Module } from '@nestjs/common';
import { ExecucaoController } from './execucao.controller.js';
import { ExecucaoService } from './execucao.service.js';

@Module({
  controllers: [ExecucaoController],
  providers: [ExecucaoService],
  exports: [ExecucaoService],
})
export class ExecucaoModule {}
