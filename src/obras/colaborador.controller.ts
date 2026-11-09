import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { ConcluirTarefaColaboradorInput } from './dto/planejamento.dto.js';
import { concluirTarefaColaboradorSchema } from './dto/planejamento.dto.js';
import { PlanejamentoService } from './planejamento.service.js';

@Controller('colaborador')
export class ColaboradorController {
  constructor(private readonly planejamentoService: PlanejamentoService) {}

  @Get('tarefas')
  obterTarefas(@Query('token') token: string) {
    return this.planejamentoService.obterTarefasColaboradorPorToken(token);
  }

  @Post('tarefas/:id/concluir')
  concluirTarefa(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(concluirTarefaColaboradorSchema))
    dto: ConcluirTarefaColaboradorInput,
  ) {
    return this.planejamentoService.concluirTarefa(id, dto);
  }
}
