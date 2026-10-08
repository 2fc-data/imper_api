import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type {
  AtualizarServicoDto,
  CriarServicoDto,
} from './dto/servicos-admin.dto.js';
import {
  atualizarServicoSchema,
  criarServicoSchema,
} from './dto/servicos-admin.dto.js';
import { ServicosAdminService } from './servicos-admin.service.js';

@Controller('servicos-admin')
@UseGuards(JwtAuthGuard)
export class ServicosAdminController {
  constructor(private readonly servicosAdminService: ServicosAdminService) {}

  @Get()
  listar(@Query('q') q?: string) {
    return this.servicosAdminService.listar({ q });
  }

  @Post()
  @Permissions('criar_servico')
  criar(@Body(new ZodValidationPipe(criarServicoSchema)) dto: CriarServicoDto) {
    return this.servicosAdminService.criar(dto);
  }

  @Put(':id')
  @Permissions('editar_servico')
  atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarServicoSchema))
    dto: AtualizarServicoDto,
  ) {
    return this.servicosAdminService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('editar_servico')
  excluir(@Param('id') id: string) {
    return this.servicosAdminService.excluir(Number(id));
  }
}
