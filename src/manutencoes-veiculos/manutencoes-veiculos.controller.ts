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
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ManutencoesVeiculosService } from './manutencoes-veiculos.service.js';

@Controller('manutencoes-veiculos')
@UseGuards(JwtAuthGuard)
export class ManutencoesVeiculosController {
  constructor(private readonly service: ManutencoesVeiculosService) {}

  @Get()
  @Permissions('visualizar_frota', 'gerenciar_frota')
  listar(
    @Query('veiculoId') veiculoId?: string,
    @Query('status') status?: StatusManutencao,
  ) {
    return this.service.listar({
      veiculoId: veiculoId ? Number(veiculoId) : undefined,
      status,
    });
  }

  @Get('lookups')
  @Permissions('visualizar_frota', 'gerenciar_frota')
  lookups() {
    return this.service.lookups();
  }

  @Get(':id')
  @Permissions('visualizar_frota', 'gerenciar_frota')
  detalhar(@Param('id') id: string) {
    return this.service.detalhar(Number(id));
  }

  @Post()
  @Permissions('gerenciar_frota')
  criar(@Body() dto: any) {
    return this.service.criar(dto);
  }

  @Put(':id')
  @Permissions('gerenciar_frota')
  atualizar(@Param('id') id: string, @Body() dto: any) {
    return this.service.atualizar(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('gerenciar_frota')
  excluir(@Param('id') id: string) {
    return this.service.excluir(Number(id));
  }
}
