import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ChecklistService } from './checklist.service.js';

@Controller('checklist')
@UseGuards(JwtAuthGuard)
export class ChecklistController {
  constructor(private readonly service: ChecklistService) {}

  @Get('execucao/:executucaoAtividadeId')
  async listarPorExecucao(
    @Param('executucaoAtividadeId') executucaoAtividadeId: string,
  ) {
    return this.service.listarPorExecucao(executucaoAtividadeId);
  }

  @Put(':id/concluir')
  @Permissions('concluir_execucao')
  async concluir(@Param('id') id: string, @Req() req: Request) {
    return this.service.concluir(id, (req as any).user.id);
  }

  @Put(':id/bloquear')
  @Permissions('editar_execucao')
  async bloquear(@Param('id') id: string, @Body('motivo') motivo: string) {
    return this.service.bloquear(id, motivo);
  }
}
