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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AtividadesOSService } from './atividades-os.service.js';
import {
  type AssociarEquipeDto,
  associarEquipeSchema,
} from './dto/atividades-os.dto.js';

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

  /**
   * @deprecated spec 3.4: superseded pela aprovação do orçamento (T9).
   */
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
    @Body(new ZodValidationPipe(associarEquipeSchema)) dto: AssociarEquipeDto,
  ) {
    return this.service.associarEquipe(id, dto);
  }
}
