import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationsService } from './integrations.service.js';
import { PublicLeadDto } from './dto/public-lead.dto.js';
import { ServicesService } from '../services/services.service.js';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto.js';
import { InstagramWebhookDto } from './dto/instagram-webhook.dto.js';
import { IntegrationLogQueryDto } from './dto/integration-log-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Proposal } from '../proposals/entities/proposal.entity.js';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private integrationsService: IntegrationsService,
    private readonly servicesService: ServicesService,
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
  ) {}

  @Public()
  @Post('lead')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar lead via formulário público (sem autenticação)' })
  createPublicLead(@Body() dto: PublicLeadDto) {
    return this.integrationsService.createPublicLead(dto);
  }

  @Public()
  @Get('services')
  @ApiOperation({ summary: 'Listar serviços públicos (landing page, sem autenticação)' })
  getPublicServices() {
    return this.servicesService.findAll();
  }

  @Public()
  @Get('proposals/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Visualizar proposta pública por token (sem autenticação)' })
  async getPublicProposal(@Param('token') token: string) {
    const proposal = await this.proposalsRepository.findOne({
      where: { publicToken: token },
      relations: { items: true },
    });
    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }
    return {
      id: proposal.id,
      title: proposal.number,
      description: proposal.scope,
      status: proposal.status,
      validUntil: proposal.validUntil,
      createdAt: proposal.createdAt,
      total: Number(proposal.finalValue) || Number(proposal.totalValue),
      items: (proposal.items || []).map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
    };
  }

  @Public()
  @Post('whatsapp/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook do WhatsApp — recebe mensagens' })
  handleWhatsAppWebhook(@Body() payload: WhatsAppWebhookDto) {
    return this.integrationsService.handleWhatsAppWebhook(payload);
  }

  @Public()
  @Post('instagram/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook do Instagram — recebe comentários e DMs' })
  handleInstagramWebhook(@Body() payload: InstagramWebhookDto) {
    return this.integrationsService.handleInstagramWebhook(payload);
  }

  @Public()
  @Get('whatsapp/status')
  @ApiOperation({ summary: 'Status da integração WhatsApp' })
  getWhatsAppStatus() {
    return this.integrationsService.getWhatsAppStatus();
  }

  @Public()
  @Get('instagram/status')
  @ApiOperation({ summary: 'Status da integração Instagram' })
  getInstagramStatus() {
    return this.integrationsService.getInstagramStatus();
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar logs de integração (paginado)' })
  getIntegrationLogs(@Query() query: IntegrationLogQueryDto) {
    return this.integrationsService.getIntegrationLogs(query);
  }

  @Get('logs/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhe de um log de integração' })
  getIntegrationLogById(@Param('id') id: string) {
    return this.integrationsService.getIntegrationLogById(id);
  }
}
