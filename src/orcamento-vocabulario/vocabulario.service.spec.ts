import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { VocabularioService } from './vocabulario.service.js';

const mockPrisma = {
  verbo: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  localObra: {
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  etapa: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  subServico: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  orcamentoAtividade: {
    count: vi.fn(),
  },
  obraAtividade: {
    count: vi.fn(),
  },
};

describe('VocabularioService', () => {
  let service: VocabularioService;

  beforeEach(() => {
    service = new VocabularioService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('criarTermo', () => {
    it('lança 409 quando o nome já existe', async () => {
      mockPrisma.verbo.findFirst.mockResolvedValue({ id: 1, nome: 'aplicar' });
      try {
        await service.criarTermo('verbos', { nome: 'aplicar' });
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
      }
    });

    it('cria quando o nome é novo', async () => {
      mockPrisma.verbo.findFirst.mockResolvedValue(null);
      mockPrisma.verbo.create.mockResolvedValue({ id: 9, nome: 'rolar' });
      const resultado = await service.criarTermo('verbos', { nome: 'rolar' });
      expect(resultado).toEqual({ id: 9, nome: 'rolar' });
      expect(mockPrisma.verbo.create).toHaveBeenCalledWith({
        data: { nome: 'rolar' },
      });
    });
  });

  describe('atualizarTermo (colateral: não confunde com o próprio registro)', () => {
    it('não lança 409 quando findFirst encontra o próprio id (collation CI)', async () => {
      const proprio = { id: 5, nome: 'Alçapão', ativo: true };
      mockPrisma.verbo.findUnique.mockResolvedValue(proprio);
      // banco real: com id.not exclui a si mesmo → null; sem filtro (bug) → proprio
      mockPrisma.verbo.findFirst.mockImplementation(async (args: any) =>
        args.where?.id?.not === 5 ? null : proprio,
      );
      mockPrisma.verbo.update.mockResolvedValue({
        ...proprio,
        nome: 'alçapão',
      });

      const resultado = await service.atualizarTermo('verbos', 5, {
        nome: 'alçapão',
      });

      expect(mockPrisma.verbo.findFirst).toHaveBeenCalledWith({
        where: { nome: 'alçapão', id: { not: 5 } },
      });
      expect(mockPrisma.verbo.update).toHaveBeenCalled();
      expect(resultado.nome).toBe('alçapão');
    });

    it('lança 409 quando existe OUTRO registro com o nome', async () => {
      const proprio = { id: 5, nome: 'sala', ativo: true };
      mockPrisma.verbo.findUnique.mockResolvedValue(proprio);
      mockPrisma.verbo.findFirst.mockResolvedValue({
        id: 9,
        nome: 'aplicar',
      });

      try {
        await service.atualizarTermo('verbos', 5, { nome: 'aplicar' });
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
      }
    });
  });

  describe('atualizarEtapa (colateral: não confunde com o próprio registro)', () => {
    it('não lança 409 quando findFirst encontra o próprio id (collation CI)', async () => {
      const proprio = { id: 2, nome: 'Preparação', ordem: 1, ativo: true };
      mockPrisma.etapa.findUnique.mockResolvedValue(proprio);
      // banco real: com id.not exclui a si mesmo → null; sem filtro (bug) → proprio
      mockPrisma.etapa.findFirst.mockImplementation(async (args: any) =>
        args.where?.id?.not === 2 ? null : proprio,
      );
      mockPrisma.etapa.update.mockResolvedValue({
        ...proprio,
        nome: 'preparação',
      });

      const resultado = await service.atualizarEtapa(2, {
        nome: 'preparação',
      });

      expect(mockPrisma.etapa.findFirst).toHaveBeenCalledWith({
        where: { nome: 'preparação', id: { not: 2 } },
      });
      expect(mockPrisma.etapa.update).toHaveBeenCalled();
      expect(resultado.nome).toBe('preparação');
    });
  });

  describe('atualizarSubServico (colateral: não confunde com o próprio registro)', () => {
    it('não lança 409 quando findFirst encontra o próprio id (collation CI)', async () => {
      const proprio = {
        id: 7,
        etapaId: 1,
        nome: 'Pintura Paredes',
        ativo: true,
      };
      mockPrisma.subServico.findUnique.mockResolvedValue(proprio);
      // banco real: com id.not exclui a si mesmo → null; sem filtro (bug) → proprio
      mockPrisma.subServico.findFirst.mockImplementation(async (args: any) =>
        args.where?.id?.not === 7 ? null : proprio,
      );
      mockPrisma.subServico.update.mockResolvedValue({
        ...proprio,
        nome: 'pintura paredes',
      });

      const resultado = await service.atualizarSubServico(7, {
        nome: 'pintura paredes',
      });

      expect(mockPrisma.subServico.findFirst).toHaveBeenCalledWith({
        where: { etapaId: 1, nome: 'pintura paredes', id: { not: 7 } },
      });
      expect(mockPrisma.subServico.update).toHaveBeenCalled();
      expect(resultado.nome).toBe('pintura paredes');
    });
  });

  describe('removerTermo', () => {
    function verboExistente(id = 5) {
      return { id, nome: 'aplicar', ativo: true };
    }

    function semReferencias() {
      mockPrisma.orcamentoAtividade.count.mockResolvedValue(0);
      mockPrisma.obraAtividade.count.mockResolvedValue(0);
    }

    beforeEach(() => {
      semReferencias();
      mockPrisma.verbo.delete.mockResolvedValue(verboExistente());
    });

    it('lança 404 quando o id não é inteiro', async () => {
      try {
        await service.removerTermo('verbos', 1.5);
        expect.fail('deveria ter lançado 404');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(404);
      }
      expect(mockPrisma.verbo.delete).not.toHaveBeenCalled();
    });

    it('lança 404 quando o termo não existe', async () => {
      mockPrisma.verbo.findUnique.mockResolvedValue(null);
      try {
        await service.removerTermo('verbos', 999);
        expect.fail('deveria ter lançado 404');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(404);
      }
      expect(mockPrisma.verbo.delete).not.toHaveBeenCalled();
    });

    it('lança 409 com contagem quando em uso em orçamentos e obras', async () => {
      mockPrisma.verbo.findUnique.mockResolvedValue(verboExistente());
      mockPrisma.orcamentoAtividade.count.mockResolvedValue(3);
      mockPrisma.obraAtividade.count.mockResolvedValue(1);

      try {
        await service.removerTermo('verbos', 5);
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toContain('3 orçamentos');
        expect((e as AppError).message).toContain('1 obra');
      }
      expect(mockPrisma.verbo.delete).not.toHaveBeenCalled();
    });

    it('lança 409 apenas de orçamentos quando obras = 0', async () => {
      mockPrisma.verbo.findUnique.mockResolvedValue(verboExistente());
      mockPrisma.orcamentoAtividade.count.mockResolvedValue(1);

      try {
        await service.removerTermo('verbos', 5);
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toContain('1 orçamento');
        expect((e as AppError).message).not.toContain('obra');
      }
      expect(mockPrisma.verbo.delete).not.toHaveBeenCalled();
    });

    it('exclui de verdade quando não há referências e usa o FK da dimensão', async () => {
      const verbo = verboExistente();
      mockPrisma.verbo.findUnique.mockResolvedValue(verbo);

      const resultado = await service.removerTermo('verbos', 5);
      expect(resultado).toEqual(verbo);
      expect(mockPrisma.orcamentoAtividade.count).toHaveBeenCalledWith({
        where: { verboId: 5 },
      });
      expect(mockPrisma.obraAtividade.count).toHaveBeenCalledWith({
        where: { verboId: 5 },
      });
      expect(mockPrisma.verbo.delete).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });

    it('usa localId como FK na dimensão locais', async () => {
      const local = { id: 7, nome: 'sala', ativo: true };
      mockPrisma.localObra.findUnique.mockResolvedValue(local);
      mockPrisma.localObra.delete.mockResolvedValue(local);

      const resultado = await service.removerTermo('locais', 7);
      expect(resultado).toEqual(local);
      expect(mockPrisma.orcamentoAtividade.count).toHaveBeenCalledWith({
        where: { localId: 7 },
      });
      expect(mockPrisma.obraAtividade.count).toHaveBeenCalledWith({
        where: { localId: 7 },
      });
      expect(mockPrisma.localObra.delete).toHaveBeenCalledWith({
        where: { id: 7 },
      });
    });

    it('mapeia P2003 do delete (corrida) para 409', async () => {
      mockPrisma.verbo.findUnique.mockResolvedValue(verboExistente());
      mockPrisma.verbo.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('FK violation', {
          code: 'P2003',
          clientVersion: 'test',
        }),
      );

      try {
        await service.removerTermo('verbos', 5);
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toContain('remova as referências');
      }
    });
  });

  describe('removerSubServico', () => {
    function subExistente(id = 1) {
      return {
        id,
        etapaId: 1,
        nome: 'aplicar tinta',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    function semReferencias() {
      mockPrisma.subServico.findUnique.mockResolvedValue(subExistente());
      mockPrisma.orcamentoAtividade.count.mockResolvedValue(0);
      mockPrisma.obraAtividade.count.mockResolvedValue(0);
    }

    beforeEach(() => {
      mockPrisma.orcamentoAtividade.count.mockResolvedValue(0);
      mockPrisma.obraAtividade.count.mockResolvedValue(0);
      mockPrisma.subServico.delete.mockResolvedValue(subExistente());
    });

    it('lança 404 quando o id não é inteiro', async () => {
      try {
        await service.removerSubServico(1.5);
        expect.fail('deveria ter lançado 404');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(404);
      }
      expect(mockPrisma.subServico.delete).not.toHaveBeenCalled();
    });

    it('lança 404 quando o sub-serviço não existe', async () => {
      mockPrisma.subServico.findUnique.mockResolvedValue(null);
      try {
        await service.removerSubServico(999);
        expect.fail('deveria ter lançado 404');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(404);
      }
      expect(mockPrisma.subServico.delete).not.toHaveBeenCalled();
    });

    it('lança 409 com contagem de orçamentos e obras quando em uso', async () => {
      mockPrisma.subServico.findUnique.mockResolvedValue(subExistente());
      mockPrisma.orcamentoAtividade.count.mockResolvedValue(3);
      mockPrisma.obraAtividade.count.mockResolvedValue(1);

      try {
        await service.removerSubServico(1);
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toContain('3 orçamentos');
        expect((e as AppError).message).toContain('1 obra');
      }
      expect(mockPrisma.subServico.delete).not.toHaveBeenCalled();
    });

    it('lança 409 apenas de orçamentos quando obras = 0', async () => {
      mockPrisma.subServico.findUnique.mockResolvedValue(subExistente());
      mockPrisma.orcamentoAtividade.count.mockResolvedValue(1);
      mockPrisma.obraAtividade.count.mockResolvedValue(0);

      try {
        await service.removerSubServico(1);
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toContain('1 orçamento');
        expect((e as AppError).message).not.toContain('obra');
      }
      expect(mockPrisma.subServico.delete).not.toHaveBeenCalled();
    });

    it('exclui de verdade quando não há referências', async () => {
      const sub = subExistente();
      mockPrisma.subServico.findUnique.mockResolvedValue(sub);
      mockPrisma.subServico.delete.mockResolvedValue(sub);

      const resultado = await service.removerSubServico(1);
      expect(resultado).toEqual(sub);
      expect(mockPrisma.subServico.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.orcamentoAtividade.count).toHaveBeenCalledWith({
        where: { subServicoId: 1 },
      });
      expect(mockPrisma.obraAtividade.count).toHaveBeenCalledWith({
        where: { subServicoId: 1 },
      });
    });

    it('mapeia P2003 do delete (corrida) para 409', async () => {
      semReferencias();
      mockPrisma.subServico.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('FK violation', {
          code: 'P2003',
          clientVersion: 'test',
        }),
      );

      try {
        await service.removerSubServico(1);
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toContain('desative-o');
      }
    });
  });
});
