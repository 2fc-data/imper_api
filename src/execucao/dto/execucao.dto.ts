import { z } from 'zod';

export const planificarAtividadeSchema = z.object({
  atividadeId: z.string().min(1),
});
export type PlanificarAtividadeDto = z.infer<typeof planificarAtividadeSchema>;

export const statusExecucaoSchema = z.object({
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA']),
});
export type StatusExecucaoDto = z.infer<typeof statusExecucaoSchema>;
