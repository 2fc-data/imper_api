import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignLeadDto {
  @ApiProperty({ description: 'UUID do usuário responsável' })
  @IsUUID()
  assignedUserId: string;
}
