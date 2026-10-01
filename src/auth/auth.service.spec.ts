import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';

const SENHA = 'senha123';
let hash = '';

const mockPrisma = {
  user: { findUnique: vi.fn() },
  usuarioPapel: { findMany: vi.fn() },
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
  mockPrisma.user.findUnique.mockResolvedValue({
    id: 1,
    nome: 'Ana Silva',
    email: 'ana@exemplo.com',
    senhaHash: hash,
  });
});

describe('AuthService.login — múltiplos papéis', () => {
  it('usuário misto: papel staff-primeiro, papeis[] completo e união de permissões', async () => {
    mockPrisma.usuarioPapel.findMany.mockResolvedValue([
      { papel: { nome: 'CLIENTE', permissoes: [] } },
      {
        papel: {
          nome: 'TECNICO',
          permissoes: [{ permissao: { chave: 'editar_os' } }],
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
        permissoes: ['editar_os'],
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

  it('sem papéis: fallback ATENDENTE e lista vazia', async () => {
    mockPrisma.usuarioPapel.findMany.mockResolvedValue([]);

    const r = await servico().login({
      email: 'ana@exemplo.com',
      senha: SENHA,
    });

    expect(r.user.papel).toBe('ATENDENTE');
    expect(r.user.papeis).toEqual([]);
  });
});
