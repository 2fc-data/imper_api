import {
  comprarItemSchema,
  listarListaComprasQuerySchema,
  recusarListaSchema,
  salvarItensListaSchema,
} from './listas-compras.js';

describe('listarListaComprasQuerySchema', () => {
  it('aceita combo válido e rejeita valores fora do enum', () => {
    const ok = { tipo: 'SUPERMERCADO', setor: 'LOJA', mes: 3, ano: 2026 };
    expect(listarListaComprasQuerySchema.safeParse(ok).success).toBe(true);
    expect(
      listarListaComprasQuerySchema.safeParse({ ...ok, tipo: 'PEIXE' }).success,
    ).toBe(false);
    expect(
      listarListaComprasQuerySchema.safeParse({ ...ok, mes: 0 }).success,
    ).toBe(false);
    expect(
      listarListaComprasQuerySchema.safeParse({ ...ok, mes: 13 }).success,
    ).toBe(false);
    expect(
      listarListaComprasQuerySchema.safeParse({ ...ok, setor: 'MATRIZ' })
        .success,
    ).toBe(false);
  });

  it('coage query strings e aplica limite do ano', () => {
    const ok = { tipo: 'MATERIAL', setor: 'LOJA' };
    expect(
      listarListaComprasQuerySchema.safeParse({ ...ok, mes: '3', ano: '2026' })
        .success,
    ).toBe(true);
    expect(
      listarListaComprasQuerySchema.safeParse({ ...ok, mes: 'abc', ano: 2026 })
        .success,
    ).toBe(false);
    expect(
      listarListaComprasQuerySchema.safeParse({ ...ok, mes: 3, ano: 2019 })
        .success,
    ).toBe(false);
    expect(
      listarListaComprasQuerySchema.safeParse({ ...ok, mes: 3, ano: 2101 })
        .success,
    ).toBe(false);
  });
});

describe('salvarItensListaSchema', () => {
  it('aceita lista vazia e rejeita quantidade zero/negativa ou itemId ausente', () => {
    expect(salvarItensListaSchema.safeParse({ itens: [] }).success).toBe(true);
    expect(
      salvarItensListaSchema.safeParse({
        itens: [{ itemId: 1, quantidade: 2.5 }],
      }).success,
    ).toBe(true);
    expect(
      salvarItensListaSchema.safeParse({
        itens: [{ itemId: 1, quantidade: 0 }],
      }).success,
    ).toBe(false);
    expect(
      salvarItensListaSchema.safeParse({
        itens: [{ itemId: -1, quantidade: 1 }],
      }).success,
    ).toBe(false);
    expect(salvarItensListaSchema.safeParse({}).success).toBe(false);
  });
});

describe('recusarListaSchema', () => {
  it('exige motivo não vazio', () => {
    expect(recusarListaSchema.safeParse({ motivo: 'Sem verba' }).success).toBe(
      true,
    );
    expect(recusarListaSchema.safeParse({ motivo: '' }).success).toBe(false);
    expect(recusarListaSchema.safeParse({}).success).toBe(false);
  });
});

describe('comprarItemSchema', () => {
  it('aceita corpo vazio e custoReal positivo', () => {
    expect(comprarItemSchema.safeParse({}).success).toBe(true);
    expect(comprarItemSchema.safeParse({ custoReal: 12.5 }).success).toBe(true);
    expect(comprarItemSchema.safeParse({ custoReal: -1 }).success).toBe(false);
  });
});
