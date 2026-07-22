import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '../../../common/enums/crm.enums';

export class MoveLeadDto {
  @ApiProperty({ enum: LeadStatus, example: LeadStatus.QUALIFICADO })
  @IsEnum(LeadStatus)
  status: LeadStatus;
}
