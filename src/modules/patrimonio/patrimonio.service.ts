import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity.js';
import { AssetAssignment } from './entities/asset-assignment.entity.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';
import { QueryAssetDto } from './dto/query-asset.dto.js';
import { CreateAssignmentDto } from './dto/create-assignment.dto.js';

@Injectable()
export class PatrimonioService {
  private readonly logger = new Logger(PatrimonioService.name);

  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetAssignment)
    private readonly assignmentRepository: Repository<AssetAssignment>,
  ) {}

  private async generateCodigo(): Promise<string> {
    const count = await this.assetRepository.count();
    const next = count + 1;
    return `AST${String(next).padStart(5, '0')}`;
  }

  async create(dto: CreateAssetDto): Promise<Asset> {
    const codigo = await this.generateCodigo();
    const asset = this.assetRepository.create({ ...dto, codigo });
    return this.assetRepository.save(asset);
  }

  async findAll(filters: QueryAssetDto) {
    const { page = 1, limit = 20, search, tipo, estado, status, costCenterId } = filters;
    const qb = this.assetRepository.createQueryBuilder('asset');

    if (search) {
      qb.where(
        '(asset.nome LIKE :search OR asset.codigo LIKE :search OR asset.placa LIKE :search OR asset.marca LIKE :search OR asset.modelo LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tipo) {
      qb.andWhere('asset.tipo = :tipo', { tipo });
    }

    if (estado) {
      qb.andWhere('asset.estado = :estado', { estado });
    }

    if (status) {
      qb.andWhere('asset.status = :status', { status });
    }

    if (costCenterId) {
      qb.andWhere('asset.costCenterId = :costCenterId', { costCenterId });
    }

    qb.orderBy('asset.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: { costCenter: true, assignments: true },
    });
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    return asset;
  }

  async update(id: string, dto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findOne(id);
    Object.assign(asset, dto);
    return this.assetRepository.save(asset);
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetRepository.remove(asset);
  }

  async findAssignments(assetId: string): Promise<AssetAssignment[]> {
    return this.assignmentRepository.find({
      where: { assetId },
      relations: { colaborador: true },
      order: { startDate: 'DESC' },
    });
  }

  async addAssignment(assetId: string, dto: CreateAssignmentDto): Promise<AssetAssignment> {
    await this.findOne(assetId);
    const assignment = this.assignmentRepository.create({
      ...dto,
      assetId,
    });
    return this.assignmentRepository.save(assignment);
  }

  async removeAssignment(id: string): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException(`Assignment ${id} not found`);
    await this.assignmentRepository.remove(assignment);
  }
}
