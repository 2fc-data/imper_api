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

export enum ClientStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  BLOCKED = 'bloqueado',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  STATUS_CHANGE = 'status_change',
}

export enum ColaboradorTipo {
  FUNCIONARIO = 'funcionario',
  TERCEIRO = 'terceiro',
}

export enum ColaboradorStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  BLOQUEADO = 'bloqueado',
}

export enum ColaboradorContrato {
  CLT = 'clt',
  PJ = 'pj',
  TEMPORARIO = 'temporario',
  TERCEIRIZADO = 'terceirizado',
}

export enum EpiType {
  CAPACETE = 'capacete',
  LUVA = 'luva',
  CINTO = 'cinto',
  BOTA = 'bota',
  OCULOS = 'oculos',
  PROTETOR_AURICULAR = 'protetor_auricular',
  MASCARA = 'mascara',
  MACACAO = 'macacao',
  OTHER = 'other',
}

export enum EpiStatus {
  ENTREGUE = 'entregue',
  DEVOLVIDO = 'devolvido',
  PERDIDO = 'perdido',
  DANIFICADO = 'danificado',
}

export enum AssetTipo {
  VEICULO = 'veiculo',
  EQUIPAMENTO = 'equipamento',
  IMOVEL = 'imovel',
  MOBILIARIO = 'mobilario',
}

export enum AssetEstado {
  BOM = 'bom',
  REGULAR = 'regular',
  NECESSITA_REPARO = 'necessita_reparo',
  INOPERANTE = 'inoperante',
}

export enum AssetStatus {
  DISPONIVEL = 'disponivel',
  EM_USO = 'em_uso',
  EM_MANUTENCAO = 'em_manutencao',
  BAIXADO = 'baixado',
}

export enum CombustivelTipo {
  GASOLINA = 'gasolina',
  ETANOL = 'etanol',
  DIESEL = 'diesel',
  FLEX = 'flex',
  ELETRICO = 'eletrico',
  HIBRIDO = 'hibrido',
}
