import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity.js';
import { Department } from './entities/department.entity.js';
import { Team } from './entities/team.entity.js';
import { CostCenter } from './entities/cost-center.entity.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { CreateCostCenterDto } from './dto/create-cost-center.dto.js';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto.js';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(Department)
    private deptRepository: Repository<Department>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(CostCenter)
    private costCenterRepository: Repository<CostCenter>,
  ) {}

  async createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
    const org = this.orgRepository.create(dto);
    return this.orgRepository.save(org);
  }

  async findAllOrganizations(): Promise<Organization[]> {
    return this.orgRepository.find({ where: { isActive: true } });
  }

  async findOneOrganization(id: string): Promise<Organization> {
    const org = await this.orgRepository.findOne({ where: { id } });
    if (!org)
      throw new NotFoundException(`Organization with ID ${id} not found`);
    return org;
  }

  async updateOrganization(
    id: string,
    dto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const org = await this.findOneOrganization(id);
    Object.assign(org, dto);
    return this.orgRepository.save(org);
  }

  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    const dept = this.deptRepository.create(dto);
    return this.deptRepository.save(dept);
  }

  async findAllDepartments(organizationId?: string): Promise<Department[]> {
    const where = organizationId
      ? { organizationId, isActive: true }
      : { isActive: true };
    return this.deptRepository.find({
      where,
      relations: { organization: true },
    });
  }

  async findOneDepartment(id: string): Promise<Department> {
    const dept = await this.deptRepository.findOne({
      where: { id },
      relations: { organization: true },
    });
    if (!dept)
      throw new NotFoundException(`Department with ID ${id} not found`);
    return dept;
  }

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<Department> {
    const dept = await this.findOneDepartment(id);
    Object.assign(dept, dto);
    return this.deptRepository.save(dept);
  }

  async createTeam(dto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create(dto);
    return this.teamRepository.save(team);
  }

  async findAllTeams(departmentId?: string): Promise<Team[]> {
    const where = departmentId
      ? { departmentId, isActive: true }
      : { isActive: true };
    return this.teamRepository.find({ where, relations: { department: true } });
  }

  async findOneTeam(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: { department: true },
    });
    if (!team) throw new NotFoundException(`Team with ID ${id} not found`);
    return team;
  }

  async updateTeam(id: string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOneTeam(id);
    Object.assign(team, dto);
    return this.teamRepository.save(team);
  }

  async createCostCenter(dto: CreateCostCenterDto): Promise<CostCenter> {
    const cc = this.costCenterRepository.create(dto);
    return this.costCenterRepository.save(cc);
  }

  async findAllCostCenter(departmentId?: string): Promise<CostCenter[]> {
    const where = departmentId
      ? { departmentId, isActive: true }
      : { isActive: true };
    return this.costCenterRepository.find({
      where,
      relations: { department: true, team: true },
    });
  }

  async findOneCostCenter(id: string): Promise<CostCenter> {
    const cc = await this.costCenterRepository.findOne({
      where: { id },
      relations: { department: true, team: true },
    });
    if (!cc) throw new NotFoundException(`CostCenter with ID ${id} not found`);
    return cc;
  }

  async updateCostCenter(
    id: string,
    dto: UpdateCostCenterDto,
  ): Promise<CostCenter> {
    const cc = await this.findOneCostCenter(id);
    Object.assign(cc, dto);
    return this.costCenterRepository.save(cc);
  }
}
