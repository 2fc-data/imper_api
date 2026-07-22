import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteActivityDto {
  @ApiPropertyOptional({ example: '2026-07-20T14:30:00.000Z' })
  @IsDateString()
  @IsOptional()
  completedAt?: string;
}
