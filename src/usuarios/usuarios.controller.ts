import {
  Body,
  Controller,
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
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type {
  AtualizarUsuarioDto,
  CriarUsuarioDto,
  ResetarSenhaDto,
} from './dto/usuarios.dto.js';
import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  resetarSenhaSchema,
} from './dto/usuarios.dto.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async listar() {
    return this.usuariosService.listar();
  }

  @Get('buscar')
  async buscar(@Query('q') q: string) {
    return this.usuariosService.buscar(q ?? '');
  }

  @Get('papeis')
  async listarPapeis() {
    return this.usuariosService.listarPapeis();
  }

  @Post()
  @Permissions('criar_usuario')
  async criar(
    @Body(new ZodValidationPipe(criarUsuarioSchema)) dto: CriarUsuarioDto,
  ) {
    return this.usuariosService.criar(dto);
  }

  @Put(':id')
  @Permissions('editar_usuario')
  async atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarUsuarioSchema))
    dto: AtualizarUsuarioDto,
  ) {
    return this.usuariosService.atualizar(Number(id), dto);
  }

  @Get('cargos')
  async listarCargos() {
    return this.usuariosService.listarCargos();
  }

  @Post('cargos')
  @Permissions('editar_usuario')
  async criarCargo(@Body() body: { nome: string; descricao?: string }) {
    return this.usuariosService.criarCargo(body);
  }

  @Put('cargos/:id')
  @Permissions('editar_usuario')
  async atualizarCargo(
    @Param('id') id: string,
    @Body() body: { nome?: string; descricao?: string; ativo?: boolean },
  ) {
    return this.usuariosService.atualizarCargo(Number(id), body);
  }

  @Patch(':id/perfil')
  @Permissions('editar_usuario')
  async definirPerfil(
    @Param('id') id: string,
    @Body() body: { papelId: number },
  ) {
    return this.usuariosService.atualizar(Number(id), {
      papelId: body.papelId,
    });
  }

  @Post(':id/resetar-senha')
  @Permissions('resetar_senha_usuario')
  async resetarSenha(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(resetarSenhaSchema)) dto: ResetarSenhaDto,
  ) {
    return this.usuariosService.resetarSenha(Number(id), dto.novaSenha);
  }
}
