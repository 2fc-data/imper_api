import { AppError } from '../lib/errors.js';
import { PortalService } from './portal.service.js';

const mockAtendimentos = {
  listarDoUsuario: vi.fn(),
  detalharParaUsuario: vi.fn(),
  listarLogs: vi.fn(),
};
const mockAgendamentos = {
  listarDoUsuario: vi.fn(),
};
const mockOrcamentos = {
  listarDoUsuario: vi.fn(),
  detalharParaUsuario: vi.fn(),
};
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  obra: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
};

function criarService() {
  return new PortalService(
    mockPrisma as any,
    mockAtendimentos as any,
    mockAgendamentos as any,
    mockOrcamentos as any,
  );
}

describe('PortalService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('delegação', () => {
    it('listarAtendimentos → atendimentos.listarDoUsuario(userId)', async () => {
      mockAtendimentos.listarDoUsuario.mockResolvedValue([{ id: 1 }]);
      const res = await criarService().listarAtendimentos(7);
      expect(mockAtendimentos.listarDoUsuario).toHaveBeenCalledWith(7);
      expect(res).toEqual([{ id: 1 }]);
    });

    it('listarAgendamentos → agendamentos.listarDoUsuario(userId)', async () => {
      await criarService().listarAgendamentos(7);
      expect(mockAgendamentos.listarDoUsuario).toHaveBeenCalledWith(7);
    });

    it('listarOrcamentos → orcamentos.listarDoUsuario(userId)', async () => {
      await criarService().listarOrcamentos(7);
      expect(mockOrcamentos.listarDoUsuario).toHaveBeenCalledWith(7);
    });

    it('detalharOrcamento → orcamentos.detalharParaUsuario(userId, id)', async () => {
      await criarService().detalharOrcamento(7, 10);
      expect(mockOrcamentos.detalharParaUsuario).toHaveBeenCalledWith(7, 10);
    });

    it('listarObras → prisma.obra.findMany com escopo do usuário', async () => {
      await criarService().listarObras(7);
      expect(mockPrisma.obra.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ userId: 7 }, { acessos: { some: { userId: 7, ativo: true } } }] },
        }),
      );
    });

    it('detalharObra → prisma.obra.findFirst com escopo do usuário', async () => {
      mockPrisma.obra.findFirst.mockResolvedValue({ id: 10 });
      const res = await criarService().detalharObra(7, 10);
      expect(mockPrisma.obra.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 10,
            OR: [{ userId: 7 }, { acessos: { some: { userId: 7, ativo: true } } }],
          },
        }),
      );
      expect(res).toEqual({ id: 10 });
    });

    it('detalharObra lança 404 quando obra não encontrada', async () => {
      mockPrisma.obra.findFirst.mockResolvedValue(null);
      await expect(criarService().detalharObra(7, 999)).rejects.toThrow(
        'Obra não encontrada',
      );
    });
  });

  describe('detalharAtendimento', () => {
    it('propaga 404 sem chamar listarLogs', async () => {
      mockAtendimentos.detalharParaUsuario.mockRejectedValue(
        new AppError(404, 'Atendimento não encontrado'),
      );
      await expect(criarService().detalharAtendimento(7, 999)).rejects.toThrow(
        'Atendimento não encontrado',
      );
      expect(mockAtendimentos.listarLogs).not.toHaveBeenCalled();
    });

    it('retorna { ...item, logs } quando o usuário é dono', async () => {
      mockAtendimentos.detalharParaUsuario.mockResolvedValue({ id: 10 });
      mockAtendimentos.listarLogs.mockResolvedValue([{ id: 100 }]);
      const res = await criarService().detalharAtendimento(7, 10);
      expect(mockAtendimentos.detalharParaUsuario).toHaveBeenCalledWith(7, 10);
      expect(mockAtendimentos.listarLogs).toHaveBeenCalledWith(10);
      expect(res).toEqual({ id: 10, logs: [{ id: 100 }] });
    });
  });

  describe('atualizarPerfil', () => {
    it('404 Usuário não encontrado quando findUnique retorna null', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(criarService().atualizarPerfil(7, {})).rejects.toThrow(
        'Usuário não encontrado',
      );
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('409 Nome já cadastrado por outro usuário', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 7 });
      mockPrisma.user.findFirst.mockResolvedValue({ id: 8 });
      try {
        await criarService().atualizarPerfil(7, { nome: 'Maria' });
        expect.unreachable();
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toBe(
          'Nome já cadastrado por outro usuário',
        );
      }
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { nome: 'Maria', id: { not: 7 } } }),
      );
    });

    it('409 E-mail já cadastrado por outro usuário', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 7 });
      mockPrisma.user.findFirst.mockResolvedValue({ id: 8 });
      await expect(
        criarService().atualizarPerfil(7, { email: 'maria@x.com' }),
      ).rejects.toThrow('E-mail já cadastrado por outro usuário');
    });

    it('409 Telefone já cadastrado por outro usuário', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 7 });
      mockPrisma.user.findFirst.mockResolvedValue({ id: 8 });
      await expect(
        criarService().atualizarPerfil(7, { telefone: '11999998888' }),
      ).rejects.toThrow('Telefone já cadastrado por outro usuário');
    });

    it('409 CPF/CNPJ já cadastrado (dup de outro usuário)', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 7 }) // lookup do usuário
        .mockResolvedValueOnce({ id: 8 }); // dup de outro usuário
      await expect(
        criarService().atualizarPerfil(7, { cpfCnpj: '52998224725' }),
      ).rejects.toThrow('CPF/CNPJ já cadastrado');
    });

    it('dup com id === userId não lança (mesmo valor de si mesmo)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 7 });
      mockPrisma.user.findFirst.mockResolvedValue({ id: 7 });
      mockPrisma.user.update.mockResolvedValue({ id: 7 });
      await criarService().atualizarPerfil(7, { nome: 'Mesmo Nome' });
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it("email: '' → update com email null; email ausente → não entra em dados", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 7 });
      mockPrisma.user.update.mockResolvedValue({ id: 7 });
      await criarService().atualizarPerfil(7, { email: '' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { email: null } }),
      );

      mockPrisma.user.update.mockClear();
      await criarService().atualizarPerfil(7, { nome: 'Sem Email' });
      const dados = mockPrisma.user.update.mock.calls[0][0].data;
      expect(dados).not.toHaveProperty('email');
      expect(dados).toEqual({ nome: 'Sem Email' });
    });

    it("cpfCnpj: undefined não altera; '' → null; formatado → só dígitos", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 7 });
      mockPrisma.user.update.mockResolvedValue({ id: 7 });

      await criarService().atualizarPerfil(7, {});
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: {} }),
      );

      await criarService().atualizarPerfil(7, { cpfCnpj: '' });
      expect(mockPrisma.user.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { cpfCnpj: null } }),
      );

      mockPrisma.user.findFirst.mockResolvedValue(null);
      await criarService().atualizarPerfil(7, {
        cpfCnpj: '529.982.247-25',
      });
      expect(mockPrisma.user.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { cpfCnpj: '52998224725' } }),
      );
    });

    it("telefone '' → null e telefone preenchido grava só dígitos", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 7 });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({ id: 7 });

      await criarService().atualizarPerfil(7, { telefone: '' });
      expect(mockPrisma.user.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { telefone: null } }),
      );

      await criarService().atualizarPerfil(7, {
        telefone: '(11) 99999-8888',
      });
      expect(mockPrisma.user.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { telefone: '11999998888' } }),
      );
    });

    it('retorna update com select exato { id, nome, email, telefone, cpfCnpj }', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 7 });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({ id: 7 });
      await criarService().atualizarPerfil(7, { nome: 'Ana' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 7 },
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            cpfCnpj: true,
          },
        }),
      );
    });
  });
});
