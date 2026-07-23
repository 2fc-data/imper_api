import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmergenciaDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @MaxLength(255)
  nome: string;

  @ApiPropertyOptional({ example: 'Esposa' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  parentesco?: string;

  @ApiProperty({ example: '(11) 98888-8888' })
  @IsString()
  @MaxLength(20)
  telefone: string;
}
