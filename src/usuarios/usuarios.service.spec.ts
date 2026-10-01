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
