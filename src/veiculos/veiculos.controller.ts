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
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {
  type RegistroKmInput,
  type VeiculoAtualizarInput,
  type VeiculoCriarInput,
  VeiculosService,
} from './veiculos.service.js';

interface RequestWithUser extends Request {
  user?: { id: number };
}

@Controller('veiculos')
@UseGuards(JwtAuthGuard)
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Get()
  @Permissions('visualizar_frota', 'gerenciar_frota')
  listar(@Query() query: { q?: string; statusId?: number; tipoId?: number }) {
    return this.veiculosService.listar(query);
  }

  @Get('lookups')
  @Permissions('visualizar_frota', 'gerenciar_frota')
  lookups() {
    return this.veiculosService.lookups();
  }

  @Get('analises')
  @Permissions('visualizar_frota', 'gerenciar_frota')
  analises(@Query('mes') mes?: string, @Query('ano') ano?: string) {
    return this.veiculosService.analises(
      mes ? parseInt(mes, 10) : undefined,
      ano ? parseInt(ano, 10) : undefined,
    );
  }

  @Get('proximo-codigo')
  @Permissions('gerenciar_frota')
  proximoCodigo() {
    return this.veiculosService.proximoCodigo();
  }

  @Get(':id')
  @Permissions('visualizar_frota', 'gerenciar_frota')
  detalhar(@Param('id') id: string) {
    return this.veiculosService.detalhar(Number(id));
  }

  @Get(':id/km')
  @Permissions('visualizar_frota', 'registrar_km_frota', 'gerenciar_frota')
  listarKm(
    @Param('id') id: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.veiculosService.listarRegistrosKm(
      Number(id),
      mes ? parseInt(mes, 10) : undefined,
      ano ? parseInt(ano, 10) : undefined,
    );
  }

  @Post()
  @Permissions('gerenciar_frota')
  criar(@Body() dto: VeiculoCriarInput) {
    return this.veiculosService.criar(dto);
  }

  @Post(':id/km')
  @Permissions('registrar_km_frota', 'gerenciar_frota')
  registrarKm(
    @Param('id') id: string,
    @Body() dto: RegistroKmInput,
    @Req() req: RequestWithUser,
  ) {
    return this.veiculosService.registrarKm(Number(id), dto, req.user?.id);
  }

  @Put(':id')
  @Permissions('gerenciar_frota')
  atualizar(@Param('id') id: string, @Body() dto: VeiculoAtualizarInput) {
    return this.veiculosService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('gerenciar_frota')
  excluir(@Param('id') id: string) {
    return this.veiculosService.excluir(Number(id));
  }
}
