import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationLog } from './entities/integration-log.entity.js';
import { Lead } from '../leads/entities/lead.entity.js';
import { PublicLeadDto } from './dto/public-lead.dto.js';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto.js';
import { InstagramWebhookDto } from './dto/instagram-webhook.dto.js';
import { IntegrationLogQueryDto } from './dto/integration-log-query.dto.js';
import { LeadSource, LeadStatus } from '../../common/enums/crm.enums.js';

import { Contact } from '../contacts/entities/contact.entity.js';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    @InjectRepository(IntegrationLog)
    private integrationLogRepository: Repository<IntegrationLog>,
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  async createPublicLead(dto: PublicLeadDto) {
    const source = (dto.source as LeadSource) || LeadSource.FORMULARIO;

    const lead = this.leadsRepository.create({
      name: dto.name,
      companyName: dto.company || '',
      email: dto.email,
      phone: dto.phone,
      notes: dto.service
        ? `Serviço de interesse: ${dto.service}${dto.message ? `\n${dto.message}` : ''}`
        : dto.message,
      status: LeadStatus.NOVO,
      source,
    });

    const savedLead = await this.leadsRepository.save(lead);

    // Create and save contact in contacts table
    const contact = this.contactsRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      whatsapp: source === LeadSource.WHATSAPP ? dto.phone : undefined,
      companyName: dto.company || '',
      notes: dto.service
        ? `Criado via Formulário de Contato. Serviço: ${dto.service}`
        : 'Criado via Formulário de Contato.',
      leadId: savedLead.id,
    });
    await this.contactsRepository.save(contact);

    const log = this.integrationLogRepository.create({
      source: 'formulario',
      rawPayload: JSON.stringify(dto),
      processed: true,
      leadId: savedLead.id,
    });

    await this.integrationLogRepository.save(log);

    this.logger.log(`Public lead created: ${savedLead.id} from formulario`);

    return {
      success: true,
      leadId: savedLead.id,
      message: 'Lead recebido com sucesso!',
    };
  }

  async logIntegration(data: {
    source: string;
    rawPayload?: string;
    processed?: boolean;
    leadId?: string;
    errorMessage?: string;
  }): Promise<IntegrationLog> {
    const log = this.integrationLogRepository.create({
      source: data.source,
      rawPayload: data.rawPayload,
      processed: data.processed ?? false,
      leadId: data.leadId,
      errorMessage: data.errorMessage,
    });

    return this.integrationLogRepository.save(log);
  }

  async findOrCreateLead(
    data: {
      name?: string;
      email?: string;
      phone?: string;
      whatsapp?: string;
      companyName?: string;
      notes?: string;
    },
    source: LeadSource,
  ): Promise<Lead> {
    const normalizedPhone = data.phone ? this.normalizePhone(data.phone) : null;

    // 1. Search by email
    if (data.email) {
      const existing = await this.leadsRepository.findOne({
        where: { email: data.email },
      });
      if (existing) {
        return this.updateExistingLead(existing, data);
      }
    }

    // 2. Search by normalized phone
    if (normalizedPhone) {
      const existing = await this.leadsRepository.findOne({
        where: { phone: normalizedPhone },
      });
      if (existing) {
        return this.updateExistingLead(existing, data);
      }
    }

    // 3. Search by whatsapp
    if (data.whatsapp) {
      const normalizedWhatsapp = this.normalizePhone(data.whatsapp);
      const existing = await this.leadsRepository.findOne({
        where: { whatsapp: normalizedWhatsapp },
      });
      if (existing) {
        return this.updateExistingLead(existing, data);
      }
    }

    // 4. Create new lead
    const lead = this.leadsRepository.create({
      name: data.name || 'Desconhecido',
      companyName: data.companyName || '',
      email: data.email,
      phone: normalizedPhone || data.phone,
      whatsapp: data.whatsapp ? this.normalizePhone(data.whatsapp) : undefined,
      notes: data.notes,
      status: LeadStatus.NOVO,
      source,
    });

    return this.leadsRepository.save(lead);
  }

  private async updateExistingLead(
    lead: Lead,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      whatsapp?: string;
      companyName?: string;
      notes?: string;
    },
  ): Promise<Lead> {
    let changed = false;

    if (!lead.name && data.name) {
      lead.name = data.name;
      changed = true;
    }
    if (!lead.email && data.email) {
      lead.email = data.email;
      changed = true;
    }
    if (!lead.phone && data.phone) {
      lead.phone = this.normalizePhone(data.phone);
      changed = true;
    }
    if (!lead.whatsapp && data.whatsapp) {
      lead.whatsapp = this.normalizePhone(data.whatsapp);
      changed = true;
    }
    if (!lead.companyName && data.companyName) {
      lead.companyName = data.companyName;
      changed = true;
    }
    if (data.notes) {
      lead.notes = lead.notes
        ? `${lead.notes}\n${data.notes}`
        : data.notes;
      changed = true;
    }

    lead.lastContactAt = new Date();
    lead.contactAttempts += 1;

    if (changed) {
      await this.leadsRepository.save(lead);
    }

    return lead;
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[\s\-\(\)\+]/g, '');
  }

  async handleWhatsAppWebhook(payload: WhatsAppWebhookDto) {
    const phone = payload.data?.key?.remoteJid || '';
    const name = payload.data?.pushName || '';
    const message = payload.data?.message?.conversation || '';

    this.logger.log(`WhatsApp webhook received from ${name} (${phone})`);

    const log = await this.logIntegration({
      source: 'whatsapp',
      rawPayload: JSON.stringify(payload),
      processed: false,
    });

    try {
      const lead = await this.findOrCreateLead(
        {
          name,
          phone: phone.replace('@s.whatsapp.net', ''),
          whatsapp: phone.replace('@s.whatsapp.net', ''),
          notes: message ? `Mensagem WhatsApp: ${message}` : undefined,
        },
        LeadSource.WHATSAPP,
      );

      log.processed = true;
      log.leadId = lead.id;
      await this.integrationLogRepository.save(log);

      this.logger.log(`WhatsApp lead processed: ${lead.id}`);

      return {
        success: true,
        leadId: lead.id,
        message: 'Mensagem WhatsApp processada com sucesso',
      };
    } catch (error) {
      log.errorMessage = error.message;
      await this.integrationLogRepository.save(log);

      this.logger.error(`WhatsApp webhook error: ${error.message}`);

      return {
        success: false,
        message: 'Erro ao processar mensagem WhatsApp',
      };
    }
  }

  async handleInstagramWebhook(payload: InstagramWebhookDto) {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const text = change?.value?.text || '';
    const fromUsername = change?.value?.from?.username || '';

    this.logger.log(`Instagram webhook received from @${fromUsername}`);

    const log = await this.logIntegration({
      source: 'instagram',
      rawPayload: JSON.stringify(payload),
      processed: false,
    });

    try {
      const lead = await this.findOrCreateLead(
        {
          name: fromUsername,
          companyName: `@${fromUsername}`,
          notes: text ? `Mensagem Instagram: ${text}` : undefined,
        },
        LeadSource.INSTAGRAM,
      );

      log.processed = true;
      log.leadId = lead.id;
      await this.integrationLogRepository.save(log);

      this.logger.log(`Instagram lead processed: ${lead.id}`);

      return {
        success: true,
        leadId: lead.id,
        message: 'Mensagem Instagram processada com sucesso',
      };
    } catch (error) {
      log.errorMessage = error.message;
      await this.integrationLogRepository.save(log);

      this.logger.error(`Instagram webhook error: ${error.message}`);

      return {
        success: false,
        message: 'Erro ao processar mensagem Instagram',
      };
    }
  }

  async getIntegrationLogs(filters: IntegrationLogQueryDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.integrationLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.lead', 'lead');

    if (filters.source) {
      qb.where('log.source = :source', { source: filters.source });
    }

    qb.orderBy('log.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getIntegrationLogById(id: string): Promise<IntegrationLog | null> {
    return this.integrationLogRepository.findOne({
      where: { id },
      relations: { lead: true },
    });
  }

  async getWhatsAppStatus() {
    return {
      connected: true,
      instance: 'default',
      status: 'open',
      message: 'WhatsApp integration ativa (mock)',
    };
  }

  async getInstagramStatus() {
    return {
      connected: true,
      accountId: 'mock_account',
      status: 'active',
      message: 'Instagram integration ativa (mock)',
    };
  }
}
