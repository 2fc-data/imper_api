import {
  atualizarAtividadeObraSchema,
  atualizarEtapaSchema,
  atualizarObraSchema,
  criarAditivoSchema,
  criarAtividadeSchema,
  criarEtapaSchema,
  listarObrasQuerySchema,
} from './obras.js';

const atividadeValida = {
  obraEtapaId: 1,
  subServicoId: 2,
  catalogoAtividadeId: 'clx1',
  descricao: 'Aplicar membrana asfáltica',
  verboId: 1,
  objetoId: 2,
};

describe('listarObrasQuerySchema', () => {
  it('aceita query vazia e rejeita status fora do enum', () => {
    expect(listarObrasQuerySchema.safeParse({}).success).toBe(true);
    expect(listarObrasQuerySchema.safeParse({ status: 'EM_EXECUCAO' }).success).toBe(true);
    expect(listarObrasQuerySchema.safeParse({ status: 'EM_OBRA' }).success).toBe(false);
  });
});

describe('criarEtapaSchema', () => {
  it('exige nome e etapaId do catálogo', () => {
    expect(criarEtapaSchema.safeParse({ nome: 'Fundação', etapaId: 1 }).success).toBe(true);
    expect(criarEtapaSchema.safeParse({ nome: '', etapaId: 1 }).success).toBe(false);
    expect(criarEtapaSchema.safeParse({ nome: 'Fundação' }).success).toBe(false);
  });
});

describe('atualizarEtapaSchema', () => {
  it('aceita atualização parcial e rejeita corpo vazio', () => {
    expect(atualizarEtapaSchema.safeParse({ inativo: true }).success).toBe(true);
    expect(atualizarEtapaSchema.safeParse({}).success).toBe(false);
  });
});

describe('criarAtividadeSchema', () => {
  it('aceita payload mínimo e valida quantidade de material', () => {
    expect(criarAtividadeSchema.safeParse(atividadeValida).success).toBe(true);
    expect(
      criarAtividadeSchema.safeParse({ ...atividadeValida, materiais: [] }).success,
    ).toBe(true);
    expect(
      criarAtividadeSchema.safeParse({
        ...atividadeValida,
        materiais: [{ materialId: 1, quantidade: 0 }],
      }).success,
    ).toBe(false);
  });
});

describe('atualizarAtividadeObraSchema', () => {
  it('exige updatedAt (lock otimístico) e ao menos um campo editável', () => {
    expect(
      atualizarAtividadeObraSchema.safeParse({
        quantidade: 4,
        updatedAt: '2026-10-04T10:00:00.000Z',
      }).success,
    ).toBe(true);
    expect(atualizarAtividadeObraSchema.safeParse({ quantidade: 4 }).success).toBe(false);
    expect(
      atualizarAtividadeObraSchema.safeParse({ updatedAt: '2026-10-04T10:00:00.000Z' }).success,
    ).toBe(false);
  });
});

describe('criarAditivoSchema', () => {
  it('exige ao menos um item e valida o enum de acrescimo', () => {
    const base = { descricao: 'Acréscimo de hidráulica', valor: 1500 };
    expect(
      criarAditivoSchema.safeParse({
        ...base,
        itens: [{ acrescimo: 'novaEtapa', nome: 'Hidráulica', etapaId: 3 }],
      }).success,
    ).toBe(true);
    expect(criarAditivoSchema.safeParse({ ...base, itens: [] }).success).toBe(false);
    expect(
      criarAditivoSchema.safeParse({
        ...base,
        itens: [{ acrescimo: 'EXTRA', nome: 'X' }],
      }).success,
    ).toBe(false);
  });
});

describe('atualizarObraSchema', () => {
  it('valida urgência/status e exige ao menos um campo', () => {
    expect(atualizarObraSchema.safeParse({ urgencia: 'URGENTE' }).success).toBe(true);
    expect(atualizarObraSchema.safeParse({ urgencia: 'ALTA' }).success).toBe(false);
    expect(atualizarObraSchema.safeParse({}).success).toBe(false);
  });
});
