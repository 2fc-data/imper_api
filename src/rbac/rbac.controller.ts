import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type {
  AtualizarPapelDto,
  CriarPapelDto,
  DefinirPermissoesDto,
} from './dto/rbac.dto.js';
import {
  atualizarPapelSchema,
  criarPapelSchema,
  definirPermissoesSchema,
} from './dto/rbac.dto.js';
import { RbacService } from './rbac.service.js';

@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('papeis')
  @Permissions('gerenciar_papeis')
  async listarPapeis() {
    return this.rbacService.listarPapeis();
  }

  @Post('papeis')
  @Permissions('gerenciar_papeis')
  @UsePipes(new ZodValidationPipe(criarPapelSchema))
  async criarPapel(@Body() dto: CriarPapelDto) {
    return this.rbacService.criarPapel(dto);
  }

  @Put('papeis/:id')
  @Permissions('gerenciar_papeis')
  async atualizarPapel(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarPapelSchema)) dto: AtualizarPapelDto,
  ) {
    return this.rbacService.atualizarPapel(Number(id), dto);
  }

  @Delete('papeis/:id')
  @Permissions('gerenciar_papeis')
  async excluirPapel(@Param('id') id: string) {
    return this.rbacService.excluirPapel(Number(id));
  }

  @Get('permissoes')
  @Permissions('gerenciar_papeis')
  async listarPermissoes() {
    return this.rbacService.listarPermissoes();
  }

  @Get('papeis/:id/permissoes')
  @Permissions('gerenciar_papeis')
  async listarPermissoesPorPapel(@Param('id') id: string) {
    return this.rbacService.listarPermissoesPorPapel(Number(id));
  }

  @Put('papeis/:id/permissoes')
  @Permissions('gerenciar_papeis')
  async definirPermissoes(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(definirPermissoesSchema))
    dto: DefinirPermissoesDto,
  ) {
    return this.rbacService.definirPermissoes(Number(id), dto.permissoesIds);
  }
}
