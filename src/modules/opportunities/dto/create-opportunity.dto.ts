import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  MaxLength,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunityStatus } from '../../../common/enums/crm.enums';

export class CreateOpportunityDto {
  @ApiProperty({ example: 'Proposta de consultoria' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Oportunidade de consultoria para empresa X' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'UUID do usuário responsável' })
  @IsUUID()
  @IsOptional()
  assignedUserId?: string;

  @ApiProperty({ example: 15000.5 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional({ enum: OpportunityStatus })
  @IsEnum(OpportunityStatus)
  @IsOptional()
  status?: OpportunityStatus;
}
