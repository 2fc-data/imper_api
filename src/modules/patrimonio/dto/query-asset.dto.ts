import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  AssetTipo,
  AssetEstado,
  AssetStatus,
} from '../../../common/enums/crm.enums.js';

export class QueryAssetDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: AssetTipo })
  @IsEnum(AssetTipo)
  @IsOptional()
  tipo?: AssetTipo;

  @ApiPropertyOptional({ enum: AssetEstado })
  @IsEnum(AssetEstado)
  @IsOptional()
  estado?: AssetEstado;

  @ApiPropertyOptional({ enum: AssetStatus })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @ApiPropertyOptional({ description: 'UUID do centro de custo' })
  @IsUUID()
  @IsOptional()
  costCenterId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
