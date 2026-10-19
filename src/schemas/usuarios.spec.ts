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

  it('aceita ativo false', () => {
    const r = criarUsuarioSchema.safeParse({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [1],
      ativo: false,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.ativo).toBe(false);
  });

  it('aceita sem ativo (default false aplicado pelo service)', () => {
    const r = criarUsuarioSchema.safeParse({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [1],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.ativo).toBeUndefined();
  });

  it('rejeita ativo não booleano', () => {
    const r = criarUsuarioSchema.safeParse({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [1],
      ativo: 'sim',
    });
    expect(r.success).toBe(false);
  });

  it('aceita rg opcional e aplica trim', () => {
    const r = criarUsuarioSchema.safeParse({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [1],
      rg: '  12.345.678-9  ',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.rg).toBe('12.345.678-9');
  });

  it('aceita sem rg (opcional)', () => {
    const r = criarUsuarioSchema.safeParse({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [1],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.rg).toBeUndefined();
  });

  it('rejeita rg com mais de 20 caracteres', () => {
    const r = criarUsuarioSchema.safeParse({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [1],
      rg: 'x'.repeat(21),
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

  it('aceita rg vazio (limpa o campo no service)', () => {
    expect(atualizarUsuarioSchema.safeParse({ rg: '' }).success).toBe(true);
  });

  it('rejeita rg com mais de 20 caracteres', () => {
    expect(
      atualizarUsuarioSchema.safeParse({ rg: 'x'.repeat(21) }).success,
    ).toBe(false);
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
