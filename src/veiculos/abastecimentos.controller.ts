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
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VeiculosService } from './veiculos.service.js';

@Controller('abastecimentos-veiculos')
@UseGuards(JwtAuthGuard)
export class AbastecimentosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Get()
  @Permissions('visualizar_frota', 'gerenciar_frota')
  listar(@Query('veiculoId') veiculoId?: string) {
    return this.veiculosService.listarAbastecimentos(
      veiculoId ? parseInt(veiculoId) : undefined,
    );
  }

  @Post()
  @Permissions('gerenciar_frota')
  criar(@Body() dto: any, @Req() req: any) {
    return this.veiculosService.criarAbastecimento(
      dto.veiculoId,
      dto,
      req.user?.id,
    );
  }

  @Put(':id')
  @Permissions('gerenciar_frota')
  atualizar(@Param('id') id: string, @Body() dto: any) {
    return this.veiculosService.atualizarAbastecimento(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('gerenciar_frota')
  excluir(@Param('id') id: string) {
    return this.veiculosService.excluirAbastecimento(Number(id));
  }
}
