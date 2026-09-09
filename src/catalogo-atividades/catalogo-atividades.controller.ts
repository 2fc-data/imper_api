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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CatalogoAtividadesService } from './catalogo-atividades.service.js';

@Controller('catalogo-atividades')
@UseGuards(JwtAuthGuard)
export class CatalogoAtividadesController {
  constructor(private readonly service: CatalogoAtividadesService) {}

  @Get()
  async listar(
    @Query('q') q?: string,
    @Query('especialidade') especialidade?: string,
  ) {
    return this.service.listar({ q, especialidade });
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.service.detalhar(id);
  }

  @Post()
  async criar(@Body() dto: any) {
    return this.service.criar(dto);
  }

  @Put(':id')
  async atualizar(@Param('id') id: string, @Body() dto: any) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return this.service.excluir(id);
  }

  @Post(':id/substeps')
  async adicionarSubStep(@Param('id') id: string, @Body() dto: any) {
    return this.service.adicionarSubStep(id, dto);
  }

  @Delete('substeps/:substepId')
  async removerSubStep(@Param('substepId') substepId: string) {
    return this.service.removerSubStep(substepId);
  }

  @Post(':id/recursos')
  async adicionarRecurso(@Param('id') id: string, @Body() dto: any) {
    return this.service.adicionarRecurso(id, dto);
  }

  @Delete('recursos/:recursoId')
  async removerRecurso(@Param('recursoId') recursoId: string) {
    return this.service.removerRecurso(recursoId);
  }
}
