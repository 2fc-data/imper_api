import type {
  AlterarSenhaInput,
  CadastrarInput,
  LoginInput,
  RecuperarSenhaInput,
  RedefinirSenhaInput,
} from '../../schemas/index.js';
import {
  alterarSenhaSchema,
  cadastrarSchema,
  loginSchema,
  recuperarSenhaSchema,
  redefinirSenhaSchema,
} from '../../schemas/index.js';

export {
  alterarSenhaSchema,
  cadastrarSchema,
  loginSchema,
  recuperarSenhaSchema,
  redefinirSenhaSchema,
};

export type LoginDto = LoginInput;
export type CadastrarDto = CadastrarInput;
export type RecuperarSenhaDto = RecuperarSenhaInput;
export type RedefinirSenhaDto = RedefinirSenhaInput;
export type AlterarSenhaDto = AlterarSenhaInput;
