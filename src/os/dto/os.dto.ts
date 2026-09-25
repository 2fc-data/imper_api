import { z } from 'zod';

export const cancelarOsSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, 'Motivo é obrigatório')
    .max(500, 'Motivo deve ter no máximo 500 caracteres'),
});

export type CancelarOsDto = z.infer<typeof cancelarOsSchema>;
