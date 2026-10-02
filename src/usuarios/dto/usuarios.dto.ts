import type {
  AtualizarUsuarioInput,
  CriarUsuarioInput,
  DefinirPerfisInput,
  ResetarSenhaInput,
} from '../../schemas/index.js';
import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  definirPerfisSchema,
  resetarSenhaSchema,
} from '../../schemas/index.js';

export {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  definirPerfisSchema,
  resetarSenhaSchema,
};

export type CriarUsuarioDto = CriarUsuarioInput;
export type AtualizarUsuarioDto = AtualizarUsuarioInput;
export type DefinirPerfisDto = DefinirPerfisInput;
export type ResetarSenhaDto = ResetarSenhaInput;
