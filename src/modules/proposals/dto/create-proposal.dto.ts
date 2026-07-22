import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProposalItemDto {
  @ApiProperty({ example: 'Instalação de toldo' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'm²' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateProposalDto {
  @ApiPropertyOptional({ example: 'Proposta comercial de impermeabilização' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'UUID da oportunidade' })
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiPropertyOptional({ example: 'Escopo completo da instalação...' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ example: 'Pagamento em 30 dias...' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiProperty({ type: [CreateProposalItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProposalItemDto)
  items: CreateProposalItemDto[];
}
