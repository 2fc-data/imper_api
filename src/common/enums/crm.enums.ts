export enum LeadStatus {
  NOVO = 'novo',
  QUALIFICADO = 'qualificado',
  VISITA_TECNICA = 'visita_tecnica',
  ORCAMENTO = 'orcamento',
  NEGOCIACAO = 'negociacao',
  GANHO = 'ganho',
  PERDIDO = 'perdido',
}

export enum LeadSource {
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  GOOGLE_ADS = 'google_ads',
  INDICACAO = 'indicacao',
  FORMULARIO = 'formulario',
  LIGACAO = 'ligacao',
  SITE = 'site',
  OUTRO = 'outro',
}

export enum OpportunityStatus {
  ABERTA = 'aberta',
  EM_ANDAMENTO = 'em_andamento',
  GANHA = 'ganha',
  PERDIDA = 'perdida',
}


export enum ActivityType {
  LIGACAO = 'ligacao',
  REUNIAO = 'reuniao',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  VISITA_TECNICA = 'visita_tecnica',
  PROPOSTA = 'proposta',
  TAREFA = 'tarefa',
  NOTA = 'nota',
}

export enum ActivityStatus {
  PENDENTE = 'pendente',
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada',
}

export enum ProposalStatus {
  RASCUNHO = 'rascunho',
  ENVIADA = 'enviada',
  APROVADA = 'aprovada',
  REJEITADA = 'rejeitada',
  EXPIRADA = 'expirada',
}

export enum NotificationType {
  LEAD_ATRIBUIDO = 'lead_atribuido',
  LEAD_MOVIDO = 'lead_movido',
  ATIVIDADE_AGENDADA = 'atividade_agendada',
  ATIVIDADE_ATRASADA = 'atividade_atrasada',
  PROPOSTA_ENVIADA = 'proposta_enviada',
  PROPOSTA_ASSINADA = 'proposta_assinada',
  PROPOSTA_EXPIRADA = 'proposta_expirada',
  LEAD_SEM_INTERACAO = 'lead_sem_interacao',
  META_ATINGIDA = 'meta_atingida',
  SISTEMA = 'sistema',
}
