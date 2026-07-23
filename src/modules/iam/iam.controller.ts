import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IamService } from './iam.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { AssignRoleDto } from './dto/assign-role.dto.js';
import { CreateDelegationDto } from './dto/create-delegation.dto.js';

@ApiTags('IAM')
@ApiBearerAuth()
@Controller('iam')
export class IamController {
  constructor(private readonly iamService: IamService) {}

  @Post('roles')
  @ApiOperation({ summary: 'Create a role' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.iamService.createRole(dto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'List all roles' })
  async findAllRoles() {
    return this.iamService.findAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  async findOneRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.iamService.findOneRole(id);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update role' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.iamService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Deactivate role' })
  async removeRole(@Param('id', ParseUUIDPipe) id: string) {
    await this.iamService.removeRole(id);
    return { message: 'Role deactivated' };
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all permissions' })
  async findAllPermissions() {
    return this.iamService.findAllPermissions();
  }

  @Post('users/:userId/roles')
  @ApiOperation({ summary: 'Assign role to user' })
  async assignRoleToUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.iamService.assignRoleToUser(userId, dto);
  }

  @Get('users/:userId/roles')
  @ApiOperation({ summary: 'Get user roles' })
  async findUserRoles(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.iamService.findUserRoles(userId);
  }

  @Delete('users/roles/:id')
  @ApiOperation({ summary: 'Remove user role' })
  async removeUserRole(@Param('id', ParseUUIDPipe) id: string) {
    await this.iamService.removeUserRole(id);
    return { message: 'UserRole deactivated' };
  }

  @Post('delegations')
  @ApiOperation({ summary: 'Create delegation' })
  async createDelegation(@Body() dto: CreateDelegationDto) {
    return this.iamService.createDelegation(dto);
  }

  @Get('delegations/:userId')
  @ApiOperation({ summary: 'Get active delegations for user' })
  async findActiveDelegations(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.iamService.findActiveDelegations(userId);
  }

  @Delete('delegations/:id')
  @ApiOperation({ summary: 'Remove delegation' })
  async removeDelegation(@Param('id', ParseUUIDPipe) id: string) {
    await this.iamService.removeDelegation(id);
    return { message: 'Delegation deactivated' };
  }
}
