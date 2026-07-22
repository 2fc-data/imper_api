import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Contact } from './entities/contact.entity.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { ContactFilterDto } from './dto/contact-filter.dto.js';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(dto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(dto);
    return this.contactRepository.save(contact);
  }

  async findAll(filters: ContactFilterDto): Promise<{ data: Contact[]; total: number }> {
    const { page = 1, limit = 20, search, leadId, opportunityId, assignedUserId, companyName } = filters;
    const skip = (page - 1) * limit;

    const qb = this.contactRepository.createQueryBuilder('contact');

    if (search) {
      qb.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.companyName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (leadId) {
      qb.andWhere('contact.leadId = :leadId', { leadId });
    }

    if (opportunityId) {
      qb.andWhere('contact.opportunityId = :opportunityId', { opportunityId });
    }

    if (assignedUserId) {
      qb.andWhere('contact.assignedUserId = :assignedUserId', { assignedUserId });
    }

    if (companyName) {
      qb.andWhere('contact.companyName ILIKE :companyName', { companyName: `%${companyName}%` });
    }

    qb.orderBy('contact.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async update(id: string, dto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(id);
    Object.assign(contact, dto);
    return this.contactRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactRepository.remove(contact);
  }
}
