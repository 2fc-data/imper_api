import type { z } from 'zod';
import type {
  atualizarAtividadeObraSchema,
  atualizarEtapaSchema,
  atualizarObraSchema,
  criarAditivoSchema,
  criarAtividadeSchema,
  criarEtapaSchema,
  criarOsSchema,
  listarObrasQuerySchema,
} from '../../schemas/obras.js';

export type ListarObrasQueryInput = z.infer<typeof listarObrasQuerySchema>;
export type CriarEtapaInput = z.infer<typeof criarEtapaSchema>;
export type AtualizarEtapaInput = z.infer<typeof atualizarEtapaSchema>;
export type CriarAtividadeInput = z.infer<typeof criarAtividadeSchema>;
export type AtualizarAtividadeObraInput = z.infer<typeof atualizarAtividadeObraSchema>;
export type CriarOsInput = z.infer<typeof criarOsSchema>;
export type CriarAditivoInput = z.infer<typeof criarAditivoSchema>;
export type AtualizarObraInput = z.infer<typeof atualizarObraSchema>;
