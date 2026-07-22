import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicLeadDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Empresa ABC' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Consultoria em TI' })
  @IsString()
  @IsOptional()
  service?: string;

  @ApiPropertyOptional({ example: 'Gostaria de um orçamento' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({ example: 'formulario' })
  @IsString()
  @IsOptional()
  source?: string;
}
