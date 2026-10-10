import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { SeparacaoService } from './separacao.service.js';

type UsuarioReq = { id: number };

@Controller('separacao')
@UseGuards(JwtAuthGuard)
export class SeparacaoController {
  constructor(private readonly service: SeparacaoService) {}

  @Get()
  async listar(
    @Query('obraId') obraId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listar({
      obraId: obraId ? Number(obraId) : undefined,
      status,
    });
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.service.detalhar(Number(id));
  }

  @Put(':id/confirmar')
  async confirmarSeparacao(
    @Param('id') id: string,
    @CurrentUser() user: UsuarioReq,
  ) {
    return this.service.confirmarSeparacao(Number(id), user.id);
  }

  @Put(':id/retirada')
  async registrarRetirada(@Param('id') id: string) {
    return this.service.registrarRetirada(Number(id));
  }

  @Put(':id/devolucao')
  async registrarDevolucao(@Param('id') id: string) {
    return this.service.registrarDevolucao(Number(id));
  }

  @Put(':id/itens/:itemId/retirar')
  async registrarRetiradaItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: { colaboradorId: number; observacao?: string },
    @CurrentUser() user: UsuarioReq,
  ) {
    return this.service.registrarRetiradaItem(Number(id), Number(itemId), {
      ...body,
      registradoPorId: user.id,
    });
  }

  @Put(':id/itens/:itemId/devolver')
  async registrarDevolucaoItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: { observacao?: string; status?: 'DEVOLVIDO' | 'PERDIDO' },
    @CurrentUser() user: UsuarioReq,
  ) {
    return this.service.registrarDevolucaoItem(Number(id), Number(itemId), {
      ...body,
      registradoPorId: user.id,
    });
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return this.service.excluir(Number(id));
  }
}
