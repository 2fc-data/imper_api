import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { randomUUID } from 'crypto';
import { Proposal } from './entities/proposal.entity.js';
import { ProposalItem } from './entities/proposal-item.entity.js';
import { CreateProposalDto } from './dto/create-proposal.dto.js';
import { UpdateProposalDto } from './dto/update-proposal.dto.js';
import { SignProposalDto } from './dto/sign-proposal.dto.js';
import { ProposalFilterDto } from './dto/proposal-filter.dto.js';
import { ProposalStatus, NotificationType } from '../../common/enums/crm.enums.js';
import { ProposalPdfService } from './proposal-pdf.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationsGateway } from '../notifications/notifications.gateway.js';

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name);

  constructor(
    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,
    @InjectRepository(ProposalItem)
    private proposalItemRepository: Repository<ProposalItem>,
    private readonly proposalPdfService: ProposalPdfService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(dto: CreateProposalDto, userId: string): Promise<Proposal> {
    const number = await this.generateNumber();

    const items = dto.items.map((item) => {
      const total = item.quantity * item.unitPrice;
      return this.proposalItemRepository.create({ ...item, total });
    });

    const totalValue = items.reduce((sum, item) => sum + Number(item.total), 0);
    const discountPercent = dto.discountPercent ?? 0;
    const finalValue = totalValue * (1 - discountPercent / 100);

    const proposal = this.proposalRepository.create({
      number,
      publicToken: randomUUID(),
      title: dto.title,
      scope: dto.scope,
      terms: dto.terms,
      discountPercent,
      totalValue,
      finalValue,
      opportunityId: dto.opportunityId,
      createdById: userId,
      items,
    });

    return this.proposalRepository.save(proposal);
  }

  async findAll(filters: ProposalFilterDto) {
    const { page = 1, limit = 20, search, status, opportunityId } = filters;
    const qb = this.proposalRepository.createQueryBuilder('prop');

    if (search) {
      qb.where(
        '(prop.number LIKE :search OR prop.scope LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('prop.status = :status', { status });
    }

    if (opportunityId) {
      qb.andWhere('prop.opportunityId = :opportunityId', { opportunityId });
    }

    qb.orderBy('prop.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('prop.opportunity', 'opportunity')
      .leftJoinAndSelect('prop.createdBy', 'createdBy')
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Proposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
      relations: {
        items: true,
        opportunity: true,
        createdBy: true,
      },
    });
    if (!proposal) throw new NotFoundException(`Proposal ${id} not found`);
    return proposal;
  }

  async update(id: string, dto: UpdateProposalDto): Promise<Proposal> {
    const proposal = await this.findOne(id);

    if (proposal.status !== ProposalStatus.RASCUNHO) {
      throw new BadRequestException(
        'Only proposals in RASCUNHO status can be updated',
      );
    }

    if (dto.items) {
      await this.proposalItemRepository.delete({ proposalId: id });

      const items = dto.items.map((item) => {
        const total = item.quantity * item.unitPrice;
        return this.proposalItemRepository.create({
          ...item,
          total,
          proposalId: id,
        });
      });
      proposal.items = items;
    }

    if (dto.items || dto.discountPercent !== undefined) {
      const items = dto.items
        ? proposal.items
        : await this.proposalItemRepository.find({ where: { proposalId: id } });
      const totalValue = items.reduce(
        (sum, item) => sum + Number(item.total),
        0,
      );
      const discountPercent = dto.discountPercent ?? proposal.discountPercent;
      proposal.totalValue = totalValue;
      proposal.discountPercent = discountPercent;
      proposal.finalValue = totalValue * (1 - discountPercent / 100);
    }

    if (dto.scope !== undefined) proposal.scope = dto.scope;
    if (dto.terms !== undefined) proposal.terms = dto.terms;
    if (dto.opportunityId !== undefined)
      proposal.opportunityId = dto.opportunityId;

    return this.proposalRepository.save(proposal);
  }

  async send(id: string): Promise<Proposal> {
    const proposal = await this.findOne(id);

    if (proposal.status !== ProposalStatus.RASCUNHO) {
      throw new BadRequestException(
        'Only proposals in RASCUNHO status can be sent',
      );
    }

    proposal.status = ProposalStatus.ENVIADA;
    proposal.sentAt = new Date();
    const saved = await this.proposalRepository.save(proposal);

    if (proposal.createdById) {
      try {
        const notification = await this.notificationsService.create({
          type: NotificationType.PROPOSTA_ENVIADA,
          title: 'Proposta enviada',
          message: `A proposta "${proposal.number}" foi enviada para o cliente.`,
          userId: proposal.createdById,
          relatedId: proposal.id,
        });
        this.notificationsGateway.sendNotificationToUser(proposal.createdById, notification);
      } catch (err) {
        this.logger.error('Failed to send proposal-sent notification', err);
      }
    }

    return saved;
  }

  async sign(
    id: string,
    dto: SignProposalDto,
    ip: string,
  ): Promise<Proposal> {
    const proposal = await this.findOne(id);

    if (proposal.status !== ProposalStatus.ENVIADA) {
      throw new BadRequestException(
        'Only proposals in ENVIADA status can be signed',
      );
    }

    proposal.status = ProposalStatus.APROVADA;
    proposal.signedAt = new Date();
    proposal.signedBy = dto.signedBy;
    proposal.signedDocument = dto.signedDocument;
    proposal.signedIp = ip;
    const saved = await this.proposalRepository.save(proposal);

    if (proposal.createdById) {
      try {
        const notification = await this.notificationsService.create({
          type: NotificationType.PROPOSTA_ASSINADA,
          title: 'Proposta assinada',
          message: `A proposta "${proposal.number}" foi assinada por ${dto.signedBy}.`,
          userId: proposal.createdById,
          relatedId: proposal.id,
        });
        this.notificationsGateway.sendNotificationToUser(proposal.createdById, notification);
      } catch (err) {
        this.logger.error('Failed to send proposal-signed notification', err);
      }
    }

    return saved;
  }

  async reject(id: string): Promise<Proposal> {
    const proposal = await this.findOne(id);

    if (proposal.status !== ProposalStatus.ENVIADA) {
      throw new BadRequestException(
        'Only proposals in ENVIADA status can be rejected',
      );
    }

    proposal.status = ProposalStatus.REJEITADA;

    return this.proposalRepository.save(proposal);
  }

  async checkExpired(): Promise<number> {
    const now = new Date();
    const expiredProposals = await this.proposalRepository.find({
      where: {
        status: ProposalStatus.ENVIADA,
        validUntil: LessThanOrEqual(now),
      },
      relations: { createdBy: true },
    });

    let count = 0;
    for (const proposal of expiredProposals) {
      proposal.status = ProposalStatus.EXPIRADA;
      await this.proposalRepository.save(proposal);

      if (proposal.createdById) {
        try {
          const notification = await this.notificationsService.create({
            type: NotificationType.PROPOSTA_EXPIRADA,
            title: 'Proposta expirada',
            message: `A proposta "${proposal.number}" expirou em ${proposal.validUntil?.toLocaleDateString('pt-BR')}.`,
            userId: proposal.createdById,
            relatedId: proposal.id,
          });
          this.notificationsGateway.sendNotificationToUser(proposal.createdById, notification);
        } catch (err) {
          this.logger.error('Failed to send proposal-expired notification', err);
        }
      }
      count++;
    }

    return count;
  }

  async generateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PROP-${year}-`;

    const lastProposal = await this.proposalRepository
      .createQueryBuilder('prop')
      .where('prop.number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('prop.number', 'DESC')
      .getOne();

    let seq = 1;
    if (lastProposal) {
      const lastSeq = parseInt(lastProposal.number.split('-')[2], 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  async generatePdf(proposalId: string): Promise<Buffer> {
    const proposal = await this.findOne(proposalId);
    return this.proposalPdfService.generatePdf(
      proposal,
      proposal.opportunity ?? null,
      proposal.createdBy ?? null,
    );
  }
}
