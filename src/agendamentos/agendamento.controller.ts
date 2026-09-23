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
import type { StatusAgendamento, TipoAgendamento } from '../schemas/enums.js';
import {
  AgendamentoService,
  type AtualizarAgendamentoDto,
  type CriarAgendamentoDto,
} from './agendamento.service.js';
import { RotaAgendamentoService } from './rota-agendamento.service.js';

interface RequestWithUser extends Request {
  user?: { id: number };
}

@Controller('agendamentos')
@UseGuards(JwtAuthGuard)
export class AgendamentoController {
  constructor(
    private readonly agendamentoService: AgendamentoService,
    private readonly rotaService: RotaAgendamentoService,
  ) {}

  @Get()
  async listar(
    @Query('status') status?: StatusAgendamento,
    @Query('tipo') tipo?: TipoAgendamento,
    @Query('userId') userId?: string,
    @Query('dataDe') dataDe?: string,
    @Query('dataAte') dataAte?: string,
  ) {
    return this.agendamentoService.listar({
      status,
      tipo,
      userId: userId ? Number(userId) : undefined,
      dataDe,
      dataAte,
    });
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.agendamentoService.detalhar(Number(id));
  }

  @Get(':id/rota')
  async rota(@Param('id') id: string) {
    return this.rotaService.calcularRota(Number(id));
  }

  @Post()
  async criar(@Body() dto: CriarAgendamentoDto, @Req() req: RequestWithUser) {
    return this.agendamentoService.criar(dto, req.user?.id);
  }

  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarAgendamentoDto,
  ) {
    return this.agendamentoService.atualizar(Number(id), dto);
  }

  @Patch(':id/status')
  async atualizarStatus(
    @Param('id') id: string,
    @Body() body: { status: StatusAgendamento; dataRealizada?: string | null },
  ) {
    return this.agendamentoService.atualizarStatus(
      Number(id),
      body.status,
      body.dataRealizada,
    );
  }
}
