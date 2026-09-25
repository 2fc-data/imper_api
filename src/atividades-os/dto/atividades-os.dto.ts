import { z } from 'zod';

export const associarEquipeSchema = z.object({
  equipeId: z.string().min(1, 'equipeId é obrigatório'),
  dataPrevisao: z.string().datetime({ offset: true }).nullable().optional(),
});

export type AssociarEquipeDto = z.infer<typeof associarEquipeSchema>;
