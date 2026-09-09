import type {
  AtualizarPapelInput,
  CriarPapelInput,
  DefinirPermissoesInput,
} from '../../schemas/index.js';
import {
  atualizarPapelSchema,
  criarPapelSchema,
  definirPermissoesSchema,
} from '../../schemas/index.js';

export { atualizarPapelSchema, criarPapelSchema, definirPermissoesSchema };

export type CriarPapelDto = CriarPapelInput;
export type AtualizarPapelDto = AtualizarPapelInput;
export type DefinirPermissoesDto = DefinirPermissoesInput;
