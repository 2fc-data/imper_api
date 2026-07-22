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
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import type { Response } from 'express';
import { ProposalsService } from './proposals.service.js';
import { CreateProposalDto } from './dto/create-proposal.dto.js';
import { UpdateProposalDto } from './dto/update-proposal.dto.js';
import { SignProposalDto } from './dto/sign-proposal.dto.js';
import { ProposalFilterDto } from './dto/proposal-filter.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Proposals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/proposals')
export class ProposalsController {
  constructor(private proposalsService: ProposalsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar proposta' })
  create(
    @Body() dto: CreateProposalDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.proposalsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar propostas (filtros, paginação)' })
  findAll(@Query() filters: ProposalFilterDto) {
    return this.proposalsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da proposta' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.proposalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar proposta' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProposalDto,
  ) {
    return this.proposalsService.update(id, dto);
  }

  @Patch(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar proposta' })
  send(@Param('id', ParseUUIDPipe) id: string) {
    return this.proposalsService.send(id);
  }

  @Patch(':id/sign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assinar proposta' })
  sign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SignProposalDto,
    @Req() req: Request,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ?? req.ip ?? 'unknown';
    return this.proposalsService.sign(id, dto, ip);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeitar proposta' })
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.proposalsService.reject(id);
  }

  @Post('check-expired')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar e expirar propostas vencidas' })
  async checkExpired() {
    const count = await this.proposalsService.checkExpired();
    return { expired: count };
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Baixar PDF da proposta' })
  async downloadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const proposal = await this.proposalsService.findOne(id);
    const pdfBuffer = await this.proposalsService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${proposal.number}.pdf"`,
    });

    res.end(pdfBuffer);
  }
}
