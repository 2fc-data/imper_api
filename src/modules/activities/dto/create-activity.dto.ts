import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../../../common/enums/crm.enums';

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, example: ActivityType.LIGACAO })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ example: 'Ligação de follow-up' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Verificar interesse do lead' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-07-20T10:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ description: 'UUID do lead relacionado' })
  @IsUUID()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({ description: 'UUID do usuário responsável (padrão: usuário atual)' })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
