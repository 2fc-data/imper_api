import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { type RegistroKmInput, VeiculosService } from './veiculos.service.js';

@Controller('registros-km')
@UseGuards(JwtAuthGuard)
export class RegistrosKmController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Get()
  @Permissions('visualizar_frota', 'registrar_km_frota', 'gerenciar_frota')
  listar(
    @Query('veiculoId') veiculoId?: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.veiculosService.listarRegistrosKm(
      veiculoId ? parseInt(veiculoId, 10) : undefined,
      mes ? parseInt(mes, 10) : undefined,
      ano ? parseInt(ano, 10) : undefined,
    );
  }

  @Put(':id')
  @Permissions('registrar_km_frota', 'gerenciar_frota')
  atualizar(@Param('id') id: string, @Body() dto: RegistroKmInput) {
    return this.veiculosService.atualizarRegistroKm(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('registrar_km_frota', 'gerenciar_frota')
  excluir(@Param('id') id: string) {
    return this.veiculosService.excluirRegistroKm(Number(id));
  }
}
