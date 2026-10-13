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
  type AtualizarComboDto,
  type AtualizarSubServicoDto,
  type AtualizarTermoDto,
  atualizarComboSchema,
  atualizarSubServicoSchema,
  atualizarTermoSchema,
  type CriarComboDto,
  type CriarSubServicoDto,
  type CriarTermoDto,
  criarComboSchema,
  criarSubServicoSchema,
  criarTermoSchema,
} from './dto/vocabulario.dto.js';
import { VocabularioService } from './vocabulario.service.js';

function parseAtivo(ativo?: string): boolean | undefined {
  if (ativo === 'true') return true;
  if (ativo === 'false') return false;
  return undefined;
}

function parseFiltro(
  valor: string | undefined,
  campo: string,
): number | null | undefined {
  if (valor === undefined) return undefined;
  if (valor === '' || valor === 'null') return null;
  const numero = Number(valor);
  if (!Number.isInteger(numero)) {
    throw new AppError(400, `Filtro ${campo} inválido`);
  }
  return numero;
}

function parseId(valor: string, campo: string): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero)) {
    throw new AppError(400, `${campo} inválido`);
  }
  return numero;
}

@UseGuards(JwtAuthGuard)
@Controller('vocabulario')
export class VocabularioController {
  constructor(private readonly service: VocabularioService) {}

  @Get('verbos')
  listarVerbos(@Query('q') q?: string, @Query('ativo') ativo?: string) {
    return this.service.listarTermos('verbos', {
      q,
      ativo: parseAtivo(ativo),
    });
  }

  @Permissions('gerenciar_catalogo')
  @Post('verbos')
  criarVerbo(
    @Body(new ZodValidationPipe(criarTermoSchema)) dto: CriarTermoDto,
  ) {
    return this.service.criarTermo('verbos', dto);
  }

  @Permissions('gerenciar_catalogo')
  @Patch('verbos/:id')
  atualizarVerbo(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarTermoSchema)) dto: AtualizarTermoDto,
  ) {
    return this.service.atualizarTermo('verbos', parseId(id, 'Verbo'), dto);
  }

  @Permissions('gerenciar_catalogo')
  @Delete('verbos/:id')
  removerVerbo(@Param('id') id: string) {
    return this.service.removerTermo('verbos', parseId(id, 'Verbo'));
  }

  @Get('objetos')
  listarObjetos(@Query('q') q?: string, @Query('ativo') ativo?: string) {
    return this.service.listarTermos('objetos', {
      q,
      ativo: parseAtivo(ativo),
    });
  }

  @Permissions('gerenciar_catalogo')
  @Post('objetos')
  criarObjeto(
    @Body(new ZodValidationPipe(criarTermoSchema)) dto: CriarTermoDto,
  ) {
    return this.service.criarTermo('objetos', dto);
  }

  @Permissions('gerenciar_catalogo')
  @Patch('objetos/:id')
  atualizarObjeto(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarTermoSchema)) dto: AtualizarTermoDto,
  ) {
    return this.service.atualizarTermo('objetos', parseId(id, 'Objeto'), dto);
  }

  @Permissions('gerenciar_catalogo')
  @Delete('objetos/:id')
  removerObjeto(@Param('id') id: string) {
    return this.service.removerTermo('objetos', parseId(id, 'Objeto'));
  }

  @Get('locais')
  listarLocais(@Query('q') q?: string, @Query('ativo') ativo?: string) {
    return this.service.listarTermos('locais', {
      q,
      ativo: parseAtivo(ativo),
    });
  }

  @Permissions('gerenciar_catalogo')
  @Post('locais')
  criarLocal(
    @Body(new ZodValidationPipe(criarTermoSchema)) dto: CriarTermoDto,
  ) {
    return this.service.criarTermo('locais', dto);
  }

  @Permissions('gerenciar_catalogo')
  @Patch('locais/:id')
  atualizarLocal(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarTermoSchema)) dto: AtualizarTermoDto,
  ) {
    return this.service.atualizarTermo('locais', parseId(id, 'Local'), dto);
  }

  @Permissions('gerenciar_catalogo')
  @Delete('locais/:id')
  removerLocal(@Param('id') id: string) {
    return this.service.removerTermo('locais', parseId(id, 'Local'));
  }

  @Get('caracteristicas')
  listarCaracteristicas(
    @Query('q') q?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.listarTermos('caracteristicas', {
      q,
      ativo: parseAtivo(ativo),
    });
  }

  @Permissions('gerenciar_catalogo')
  @Post('caracteristicas')
  criarCaracteristica(
    @Body(new ZodValidationPipe(criarTermoSchema)) dto: CriarTermoDto,
  ) {
    return this.service.criarTermo('caracteristicas', dto);
  }

  @Permissions('gerenciar_catalogo')
  @Patch('caracteristicas/:id')
  atualizarCaracteristica(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarTermoSchema)) dto: AtualizarTermoDto,
  ) {
    return this.service.atualizarTermo(
      'caracteristicas',
      parseId(id, 'Característica'),
      dto,
    );
  }

  @Permissions('gerenciar_catalogo')
  @Delete('caracteristicas/:id')
  removerCaracteristica(@Param('id') id: string) {
    return this.service.removerTermo(
      'caracteristicas',
      parseId(id, 'Característica'),
    );
  }

  @Get('sub-servicos')
  listarSubServicos(
    @Query('etapaId') etapaId?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.listarSubServicos(
      etapaId !== undefined ? parseId(etapaId, 'etapaId') : undefined,
      parseAtivo(ativo),
    );
  }

  @Permissions('gerenciar_catalogo')
  @Post('sub-servicos')
  criarSubServico(
    @Body(new ZodValidationPipe(criarSubServicoSchema))
    dto: CriarSubServicoDto,
  ) {
    return this.service.criarSubServico(dto);
  }

  @Get('sub-servicos/:id/cascata')
  cascata(
    @Param('id') id: string,
    @Query('verboId') verboId?: string,
    @Query('objetoId') objetoId?: string,
    @Query('localId') localId?: string,
    @Query('caracteristicaId') caracteristicaId?: string,
  ) {
    const subServicoId = parseId(id, 'Sub-serviço');
    return this.service.cascata(subServicoId, {
      verboId: parseFiltro(verboId, 'verboId'),
      objetoId: parseFiltro(objetoId, 'objetoId'),
      localId: parseFiltro(localId, 'localId'),
      caracteristicaId: parseFiltro(caracteristicaId, 'caracteristicaId'),
    });
  }

  @Permissions('gerenciar_catalogo')
  @Patch('sub-servicos/:id')
  atualizarSubServico(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarSubServicoSchema))
    dto: AtualizarSubServicoDto,
  ) {
    return this.service.atualizarSubServico(parseId(id, 'Sub-serviço'), dto);
  }

  @Permissions('gerenciar_catalogo')
  @Delete('sub-servicos/:id')
  removerSubServico(@Param('id') id: string) {
    return this.service.removerSubServico(parseId(id, 'Sub-serviço'));
  }

  @Get('sub-servicos/:id/combos')
  listarCombos(@Param('id') id: string) {
    return this.service.listarCombos(parseId(id, 'Sub-serviço'));
  }

  @Permissions('gerenciar_catalogo')
  @Post('combos')
  criarCombo(
    @Body(new ZodValidationPipe(criarComboSchema)) dto: CriarComboDto,
  ) {
    return this.service.criarCombo(dto);
  }

  @Permissions('gerenciar_catalogo')
  @Patch('combos/:id')
  atualizarCombo(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarComboSchema)) dto: AtualizarComboDto,
  ) {
    return this.service.atualizarCombo(parseId(id, 'Combo'), dto);
  }

  @Permissions('gerenciar_catalogo')
  @Delete('combos/:id')
  removerCombo(@Param('id') id: string) {
    return this.service.removerCombo(parseId(id, 'Combo'));
  }
}

