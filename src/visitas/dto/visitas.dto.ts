import { z } from 'zod';

export const criarVisitaSchema = z.object({
  agendamentoId: z.number().int(),
  tecnicoId: z.number().int().optional(),
});

export type CriarVisitaDto = z.infer<typeof criarVisitaSchema>;

export const atualizarVisitaSchema = z.object({
  status: z.enum(['AGENDADA', 'REALIZADA', 'CANCELADA']).optional(),
  resultado: z
    .enum([
      'SEM_ACAO',
      'ORCAMENTO_NECESSARIO',
      'OBRA_NECESSARIA',
      'CLIENTE_AUSENTE',
    ])
    .optional(),
  constatacao: z.string().optional(),
  relatorio: z.string().optional(),
  necessitaOrcamento: z.boolean().optional(),
  necessitaObra: z.boolean().optional(),
});

export type AtualizarVisitaDto = z.infer<typeof atualizarVisitaSchema>;
