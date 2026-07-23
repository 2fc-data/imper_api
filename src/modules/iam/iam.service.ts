import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';
import { RolePermission } from './entities/role-permission.entity.js';
import { UserRole } from './entities/user-role.entity.js';
import { Delegation } from './entities/delegation.entity.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { AssignRoleDto } from './dto/assign-role.dto.js';
import { CreateDelegationDto } from './dto/create-delegation.dto.js';

@Injectable()
export class IamService {
  private readonly logger = new Logger(IamService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
  ) {}

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findOne({
      where: { name: dto.name },
    });
    if (existing)
      throw new ConflictException(`Role "${dto.name}" already exists`);

    const role = this.roleRepository.create({
      name: dto.name,
      description: dto.description,
    });
    await this.roleRepository.save(role);

    if (dto.permissions && dto.permissions.length > 0) {
      await this.assignPermissionsToRole(role.id, dto.permissions);
    }

    return this.roleRepository.findOne({
      where: { id: role.id },
    }) as Promise<Role>;
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({ where: { isActive: true } });
  }

  async findOneRole(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { rolePermissions: { permission: true } },
    });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOneRole(id);
    if (role.isSystem) {
      throw new ConflictException('Cannot modify a system role');
    }
    if (dto.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Role "${dto.name}" already exists`);
      }
      role.name = dto.name;
    }
    if (dto.description !== undefined) {
      role.description = dto.description;
    }
    await this.roleRepository.save(role);

    if (dto.permissions) {
      await this.rolePermissionRepository.delete({ roleId: id });
      if (dto.permissions.length > 0) {
        await this.assignPermissionsToRole(id, dto.permissions);
      }
    }

    return this.findOneRole(id);
  }

  async removeRole(id: string): Promise<void> {
    const role = await this.findOneRole(id);
    if (role.isSystem) {
      throw new ConflictException('Cannot delete a system role');
    }
    const userRoles = await this.userRoleRepository.find({
      where: { roleId: id },
    });
    if (userRoles.length > 0) {
      throw new ConflictException(
        'Cannot delete a role that is assigned to users',
      );
    }
    role.isActive = false;
    await this.roleRepository.save(role);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionNames: string[],
  ): Promise<void> {
    const permissions = await this.permissionRepository.find({
      where: { name: In(permissionNames) },
    });

    const rolePermissions = permissions.map((perm) =>
      this.rolePermissionRepository.create({ roleId, permissionId: perm.id }),
    );
    await this.rolePermissionRepository.save(rolePermissions);
  }

  async assignRoleToUser(
    userId: string,
    dto: AssignRoleDto,
  ): Promise<UserRole> {
    const existing = await this.userRoleRepository.findOne({
      where: {
        userId,
        roleId: dto.roleId,
        organizationId: dto.organizationId || undefined,
        departmentId: dto.departmentId || undefined,
        teamId: dto.teamId || undefined,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Role already assigned to this user for this scope',
      );
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleId: dto.roleId,
      organizationId: dto.organizationId,
      departmentId: dto.departmentId,
      teamId: dto.teamId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
    return this.userRoleRepository.save(userRole);
  }

  async findUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { userId, isActive: true },
      relations: { role: true },
    });
  }

  async removeUserRole(id: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({ where: { id } });
    if (!userRole)
      throw new NotFoundException(`UserRole with ID ${id} not found`);
    userRole.isActive = false;
    await this.userRoleRepository.save(userRole);
  }

  async createDelegation(dto: CreateDelegationDto): Promise<Delegation> {
    const delegation = this.delegationRepository.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
    return this.delegationRepository.save(delegation);
  }

  async findActiveDelegations(userId: string): Promise<Delegation[]> {
    return this.delegationRepository.find({
      where: {
        delegatorId: userId,
        isActive: true,
      },
      relations: { role: true },
    });
  }

  async removeDelegation(id: string): Promise<void> {
    const delegation = await this.delegationRepository.findOne({
      where: { id },
    });
    if (!delegation)
      throw new NotFoundException(`Delegation with ID ${id} not found`);
    delegation.isActive = false;
    await this.delegationRepository.save(delegation);
  }
}
