import { z } from 'zod';

const cascataIds = z.object({
  verboId: z.number().int(),
  objetoId: z.number().int(),
  localId: z.number().int().nullable().optional(),
  caracteristicaId: z.number().int().nullable().optional(),
});

const materialLinha = z.object({
  materialId: z.number().int(),
  quantidade: z.number().positive('Quantidade deve ser positiva'),
});

const linhaSchema = cascataIds.extend({
  descricao: z.string().trim().min(1, 'Informe a descrição').max(1000),
  unidadeId: z.number().int().nullable().optional(),
  quantidade: z.number().positive().nullable().optional(),
  areaM2: z.number().positive().nullable().optional(),
  moValorHora: z.number().min(0).nullable().optional(),
  moPessoas: z.number().int().min(1).nullable().optional(),
  moHoras: z.number().min(0).nullable().optional(),
  materiais: z.array(materialLinha).default([]),
});

const atividadeSchema = z.object({
  etapaId: z.number().int(),
  subServicoId: z.number().int(),
  catalogoAtividadeId: z.string().min(1),
  linhas: z.array(linhaSchema).min(1, 'Informe ao menos 1 linha por atividade'),
});

const fichaSchema = z.object({
  areaPisoM2: z.number().positive().nullable().optional(),
  areaParedeM2: z.number().positive().nullable().optional(),
  areaTetoM2: z.number().positive().nullable().optional(),
  perimetroM: z.number().positive().nullable().optional(),
  acabamentoPiso: z
    .enum(['CERAMICA', 'PORCELANATO', 'CIMENTO', 'REVESTIMENTO', 'OUTRO'])
    .nullable()
    .optional(),
  acabamentoParede: z
    .enum(['PINTURA', 'REVESTIMENTO_CERAMICO', 'APLICACAO', 'OUTRO'])
    .nullable()
    .optional(),
  tipoForro: z
    .enum(['GESSO', 'PVC', 'DRYWALL', 'ALVENARIA', 'NENHUM'])
    .nullable()
    .optional(),
  tipoEsquadria: z
    .enum(['ALUMINIO', 'MADEIRA', 'FERRO', 'PVC', 'OUTRO'])
    .nullable()
    .optional(),
  padraoAcabamento: z
    .enum(['BASICO', 'STANDARD', 'PREMIUM'])
    .nullable()
    .optional(),
  caixasLuz: z.number().int().min(0).nullable().optional(),
  cuidados: z.array(z.string().max(300)).default([]),
  risco1: z.string().max(500).nullable().optional(),
  acao1: z.string().max(500).nullable().optional(),
  risco2: z.string().max(500).nullable().optional(),
  acao2: z.string().max(500).nullable().optional(),
  risco3: z.string().max(500).nullable().optional(),
  acao3: z.string().max(500).nullable().optional(),
});

export const criarOrcamentoSchema = z.object({
  atendimentoId: z.number().int(),
  visitaId: z.number().int().nullable().optional(),
  enderecoId: z.number().int().nullable().optional(),
  servicoMarketingId: z.number().int().nullable().optional(),
  urgencia: z.enum(['NORMAL', 'URGENTE', 'URGENTISSIMO']).default('NORMAL'),
  observacoes: z.string().max(2000).optional(),
  validade: z.string().datetime({ offset: true }).optional(), // default: hoje + 30d
  areaM2: z.number().positive('Informe a área (m²)').nullable().optional(),
  valorM2: z.number().min(0, 'Informe o valor/m²').nullable().optional(),
  ficha: fichaSchema.optional(),
  atividades: z.array(atividadeSchema).default([]),
});

export type CriarOrcamentoDto = z.infer<typeof criarOrcamentoSchema>;

export const recusarSchema = z.object({
  motivo: z.string().trim().min(1, 'Informe o motivo').max(500),
});

export type RecusarDto = z.infer<typeof recusarSchema>;
