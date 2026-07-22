import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { CloseOpportunityDto } from './dto/close-opportunity.dto';
import { OpportunityFilterDto } from './dto/opportunity-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Opportunities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/opportunities')
export class OpportunitiesController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar oportunidade' })
  create(
    @Body() dto: CreateOpportunityDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.opportunitiesService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar oportunidades (filtros, paginação)' })
  findAll(@Query() filters: OpportunityFilterDto) {
    return this.opportunitiesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da oportunidade' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar oportunidade' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(id, dto);
  }

  @Patch(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fechar oportunidade (ganho/perdido)' })
  close(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseOpportunityDto,
  ) {
    return this.opportunitiesService.close(id, dto);
  }
}
