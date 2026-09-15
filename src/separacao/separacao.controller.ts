import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { SeparacaoService } from './separacao.service.js';

@Controller('separacao')
@UseGuards(JwtAuthGuard)
export class SeparacaoController {
  constructor(private readonly service: SeparacaoService) {}

  @Get()
  async listar(
    @Query('osId') osId?: string,
    @Query('equipeId') equipeId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listar({
      osId: osId ? Number(osId) : undefined,
      equipeId,
      status,
    });
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.service.detalhar(Number(id));
  }

  @Put(':id/confirmar')
  async confirmarSeparacao(@Param('id') id: string, @Req() req: Request) {
    return this.service.confirmarSeparacao(Number(id), (req as any).user.id);
  }

  @Put(':id/notificar-equipe')
  async notificarEquipe(@Param('id') id: string) {
    return this.service.notificarEquipe(Number(id));
  }

  @Put(':id/retirada')
  async registrarRetirada(@Param('id') id: string) {
    return this.service.registrarRetirada(Number(id));
  }

  @Put(':id/devolucao')
  async registrarDevolucao(@Param('id') id: string) {
    return this.service.registrarDevolucao(Number(id));
  }

  @Put(':id/itens/:itemId/retirar')
  async registrarRetiradaItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: { colaboradorId: number; observacao?: string },
    @Req() req: Request,
  ) {
    return this.service.registrarRetiradaItem(Number(id), Number(itemId), {
      ...body,
      registradoPorId: (req as any).user.id,
    });
  }

  @Put(':id/itens/:itemId/devolver')
  async registrarDevolucaoItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: { observacao?: string; status?: 'DEVOLVIDO' | 'PERDIDO' },
    @Req() req: Request,
  ) {
    return this.service.registrarDevolucaoItem(Number(id), Number(itemId), {
      ...body,
      registradoPorId: (req as any).user.id,
    });
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return this.service.excluir(Number(id));
  }
}
