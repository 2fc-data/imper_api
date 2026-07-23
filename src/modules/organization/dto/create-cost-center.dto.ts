import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCostCenterDto {
  @ApiProperty({ example: 'CC-001' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Projetos Comerciais' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'UUID do departamento' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'UUID da equipe' })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;
}
