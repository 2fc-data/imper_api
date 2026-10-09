import {
  Body,
  Controller,
  Delete,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VeiculosService } from './veiculos.service.js';

@Controller('registros-km')
@UseGuards(JwtAuthGuard)
export class RegistrosKmController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Put(':id')
  @Permissions('registrar_km_frota', 'gerenciar_frota')
  atualizar(@Param('id') id: string, @Body() dto: any) {
    return this.veiculosService.atualizarRegistroKm(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('registrar_km_frota', 'gerenciar_frota')
  excluir(@Param('id') id: string) {
    return this.veiculosService.excluirRegistroKm(Number(id));
  }
}
