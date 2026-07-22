import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunityStatus } from '../../../common/enums/crm.enums';

export class CloseOpportunityDto {
  @ApiProperty({ enum: [OpportunityStatus.GANHA, OpportunityStatus.PERDIDA] })
  @IsEnum([OpportunityStatus.GANHA, OpportunityStatus.PERDIDA])
  status: OpportunityStatus.GANHA | OpportunityStatus.PERDIDA;

  @ApiPropertyOptional({ example: 'Preço alto demais' })
  @IsString()
  @IsOptional()
  lossReason?: string;
}
