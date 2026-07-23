import { IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ description: 'UUID of the role to assign' })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({ description: 'Scope to organization' })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Scope to department' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Scope to team' })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiPropertyOptional({ description: 'Expiration date (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
