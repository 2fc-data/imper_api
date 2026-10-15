import { describe, expect, it } from 'vitest';
import { criarOrcamentoSchema } from './orcamentos.dto.js';

const base = {
  atendimentoId: 1,
  atividades: [
    {
      etapaId: 1,
      subServicoId: 2,
      linhas: [
        {
          verboId: 1,
          objetoId: 2,
          materiais: [],
        },
      ],
    },
  ],
};

describe('criarOrcamentoSchema — epis por linha', () => {
  it('aceita linha com epis válidos', () => {
    const parsed = criarOrcamentoSchema.parse({
      ...base,
      atividades: [
        {
          ...base.atividades[0],
          linhas: [
            {
              verboId: 1,
              objetoId: 2,
              materiais: [],
              epis: [
                { epiId: 10, quantidade: 2, custoUnitario: 5.5 },
                { epiId: 11, quantidade: 1 },
              ],
            },
          ],
        },
      ],
    });
    expect(parsed.atividades[0].linhas[0].epis).toEqual([
      { epiId: 10, quantidade: 2, custoUnitario: 5.5 },
      { epiId: 11, quantidade: 1 },
    ]);
  });

  it('epis sem envio vira [] (default)', () => {
    const parsed = criarOrcamentoSchema.parse(base);
    expect(parsed.atividades[0].linhas[0].epis).toEqual([]);
  });

  it('rejeita quantidade não positiva', () => {
    expect(() =>
      criarOrcamentoSchema.parse({
        ...base,
        atividades: [
          {
            ...base.atividades[0],
            linhas: [
              {
                verboId: 1,
                objetoId: 2,
                epis: [{ epiId: 10, quantidade: 0 }],
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it('rejeita custoUnitario negativo', () => {
    expect(() =>
      criarOrcamentoSchema.parse({
        ...base,
        atividades: [
          {
            ...base.atividades[0],
            linhas: [
              {
                verboId: 1,
                objetoId: 2,
                epis: [{ epiId: 10, quantidade: 1, custoUnitario: -1 }],
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it('aceita custoUnitario null (preço não cadastrado)', () => {
    const parsed = criarOrcamentoSchema.parse({
      ...base,
      atividades: [
        {
          ...base.atividades[0],
          linhas: [
            {
              verboId: 1,
              objetoId: 2,
              epis: [{ epiId: 10, quantidade: 1, custoUnitario: null }],
            },
          ],
        },
      ],
    });
    expect(parsed.atividades[0].linhas[0].epis).toEqual([
      { epiId: 10, quantidade: 1, custoUnitario: null },
    ]);
  });
});
