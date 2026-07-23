import { PartialType } from '@nestjs/swagger';
import { CreateCostCenterDto } from './create-cost-center.dto.js';

export class UpdateCostCenterDto extends PartialType(CreateCostCenterDto) {}
