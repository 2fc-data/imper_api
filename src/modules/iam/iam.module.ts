import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';
import { RolePermission } from './entities/role-permission.entity.js';
import { UserRole } from './entities/user-role.entity.js';
import { Delegation } from './entities/delegation.entity.js';
import { IamService } from './iam.service.js';
import { IamController } from './iam.controller.js';
import { PermissionGuard } from './guards/permission.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      UserRole,
      Delegation,
    ]),
  ],
  controllers: [IamController],
  providers: [IamService, PermissionGuard],
  exports: [IamService, PermissionGuard],
})
export class IamModule {}
