import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  atualizarAtividadeObraSchema,
  atualizarEtapaSchema,
  atualizarObraSchema,
  criarAditivoSchema,
  criarAtividadeSchema,
  criarEtapaSchema,
  criarOsSchema,
  listarObrasQuerySchema,
} from '../schemas/obras.js';
import type {
  AtualizarAtividadeObraInput,
  AtualizarEtapaInput,
  AtualizarObraInput,
  CriarAditivoInput,
  CriarAtividadeInput,
  CriarEtapaInput,
  CriarOsInput,
  ListarObrasQueryInput,
} from './dto/obras.dto.js';
import { ObrasService } from './obras.service.js';

@Controller('obras')
@UseGuards(JwtAuthGuard)
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) {}

  @Get()
  @Permissions('ver_obras')
  async listar(@Query(new ZodValidationPipe(listarObrasQuerySchema)) query: ListarObrasQueryInput) {
    return this.obrasService.listar(query);
  }

  @Get(':id')
  @Permissions('ver_obras')
  async detalhar(@Param('id') id: string) {
    return this.obrasService.detalhar(Number(id));
  }

  @Get(':id/comparacao')
  @Permissions('ver_obras')
  async obterComparacao(@Param('id') id: string) {
    return this.obrasService.obterComparacao(Number(id));
  }

  @Patch(':id')
  @Permissions('editar_obra')
  async atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarObraSchema)) dto: AtualizarObraInput,
  ) {
    return this.obrasService.atualizar(Number(id), dto);
  }

  @Post(':id/concluir')
  @Permissions('editar_obra')
  async concluir(@Param('id') id: string, @Req() req: Request) {
    return this.obrasService.concluir(Number(id), (req as any).user.id);
  }

  @Post(':id/etapas')
  @Permissions('editar_obra')
  async criarEtapa(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarEtapaSchema)) dto: CriarEtapaInput,
  ) {
    return this.obrasService.criarEtapa(Number(id), dto);
  }

  @Patch(':id/etapas/:etapaId')
  @Permissions('editar_obra')
  async atualizarEtapa(
    @Param('id') id: string,
    @Param('etapaId') etapaId: string,
    @Body(new ZodValidationPipe(atualizarEtapaSchema)) dto: AtualizarEtapaInput,
  ) {
    return this.obrasService.atualizarEtapa(Number(id), Number(etapaId), dto);
  }

  @Delete(':id/etapas/:etapaId')
  @Permissions('editar_obra')
  async excluirEtapa(@Param('id') id: string, @Param('etapaId') etapaId: string) {
    return this.obrasService.excluirEtapa(Number(id), Number(etapaId));
  }

  @Post(':id/atividades')
  @Permissions('editar_obra')
  async criarAtividade(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarAtividadeSchema)) dto: CriarAtividadeInput,
  ) {
    return this.obrasService.criarAtividade(Number(id), dto);
  }

  @Patch(':id/atividades/:aid')
  @Permissions('editar_obra')
  async syncAtividadeObra(
    @Param('id') id: string,
    @Param('aid') aid: string,
    @Body(new ZodValidationPipe(atualizarAtividadeObraSchema)) dto: AtualizarAtividadeObraInput,
  ) {
    return this.obrasService.syncAtividadeObra(Number(id), aid, dto);
  }

  @Post(':id/os')
  @Permissions('criar_os')
  async criarOsDaObra(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarOsSchema)) dto: CriarOsInput,
  ) {
    return this.obrasService.criarOsDaObra(Number(id), dto);
  }

  @Post(':id/aditivos')
  @Permissions('criar_aditivo')
  async criarAditivo(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarAditivoSchema)) dto: CriarAditivoInput,
  ) {
    return this.obrasService.criarAditivo(Number(id), dto);
  }

  @Post('/aditivos/:id/aprovar')
  @Permissions('aprovar_aditivo')
  async aprovarAditivo(@Param('id') id: string, @Req() req: Request) {
    return this.obrasService.aprovarAditivo(Number(id), (req as any).user.id);
  }

  @Post('/aditivos/:id/recusar')
  @Permissions('aprovar_aditivo')
  async recusarAditivo(@Param('id') id: string, @Req() req: Request) {
    return this.obrasService.recusarAditivo(Number(id), (req as any).user.id);
  }
}
