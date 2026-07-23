import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConfigDto {
  @ApiProperty({ example: 'smtp.imper.com.br' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: 'Scope to organization' })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Scope to department' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Scope to user' })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
