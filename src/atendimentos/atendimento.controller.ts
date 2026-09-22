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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { CanalAtendimento, Urgencia, StatusAtendimento } from '../schemas/enums.js';
import { AtendimentoService } from './atendimento.service.js';

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

  @Post()
  async criar(@Body() dto: {
    canal: CanalAtendimento;
    urgencia?: Urgencia;
    descricao?: string;
    clienteId?: number;
    atendenteId?: number;
    clienteNome?: string;
    clienteTelefone?: string;
    clienteEmail?: string;
    clienteCpfCnpj?: string;
  }) {
    return this.atendimentoService.criar(dto);
  }

  @Patch(':id/status')
  async atualizarStatus(
    @Param('id') id: string,
    @Body('status') status: StatusAtendimento,
  ) {
    return this.atendimentoService.atualizarStatus(Number(id), status);
  }
}