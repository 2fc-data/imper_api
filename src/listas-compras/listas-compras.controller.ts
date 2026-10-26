import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { TipoListaCompra } from '@prisma/client';
import type { Request } from 'express';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  type ComprarItemInput,
  comprarItemSchema,
  type ListarListaComprasQueryInput,
  listarListaComprasQuerySchema,
  type RecusarListaInput,
  recusarListaSchema,
  type SalvarItensListaInput,
  salvarItensListaSchema,
} from '../schemas/listas-compras.js';
import { ListasComprasService } from './listas-compras.service.js';

interface RequestWithUser extends Request {
  user?: { id: number };
}

@Controller('listas-compras')
@UseGuards(JwtAuthGuard)
export class ListasComprasController {
  constructor(private readonly service: ListasComprasService) {}

  @Get()
  async obter(
    @Query(new ZodValidationPipe(listarListaComprasQuerySchema))
    query: ListarListaComprasQueryInput,
  ) {
    return this.service.obter(
      query.tipo,
      query.setor,
      query.mes,
      query.ano,
      query.tipoDespesaId,
    );
  }

  @Put(':tipo/:setor/:mes/:ano/itens')
  @Permissions('criar_lista_compras')
  async salvarItens(
    @Param('tipo') tipo: TipoParam,
    @Param('setor') setor: SetorParam,
    @Param('mes') mes: string,
    @Param('ano') ano: string,
    @Query('tipoDespesaId') queryTipoDespesaId: string | undefined,
    @Body(new ZodValidationPipe(salvarItensListaSchema))
    body: SalvarItensListaInput,
    @Req() req: RequestWithUser,
  ) {
    const tipoNormalizado = (
      tipo === 'SUPERMERCADO' ? 'DESPESAS_EXTRAS' : tipo
    ) as TipoListaCompra;
    const tipoDespesaId =
      body.tipoDespesaId ??
      (queryTipoDespesaId ? Number(queryTipoDespesaId) : undefined);
    return this.service.salvarItens(
      tipoNormalizado,
      setor,
      Number(mes),
      Number(ano),
      body,
      req.user?.id ?? 0,
      tipoDespesaId,
    );
  }

  @Post(':id/enviar')
  @Permissions('criar_lista_compras')
  async enviar(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.service.enviar(Number(id), req.user?.id ?? 0);
  }

  @Post(':id/aprovar')
  @Permissions('aprovar_lista_compras')
  async aprovar(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.service.aprovar(Number(id), req.user?.id ?? 0);
  }

  @Post(':id/recusar')
  @Permissions('aprovar_lista_compras')
  async recusar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(recusarListaSchema)) body: RecusarListaInput,
    @Req() req: RequestWithUser,
  ) {
    return this.service.recusar(Number(id), body.motivo, req.user?.id ?? 0);
  }

  @Post(':id/itens/:itemId/recusar')
  @Permissions('aprovar_lista_compras')
  async recusarItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.service.recusarItem(
      Number(id),
      Number(itemId),
      req.user?.id ?? 0,
    );
  }

  @Post(':id/itens/:itemId/reverter')
  @Permissions('aprovar_lista_compras')
  async reverterItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.reverterItem(Number(id), Number(itemId));
  }

  @Post(':id/itens/:itemId/comprar')
  @Permissions('aprovar_lista_compras')
  async comprarItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(comprarItemSchema)) body: ComprarItemInput,
    @Req() req: RequestWithUser,
  ) {
    return this.service.comprarItem(
      Number(id),
      Number(itemId),
      body.custoReal,
      req.user?.id ?? 0,
    );
  }
}

type TipoParam =
  | 'DESPESAS_EXTRAS'
  | 'SUPERMERCADO'
  | 'MATERIAL'
  | 'EPI'
  | 'EQUIPAMENTO';
type SetorParam = 'LOJA' | 'ALMOXARIFADO';
