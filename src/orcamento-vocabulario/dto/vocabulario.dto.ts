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

const comboBaseSchema = z.object({
  verboId: z.number().int('Verbo inválido'),
  objetoId: z.number().int('Objeto inválido'),
  localId: z.number().int('Local inválido').nullable().optional(),
  caracteristicaId: z
    .number()
    .int('Característica inválida')
    .nullable()
    .optional(),
});

export const comboLoteSchema = z.object({
  subServicoId: z.number().int('Sub-serviço inválido'),
  combos: z.array(comboBaseSchema).min(1, 'Informe ao menos uma combinação'),
});

export const comboUnicoSchema = comboBaseSchema.extend({
  subServicoId: z.number().int('Sub-serviço inválido'),
});

export type CriarTermoDto = z.infer<typeof criarTermoSchema>;
export type AtualizarTermoDto = z.infer<typeof atualizarTermoSchema>;
export type CriarSubServicoDto = z.infer<typeof criarSubServicoSchema>;
export type ComboLoteDto = z.infer<typeof comboLoteSchema>;
export type ComboUnicoDto = z.infer<typeof comboUnicoSchema>;
export type ComboDto = z.infer<typeof comboBaseSchema>;
