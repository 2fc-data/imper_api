import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientFilterDto } from './dto/client-filter.dto';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create({
      ...dto,
      cpfCnpjIndex: dto.cpfCnpj,
      statusIndex: dto.status,
    });
    return this.clientRepository.save(client);
  }

  async createFromOpportunity(data: {
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    sourceOpportunityId?: string;
  }): Promise<Client> {
    const client = this.clientRepository.create({
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      sourceOpportunityId: data.sourceOpportunityId,
    });
    return this.clientRepository.save(client);
  }

  async findAll(filters: ClientFilterDto) {
    const { page = 1, limit = 20, search, status } = filters;
    const qb = this.clientRepository.createQueryBuilder('client');

    if (search) {
      qb.where(
        '(client.name LIKE :search OR client.companyName LIKE :search OR client.email LIKE :search OR client.cpfCnpj LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('client.status = :status', { status });
    }

    qb.orderBy('client.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: { opportunities: true },
    });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, dto, {
      cpfCnpjIndex: dto.cpfCnpj ?? client.cpfCnpjIndex,
      statusIndex: dto.status ?? client.statusIndex,
    });
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  async incrementPurchases(id: string): Promise<void> {
    await this.clientRepository.increment({ id }, 'totalPurchases', 1);
  }

  async incrementProjects(id: string): Promise<void> {
    await this.clientRepository.increment({ id }, 'completedProjects', 1);
  }
}
