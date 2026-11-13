import { z } from 'zod';
import { StatusObraEnum, UrgenciaEnum } from './obras.js';

function booleanQuery(defaultValue: boolean) {
  return z
    .enum(['true', 'false'])
    .optional()
    .transform((value) =>
      value === undefined ? defaultValue : value === 'true',
    );
}

export const dashboardObrasQuerySchema = z
  .object({
    de: z.coerce.date().optional(),
    ate: z.coerce.date().optional(),
    tudo: booleanQuery(false),
    status: StatusObraEnum.optional(),
    urgencia: UrgenciaEnum.optional(),
    clienteId: z.coerce.number().int().positive().optional(),
    obraId: z.coerce.number().int().positive().optional(),
    comparar: booleanQuery(true),
  })
  .refine((data) => !data.de || !data.ate || data.de <= data.ate, {
    message: 'A data inicial não pode ser posterior à data final',
    path: ['de'],
  });
