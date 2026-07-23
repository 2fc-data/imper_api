import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { CreateCostCenterDto } from './dto/create-cost-center.dto.js';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto.js';

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({ summary: 'Create an organization' })
  async createOrganization(@Body() dto: CreateOrganizationDto) {
    return this.organizationService.createOrganization(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all organizations' })
  async findAllOrganizations() {
    return this.organizationService.findAllOrganizations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async findOneOrganization(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.findOneOrganization(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization' })
  async updateOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationService.updateOrganization(id, dto);
  }

  @Post('departments')
  @ApiOperation({ summary: 'Create a department' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.organizationService.createDepartment(dto);
  }

  @Get('departments')
  @ApiOperation({ summary: 'List departments' })
  async findAllDepartments(@Query('organizationId') organizationId?: string) {
    return this.organizationService.findAllDepartments(organizationId);
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Get department by ID' })
  async findOneDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.findOneDepartment(id);
  }

  @Put('departments/:id')
  @ApiOperation({ summary: 'Update department' })
  async updateDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.organizationService.updateDepartment(id, dto);
  }

  @Post('teams')
  @ApiOperation({ summary: 'Create a team' })
  async createTeam(@Body() dto: CreateTeamDto) {
    return this.organizationService.createTeam(dto);
  }

  @Get('teams')
  @ApiOperation({ summary: 'List teams' })
  async findAllTeams(@Query('departmentId') departmentId?: string) {
    return this.organizationService.findAllTeams(departmentId);
  }

  @Get('teams/:id')
  @ApiOperation({ summary: 'Get team by ID' })
  async findOneTeam(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.findOneTeam(id);
  }

  @Put('teams/:id')
  @ApiOperation({ summary: 'Update team' })
  async updateTeam(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.organizationService.updateTeam(id, dto);
  }

  @Post('cost-centers')
  @ApiOperation({ summary: 'Create a cost center' })
  async createCostCenter(@Body() dto: CreateCostCenterDto) {
    return this.organizationService.createCostCenter(dto);
  }

  @Get('cost-centers')
  @ApiOperation({ summary: 'List cost centers' })
  async findAllCostCenter(@Query('departmentId') departmentId?: string) {
    return this.organizationService.findAllCostCenter(departmentId);
  }

  @Get('cost-centers/:id')
  @ApiOperation({ summary: 'Get cost center by ID' })
  async findOneCostCenter(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.findOneCostCenter(id);
  }

  @Put('cost-centers/:id')
  @ApiOperation({ summary: 'Update cost center' })
  async updateCostCenter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCostCenterDto,
  ) {
    return this.organizationService.updateCostCenter(id, dto);
  }
}
