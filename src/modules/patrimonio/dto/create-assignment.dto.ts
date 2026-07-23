import { IsUUID, IsDate, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'UUID do colaborador responsável' })
  @IsUUID()
  colaboradorId: string;

  @ApiProperty({ example: '2026-07-23' })
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ example: 'Atribuição para projeto X' })
  @IsString()
  @IsOptional()
  motivo?: string;
}
