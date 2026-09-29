import { describe, expect, it } from 'vitest';
import { AppError } from '../lib/errors.js';
import {
  assertAtendimentoAberto,
  type ContextoAcoes,
  calcularProximasAcoes,
  ehTerminal,
  TRANSICOES,
  validarTransicao,
} from './cascata.js';

function ctx(parcial: Partial<ContextoAcoes>): ContextoAcoes {
  return {
    status: 'NOVO',
    visitaSolicitada: false,
    temAgendamentoVisita: false,
    temVisita: false,
    ...parcial,
  };
}

describe('cascata — matriz de transições', () => {
  it('NOVO permite EM_ANDAMENTO, CONCLUIDO e INATIVO', () => {
    expect(TRANSICOES.NOVO).toEqual(['EM_ANDAMENTO', 'CONCLUIDO', 'INATIVO']);
  });

  it('EM_ANDAMENTO permite ORCAMENTAMENTO, CONCLUIDO e INATIVO', () => {
    expect(TRANSICOES.EM_ANDAMENTO).toEqual([
      'ORCAMENTAMENTO',
      'CONCLUIDO',
      'INATIVO',
    ]);
  });

  it('ORCAMENTAMENTO permite EM_ANDAMENTO, CONCLUIDO e INATIVO', () => {
    expect(TRANSICOES.ORCAMENTAMENTO).toEqual([
      'EM_ANDAMENTO',
      'CONCLUIDO',
      'INATIVO',
    ]);
  });

  it('terminais não têm transições', () => {
    expect(TRANSICOES.CONCLUIDO).toEqual([]);
    expect(TRANSICOES.INATIVO).toEqual([]);
  });

  it('ehTerminal cobre CONCLUIDO e INATIVO', () => {
    expect(ehTerminal('CONCLUIDO')).toBe(true);
    expect(ehTerminal('INATIVO')).toBe(true);
    expect(ehTerminal('NOVO')).toBe(false);
    expect(ehTerminal('EM_ANDAMENTO')).toBe(false);
    expect(ehTerminal('ORCAMENTAMENTO')).toBe(false);
  });
});

describe('cascata — validarTransicao', () => {
  it('rejeita NOVO → ORCAMENTAMENTO', () => {
    expect(() => validarTransicao('NOVO', 'ORCAMENTAMENTO')).toThrow(AppError);
    try {
      validarTransicao('NOVO', 'ORCAMENTAMENTO');
    } catch (e) {
      expect((e as AppError).getStatus()).toBe(400);
      expect((e as Error).message).toBe(
        'Transição inválida: NOVO → ORCAMENTAMENTO',
      );
    }
  });

  it('rejeita qualquer transição saindo de CONCLUIDO', () => {
    try {
      validarTransicao('CONCLUIDO', 'EM_ANDAMENTO');
      expect.fail('deveria lançar');
    } catch (e) {
      expect((e as AppError).getStatus()).toBe(400);
      expect((e as Error).message).toBe(
        'Transição inválida: CONCLUIDO → EM_ANDAMENTO',
      );
    }
  });

  it('aceita transições válidas', () => {
    expect(() => validarTransicao('NOVO', 'EM_ANDAMENTO')).not.toThrow();
    expect(() =>
      validarTransicao('EM_ANDAMENTO', 'ORCAMENTAMENTO'),
    ).not.toThrow();
    expect(() => validarTransicao('ORCAMENTAMENTO', 'CONCLUIDO')).not.toThrow();
  });
});

describe('cascata — assertAtendimentoAberto', () => {
  it('lança 400 para terminais', () => {
    for (const terminal of ['CONCLUIDO', 'INATIVO'] as const) {
      try {
        assertAtendimentoAberto(terminal);
        expect.fail('deveria lançar');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(400);
        expect((e as Error).message).toBe('Atendimento encerrado');
      }
    }
  });

  it('não lança para status abertos', () => {
    expect(() => assertAtendimentoAberto('NOVO')).not.toThrow();
    expect(() => assertAtendimentoAberto('EM_ANDAMENTO')).not.toThrow();
    expect(() => assertAtendimentoAberto('ORCAMENTAMENTO')).not.toThrow();
  });
});

describe('cascata — calcularProximasAcoes', () => {
  it('terminal → [] com qualquer flag', () => {
    expect(calcularProximasAcoes(ctx({ status: 'CONCLUIDO' }))).toEqual([]);
    expect(
      calcularProximasAcoes(ctx({ status: 'INATIVO', visitaSolicitada: true })),
    ).toEqual([]);
  });

  it('NOVO sem flag → EM_ANDAMENTO e ENCERRAR', () => {
    expect(calcularProximasAcoes(ctx({ status: 'NOVO' }))).toEqual([
      'MUDAR_STATUS:EM_ANDAMENTO',
      'ENCERRAR',
    ]);
  });

  it('NOVO com flag e sem agendamento → CRIAR_AGENDAMENTO', () => {
    expect(
      calcularProximasAcoes(ctx({ status: 'NOVO', visitaSolicitada: true })),
    ).toEqual(['MUDAR_STATUS:EM_ANDAMENTO', 'CRIAR_AGENDAMENTO', 'ENCERRAR']);
  });

  it('EM_ANDAMENTO com flag, agendamento sem visita → CRIAR_VISITA', () => {
    expect(
      calcularProximasAcoes(
        ctx({
          status: 'EM_ANDAMENTO',
          visitaSolicitada: true,
          temAgendamentoVisita: true,
        }),
      ),
    ).toEqual(['MUDAR_STATUS:ORCAMENTAMENTO', 'CRIAR_VISITA', 'ENCERRAR']);
  });

  it('EM_ANDAMENTO com flag, agendamento e visita → sem vínculos', () => {
    expect(
      calcularProximasAcoes(
        ctx({
          status: 'EM_ANDAMENTO',
          visitaSolicitada: true,
          temAgendamentoVisita: true,
          temVisita: true,
        }),
      ),
    ).toEqual(['MUDAR_STATUS:ORCAMENTAMENTO', 'ENCERRAR']);
  });

  it('EM_ANDAMENTO com flag mas sem agendamento → CRIAR_AGENDAMENTO', () => {
    expect(
      calcularProximasAcoes(
        ctx({ status: 'EM_ANDAMENTO', visitaSolicitada: true }),
      ),
    ).toEqual(['MUDAR_STATUS:ORCAMENTAMENTO', 'CRIAR_AGENDAMENTO', 'ENCERRAR']);
  });

  it('ORCAMENTAMENTO → EM_ANDAMENTO, CRIAR_ORCAMENTO e ENCERRAR (independente da flag)', () => {
    expect(calcularProximasAcoes(ctx({ status: 'ORCAMENTAMENTO' }))).toEqual([
      'MUDAR_STATUS:EM_ANDAMENTO',
      'CRIAR_ORCAMENTO',
      'ENCERRAR',
    ]);
    expect(
      calcularProximasAcoes(
        ctx({ status: 'ORCAMENTAMENTO', visitaSolicitada: true }),
      ),
    ).toEqual(['MUDAR_STATUS:EM_ANDAMENTO', 'CRIAR_ORCAMENTO', 'ENCERRAR']);
  });
});
