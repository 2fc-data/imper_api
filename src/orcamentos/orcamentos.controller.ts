import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { CriarOrcamentoDto } from './dto/orcamentos.dto.js';
import { criarOrcamentoSchema } from './dto/orcamentos.dto.js';
import { OrcamentosService } from './orcamentos.service.js';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Get()
  async listar(@Query('status') status?: string, @Query('q') q?: string) {
    return this.orcamentosService.listar({ status, q });
  }

  @Post()
  async criar(
    @Body(new ZodValidationPipe(criarOrcamentoSchema)) dto: CriarOrcamentoDto,
    @Req() req: Request,
  ) {
    return this.orcamentosService.criar(dto, (req as any).user.id);
  }

  @Post(':id/enviar')
  async enviar(@Param('id') id: string) {
    return this.orcamentosService.enviar(Number(id));
  }
}
