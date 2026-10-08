import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import type { CriarServicoDto } from './dto/servicos-admin.dto.js';
import { ServicosAdminService } from './servicos-admin.service.js';

const mockPrisma = {
  servicoMarketing: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

const dtoValido: CriarServicoDto = {
  titulo: 'Impermeabilização',
  descricao: 'Aplicação de manta asfáltica',
  icone: 'M12 2',
};

describe('ServicosAdminService', () => {
  let service: ServicosAdminService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ServicosAdminService(mockPrisma as any);
  });

  describe('listar', () => {
    it('retorna todos os serviços sem filtro q', async () => {
      mockPrisma.servicoMarketing.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.listar();

      expect(result).toEqual([{ id: 1 }]);
      expect(mockPrisma.servicoMarketing.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
      });
    });

    it('filtra por título/descrição quando informa q', async () => {
      mockPrisma.servicoMarketing.findMany.mockResolvedValue([]);

      await service.listar({ q: 'manta' });

      expect(mockPrisma.servicoMarketing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { titulo: { contains: 'manta' } },
              { descricao: { contains: 'manta' } },
            ],
          },
        }),
      );
    });
  });

  describe('criar', () => {
    it('cria serviço com ordem sequencial', async () => {
      mockPrisma.servicoMarketing.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ordem: 3 });
      mockPrisma.servicoMarketing.create.mockResolvedValue({
        id: 10,
        ...dtoValido,
      });

      const result = await service.criar(dtoValido);

      expect(result.id).toBe(10);
      expect(mockPrisma.servicoMarketing.create).toHaveBeenCalledWith({
        data: { ...dtoValido, ativo: true, ordem: 4 },
      });
    });

    it('usa ordem 1 quando não há serviços', async () => {
      mockPrisma.servicoMarketing.findFirst.mockResolvedValue(null);
      mockPrisma.servicoMarketing.create.mockResolvedValue({ id: 1 });

      await service.criar(dtoValido);

      expect(mockPrisma.servicoMarketing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ordem: 1 }),
        }),
      );
    });

    it('lança 409 quando o título já existe', async () => {
      mockPrisma.servicoMarketing.findFirst
        .mockResolvedValueOnce({ id: 99 })
        .mockResolvedValueOnce({ ordem: 1 });

      try {
        await service.criar(dtoValido);
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toBe(
          'Já existe serviço com esse título',
        );
      }
      expect(mockPrisma.servicoMarketing.create).not.toHaveBeenCalled();
    });
  });

  describe('atualizar', () => {
    it('lança 404 quando o serviço não existe', async () => {
      mockPrisma.servicoMarketing.findUnique.mockResolvedValue(null);

      await expect(service.atualizar(999, { titulo: 'Novo' })).rejects.toThrow(
        'Serviço não encontrado',
      );
      expect(mockPrisma.servicoMarketing.update).not.toHaveBeenCalled();
    });

    it('lança 409 quando o novo título pertence a outro serviço', async () => {
      mockPrisma.servicoMarketing.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.servicoMarketing.findFirst.mockResolvedValue({ id: 2 });

      try {
        await service.atualizar(1, { titulo: 'Repetido' });
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(409);
      }
      expect(mockPrisma.servicoMarketing.update).not.toHaveBeenCalled();
    });

    it('atualiza mantendo o próprio título sem erro de duplicidade', async () => {
      mockPrisma.servicoMarketing.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.servicoMarketing.findFirst.mockResolvedValue(null);
      mockPrisma.servicoMarketing.update.mockResolvedValue({ id: 1 });

      const result = await service.atualizar(1, { titulo: 'Mesmo título' });

      expect(result).toEqual({ id: 1 });
      expect(mockPrisma.servicoMarketing.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { titulo: 'Mesmo título', NOT: { id: 1 } },
        }),
      );
    });
  });

  describe('excluir', () => {
    it('remove o serviço e retorna ok', async () => {
      mockPrisma.servicoMarketing.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.servicoMarketing.delete.mockResolvedValue({ id: 1 });

      const result = await service.excluir(1);

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.servicoMarketing.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('lança 404 quando o serviço não existe', async () => {
      mockPrisma.servicoMarketing.findUnique.mockResolvedValue(null);

      await expect(service.excluir(999)).rejects.toThrow(
        'Serviço não encontrado',
      );
      expect(mockPrisma.servicoMarketing.delete).not.toHaveBeenCalled();
    });

    it('lança 409 quando o serviço está vinculado a orçamentos', async () => {
      mockPrisma.servicoMarketing.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.servicoMarketing.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Foreign key', {
          code: 'P2003',
          clientVersion: 'test',
          meta: { constraint: 'orcamentos_servicoMarketingId_fkey' },
        }),
      );

      try {
        await service.excluir(1);
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toBe(
          'Serviço vinculado a orçamentos — desative-o em vez de excluir',
        );
      }
    });
  });
});
