import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { ProposalStatus } from '../../../common/enums/crm.enums.js';

export class ProposalFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ProposalStatus })
  @IsEnum(ProposalStatus)
  @IsOptional()
  status?: ProposalStatus;

  @ApiPropertyOptional({ description: 'UUID da oportunidade' })
  @IsUUID()
  @IsOptional()
  opportunityId?: string;
}
