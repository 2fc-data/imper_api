import { z } from 'zod';

export const listarListaComprasQuerySchema = z.object({
  tipo: z
    .enum(['DESPESAS_EXTRAS', 'SUPERMERCADO', 'MATERIAL', 'EPI', 'EQUIPAMENTO'])
    .transform((t) => (t === 'SUPERMERCADO' ? 'DESPESAS_EXTRAS' : t)),
  setor: z.enum(['LOJA', 'ALMOXARIFADO']),
  mes: z.coerce.number().int().min(1).max(12),
  ano: z.coerce.number().int().min(2020).max(2100),
});
export type ListarListaComprasQueryInput = z.infer<
  typeof listarListaComprasQuerySchema
>;

export const salvarItensListaSchema = z.object({
  itens: z.array(
    z.object({
      itemId: z.number().int().positive(),
      quantidade: z.number().positive(),
    }),
  ),
});
export type SalvarItensListaInput = z.infer<typeof salvarItensListaSchema>;

export const recusarListaSchema = z.object({
  motivo: z.string().trim().min(1, 'Informe o motivo da recusa'),
});
export type RecusarListaInput = z.infer<typeof recusarListaSchema>;

export const comprarItemSchema = z.object({
  custoReal: z.number().positive().optional(),
});
export type ComprarItemInput = z.infer<typeof comprarItemSchema>;
