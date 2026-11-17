import { z } from 'zod';

const dataCompraSchema = z
  .string()
  .trim()
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Data da compra inválida')
  .nullable()
  .optional();

const itemCompraSchema = z.object({
  itemId: z.number().int().positive(),
  quantidade: z.number().positive(),
  fornecedorId: z.number().int().positive().nullable().optional(),
  valorUnitario: z.number().nonnegative().nullable().optional(),
  dataCompra: dataCompraSchema,
});

export const listarListaComprasQuerySchema = z.object({
  tipo: z
    .enum(['DESPESAS_EXTRAS', 'SUPERMERCADO', 'MATERIAL', 'EPI', 'EQUIPAMENTO'])
    .transform((t) => (t === 'SUPERMERCADO' ? 'DESPESAS_EXTRAS' : t)),
  setor: z.enum(['LOJA', 'ALMOXARIFADO']),
  mes: z.coerce.number().int().min(1).max(12),
  ano: z.coerce.number().int().min(2020).max(2100),
  tipoDespesaId: z.coerce.number().int().positive().optional(),
});
export type ListarListaComprasQueryInput = z.infer<
  typeof listarListaComprasQuerySchema
>;

export const salvarItensListaSchema = z.object({
  tipoDespesaId: z.number().int().positive().optional(),
  itens: z.array(itemCompraSchema),
});
export type SalvarItensListaInput = z.infer<typeof salvarItensListaSchema>;
export type SalvarItemListaInput = z.infer<typeof itemCompraSchema>;

export const recusarListaSchema = z.object({
  motivo: z.string().trim().min(1, 'Informe o motivo da recusa'),
});
export type RecusarListaInput = z.infer<typeof recusarListaSchema>;

export const comprarItemSchema = z.object({
  custoReal: z.number().positive().optional(),
  fornecedorId: z.number().int().positive().nullable().optional(),
  valorUnitario: z.number().nonnegative().nullable().optional(),
  dataCompra: dataCompraSchema,
});
export type ComprarItemInput = z.infer<typeof comprarItemSchema>;
