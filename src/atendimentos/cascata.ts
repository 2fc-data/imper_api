import { AppError } from '../lib/errors.js';

export type StatusCascata =
  | 'NOVO'
  | 'EM_ANDAMENTO'
  | 'ORCAMENTAMENTO'
  | 'CONCLUIDO'
  | 'INATIVO';

export const TRANSICOES: Record<StatusCascata, StatusCascata[]> = {
  NOVO: ['EM_ANDAMENTO', 'CONCLUIDO', 'INATIVO'],
  EM_ANDAMENTO: ['ORCAMENTAMENTO', 'CONCLUIDO', 'INATIVO'],
  ORCAMENTAMENTO: ['EM_ANDAMENTO', 'CONCLUIDO', 'INATIVO'],
  CONCLUIDO: [],
  INATIVO: [],
};

export const TERMINAIS: StatusCascata[] = ['CONCLUIDO', 'INATIVO'];

export function ehTerminal(status: StatusCascata): boolean {
  return TERMINAIS.includes(status);
}

export function validarTransicao(
  de: StatusCascata,
  para: StatusCascata,
): void {
  if (!TRANSICOES[de]?.includes(para)) {
    throw new AppError(400, `Transição inválida: ${de} → ${para}`);
  }
}

export function assertAtendimentoAberto(status: StatusCascata): void {
  if (ehTerminal(status)) throw new AppError(400, 'Atendimento encerrado');
}

export interface ContextoAcoes {
  status: StatusCascata;
  visitaSolicitada: boolean;
  temAgendamentoVisita: boolean;
  temVisita: boolean;
}

export type AcaoAtendimento =
  | 'MUDAR_STATUS:EM_ANDAMENTO'
  | 'MUDAR_STATUS:ORCAMENTAMENTO'
  | 'CRIAR_AGENDAMENTO'
  | 'CRIAR_VISITA'
  | 'CRIAR_ORCAMENTO'
  | 'ENCERRAR';

export function calcularProximasAcoes(
  ctx: ContextoAcoes,
): AcaoAtendimento[] {
  if (ehTerminal(ctx.status)) return [];
  const vinculos: AcaoAtendimento[] = [];
  if (ctx.visitaSolicitada) {
    if (!ctx.temAgendamentoVisita) vinculos.push('CRIAR_AGENDAMENTO');
    else if (!ctx.temVisita) vinculos.push('CRIAR_VISITA');
  }
  switch (ctx.status) {
    case 'NOVO':
      return ['MUDAR_STATUS:EM_ANDAMENTO', ...vinculos, 'ENCERRAR'];
    case 'EM_ANDAMENTO':
      return ['MUDAR_STATUS:ORCAMENTAMENTO', ...vinculos, 'ENCERRAR'];
    case 'ORCAMENTAMENTO':
      return [
        'MUDAR_STATUS:EM_ANDAMENTO',
        'CRIAR_ORCAMENTO',
        'ENCERRAR',
      ];
  }
}
