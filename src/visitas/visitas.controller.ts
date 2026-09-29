import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AtualizarVisitaDto, CriarVisitaDto } from './dto/visitas.dto.js';
import { atualizarVisitaSchema, criarVisitaSchema } from './dto/visitas.dto.js';
import { VisitasService } from './visitas.service.js';

@Controller('visitas')
@UseGuards(JwtAuthGuard)
export class VisitasController {
  constructor(private readonly visitasService: VisitasService) {}

  @Post()
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
  async atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarVisitaSchema)) dto: AtualizarVisitaDto,
  ) {
    return this.visitasService.atualizar(Number(id), dto);
  }
}
