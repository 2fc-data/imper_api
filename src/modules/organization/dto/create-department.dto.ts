import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Comercial' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Departamento de vendas e prospecção' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'UUID da organização' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({ description: 'UUID do gerente' })
  @IsUUID()
  @IsOptional()
  managerId?: string;
}
