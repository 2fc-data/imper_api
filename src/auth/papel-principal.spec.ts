import { papelPrincipal } from './papel-principal';

describe('papelPrincipal', () => {
  it('retorna null para lista vazia', () => {
    expect(papelPrincipal([])).toBeNull();
  });

  it('retorna CLIENTE quando é o único papel', () => {
    expect(papelPrincipal([{ papel: { nome: 'CLIENTE' } }])).toBe('CLIENTE');
  });

  it('prefere papel staff quando há CLIENTE', () => {
    expect(
      papelPrincipal([
        { papel: { nome: 'CLIENTE' } },
        { papel: { nome: 'TECNICO' } },
      ]),
    ).toBe('TECNICO');
  });

  it('retorna o primeiro staff na ordem da lista', () => {
    expect(
      papelPrincipal([
        { papel: { nome: 'CLIENTE' } },
        { papel: { nome: 'ADMIN' } },
        { papel: { nome: 'TECNICO' } },
      ]),
    ).toBe('ADMIN');
  });

  it('ignora CLIENTE na segunda posição', () => {
    expect(
      papelPrincipal([
        { papel: { nome: 'ATENDENTE' } },
        { papel: { nome: 'CLIENTE' } },
      ]),
    ).toBe('ATENDENTE');
  });
});
