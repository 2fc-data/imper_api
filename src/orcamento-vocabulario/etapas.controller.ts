import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VocabularioService } from './vocabulario.service.js';

@UseGuards(JwtAuthGuard)
@Controller('etapas')
export class EtapasController {
  constructor(private readonly service: VocabularioService) {}

  @Get()
  listar(@Query('ativo') ativo?: string) {
    const filtro =
      ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.service.listarEtapas(filtro);
  }
}
