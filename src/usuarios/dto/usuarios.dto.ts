import type {
  AtualizarUsuarioInput,
  CriarUsuarioInput,
  ResetarSenhaInput,
} from '../../schemas/index.js';
import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  resetarSenhaSchema,
} from '../../schemas/index.js';

export { atualizarUsuarioSchema, criarUsuarioSchema, resetarSenhaSchema };

export type CriarUsuarioDto = CriarUsuarioInput;
export type AtualizarUsuarioDto = AtualizarUsuarioInput;
export type ResetarSenhaDto = ResetarSenhaInput;
