import { z } from 'zod';

export const criarServicoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'Informe o título')
    .max(200, 'Máximo de 200 caracteres'),
  descricao: z
    .string()
    .trim()
    .min(1, 'Informe a descrição')
    .max(500, 'Máximo de 500 caracteres'),
  icone: z
    .string()
    .trim()
    .min(1, 'Informe o ícone')
    .max(500, 'Máximo de 500 caracteres'),
  ativo: z.boolean().optional(),
});

export const atualizarServicoSchema = criarServicoSchema.partial();

export type CriarServicoDto = z.infer<typeof criarServicoSchema>;
export type AtualizarServicoDto = z.infer<typeof atualizarServicoSchema>;
