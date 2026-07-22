import { IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class ContactFilterDto extends PaginationQueryDto {
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

  @ApiPropertyOptional({ example: 'Empresa ABC' })
  @IsString()
  @IsOptional()
  companyName?: string;
}
