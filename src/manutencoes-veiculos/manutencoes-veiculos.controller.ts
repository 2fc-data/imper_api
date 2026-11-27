import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { StatusManutencao } from '@prisma/client';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {
  type ManutencaoVeiculoAtualizarInput,
  type ManutencaoVeiculoCriarInput,
  ManutencoesVeiculosService,
} from './manutencoes-veiculos.service.js';

interface RequestWithUser extends Request {
  user?: { id: number };
}

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

  @Get('pendentes-aprovacao')
  @Permissions('aprovar_manutencao_frota')
  pendentesAprovacao(@Req() req: RequestWithUser) {
    return this.service.listarPendentesAprovacao(req.user!.id);
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
  criar(@Body() dto: ManutencaoVeiculoCriarInput, @Req() req: RequestWithUser) {
    return this.service.criar(dto, req.user!.id);
  }

  @Post(':id/aprovar')
  @Permissions('aprovar_manutencao_frota')
  aprovar(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.service.aprovar(Number(id), req.user!.id);
  }

  @Post(':id/recusar')
  @Permissions('aprovar_manutencao_frota')
  recusar(
    @Param('id') id: string,
    @Body() body: { motivo?: string },
    @Req() req: RequestWithUser,
  ) {
    return this.service.recusar(Number(id), body.motivo ?? '', req.user!.id);
  }

  @Put(':id')
  @Permissions('gerenciar_frota')
  atualizar(
    @Param('id') id: string,
    @Body() dto: ManutencaoVeiculoAtualizarInput,
  ) {
    return this.service.atualizar(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('gerenciar_frota')
  excluir(@Param('id') id: string) {
    return this.service.excluir(Number(id));
  }
}