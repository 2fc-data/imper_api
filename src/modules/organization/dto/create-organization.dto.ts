import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Imper - Engenharia em Impermeabilização' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  cnpj?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: Record<string, any>;

  @ApiPropertyOptional({ example: '(11) 3333-4444' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'contato@imper.com.br' })
  @IsEmail()
  @IsOptional()
  email?: string;
}
