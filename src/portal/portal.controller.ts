import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Portal } from '../auth/decorators/portal.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AppError } from '../lib/errors.js';
import {
  type AtualizarPerfilInput,
  atualizarPerfilSchema,
} from '../schemas/portal.js';
import { PortalService } from './portal.service.js';

type UsuarioReq = { id: number };

@Portal()
@UseGuards(JwtAuthGuard)
@Controller('portal')
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  @Get('atendimentos')
  listarAtendimentos(@CurrentUser() user: UsuarioReq) {
    return this.portal.listarAtendimentos(user.id);
  }

  @Get('atendimentos/:id')
  detalharAtendimento(
    @CurrentUser() user: UsuarioReq,
    @Param('id') id: string,
  ) {
    return this.portal.detalharAtendimento(
      user.id,
      this.parseId(id, 'Atendimento não encontrado'),
    );
  }

  @Get('agendamentos')
  listarAgendamentos(@CurrentUser() user: UsuarioReq) {
    return this.portal.listarAgendamentos(user.id);
  }

  @Get('orcamentos')
  listarOrcamentos(@CurrentUser() user: UsuarioReq) {
    return this.portal.listarOrcamentos(user.id);
  }

  @Get('orcamentos/:id')
  detalharOrcamento(@CurrentUser() user: UsuarioReq, @Param('id') id: string) {
    return this.portal.detalharOrcamento(
      user.id,
      this.parseId(id, 'Orçamento não encontrado'),
    );
  }

  @Get('os')
  listarOs(@CurrentUser() user: UsuarioReq) {
    return this.portal.listarOs(user.id);
  }

  @Get('os/:id')
  detalharOs(@CurrentUser() user: UsuarioReq, @Param('id') id: string) {
    return this.portal.detalharOs(
      user.id,
      this.parseId(id, 'Ordem de serviço não encontrada'),
    );
  }

  @Patch('perfil')
  atualizarPerfil(
    @CurrentUser() user: UsuarioReq,
    @Body(new ZodValidationPipe(atualizarPerfilSchema))
    data: AtualizarPerfilInput,
  ) {
    return this.portal.atualizarPerfil(user.id, data);
  }

  private parseId(valor: string, mensagem: string): number {
    const id = Number(valor);
    if (!Number.isInteger(id) || id <= 0) throw new AppError(404, mensagem);
    return id;
  }
}
