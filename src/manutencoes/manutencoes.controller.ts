import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { StatusManutencao } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ManutencoesService } from './manutencoes.service.js';

@Controller('manutencoes')
@UseGuards(JwtAuthGuard)
export class ManutencoesController {
  constructor(private readonly manutencoesService: ManutencoesService) {}

  @Get()
  async listar(
    @Query('equipamentoId') equipamentoId?: string,
    @Query('status') status?: StatusManutencao,
  ) {
    return this.manutencoesService.listar({
      equipamentoId: equipamentoId ? Number(equipamentoId) : undefined,
      status,
    });
  }

  @Get('lookups')
  async lookups() {
    return this.manutencoesService.lookups();
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.manutencoesService.detalhar(Number(id));
  }

  @Post()
  async criar(@Body() dto: any) {
    return this.manutencoesService.criar(dto);
  }

  @Put(':id')
  async atualizar(@Param('id') id: string, @Body() dto: any) {
    return this.manutencoesService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return this.manutencoesService.excluir(Number(id));
  }
}
