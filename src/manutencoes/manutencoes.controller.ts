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
  type ManutencaoAtualizarInput,
  type ManutencaoCriarInput,
  ManutencoesService,
} from './manutencoes.service.js';

interface RequestWithUser extends Request {
  user?: { id: number };
}

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

  @Get('pendentes-aprovacao')
  @Permissions('aprovar_manutencao_equipamento')
  async pendentesAprovacao(@Req() req: RequestWithUser) {
    return this.manutencoesService.listarPendentesAprovacao(req.user!.id);
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
  @Permissions('gerenciar_equipamentos')
  async criar(
    @Body() dto: ManutencaoCriarInput,
    @Req() req: RequestWithUser,
  ) {
    return this.manutencoesService.criar(dto, req.user?.id);
  }

  @Post(':id/aprovar')
  @Permissions('aprovar_manutencao_equipamento')
  async aprovar(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.manutencoesService.aprovar(Number(id), req.user!.id);
  }

  @Post(':id/recusar')
  @Permissions('aprovar_manutencao_equipamento')
  async recusar(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @Req() req: RequestWithUser,
  ) {
    return this.manutencoesService.recusar(Number(id), motivo, req.user!.id);
  }

  @Put(':id')
  @Permissions('gerenciar_equipamentos')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: ManutencaoAtualizarInput,
  ) {
    return this.manutencoesService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('gerenciar_equipamentos')
  async excluir(@Param('id') id: string) {
    return this.manutencoesService.excluir(Number(id));
  }
}
