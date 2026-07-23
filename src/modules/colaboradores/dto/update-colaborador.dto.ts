import { PartialType } from '@nestjs/swagger';
import { CreateColaboradorDto } from './create-colaborador.dto.js';

export class UpdateColaboradorDto extends PartialType(CreateColaboradorDto) {}
