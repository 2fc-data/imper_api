import { z } from 'zod';

export const criarTermoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome')
    .max(60, 'Máximo de 60 caracteres'),
});

export const atualizarTermoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome')
    .max(60, 'Máximo de 60 caracteres')
    .optional(),
  ativo: z.boolean().optional(),
});

export const criarSubServicoSchema = z.object({
  etapaId: z.number().int('Etapa inválida'),
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome')
    .max(120, 'Máximo de 120 caracteres'),
});

export const atualizarSubServicoSchema = z.object({
  etapaId: z.number().int('Etapa inválida').optional(),
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome')
    .max(120, 'Máximo de 120 caracteres')
    .optional(),
  ativo: z.boolean().optional(),
});

export const criarEtapaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome')
    .max(120, 'Máximo de 120 caracteres'),
  ordem: z.number().int('Ordem inválida').min(1, 'Ordem deve ser >= 1'),
  ativo: z.boolean().optional(),
});

export const atualizarEtapaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome')
    .max(120, 'Máximo de 120 caracteres')
    .optional(),
  ordem: z
    .number()
    .int('Ordem inválida')
    .min(1, 'Ordem deve ser >= 1')
    .optional(),
  ativo: z.boolean().optional(),
});

export type CriarTermoDto = z.infer<typeof criarTermoSchema>;
export type AtualizarTermoDto = z.infer<typeof atualizarTermoSchema>;
export type CriarSubServicoDto = z.infer<typeof criarSubServicoSchema>;
export type AtualizarSubServicoDto = z.infer<typeof atualizarSubServicoSchema>;
export type CriarEtapaDto = z.infer<typeof criarEtapaSchema>;
export type AtualizarEtapaDto = z.infer<typeof atualizarEtapaSchema>;
