import { AppError } from '../lib/errors.js';
import { UsuariosService } from './usuarios.service.js';

const mockPrisma = {
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  papelRbac: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  usuarioPapel: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
  endereco: { create: vi.fn() },
  $transaction: vi.fn(),
};

function servico() {
  return new UsuariosService(mockPrisma as never);
}

beforeEach(() => {
  vi.resetAllMocks();
  mockPrisma.$transaction.mockImplementation(
    async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma),
  );
});

describe('UsuariosService — múltiplos papéis', () => {
  it('criar: vincula todos os papelIds informados', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.papelRbac.findMany.mockResolvedValue([
      { id: 1, nome: 'CLIENTE', descricao: null },
      { id: 2, nome: 'TECNICO', descricao: null },
    ]);
    mockPrisma.user.create.mockResolvedValue({ id: 9 });

    const resultado = await servico().criar({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [1, 2],
    });

    expect(mockPrisma.usuarioPapel.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 9, papelId: 1 },
        { userId: 9, papelId: 2 },
      ],
    });
    expect(resultado.papeis).toHaveLength(2);
  });

  it('criar: lança AppError quando algum papelId não existe', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.papelRbac.findMany.mockResolvedValue([
      { id: 1, nome: 'CLIENTE', descricao: null },
    ]);

    await expect(
      servico().criar({
        nome: 'Ana Silva',
        senha: 'senha123',
        papelIds: [1, 99],
      }),
    ).rejects.toThrow('Papel inválido');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('atualizar: substitui vínculos pelos papelIds informados', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 9,
      nome: 'Ana',
      enderecos: [],
    });
    mockPrisma.papelRbac.findMany.mockResolvedValue([{ id: 2 }, { id: 5 }]);
    mockPrisma.usuarioPapel.findMany.mockResolvedValue([
      { papel: { id: 2, nome: 'TECNICO', descricao: null } },
      { papel: { id: 5, nome: 'ADMIN', descricao: null } },
    ]);
    mockPrisma.user.update.mockResolvedValue({ id: 9 });

    const resultado = await servico().atualizar(9, { papelIds: [2, 5] });

    expect(mockPrisma.usuarioPapel.deleteMany).toHaveBeenCalledWith({
      where: { userId: 9 },
    });
    expect(mockPrisma.usuarioPapel.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 9, papelId: 2 },
        { userId: 9, papelId: 5 },
      ],
    });
    expect(resultado.papeis).toHaveLength(2);
  });

  it('atualizar: lança AppError para papelId inexistente', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 9,
      nome: 'Ana',
      enderecos: [],
    });
    mockPrisma.papelRbac.findMany.mockResolvedValue([{ id: 2 }]);

    await expect(servico().atualizar(9, { papelIds: [2, 77] })).rejects.toThrow(
      AppError,
    );
    expect(mockPrisma.usuarioPapel.deleteMany).not.toHaveBeenCalled();
  });

  it('atualizar: não toca nos papéis quando papelIds não é informado', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 9,
      nome: 'Ana',
      enderecos: [],
    });
    mockPrisma.usuarioPapel.findMany.mockResolvedValue([
      { papel: { id: 1, nome: 'CLIENTE', descricao: null } },
    ]);
    mockPrisma.user.update.mockResolvedValue({ id: 9 });

    await servico().atualizar(9, { nome: 'Ana Silva' });

    expect(mockPrisma.usuarioPapel.deleteMany).not.toHaveBeenCalled();
    expect(mockPrisma.usuarioPapel.createMany).not.toHaveBeenCalled();
  });
});

describe('UsuariosService — ativo / ativar_usuario', () => {
  const sessaoComPermissao = { permissoes: ['ativar_usuario'] };
  const sessaoSemPermissao = { permissoes: ['criar_usuario'] };

  beforeEach(() => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 9 });
    mockPrisma.user.update.mockResolvedValue({ id: 9 });
    mockPrisma.papelRbac.findMany.mockResolvedValue([]);
    mockPrisma.usuarioPapel.findMany.mockResolvedValue([]);
  });

  it('criar: sem ativo grava ativo=false (default)', async () => {
    const resultado = await servico().criar({
      nome: 'Ana Silva',
      senha: 'senha123',
      papelIds: [],
    });

    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ativo: false }),
      }),
    );
    expect(resultado).toBeDefined();
  });

  it('criar: ativo=true sem sessão lança AppError 403', async () => {
    const erro = await servico()
      .criar({
        nome: 'Ana Silva',
        senha: 'senha123',
        papelIds: [],
        ativo: true,
      })
      .catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(AppError);
    expect((erro as AppError).getStatus()).toBe(403);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it('criar: ativo=true sem ativar_usuario lança AppError 403', async () => {
    await expect(
      servico().criar(
        {
          nome: 'Ana Silva',
          senha: 'senha123',
          papelIds: [],
          ativo: true,
        },
        sessaoSemPermissao,
      ),
    ).rejects.toThrow('Seu perfil não pode ativar usuários');
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it('criar: ativo=true com ativar_usuario grava ativo=true', async () => {
    await servico().criar(
      {
        nome: 'Ana Silva',
        senha: 'senha123',
        papelIds: [],
        ativo: true,
      },
      sessaoComPermissao,
    );

    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ativo: true }),
      }),
    );
  });

  it('atualizar: ativar (false→true) sem permissão lança AppError 403', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 9,
      nome: 'Ana',
      ativo: false,
      enderecos: [],
    });

    await expect(
      servico().atualizar(9, { ativo: true }, sessaoSemPermissao),
    ).rejects.toThrow('Seu perfil não pode ativar usuários');
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('atualizar: ativar (false→true) com ativar_usuario grava ativo=true', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 9,
      nome: 'Ana',
      ativo: false,
      enderecos: [],
    });

    await servico().atualizar(9, { ativo: true }, sessaoComPermissao);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ativo: true }),
      }),
    );
  });

  it('atualizar: reenviar ativo=true para usuário já ativo não exige permissão', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 9,
      nome: 'Ana',
      ativo: true,
      enderecos: [],
    });

    await servico().atualizar(9, { ativo: true }, sessaoSemPermissao);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ativo: true }),
      }),
    );
  });

  it('atualizar: desativar (true→false) não exige ativar_usuario', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 9,
      nome: 'Ana',
      ativo: true,
      enderecos: [],
    });

    await servico().atualizar(9, { ativo: false }, sessaoSemPermissao);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ativo: false }),
      }),
    );
  });
});
