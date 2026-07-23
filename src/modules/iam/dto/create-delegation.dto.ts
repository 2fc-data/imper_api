import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDelegationDto {
  @ApiProperty({ description: 'UUID of the user delegating authority' })
  @IsUUID()
  delegatorId: string;

  @ApiProperty({ description: 'UUID of the user receiving authority' })
  @IsUUID()
  delegateId: string;

  @ApiProperty({ description: 'UUID of the role being delegated' })
  @IsUUID()
  roleId: string;

  @ApiProperty({ description: 'Start date (ISO 8601)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date (ISO 8601)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Reason for delegation' })
  @IsString()
  @IsOptional()
  reason?: string;
}
