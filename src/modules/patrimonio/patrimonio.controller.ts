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
import { PatrimonioService } from './patrimonio.service.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';
import { QueryAssetDto } from './dto/query-asset.dto.js';
import { CreateAssignmentDto } from './dto/create-assignment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Patrimonio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/patrimonio')
export class PatrimonioController {
  constructor(private readonly patrimonioService: PatrimonioService) {}

  @Post()
  @ApiOperation({ summary: 'Criar ativo' })
  create(@Body() dto: CreateAssetDto) {
    return this.patrimonioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ativos (filtros, paginação)' })
  findAll(@Query() filters: QueryAssetDto) {
    return this.patrimonioService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do ativo' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patrimonioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ativo' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAssetDto) {
    return this.patrimonioService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir ativo' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.patrimonioService.remove(id);
  }

  @Get(':id/alocacoes')
  @ApiOperation({ summary: 'Listar alocações do ativo' })
  findAssignments(@Param('id', ParseUUIDPipe) id: string) {
    return this.patrimonioService.findAssignments(id);
  }

  @Post(':id/alocacoes')
  @ApiOperation({ summary: 'Alocar ativo a colaborador' })
  addAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.patrimonioService.addAssignment(id, dto);
  }

  @Delete(':id/alocacoes/:assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover alocação' })
  removeAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ) {
    return this.patrimonioService.removeAssignment(assignmentId);
  }
}
