import { z } from 'zod';

export const ESPECIALIDADES = [
  'IMPERMEABILIZACAO',
  'PINTURA',
  'ELETRICA',
  'HIDRAULICA',
  'CIVIL',
  'LIMPEZA',
  'OUTROS',
] as const;

export const TIPOS_RECURSO = ['EQUIPAMENTO', 'EPI', 'MATERIAL'] as const;

const subStepSchema = z.object({
  ordem: z.number().int('Ordem inválida'),
  descricao: z.string().trim().min(1, 'Informe a descrição'),
  observacao: z.string().trim().optional(),
});

const recursoSchema = z.object({
  tipo: z.enum(TIPOS_RECURSO, { message: 'Tipo de recurso inválido' }),
  itemCatalogoId: z.number().int('Item do catálogo inválido'),
  quantidade: z.number().min(0, 'Quantidade inválida').optional(),
});

const criarBaseSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome').max(200, 'Máximo de 200 caracteres'),
  descricao: z.string().trim().max(2000, 'Máximo de 2000 caracteres').optional(),
  especialidadeNecessaria: z.enum(ESPECIALIDADES, {
    message: 'Especialidade inválida',
  }),
  tempoEstimadoHoras: z
    .number()
    .min(0, 'Tempo estimado inválido')
    .max(999.99, 'Tempo estimado excede o limite')
    .nullable()
    .optional(),
  etapaId: z.number().int('Etapa inválida').nullable().optional(),
  subServicoId: z.number().int('Sub-serviço inválido').nullable().optional(),
});

export const criarCatalogoSchema = criarBaseSchema.extend({
  subSteps: z.array(subStepSchema).optional(),
  recursos: z.array(recursoSchema).optional(),
});

export const atualizarCatalogoSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome').max(200, 'Máximo de 200 caracteres').optional(),
  descricao: z.string().trim().max(2000, 'Máximo de 2000 caracteres').optional(),
  especialidadeNecessaria: z
    .enum(ESPECIALIDADES, { message: 'Especialidade inválida' })
    .optional(),
  tempoEstimadoHoras: z
    .number()
    .min(0, 'Tempo estimado inválido')
    .max(999.99, 'Tempo estimado excede o limite')
    .nullable()
    .optional(),
  etapaId: z.number().int('Etapa inválida').nullable().optional(),
  subServicoId: z.number().int('Sub-serviço inválido').nullable().optional(),
  ativo: z.boolean().optional(),
});

export const adicionarSubStepSchema = subStepSchema;
export const adicionarRecursoSchema = recursoSchema;

export type CriarCatalogoDto = z.infer<typeof criarCatalogoSchema>;
export type AtualizarCatalogoDto = z.infer<typeof atualizarCatalogoSchema>;
export type AdicionarSubStepDto = z.infer<typeof adicionarSubStepSchema>;
export type AdicionarRecursoDto = z.infer<typeof adicionarRecursoSchema>;
