import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { NotificacoesService } from './notificacoes.service.js';

interface RequestWithUser extends Request {
  user?: { id: number };
}

@Controller('notificacoes')
@UseGuards(JwtAuthGuard)
export class NotificacoesController {
  constructor(private readonly service: NotificacoesService) {}

  @Get()
  listar(
    @Req() req: RequestWithUser,
    @Query('status') status?: 'LIDA' | 'NAO_LIDA',
    @Query('limit') limit?: string,
  ) {
    return this.service.listar(req.user!.id, {
      status,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('nao-lidas/count')
  naoLidasCount(@Req() req: RequestWithUser) {
    return this.service.naoLidasCount(req.user!.id);
  }

  @Patch(':id/lida')
  marcarLida(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.service.marcarLida(req.user!.id, Number(id));
  }

  @Patch('lidas')
  marcarTodasLidas(@Req() req: RequestWithUser) {
    return this.service.marcarTodasLidas(req.user!.id);
  }
}