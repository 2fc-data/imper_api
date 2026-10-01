import { atualizarPerfilSchema } from './portal.js';

describe('atualizarPerfilSchema', () => {
  it('aceita nome apenas', () => {
    expect(atualizarPerfilSchema.parse({ nome: 'Ana Silva' })).toEqual({
      nome: 'Ana Silva',
    });
  });

  it('mantém campos ausentes ausentes', () => {
    expect(atualizarPerfilSchema.parse({})).toEqual({});
  });

  it('aceita email vazio (limpar) e email válido', () => {
    expect(atualizarPerfilSchema.parse({ email: '' })).toEqual({ email: '' });
    expect(atualizarPerfilSchema.parse({ email: 'ana@exemplo.com' })).toEqual({
      email: 'ana@exemplo.com',
    });
  });

  it('rejeita email inválido', () => {
    expect(() => atualizarPerfilSchema.parse({ email: 'invalido' })).toThrow();
  });

  it('aceita telefone com 10 ou 11 dígitos e formatado', () => {
    expect(atualizarPerfilSchema.parse({ telefone: '11999998888' })).toEqual({
      telefone: '11999998888',
    });
    expect(
      atualizarPerfilSchema.parse({ telefone: '(11) 99999-8888' }),
    ).toEqual({ telefone: '(11) 99999-8888' });
    expect(atualizarPerfilSchema.parse({ telefone: '' })).toEqual({
      telefone: '',
    });
  });

  it('rejeita telefone curto com a mensagem do spec', () => {
    expect(() =>
      atualizarPerfilSchema.parse({ telefone: '1234' }),
    ).toThrowError(
      /Telefone inválido\. Informe DDD \+ número com 10 ou 11 dígitos/,
    );
  });

  it('valida CPF/CNPJ', () => {
    expect(atualizarPerfilSchema.parse({ cpfCnpj: '529.982.247-25' })).toEqual({
      cpfCnpj: '529.982.247-25',
    });
    expect(() =>
      atualizarPerfilSchema.parse({ cpfCnpj: '111.111.111-11' }),
    ).toThrowError(/CPF ou CNPJ inválido/);
  });

  it('remove chaves proibidas (senha, papel, id, permissoes)', () => {
    const result = atualizarPerfilSchema.parse({
      nome: 'Ana',
      senha: 'x',
      papel: 'ADMIN',
      id: 99,
      permissoes: ['*'],
    } as never);
    expect(result).toEqual({ nome: 'Ana' });
    expect(result).not.toHaveProperty('senha');
    expect(result).not.toHaveProperty('papel');
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('permissoes');
  });
});
