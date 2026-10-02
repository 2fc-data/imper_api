import { z } from 'zod';
import { cpfCnpjValidator } from './usuarios.js';

export const atualizarPerfilSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .optional(),
  email: z
    .union([z.literal(''), z.string().trim().email('E-mail inválido')])
    .optional(),
  telefone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const digits = val.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 11;
      },
      {
        message: 'Telefone inválido. Informe DDD + número com 10 ou 11 dígitos',
      },
    ),
  cpfCnpj: cpfCnpjValidator,
});

export type AtualizarPerfilInput = z.infer<typeof atualizarPerfilSchema>;
