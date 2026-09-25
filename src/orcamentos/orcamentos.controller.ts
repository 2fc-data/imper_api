import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { CriarOrcamentoDto, RecusarDto } from './dto/orcamentos.dto.js';
import { criarOrcamentoSchema, recusarSchema } from './dto/orcamentos.dto.js';
import { OrcamentosService } from './orcamentos.service.js';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Get()
  async listar(@Query('status') status?: string, @Query('q') q?: string) {
    return this.orcamentosService.listar({ status, q });
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.orcamentosService.detalhar(Number(id));
  }

  @Post()
  async criar(
    @Body(new ZodValidationPipe(criarOrcamentoSchema)) dto: CriarOrcamentoDto,
    @Req() req: Request,
  ) {
    return this.orcamentosService.criar(dto, (req as any).user.id);
  }

  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarOrcamentoSchema)) dto: CriarOrcamentoDto,
  ) {
    return this.orcamentosService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  async remover(@Param('id') id: string) {
    return this.orcamentosService.remover(Number(id));
  }

  @Post(':id/enviar')
  async enviar(@Param('id') id: string) {
    return this.orcamentosService.enviar(Number(id));
  }

  @Post(':id/aprovar')
  @Permissions('aprovar_os')
  async aprovar(@Param('id') id: string, @Req() req: Request) {
    return this.orcamentosService.aprovar(Number(id), (req as any).user.id);
  }

  @Post(':id/recusar')
  @Permissions('aprovar_os')
  async recusar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(recusarSchema)) dto: RecusarDto,
  ) {
    return this.orcamentosService.recusar(Number(id), dto.motivo);
  }
}
