import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Colaborador } from './entities/colaborador.entity.js';
import { ColaboradorEmergencia } from './entities/colaborador-emergencia.entity.js';
import { EpiRecord } from './entities/epi-record.entity.js';
import { CreateColaboradorDto } from './dto/create-colaborador.dto.js';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto.js';
import { QueryColaboradorDto } from './dto/query-colaborador.dto.js';
import { CreateEmergenciaDto } from './dto/create-emergencia.dto.js';
import { CreateEpiDto } from './dto/create-epi.dto.js';

@Injectable()
export class ColaboradoresService {
  private readonly logger = new Logger(ColaboradoresService.name);

  constructor(
    @InjectRepository(Colaborador)
    private readonly colaboradorRepository: Repository<Colaborador>,
    @InjectRepository(ColaboradorEmergencia)
    private readonly emergenciaRepository: Repository<ColaboradorEmergencia>,
    @InjectRepository(EpiRecord)
    private readonly epiRepository: Repository<EpiRecord>,
  ) {}

  async create(dto: CreateColaboradorDto): Promise<Colaborador> {
    const colaborador = this.colaboradorRepository.create(dto);
    return this.colaboradorRepository.save(colaborador);
  }

  async findAll(filters: QueryColaboradorDto) {
    const { page = 1, limit = 20, search, tipo, status, tipoContrato, departmentId, teamId } = filters;
    const qb = this.colaboradorRepository.createQueryBuilder('col');

    if (search) {
      qb.where(
        '(col.nome LIKE :search OR col.cpf LIKE :search OR col.email LIKE :search OR col.razaoSocial LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tipo) {
      qb.andWhere('col.tipo = :tipo', { tipo });
    }

    if (status) {
      qb.andWhere('col.status = :status', { status });
    }

    if (tipoContrato) {
      qb.andWhere('col.tipoContrato = :tipoContrato', { tipoContrato });
    }

    if (departmentId) {
      qb.andWhere('col.departmentId = :departmentId', { departmentId });
    }

    if (teamId) {
      qb.andWhere('col.teamId = :teamId', { teamId });
    }

    qb.orderBy('col.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Colaborador> {
    const colaborador = await this.colaboradorRepository.findOne({
      where: { id },
      relations: { department: true, team: true, emergencia: true, epis: true },
    });
    if (!colaborador) throw new NotFoundException(`Colaborador ${id} not found`);
    return colaborador;
  }

  async update(id: string, dto: UpdateColaboradorDto): Promise<Colaborador> {
    const colaborador = await this.findOne(id);
    Object.assign(colaborador, dto);
    return this.colaboradorRepository.save(colaborador);
  }

  async remove(id: string): Promise<void> {
    const colaborador = await this.findOne(id);
    await this.colaboradorRepository.remove(colaborador);
  }

  async findEmergencia(colaboradorId: string): Promise<ColaboradorEmergencia[]> {
    return this.emergenciaRepository.find({
      where: { colaboradorId },
      order: { nome: 'ASC' },
    });
  }

  async addEmergencia(colaboradorId: string, dto: CreateEmergenciaDto): Promise<ColaboradorEmergencia> {
    await this.findOne(colaboradorId);
    const emergencia = this.emergenciaRepository.create({
      ...dto,
      colaboradorId,
    });
    return this.emergenciaRepository.save(emergencia);
  }

  async removeEmergencia(id: string): Promise<void> {
    const emergencia = await this.emergenciaRepository.findOne({ where: { id } });
    if (!emergencia) throw new NotFoundException(`Emergency contact ${id} not found`);
    await this.emergenciaRepository.remove(emergencia);
  }

  async findEpis(colaboradorId: string): Promise<EpiRecord[]> {
    return this.epiRepository.find({
      where: { colaboradorId },
      order: { dataEntrega: 'DESC' },
    });
  }

  async addEpi(colaboradorId: string, dto: CreateEpiDto): Promise<EpiRecord> {
    await this.findOne(colaboradorId);
    const epi = this.epiRepository.create({
      ...dto,
      colaboradorId,
    });
    return this.epiRepository.save(epi);
  }
}
