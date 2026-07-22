import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    const service = this.servicesRepository.create(dto);
    return this.servicesRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { active: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<Service[]> {
    return this.servicesRepository.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException(`Service ${id} not found`);
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    return this.servicesRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.servicesRepository.remove(service);
  }

  async seed(): Promise<void> {
    const count = await this.servicesRepository.count();
    if (count > 0) return;

    const seeds: CreateServiceDto[] = [
      { name: 'Impermeabilização de Telhados', description: 'Proteção completa para telhados contra infiltrações e vazamentos com materiais de alta qualidade.', icon: 'Home', displayOrder: 1 },
      { name: 'Impermeabilização de Piscinas', description: 'Impermeabilização profissional para piscinas, garantindo estanqueidade e durabilidade.', icon: 'Waves', displayOrder: 2 },
      { name: 'Impermeabilização de Fachadas', description: 'Proteção de fachadas contra Chuva e umidade, preservando a estética e estrutura.', icon: 'Building', displayOrder: 3 },
      { name: 'Impermeabilização de Fundações', description: 'Proteção de fundações e subsolos contra ação do lençol freático e umidade do solo.', icon: 'Layers', displayOrder: 4 },
      { name: 'Impermeabilização de Banheiros', description: 'Soluções completas para áreas molhadas, prevenindo infiltrações em pisos e paredes.', icon: 'Bath', displayOrder: 5 },
      { name: 'Reparo de Infiltrações e Vazamentos', description: 'Diagnóstico e reparo de infiltrações e vazamentos em qualquer tipo de edificação.', icon: 'Wrench', displayOrder: 6 },
      { name: 'Revestimento Cerâmico', description: 'Assentamento e reparo de revestimentos cerâmicos com acabamento preciso.', icon: 'Grid3x3', displayOrder: 7 },
      { name: 'Serviços Gerais de Engenharia', description: 'Consultoria e execução de serviços gerais de engenharia civil e manutenção predial.', icon: 'HardHat', displayOrder: 8 },
    ];

    for (const seed of seeds) {
      const entity = this.servicesRepository.create(seed);
      await this.servicesRepository.save(entity);
    }

    this.logger.log(`Seeded ${seeds.length} services`);
  }
}
