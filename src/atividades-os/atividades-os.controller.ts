import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AtividadesOSService } from './atividades-os.service.js';

@Controller('atividades-os')
@UseGuards(JwtAuthGuard)
export class AtividadesOSController {
  constructor(private readonly service: AtividadesOSService) {}

  @Get()
  async listar(
    @Query('osId') osId?: string,
    @Query('etapaOSId') etapaOSId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listar({
      osId: osId ? Number(osId) : undefined,
      etapaOSId: etapaOSId ? Number(etapaOSId) : undefined,
      status,
    });
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.service.detalhar(id);
  }

  @Post('planificar')
  async planificar(@Body() dto: any) {
    return this.service.planificar(dto);
  }

  @Put(':id/status')
  async atualizarStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.service.atualizarStatus(id, status);
  }

  @Put(':id/equipe')
  async associarEquipe(
    @Param('id') id: string,
    @Body('equipeId') equipeId: string,
  ) {
    return this.service.associarEquipe(id, equipeId);
  }
}
