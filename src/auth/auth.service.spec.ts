import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';

const SENHA = 'senha123';
let hash = '';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
  usuarioPapel: { findMany: vi.fn(), create: vi.fn() },
  papelRbac: { findFirst: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(),
};
const mockJwt = { sign: vi.fn().mockReturnValue('token-teste') };

function servico() {
  return new AuthService(
    mockPrisma as never,
    mockJwt as never,
    undefined as never,
    undefined as never,
  );
}

beforeAll(async () => {
  hash = await bcrypt.hash(SENHA, 4);
});

beforeEach(() => {
  vi.clearAllMocks();
  mockJwt.sign.mockReturnValue('token-teste');
  mockPrisma.$transaction.mockImplementation(
    (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma),
  );
  mockPrisma.user.findUnique.mockResolvedValue({
    id: 1,
    nome: 'Ana Silva',
    email: 'ana@exemplo.com',
    senhaHash: hash,
    ativo: true,
  });
});

describe('AuthService.login — múltiplos papéis', () => {
  it('usuário misto: papel staff-primeiro, papeis[] completo e união de permissões', async () => {
    mockPrisma.usuarioPapel.findMany.mockResolvedValue([
      { papel: { nome: 'CLIENTE', permissoes: [] } },
      {
        papel: {
          nome: 'TECNICO',
          permissoes: [{ permissao: { chave: 'editar_execucao' } }],
        },
      },
    ]);

    const r = await servico().login({
      email: 'ana@exemplo.com',
      senha: SENHA,
    });

    expect(mockJwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        papel: 'TECNICO',
        papeis: ['CLIENTE', 'TECNICO'],
        permissoes: ['editar_execucao'],
      }),
    );
    expect(r.user).toEqual(
      expect.objectContaining({
        papel: 'TECNICO',
        papeis: ['CLIENTE', 'TECNICO'],
      }),
    );
  });

  it('somente CLIENTE mantém papel CLIENTE', async () => {
    mockPrisma.usuarioPapel.findMany.mockResolvedValue([
      { papel: { nome: 'CLIENTE', permissoes: [] } },
    ]);

    const r = await servico().login({
      email: 'ana@exemplo.com',
      senha: SENHA,
    });

    expect(r.user.papel).toBe('CLIENTE');
    expect(r.user.papeis).toEqual(['CLIENTE']);
  });

  it('sem papéis: fallback ATENDIMENTO e lista vazia', async () => {
    mockPrisma.usuarioPapel.findMany.mockResolvedValue([]);

    const r = await servico().login({
      email: 'ana@exemplo.com',
      senha: SENHA,
    });

    expect(r.user.papel).toBe('ATENDIMENTO');
    expect(r.user.papeis).toEqual([]);
  });
});

describe('AuthService.login — usuário inativo', () => {
  it('credenciais válidas + ativo=false → 401 sem emitir token', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 2,
      nome: 'Inativo',
      email: 'inativo@exemplo.com',
      senhaHash: hash,
      ativo: false,
    });

    await expect(
      servico().login({ email: 'inativo@exemplo.com', senha: SENHA }),
    ).rejects.toThrow('Usuário inativo');
    expect(mockJwt.sign).not.toHaveBeenCalled();
  });

  it('senha incorreta cai no erro genérico antes da checagem de ativo', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 2,
      nome: 'Inativo',
      email: 'inativo@exemplo.com',
      senhaHash: hash,
      ativo: false,
    });

    await expect(
      servico().login({ email: 'inativo@exemplo.com', senha: 'errada' }),
    ).rejects.toThrow('E-mail ou senha inválidos');
  });
});

describe('AuthService.cadastrar — cadastro nasce inativo', () => {
  beforeEach(() => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.user.create.mockResolvedValue({
      id: 50,
      nome: 'Novo Cliente',
      email: null,
      telefone: '11999998888',
      senhaHash: 'hash',
      ativo: false,
    });
    mockPrisma.usuarioPapel.create.mockResolvedValue({});
    mockPrisma.papelRbac.findFirst.mockResolvedValue({
      id: 7,
      nome: 'CLIENTE',
    });
    mockPrisma.papelRbac.findMany.mockResolvedValue([]);
  });

  it('retorna pendenteAtivacao sem token quando o usuário nasce inativo', async () => {
    const r = await servico().cadastrar({
      nome: 'Novo Cliente',
      telefone: '11999998888',
      senha: SENHA,
    });

    expect(r.pendenteAtivacao).toBe(true);
    expect(r).not.toHaveProperty('token');
    expect(mockJwt.sign).not.toHaveBeenCalled();
    expect(r.user).toMatchObject({
      id: 50,
      papel: 'ATENDIMENTO',
      papeis: ['CLIENTE'],
    });
  });
});
