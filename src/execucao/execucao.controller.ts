import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ExecucaoService } from './execucao.service.js';
import {
  planificarAtividadeSchema,
  statusExecucaoSchema,
} from './dto/execucao.dto.js';
import type {
  PlanificarAtividadeDto,
  StatusExecucaoDto,
} from './dto/execucao.dto.js';

type UsuarioReq = { id: number };

@Controller('execucao')
@UseGuards(JwtAuthGuard)
export class ExecucaoController {
  constructor(private readonly service: ExecucaoService) {}

  @Get()
  listar(@Query('obraId') obraId?: string) {
    return this.service.listar(obraId ? Number(obraId) : undefined);
  }

  @Get(':id')
  detalhar(@Param('id') id: string) {
    return this.service.detalhar(id);
  }

  @Post('planificar')
  planificar(
    @Body(new ZodValidationPipe(planificarAtividadeSchema))
    dto: PlanificarAtividadeDto,
    @CurrentUser() user: UsuarioReq,
  ) {
    return this.service.planificar(dto.atividadeId, user.id);
  }

  @Patch(':id/status')
  mudarStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(statusExecucaoSchema)) dto: StatusExecucaoDto,
    @CurrentUser() user: UsuarioReq,
  ) {
    return this.service.mudarStatus(id, dto.status, user.id);
  }
}
