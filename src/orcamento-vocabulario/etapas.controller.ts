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
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AppError } from '../lib/errors.js';
import {
  type AtualizarEtapaDto,
  type CriarEtapaDto,
  atualizarEtapaSchema,
  criarEtapaSchema,
} from './dto/vocabulario.dto.js';
import { VocabularioService } from './vocabulario.service.js';

function parseId(valor: string): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero)) {
    throw new AppError(400, 'Etapa inválida');
  }
  return numero;
}

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

  @Permissions('gerenciar_catalogo')
  @Post()
  criar(@Body(new ZodValidationPipe(criarEtapaSchema)) dto: CriarEtapaDto) {
    return this.service.criarEtapa(dto);
  }

  @Permissions('gerenciar_catalogo')
  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarEtapaSchema)) dto: AtualizarEtapaDto,
  ) {
    return this.service.atualizarEtapa(parseId(id), dto);
  }

  @Permissions('gerenciar_catalogo')
  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.service.removerEtapa(parseId(id));
  }
}
