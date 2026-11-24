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
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AppError } from '../lib/errors.js';
import { CatalogosService } from './catalogos.service.js';

@Controller('catalogos')
@UseGuards(JwtAuthGuard)
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get()
  async listarTudo(@Query('tipoInsumo') tipoInsumo?: string) {
    return this.catalogosService.listarTudo(
      this.catalogosService.parseTipo(tipoInsumo),
    );
  }

  @Get(':recurso')
  async listar(
    @Param('recurso') recurso: string,
    @Query('tipoInsumo') tipoInsumo?: string,
  ) {
    return this.catalogosService.listar(
      this.catalogosService.resolverRecurso(recurso),
      this.catalogosService.parseTipo(tipoInsumo),
    );
  }

  @Post(':recurso')
  @Permissions('gerenciar_catalogo')
  async criar(
    @Param('recurso') recurso: string,
    @Body() data: Record<string, unknown>,
    @Query('tipoInsumo') tipoInsumo?: string,
  ) {
    return this.catalogosService.criar(
      this.catalogosService.resolverRecurso(recurso),
      data,
      this.catalogosService.parseTipo(tipoInsumo),
    );
  }

  @Put(':recurso/:id')
  @Permissions('gerenciar_catalogo')
  async atualizar(
    @Param('recurso') recurso: string,
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
    @Query('tipoInsumo') tipoInsumo?: string,
  ) {
    return this.catalogosService.atualizar(
      this.catalogosService.resolverRecurso(recurso),
      this.parseId(id),
      data,
      this.catalogosService.parseTipo(tipoInsumo),
    );
  }

  @Delete(':recurso/:id')
  @Permissions('gerenciar_catalogo')
  async remover(@Param('recurso') recurso: string, @Param('id') id: string) {
    return this.catalogosService.remover(
      this.catalogosService.resolverRecurso(recurso),
      this.parseId(id),
    );
  }

  private parseId(valor: string) {
    const id = Number(valor);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, 'Identificador inválido');
    }
    return id;
  }
}
