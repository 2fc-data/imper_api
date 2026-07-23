import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity.js';
import { Department } from './entities/department.entity.js';
import { Team } from './entities/team.entity.js';
import { CostCenter } from './entities/cost-center.entity.js';
import { OrganizationService } from './organization.service.js';
import { OrganizationController } from './organization.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Department, Team, CostCenter]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
