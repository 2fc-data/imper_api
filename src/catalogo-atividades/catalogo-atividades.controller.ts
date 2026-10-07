import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AppError } from '../lib/errors.js';
import { CatalogoAtividadesService } from './catalogo-atividades.service.js';
import {
  type AdicionarRecursoDto,
  type AdicionarSubStepDto,
  type AtualizarCatalogoDto,
  type CriarCatalogoDto,
  adicionarRecursoSchema,
  adicionarSubStepSchema,
  atualizarCatalogoSchema,
  criarCatalogoSchema,
} from './dto/catalogo-atividades.dto.js';

function parseId(valor: string, campo: string): string {
  const id = valor.trim();
  if (!id) throw new AppError(400, `${campo} inválido`);
  return id;
}

@Controller('catalogo-atividades')
@UseGuards(JwtAuthGuard)
export class CatalogoAtividadesController {
  constructor(private readonly service: CatalogoAtividadesService) {}

  @Get()
  async listar(
    @Query('q') q?: string,
    @Query('especialidade') especialidade?: string,
    @Query('etapaId') etapaId?: string,
    @Query('subServicoId') subServicoId?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.listar({
      q,
      especialidade,
      etapaId: etapaId !== undefined ? Number(etapaId) : undefined,
      subServicoId:
        subServicoId !== undefined ? Number(subServicoId) : undefined,
      ativo:
        ativo === undefined
          ? undefined
          : ativo === 'true'
            ? true
            : ativo === 'false'
              ? false
              : undefined,
    });
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.service.detalhar(parseId(id, 'Atividade'));
  }

  @Permissions('gerenciar_catalogo')
  @Post()
  async criar(
    @Body(new ZodValidationPipe(criarCatalogoSchema)) dto: CriarCatalogoDto,
  ) {
    return this.service.criar(dto);
  }

  @Permissions('gerenciar_catalogo')
  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarCatalogoSchema))
    dto: AtualizarCatalogoDto,
  ) {
    return this.service.atualizar(parseId(id, 'Atividade'), dto);
  }

  @Permissions('gerenciar_catalogo')
  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return this.service.excluir(parseId(id, 'Atividade'));
  }

  @Permissions('gerenciar_catalogo')
  @Post(':id/substeps')
  async adicionarSubStep(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adicionarSubStepSchema))
    dto: AdicionarSubStepDto,
  ) {
    return this.service.adicionarSubStep(parseId(id, 'Atividade'), dto);
  }

  @Permissions('gerenciar_catalogo')
  @Delete('substeps/:substepId')
  async removerSubStep(@Param('substepId') substepId: string) {
    return this.service.removerSubStep(parseId(substepId, 'Substep'));
  }

  @Permissions('gerenciar_catalogo')
  @Post(':id/recursos')
  async adicionarRecurso(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adicionarRecursoSchema))
    dto: AdicionarRecursoDto,
  ) {
    return this.service.adicionarRecurso(parseId(id, 'Atividade'), dto);
  }

  @Permissions('gerenciar_catalogo')
  @Delete('recursos/:recursoId')
  async removerRecurso(@Param('recursoId') recursoId: string) {
    return this.service.removerRecurso(parseId(recursoId, 'Recurso'));
  }
}
