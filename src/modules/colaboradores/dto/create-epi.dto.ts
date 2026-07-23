import { IsEnum, IsOptional, IsString, IsDate, IsInt, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EpiType, EpiStatus } from '../../../common/enums/crm.enums.js';

export class CreateEpiDto {
  @ApiProperty({ enum: EpiType })
  @IsEnum(EpiType)
  epiType: EpiType;

  @ApiPropertyOptional({ example: 'Capacete de segurança branco' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @IsOptional()
  quantidade?: number;

  @ApiProperty({ example: '2026-07-23' })
  @IsDate()
  dataEntrega: Date;

  @ApiPropertyOptional({ enum: EpiStatus, default: EpiStatus.ENTREGUE })
  @IsEnum(EpiStatus)
  @IsOptional()
  status?: EpiStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observacoes?: string;
}
