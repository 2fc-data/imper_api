import { z } from 'zod';

export const criarVisitaItemSchema = z.object({
  etapaId: z.number().int().positive(),
  subServicoId: z.number().int().positive(),
  verboId: z.number().int().positive(),
  objetoId: z.number().int().positive(),
  localId: z.number().int().positive().nullable().optional(),
  caracteristicaId: z.number().int().positive().nullable().optional(),
  unidadeId: z.number().int().positive().nullable().optional(),
  quantidade: z.number().nullable().optional(),
  areaM2: z.number().nullable().optional(),
  observacoes: z.string().max(500).nullable().optional(),
});

export type CriarVisitaItemDto = z.infer<typeof criarVisitaItemSchema>;
