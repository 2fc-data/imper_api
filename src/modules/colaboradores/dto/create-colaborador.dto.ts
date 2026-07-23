import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
  IsDate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ColaboradorTipo,
  ColaboradorStatus,
  ColaboradorContrato,
} from '../../../common/enums/crm.enums.js';

export class CreateColaboradorDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MaxLength(255)
  nome: string;

  @ApiPropertyOptional({ enum: ColaboradorTipo, default: ColaboradorTipo.FUNCIONARIO })
  @IsEnum(ColaboradorTipo)
  @IsOptional()
  tipo?: ColaboradorTipo;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsString()
  @MaxLength(14)
  @IsOptional()
  cpf?: string;

  @ApiPropertyOptional({ example: '12.345.678-9' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  rg?: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  cnh?: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsDate()
  @IsOptional()
  dataNascimento?: Date;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  telefone?: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Empresa ABC Ltda' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  razaoSocial?: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsString()
  @MaxLength(18)
  @IsOptional()
  cnpj?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  responsavel?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsString()
  @MaxLength(5)
  @IsOptional()
  tipoSanguineo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  alergias?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsDate()
  @IsOptional()
  dataInicio?: Date;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsDate()
  @IsOptional()
  dataFim?: Date;

  @ApiPropertyOptional({ enum: ColaboradorContrato })
  @IsEnum(ColaboradorContrato)
  @IsOptional()
  tipoContrato?: ColaboradorContrato;

  @ApiPropertyOptional({ enum: ColaboradorStatus, default: ColaboradorStatus.ATIVO })
  @IsEnum(ColaboradorStatus)
  @IsOptional()
  status?: ColaboradorStatus;

  @ApiPropertyOptional({ description: 'UUID do departamento' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'UUID da equipe' })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiPropertyOptional({ description: 'UUID do supervisor (usuário)' })
  @IsUUID()
  @IsOptional()
  supervisorId?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(9)
  @IsOptional()
  cep?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsString()
  @MaxLength(2)
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  cidade?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  bairro?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  logradouro?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(10)
  @IsOptional()
  numero?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  complemento?: string;
}
