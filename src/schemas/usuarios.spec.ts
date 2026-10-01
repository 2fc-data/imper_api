import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  definirPerfisSchema,
} from './usuarios.js';

describe('criarUsuarioSchema', () => {
  it('aceita múltiplos papelIds', () => {
    const r = criarUsuarioSchema.safeParse({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [1, 2],
    });
    expect(r.success).toBe(true);
  });

  it('falha sem papelIds (o campo legado papelId não é mapeado)', () => {
    const r = criarUsuarioSchema.safeParse({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelId: 1,
    });
    expect(r.success).toBe(false);
  });

  it('rejeita papelIds vazio', () => {
    const r = criarUsuarioSchema.safeParse({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [],
    });
    expect(r.success).toBe(false);
  });
});

describe('atualizarUsuarioSchema', () => {
  it('aceita atualização sem papelIds', () => {
    expect(
      atualizarUsuarioSchema.safeParse({ nome: 'Ana Silva' }).success,
    ).toBe(true);
  });

  it('rejeita papelIds vazio', () => {
    expect(atualizarUsuarioSchema.safeParse({ papelIds: [] }).success).toBe(
      false,
    );
  });
});

describe('definirPerfisSchema', () => {
  it('aceita lista não vazia', () => {
    expect(definirPerfisSchema.safeParse({ papelIds: [2, 5] }).success).toBe(
      true,
    );
  });

  it('rejeita lista vazia', () => {
    expect(definirPerfisSchema.safeParse({ papelIds: [] }).success).toBe(false);
  });

  it('falha sem papelIds (o payload legado { papelId } não é mapeado)', () => {
    expect(definirPerfisSchema.safeParse({ papelId: 2 }).success).toBe(false);
  });
});
