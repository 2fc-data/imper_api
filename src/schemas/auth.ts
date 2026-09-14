import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail ou telefone obrigatório'),
  senha: z.string().min(1, 'Senha obrigatória'),
  turnstileToken: z.string().optional(),
});

export const cadastrarSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().trim().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone inválido. Formato: (00) 00000-0000'),
  email: z.string().trim().email('E-mail inválido').optional(),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  turnstileToken: z.string().optional(),
});

export const recuperarSenhaSchema = z.object({
  canal: z.enum(['email', 'whatsapp']),
  email: z.string().email('E-mail inválido').optional(),
  telefone: z.string().optional(),
  turnstileToken: z.string().optional(),
}).refine(
  (data) => {
    if (data.canal === 'email') return !!data.email;
    if (data.canal === 'whatsapp') return !!data.telefone;
    return false;
  },
  { message: 'E-mail obrigatório para recuperação por e-mail, telefone obrigatório para recuperação por WhatsApp' },
);

export const redefinirSenhaSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  turnstileToken: z.string().optional(),
});

export const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual obrigatória'),
  novaSenha: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CadastrarInput = z.infer<typeof cadastrarSchema>;
export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>;
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;
export type AlterarSenhaInput = z.infer<typeof alterarSenhaSchema>;