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
import { DisponibilidadeService } from './disponibilidade.service.js';

@Controller('disponibilidade')
@UseGuards(JwtAuthGuard)
export class DisponibilidadeController {
  constructor(private readonly service: DisponibilidadeService) {}

  // ---------- PADRÕES ----------

  @Get('padroes')
  async listarPadroes(@Query('userId') userId?: string) {
    return this.service.listarPadroes(userId ? Number(userId) : undefined);
  }

  @Post('padroes')
  async criarPadrao(
    @Body() body: {
      userId: number;
      diaSemana: number;
      horaInicio: string;
      horaFim: string;
      capacidade?: number;
    },
  ) {
    return this.service.criarPadrao(body);
  }

  @Patch('padroes/:id')
  async atualizarPadrao(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.service.atualizarPadrao(Number(id), body);
  }

  @Delete('padroes/:id')
  async excluirPadrao(@Param('id') id: string) {
    await this.service.excluirPadrao(Number(id));
    return { success: true };
  }

  // ---------- DATAS ----------

  @Get('datas')
  async listarDatas(
    @Query('userId') userId?: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.service.listarDatas(
      userId ? Number(userId) : undefined,
      mes ? Number(mes) : undefined,
      ano ? Number(ano) : undefined,
    );
  }

  @Post('datas')
  async criarData(
    @Body() body: {
      userId: number;
      data: string;
      horaInicio: string;
      horaFim: string;
      capacidade?: number;
      excluida?: boolean;
    },
  ) {
    return this.service.criarData(body);
  }

  @Patch('datas/:id')
  async atualizarData(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.service.atualizarData(Number(id), body);
  }

  @Delete('datas/:id')
  async excluirData(@Param('id') id: string) {
    await this.service.excluirData(Number(id));
    return { success: true };
  }

  // ---------- SLOTS ----------

  @Get('slots')
  async gerarSlots(
    @Query('mes') mes: string,
    @Query('ano') ano: string,
    @Query('userId') userId?: string,
  ) {
    return this.service.gerarSlots(Number(mes), Number(ano), userId ? Number(userId) : undefined);
  }
}
