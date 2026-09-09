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
import { EquipesService } from './equipes.service.js';

@Controller('equipes')
@UseGuards(JwtAuthGuard)
export class EquipesController {
  constructor(private readonly service: EquipesService) {}

  @Get()
  async listar(@Query('osId') osId?: string, @Query('status') status?: string) {
    return this.service.listar({
      osId: osId ? Number(osId) : undefined,
      status,
    });
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

  @Post(':id/membros')
  async adicionarMembro(@Param('id') id: string, @Body() dto: any) {
    return this.service.adicionarMembro(id, dto);
  }

  @Delete('membros/:membroId')
  async removerMembro(@Param('membroId') membroId: string) {
    return this.service.removerMembro(membroId);
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return this.service.excluir(id);
  }
}
