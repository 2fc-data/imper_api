import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MaxLength(255)
  name: string;

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

  @ApiPropertyOptional({ example: 'Empresa ABC' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Gerente de Obras' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ example: 'Contato principal para projetos grandes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: ['decision-maker', 'priority'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'UUID do lead relacionado' })
  @IsUUID()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({ description: 'UUID da oportunidade relacionada' })
  @IsUUID()
  @IsOptional()
  opportunityId?: string;

  @ApiPropertyOptional({ description: 'UUID do usuário responsável' })
  @IsUUID()
  @IsOptional()
  assignedUserId?: string;
}
