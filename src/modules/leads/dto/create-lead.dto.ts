import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '../../../common/enums/crm.enums';

export class CreateLeadDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Empresa ABC' })
  @IsString()
  companyName: string;

  @ApiPropertyOptional({ example: 'joao@empresa.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  whatsapp?: string;

  @ApiProperty({ enum: LeadSource, example: LeadSource.WHATSAPP })
  @IsEnum(LeadSource)
  source: LeadSource;

  @ApiPropertyOptional({ example: 15000.5 })
  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @ApiPropertyOptional({ example: 'Lead interessado em consultoria' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: ['enterprise', 'priority'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'UUID do usuário responsável' })
  @IsUUID()
  @IsOptional()
  assignedUserId?: string;
}
