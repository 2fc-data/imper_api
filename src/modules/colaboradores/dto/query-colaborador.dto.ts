import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ColaboradorTipo,
  ColaboradorStatus,
  ColaboradorContrato,
} from '../../../common/enums/crm.enums.js';

export class QueryColaboradorDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ColaboradorTipo })
  @IsEnum(ColaboradorTipo)
  @IsOptional()
  tipo?: ColaboradorTipo;

  @ApiPropertyOptional({ enum: ColaboradorStatus })
  @IsEnum(ColaboradorStatus)
  @IsOptional()
  status?: ColaboradorStatus;

  @ApiPropertyOptional({ enum: ColaboradorContrato })
  @IsEnum(ColaboradorContrato)
  @IsOptional()
  tipoContrato?: ColaboradorContrato;

  @ApiPropertyOptional({ description: 'UUID do departamento' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'UUID da equipe' })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
