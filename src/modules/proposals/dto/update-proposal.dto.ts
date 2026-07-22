import { PartialType } from '@nestjs/swagger';
import { CreateProposalDto } from './create-proposal.dto.js';

export class UpdateProposalDto extends PartialType(CreateProposalDto) {}
