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
import type { StatusOrcamento } from '../schemas/enums.js';
import type { CriarOrcamentoDto, RecusarDto } from './dto/orcamentos.dto.js';
import { criarOrcamentoSchema, recusarSchema } from './dto/orcamentos.dto.js';
import { OrcamentosService } from './orcamentos.service.js';

interface RequestWithUser extends Request {
  user: { id: number };
}

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Get()
  async listar(
    @Query('status') status?: StatusOrcamento,
    @Query('q') q?: string,
    @Query('atendimentoId') atendimentoId?: string,
  ) {
    const aid = atendimentoId ? Number(atendimentoId) : undefined;
    return this.orcamentosService.listar({
      status,
      q,
      atendimentoId:
        aid !== undefined && Number.isFinite(aid) && aid > 0 ? aid : undefined,
    });
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.orcamentosService.detalhar(Number(id));
  }

  @Post()
  @Permissions('ver_financeiro')
  async criar(
    @Body(new ZodValidationPipe(criarOrcamentoSchema)) dto: CriarOrcamentoDto,
    @Req() req: RequestWithUser,
  ) {
    return this.orcamentosService.criar(dto, req.user.id);
  }

  @Patch(':id')
  @Permissions('ver_financeiro')
  async atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarOrcamentoSchema)) dto: CriarOrcamentoDto,
  ) {
    return this.orcamentosService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('ver_financeiro')
  async remover(@Param('id') id: string) {
    return this.orcamentosService.remover(Number(id));
  }

  @Post(':id/enviar')
  @Permissions('ver_financeiro')
  async enviar(@Param('id') id: string) {
    return this.orcamentosService.enviar(Number(id));
  }

  @Post(':id/aprovar')
  @Permissions('aprovar_orcamento')
  async aprovar(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.orcamentosService.aprovar(Number(id), req.user.id);
  }

  @Post(':id/recusar')
  @Permissions('aprovar_orcamento')
  async recusar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(recusarSchema)) dto: RecusarDto,
  ) {
    return this.orcamentosService.recusar(Number(id), dto.motivo);
  }
}
