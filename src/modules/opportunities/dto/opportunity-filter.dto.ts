import { IsEnum, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { OpportunityStatus } from '../../../common/enums/crm.enums';

export class OpportunityFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: OpportunityStatus })
  @IsEnum(OpportunityStatus)
  @IsOptional()
  status?: OpportunityStatus;

  @ApiPropertyOptional({ description: 'UUID do usuário responsável' })
  @IsUUID()
  @IsOptional()
  assignedUserId?: string;

  @ApiPropertyOptional({ example: 1000 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minValue?: number;

  @ApiPropertyOptional({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxValue?: number;
}
