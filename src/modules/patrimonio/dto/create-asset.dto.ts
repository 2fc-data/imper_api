import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
  IsDate,
  IsNumber,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AssetTipo,
  AssetEstado,
  AssetStatus,
  CombustivelTipo,
} from '../../../common/enums/crm.enums.js';

export class CreateAssetDto {
  @ApiProperty({ example: 'Veículo ABC-1234' })
  @IsString()
  @MaxLength(255)
  nome: string;

  @ApiProperty({ enum: AssetTipo })
  @IsEnum(AssetTipo)
  tipo: AssetTipo;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsDate()
  @IsOptional()
  dataAquisicao?: Date;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @IsOptional()
  valorInvestido?: number;

  @ApiPropertyOptional({ example: 45000 })
  @IsNumber()
  @IsOptional()
  valorAtual?: number;

  @ApiPropertyOptional({ enum: AssetEstado, default: AssetEstado.BOM })
  @IsEnum(AssetEstado)
  @IsOptional()
  estado?: AssetEstado;

  @ApiPropertyOptional({ enum: AssetStatus, default: AssetStatus.DISPONIVEL })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @ApiPropertyOptional({ description: 'UUID do responsável (colaborador)' })
  @IsUUID()
  @IsOptional()
  responsibleId?: string;

  @ApiPropertyOptional({ description: 'UUID do centro de custo' })
  @IsUUID()
  @IsOptional()
  costCenterId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observacoes?: string;

  @ApiPropertyOptional({ example: 'ABC-1234' })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  placa?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(20)
  @IsOptional()
  chassi?: string;

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({ example: 'Corolla' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  modelo?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsInt()
  @IsOptional()
  ano?: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(11)
  @IsOptional()
  renavam?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  @IsOptional()
  cor?: string;

  @ApiPropertyOptional({ enum: CombustivelTipo })
  @IsEnum(CombustivelTipo)
  @IsOptional()
  combustivel?: CombustivelTipo;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  km?: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  seguro?: string;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  licenciamento?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  dataVencSeguro?: Date;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  nroSerie?: string;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  garantia?: Date;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  manualUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  endereco?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  @IsOptional()
  matricula?: string;

  @ApiPropertyOptional({ example: 150.5 })
  @IsNumber()
  @IsOptional()
  area?: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  finalidade?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  situacao?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  material?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  localizacao?: string;
}
