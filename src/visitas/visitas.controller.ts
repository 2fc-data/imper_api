import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AtualizarVisitaDto, CriarVisitaDto } from './dto/visitas.dto.js';
import { atualizarVisitaSchema, criarVisitaSchema } from './dto/visitas.dto.js';
import {
  type CriarVisitaItemDto,
  criarVisitaItemSchema,
} from './dto/visita-itens.dto.js';
import { VisitasService } from './visitas.service.js';

@Controller('visitas')
@UseGuards(JwtAuthGuard)
export class VisitasController {
  constructor(private readonly visitasService: VisitasService) {}

  @Post()
  @Permissions('criar_atendimento')
  async criar(
    @Body(new ZodValidationPipe(criarVisitaSchema)) dto: CriarVisitaDto,
  ) {
    return this.visitasService.criar(dto);
  }

  @Get()
  async listar(@Query('atendimentoId') atendimentoId?: string) {
    return this.visitasService.listar(
      atendimentoId !== undefined
        ? { atendimentoId: Number(atendimentoId) }
        : undefined,
    );
  }

  @Patch(':id')
  @Permissions('editar_atendimento')
  async atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarVisitaSchema)) dto: AtualizarVisitaDto,
  ) {
    return this.visitasService.atualizar(Number(id), dto);
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.visitasService.detalhar(Number(id));
  }

  @Post(':id/itens')
  @Permissions('editar_atendimento')
  async adicionarItem(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarVisitaItemSchema)) dto: CriarVisitaItemDto,
  ) {
    return this.visitasService.adicionarItem(Number(id), dto);
  }

  @Delete(':id/itens/:itemId')
  @Permissions('editar_atendimento')
  async removerItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.visitasService.removerItem(Number(id), Number(itemId));
  }
}
