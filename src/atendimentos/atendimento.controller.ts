import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type {
  CanalAtendimento,
  StatusAtendimento,
  TipoAtendimento,
  Urgencia,
} from '../schemas/enums.js';
import { AtendimentoService } from './atendimento.service.js';

interface RequestWithUser extends Request {
  user?: { id: number };
}

@Controller('atendimentos')
@UseGuards(JwtAuthGuard)
export class AtendimentoController {
  constructor(private readonly atendimentoService: AtendimentoService) {}

  @Get()
  async listar(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('criadoDe') criadoDe?: string,
    @Query('criadoAte') criadoAte?: string,
    @Query('atualizadoDe') atualizadoDe?: string,
    @Query('atualizadoAte') atualizadoAte?: string,
  ) {
    return this.atendimentoService.listar({
      q,
      status,
      criadoDe,
      criadoAte,
      atualizadoDe,
      atualizadoAte,
    });
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.atendimentoService.detalhar(Number(id));
  }

  @Get(':id/atendimentos')
  async listarLogs(@Param('id') id: string) {
    return this.atendimentoService.listarLogs(Number(id));
  }

  @Post(':id/atendimentos')
  async criarLog(
    @Param('id') id: string,
    @Body() dto: {
      descricao?: string;
      tipo?: TipoAtendimento;
      statusDe?: StatusAtendimento;
      statusPara?: StatusAtendimento;
    },
    @Req() req: RequestWithUser,
  ) {
    return this.atendimentoService.criarLog(Number(id), dto, req.user?.id);
  }

  @Post()
  async criar(
    @Body() dto: {
      canal: CanalAtendimento;
      urgencia?: Urgencia;
      descricao?: string;
      userId?: number;
      atendenteId?: number;
      userName?: string;
      userTelefone?: string;
      userEmail?: string;
      userCpfCnpj?: string;
    },
  ) {
    return this.atendimentoService.criar(dto);
  }

  @Patch(':id/status')
  async atualizarStatus(
    @Param('id') id: string,
    @Body('status') status: StatusAtendimento,
    @Req() req: RequestWithUser,
  ) {
    return this.atendimentoService.atualizarStatus(
      Number(id),
      status,
      req.user?.id,
    );
  }
}
