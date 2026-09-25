import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import type { EnviarContatoDto } from './publico.service.js';
import { PublicoService } from './publico.service.js';

@Controller('publico')
export class PublicoController {
  constructor(private readonly publicoService: PublicoService) {}

  @Public()
  @Get('servicos')
  listarServicos() {
    return this.publicoService.listarServicos();
  }

  @Public()
  @Get('cidades')
  listarCidades() {
    return this.publicoService.listarCidades();
  }

  @Public()
  @Post('contato')
  enviarContato(@Body() dto: EnviarContatoDto) {
    return this.publicoService.enviarContato(dto);
  }
}
