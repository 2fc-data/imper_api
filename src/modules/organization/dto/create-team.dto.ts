import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Equipe Alpha' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Equipe de vendas externas' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'UUID do departamento' })
  @IsUUID()
  departmentId: string;

  @ApiPropertyOptional({ description: 'UUID do líder' })
  @IsUUID()
  @IsOptional()
  leaderId?: string;
}
