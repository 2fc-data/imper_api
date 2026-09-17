import { z } from 'zod';

function validarCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(d[i]) * (10 - i);
  let r = (soma * 10) % 11;
  if (r === 10) r = 0;
  if (r !== parseInt(d[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(d[i]) * (11 - i);
  r = (soma * 10) % 11;
  if (r === 10) r = 0;
  return r === parseInt(d[10]);
}

function validarCnpj(cnpj: string): boolean {
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(d)) return false;
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) soma += parseInt(d[i]) * pesos1[i];
  let r = soma % 11;
  const dv1 = r < 2 ? 0 : 11 - r;
  if (parseInt(d[12]) !== dv1) return false;
  soma = 0;
  for (let i = 0; i < 13; i++) soma += parseInt(d[i]) * pesos2[i];
  r = soma % 11;
  const dv2 = r < 2 ? 0 : 11 - r;
  return parseInt(d[13]) === dv2;
}

const cpfCnpjValidator = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      const digits = val.replace(/\D/g, '');
      if (digits.length === 11) return validarCpf(digits);
      if (digits.length === 14) return validarCnpj(digits);
      return false;
    },
    { message: 'CPF ou CNPJ inválido' },
  );

export const criarUsuarioSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().trim().email('E-mail inválido').optional(),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  telefone: z
    .string()
    .trim()
    .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone inválido. Formato: (00) 00000-0000')
    .optional(),
  papelId: z.number(),
  cargoId: z.number().nullable().optional(),
  cpfCnpj: cpfCnpjValidator,
  cep: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
});

export const atualizarUsuarioSchema = z.object({
  nome: z.string().trim().min(2).optional(),
  email: z.string().trim().email('E-mail inválido').optional(),
  telefone: z.string().trim().optional(),
  papelId: z.number().optional(),
  cargoId: z.number().nullable().optional(),
  ativo: z.boolean().optional(),
  cpfCnpj: cpfCnpjValidator,
  cep: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
});

export const resetarSenhaSchema = z.object({
  novaSenha: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;
export type AtualizarUsuarioInput = z.infer<typeof atualizarUsuarioSchema>;
export type ResetarSenhaInput = z.infer<typeof resetarSenhaSchema>;