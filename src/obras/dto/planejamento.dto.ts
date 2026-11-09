import { z } from 'zod';

export const materialItemSchema = z.object({
  materialId: z.number().int().positive(),
  quantidade: z.number().nonnegative(),
});

export const epiItemSchema = z.object({
  epiId: z.number().int().positive(),
  quantidade: z.number().nonnegative(),
});

export const equipamentoItemSchema = z.object({
  equipamentoId: z.number().int().positive(),
});

export const atividadePlanejamentoSchema = z.object({
  atividadeId: z.string().min(1),
  colaboradorId: z.number().int().positive().nullable().optional(),
  colaboradoresIds: z.array(z.number().int().positive()).optional().default([]),
  dataPrevisao: z.string().nullable().optional(),
  dataDisparoWhatsapp: z.string().nullable().optional(),
  veiculoId: z.number().int().positive().nullable().optional(),
  materiais: z.array(materialItemSchema).default([]),
  epis: z.array(epiItemSchema).default([]),
  equipamentos: z.array(equipamentoItemSchema).default([]),
});

export const salvarPlanejamentoSchema = z.object({
  dataInicioPrevista: z.string().nullable().optional(),
  dispararAgora: z.boolean().optional().default(false),
  atividades: z.array(atividadePlanejamentoSchema),
});

export type SalvarPlanejamentoInput = z.infer<typeof salvarPlanejamentoSchema>;
export type AtividadePlanejamentoInput = z.infer<
  typeof atividadePlanejamentoSchema
>;

export const concluirTarefaColaboradorSchema = z.object({
  token: z.string().min(1),
  concluido: z.boolean(),
  fotoWebpBase64: z.string().optional(),
  observacao: z.string().max(1000).optional(),
});

export type ConcluirTarefaColaboradorInput = z.infer<
  typeof concluirTarefaColaboradorSchema
>;
