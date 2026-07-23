import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ColaboradoresService } from './colaboradores.service.js';
import { CreateColaboradorDto } from './dto/create-colaborador.dto.js';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto.js';
import { QueryColaboradorDto } from './dto/query-colaborador.dto.js';
import { CreateEmergenciaDto } from './dto/create-emergencia.dto.js';
import { CreateEpiDto } from './dto/create-epi.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Colaboradores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/colaboradores')
export class ColaboradoresController {
  constructor(private readonly colaboradoresService: ColaboradoresService) {}

  @Post()
  @ApiOperation({ summary: 'Criar colaborador' })
  create(@Body() dto: CreateColaboradorDto) {
    return this.colaboradoresService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar colaboradores (filtros, paginação)' })
  findAll(@Query() filters: QueryColaboradorDto) {
    return this.colaboradoresService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do colaborador' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.colaboradoresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar colaborador' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateColaboradorDto) {
    return this.colaboradoresService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir colaborador' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.colaboradoresService.remove(id);
  }

  @Get(':id/emergencia')
  @ApiOperation({ summary: 'Listar contatos de emergência' })
  findEmergencia(@Param('id', ParseUUIDPipe) id: string) {
    return this.colaboradoresService.findEmergencia(id);
  }

  @Post(':id/emergencia')
  @ApiOperation({ summary: 'Adicionar contato de emergência' })
  addEmergencia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEmergenciaDto,
  ) {
    return this.colaboradoresService.addEmergencia(id, dto);
  }

  @Delete(':id/emergencia/:emergenciaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover contato de emergência' })
  removeEmergencia(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('emergenciaId', ParseUUIDPipe) emergenciaId: string,
  ) {
    return this.colaboradoresService.removeEmergencia(emergenciaId);
  }

  @Get(':id/epis')
  @ApiOperation({ summary: 'Listar EPIs do colaborador' })
  findEpis(@Param('id', ParseUUIDPipe) id: string) {
    return this.colaboradoresService.findEpis(id);
  }

  @Post(':id/epis')
  @ApiOperation({ summary: 'Registrar entrega de EPI' })
  addEpi(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEpiDto,
  ) {
    return this.colaboradoresService.addEpi(id, dto);
  }
}
