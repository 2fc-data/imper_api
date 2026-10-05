import { z } from 'zod';

export const StatusObraEnum = z.enum(['EM_PREPARACAO', 'EM_EXECUCAO', 'CONCLUIDA', 'CANCELADA']);
export const UrgenciaEnum = z.enum(['NORMAL', 'URGENTE', 'URGENTISSIMO']);

export const listarObrasQuerySchema = z.object({
  status: StatusObraEnum.optional(),
  clienteId: z.coerce.number().optional(),
  busca: z.string().optional(),
});

export const criarEtapaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  etapaId: z.number().int().positive('etapaId é obrigatório'),
});

export const atualizarEtapaSchema = z
  .object({
    nome: z.string().min(1).optional(),
    inativo: z.boolean().optional(),
    ordem: z.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Ao menos um campo deve ser fornecido',
  });

export const materialItemSchema = z.object({
  materialId: z.number().int().positive(),
  quantidade: z.number().positive('Quantidade deve ser positiva'),
  custoUnitario: z.number().nonnegative().optional(),
});

export const epiItemSchema = z.object({
  epiId: z.number().int().positive(),
  quantidade: z.number().positive(),
});

export const equipamentoItemSchema = z.object({
  equipamentoId: z.number().int().positive(),
  quantidade: z.number().positive(),
});

export const criarAtividadeSchema = z.object({
  obraEtapaId: z.number().int().positive(),
  subServicoId: z.number().int().positive(),
  catalogoAtividadeId: z.string().min(1),
  descricao: z.string().min(1),
  verboId: z.number().int().positive(),
  objetoId: z.number().int().positive(),
  localId: z.number().int().positive().optional(),
  caracteristicaId: z.number().int().positive().optional(),
  unidadeId: z.number().int().positive().optional(),
  quantidade: z.number().positive().optional(),
  areaM2: z.number().positive().optional(),
  moValorHora: z.number().nonnegative().optional(),
  moPessoas: z.number().int().positive().optional(),
  moHoras: z.number().positive().optional(),
  moValorTotal: z.number().nonnegative().optional(),
  materiaisValor: z.number().nonnegative().optional(),
  linhaValorTotal: z.number().nonnegative().optional(),
  ordem: z.number().int().optional(),
  materiais: z.array(materialItemSchema).optional(),
  epis: z.array(epiItemSchema).optional(),
  equipamentos: z.array(equipamentoItemSchema).optional(),
});

export const atualizarAtividadeObraSchema = z
  .object({
    updatedAt: z.string().datetime({ message: 'updatedAt deve ser uma data ISO válida' }),
    descricao: z.string().min(1).optional(),
    quantidade: z.number().positive().optional(),
    areaM2: z.number().positive().optional(),
    moValorHora: z.number().nonnegative().optional(),
    moPessoas: z.number().int().positive().optional(),
    moHoras: z.number().positive().optional(),
    materiais: z.array(materialItemSchema).optional(),
    epis: z.array(epiItemSchema).optional(),
    equipamentos: z.array(equipamentoItemSchema).optional(),
  })
  .refine(
    (data) => {
      const keys = Object.keys(data).filter((k) => k !== 'updatedAt');
      return keys.length > 0;
    },
    { message: 'Ao menos um campo além de updatedAt deve ser fornecido' },
  );

export const criarOsSchema = z.object({
  etapaIds: z.array(z.number().int().positive()).min(1, 'Ao menos uma etapa é obrigatória'),
  tecnicoResponsavelId: z.number().int().positive().optional(),
  dataInicioPrevista: z.string().datetime().optional(),
  observacoes: z.string().optional(),
  materiais: z.array(materialItemSchema).optional(),
  epis: z.array(epiItemSchema).optional(),
  equipamentos: z.array(equipamentoItemSchema).optional(),
});

export const itemAditivoSchema = z.object({
  acrescimo: z.enum(['novaEtapa', 'novaAtividade', 'cancelarAtividade']),
  nome: z.string().optional(),
  etapaId: z.number().int().positive().optional(),
  obraAtividadeId: z.string().optional(),
  tipo: z.enum(['SERVICO', 'MATERIAL', 'EQUIPAMENTO']).optional(),
  quantidade: z.number().positive().optional(),
  valorUnitario: z.number().nonnegative().optional(),
  valorTotal: z.number().nonnegative().optional(),
});

export const criarAditivoSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().nonnegative('Valor deve ser não-negativo'),
  itens: z.array(itemAditivoSchema).min(1, 'Ao menos um item é obrigatório'),
});

export const FormaPagamentoEnum = z.enum([
  'DINHEIRO',
  'PIX',
  'CARTAO_CREDITO',
  'CARTAO_DEBITO',
  'BOLETO',
  'TRANSFERENCIA',
]);

export const atualizarObraSchema = z
  .object({
    urgencia: UrgenciaEnum.optional(),
    status: StatusObraEnum.optional(),
    observacoes: z.string().optional(),
    formaPagamento: FormaPagamentoEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Ao menos um campo deve ser fornecido',
  });
