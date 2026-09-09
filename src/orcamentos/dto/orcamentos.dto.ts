import { z } from 'zod';

const itemOrcamentoSchema = z.object({
  servicoItemId: z.number().int().nullable().optional(),
  nome: z.string().min(1).max(150),
  tipo: z.enum(['SERVICO', 'MATERIAL', 'EQUIPAMENTO']),
  quantidade: z.number().positive(),
  unidadeId: z.number().int(),
  valorUnitario: z.number().min(0),
});

export const criarOrcamentoSchema = z.object({
  atendimentoId: z.number().int(),
  visitaId: z.number().int().nullable().optional(),
  enderecoId: z.number().int().nullable().optional(),
  observacoes: z.string().max(2000).optional(),
  itens: z.array(itemOrcamentoSchema).min(1, 'Informe ao menos 1 item'),
});

export type CriarOrcamentoDto = z.infer<typeof criarOrcamentoSchema>;
