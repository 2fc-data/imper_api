import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { CancelarOsDto } from './dto/os.dto.js';
import { cancelarOsSchema } from './dto/os.dto.js';
import { OsService } from './os.service.js';

@Controller('os')
@UseGuards(JwtAuthGuard)
export class OsController {
  constructor(private readonly osService: OsService) {}

  @Get()
  async listar(@Query('status') status?: string, @Query('q') q?: string) {
    return this.osService.listar({ status, q });
  }

  @Post(':id/aprovar')
  @Permissions('aprovar_os')
  async aprovar(@Param('id') id: string, @Req() req: Request) {
    return this.osService.aprovar(Number(id), (req as any).user.id);
  }

  @Post(':id/iniciar')
  @Permissions('iniciar_os')
  async iniciar(@Param('id') id: string) {
    return this.osService.iniciar(Number(id));
  }

  @Post(':id/concluir')
  @Permissions('concluir_os')
  async concluir(@Param('id') id: string) {
    return this.osService.concluir(Number(id));
  }

  @Post(':id/cancelar')
  @Permissions('cancelar_os')
  async cancelar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(cancelarOsSchema)) dto: CancelarOsDto,
  ) {
    return this.osService.cancelar(Number(id), dto);
  }
}
