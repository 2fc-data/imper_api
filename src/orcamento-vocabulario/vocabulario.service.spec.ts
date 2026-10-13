import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { VocabularioService } from './vocabulario.service.js';

const mockPrisma = {
  subServicoAtividade: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
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

function linhaCascata(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    subServicoId: 1,
    verboId: 1,
    objetoId: 10,
    localId: null,
    caracteristicaId: null,
    ativo: true,
    ...overrides,
  };
}

describe('VocabularioService', () => {
  let service: VocabularioService;

  beforeEach(() => {
    service = new VocabularioService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('cascata (faceted)', () => {
    const linhas = [
      linhaCascata(1, {
        verboId: 1,
        objetoId: 10,
        localId: null,
        verbo: { id: 1, nome: 'aplicar' },
        objeto: { id: 10, nome: 'tinta acrílica' },
        local: null,
        caracteristica: { id: 100, nome: 'branca' },
      }),
      linhaCascata(2, {
        verboId: 1,
        objetoId: 11,
        localId: 20,
        verbo: { id: 1, nome: 'aplicar' },
        objeto: { id: 11, nome: 'massa corrida' },
        local: { id: 20, nome: 'sala' },
        caracteristica: null,
      }),
      linhaCascata(3, {
        verboId: 2,
        objetoId: 12,
        localId: null,
        verbo: { id: 2, nome: 'lixar' },
        objeto: { id: 12, nome: 'parede' },
        local: null,
        caracteristica: null,
      }),
    ];

    beforeEach(() => {
      mockPrisma.subServicoAtividade.findMany.mockResolvedValue(linhas);
    });

    it('sem filtros lista todas as opções de cada dimensão', async () => {
      const resultado = await service.cascata(1, {});
      expect(resultado.verbo.map((v: any) => v?.id)).toEqual([1, 2]);
      expect(resultado.objeto.map((o: any) => o?.id)).toEqual([10, 11, 12]);
      expect(resultado.caracteristica.map((c: any) => c?.id ?? null)).toEqual([
        100,
        null,
      ]);
    });

    it('filtra opções de objeto pelo verbo selecionado', async () => {
      const resultado = await service.cascata(1, { verboId: 1 });
      expect(resultado.objeto.map((o: any) => o?.id)).toEqual([10, 11]);
      // opções do próprio verbo não se restringem pelo filtro do verbo
      expect(resultado.verbo.map((v: any) => v?.id)).toEqual([1, 2]);
    });

    it('preserva entrada null em local (sem local definido)', async () => {
      const resultado = await service.cascata(1, { verboId: 1 });
      expect(resultado.local).toContain(null);
      expect(resultado.local.map((l: any) => l?.id)).toContain(20);
    });

    it('combina filtros (verbo + local) sobre objeto', async () => {
      const resultado = await service.cascata(1, {
        verboId: 1,
        localId: 20,
      });
      expect(resultado.objeto.map((o: any) => o?.id)).toEqual([11]);
    });

    it('filtra apenas linhas ativas', async () => {
      await service.cascata(1, {});
      expect(mockPrisma.subServicoAtividade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { subServicoId: 1, ativo: true },
        }),
      );
    });
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
      mockPrisma.subServicoAtividade.count.mockResolvedValue(0);
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

    it('lança 409 com contagem quando em uso em combos, orçamentos e obras', async () => {
      mockPrisma.verbo.findUnique.mockResolvedValue(verboExistente());
      mockPrisma.subServicoAtividade.count.mockResolvedValue(2);
      mockPrisma.orcamentoAtividade.count.mockResolvedValue(3);
      mockPrisma.obraAtividade.count.mockResolvedValue(1);

      try {
        await service.removerTermo('verbos', 5);
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toContain('2 combos de sub-serviço');
        expect((e as AppError).message).toContain('3 orçamentos');
        expect((e as AppError).message).toContain('1 obra');
      }
      expect(mockPrisma.verbo.delete).not.toHaveBeenCalled();
    });

    it('lança 409 apenas de combos quando orçamentos e obras = 0', async () => {
      mockPrisma.verbo.findUnique.mockResolvedValue(verboExistente());
      mockPrisma.subServicoAtividade.count.mockResolvedValue(1);

      try {
        await service.removerTermo('verbos', 5);
        expect.fail('deveria ter lançado 409');
      } catch (e) {
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toContain('1 combo de sub-serviço');
        expect((e as AppError).message).not.toContain('orçamento');
        expect((e as AppError).message).not.toContain('obra');
      }
      expect(mockPrisma.verbo.delete).not.toHaveBeenCalled();
    });

    it('exclui de verdade quando não há referências e usa o FK da dimensão', async () => {
      const verbo = verboExistente();
      mockPrisma.verbo.findUnique.mockResolvedValue(verbo);

      const resultado = await service.removerTermo('verbos', 5);
      expect(resultado).toEqual(verbo);
      expect(mockPrisma.subServicoAtividade.count).toHaveBeenCalledWith({
        where: { verboId: 5, ativo: true },
      });
      expect(mockPrisma.subServicoAtividade.deleteMany).toHaveBeenCalledWith({
        where: { verboId: 5, ativo: false },
      });
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

    it('purga combos inativos e exclui quando só há resíduo de soft-delete', async () => {
      const verbo = verboExistente();
      mockPrisma.verbo.findUnique.mockResolvedValue(verbo);
      // count só conta ativo:true → 0; deleteMany remove os resíduos inativos
      mockPrisma.subServicoAtividade.count.mockResolvedValue(0);
      mockPrisma.subServicoAtividade.deleteMany.mockResolvedValue({ count: 4 });

      const resultado = await service.removerTermo('verbos', 5);
      expect(resultado).toEqual(verbo);
      expect(mockPrisma.subServicoAtividade.deleteMany).toHaveBeenCalledWith({
        where: { verboId: 5, ativo: false },
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
      expect(mockPrisma.subServicoAtividade.count).toHaveBeenCalledWith({
        where: { localId: 7, ativo: true },
      });
      expect(mockPrisma.subServicoAtividade.deleteMany).toHaveBeenCalledWith({
        where: { localId: 7, ativo: false },
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

  describe('combos (sub-serviço × verbo/objeto/local/característica)', () => {
    const dto = {
      subServicoId: 1,
      verboId: 2,
      objetoId: 30,
      localId: null,
      caracteristicaId: null,
    };

    function comboCriado(id = 500) {
      return {
        id,
        ...dto,
        ativo: true,
        verbo: { id: 2, nome: 'verificar' },
        objeto: { id: 30, nome: 'drenagem' },
        local: null,
        caracteristica: null,
      };
    }

    describe('listarCombos', () => {
      it('lista combos do sub-serviço com termos incluídos', async () => {
        const linhas = [comboCriado()];
        mockPrisma.subServicoAtividade.findMany.mockResolvedValue(linhas);

        const resultado = await service.listarCombos(1);
        expect(resultado).toEqual(linhas);
        expect(mockPrisma.subServicoAtividade.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { subServicoId: 1 },
          }),
        );
      });
    });

    describe('criarCombo', () => {
      it('lança 404 quando o sub-serviço não existe', async () => {
        mockPrisma.subServico.findUnique.mockResolvedValue(null);
        try {
          await service.criarCombo(dto);
          expect.fail('deveria ter lançado 404');
        } catch (e) {
          expect((e as AppError).getStatus()).toBe(404);
        }
        expect(mockPrisma.subServicoAtividade.create).not.toHaveBeenCalled();
      });

      it('lança 409 quando o combo já existe (mesmo com nulls)', async () => {
        mockPrisma.subServico.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.subServicoAtividade.findFirst.mockResolvedValue(
          comboCriado(),
        );
        try {
          await service.criarCombo(dto);
          expect.fail('deveria ter lançado 409');
        } catch (e) {
          expect((e as AppError).getStatus()).toBe(409);
        }
        expect(mockPrisma.subServicoAtividade.findFirst).toHaveBeenCalledWith({
          where: {
            subServicoId: 1,
            verboId: 2,
            objetoId: 30,
          },
        });
        expect(mockPrisma.subServicoAtividade.create).not.toHaveBeenCalled();
      });

      it('cria combo com include de termos', async () => {
        mockPrisma.subServico.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.subServicoAtividade.findFirst.mockResolvedValue(null);
        mockPrisma.subServicoAtividade.create.mockResolvedValue(comboCriado());

        const resultado = await service.criarCombo(dto);
        expect(resultado).toEqual(comboCriado());
        expect(mockPrisma.subServicoAtividade.create).toHaveBeenCalledWith({
          data: {
            subServicoId: 1,
            verboId: 2,
            objetoId: 30,
            localId: null,
            caracteristicaId: null,
          },
          include: expect.objectContaining({
            verbo: { select: { id: true, nome: true } },
          }),
        });
      });

      it('mapeia P2003 (termo inexistente) para 404', async () => {
        mockPrisma.subServico.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.subServicoAtividade.findFirst.mockResolvedValue(null);
        mockPrisma.subServicoAtividade.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('FK violation', {
            code: 'P2003',
            clientVersion: 'test',
          }),
        );
        try {
          await service.criarCombo(dto);
          expect.fail('deveria ter lançado 404');
        } catch (e) {
          expect((e as AppError).getStatus()).toBe(404);
        }
      });

      it('mapeia P2002 (corrida no unique) para 409', async () => {
        mockPrisma.subServico.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.subServicoAtividade.findFirst.mockResolvedValue(null);
        mockPrisma.subServicoAtividade.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique constraint', {
            code: 'P2002',
            clientVersion: 'test',
          }),
        );
        try {
          await service.criarCombo(dto);
          expect.fail('deveria ter lançado 409');
        } catch (e) {
          expect((e as AppError).getStatus()).toBe(409);
        }
      });
    });

    describe('removerCombo', () => {
      it('lança 404 quando o id não é inteiro', async () => {
        try {
          await service.removerCombo(1.5);
          expect.fail('deveria ter lançado 404');
        } catch (e) {
          expect((e as AppError).getStatus()).toBe(404);
        }
        expect(mockPrisma.subServicoAtividade.delete).not.toHaveBeenCalled();
      });

      it('lança 404 quando o combo não existe', async () => {
        mockPrisma.subServicoAtividade.findUnique.mockResolvedValue(null);
        try {
          await service.removerCombo(999);
          expect.fail('deveria ter lançado 404');
        } catch (e) {
          expect((e as AppError).getStatus()).toBe(404);
        }
        expect(mockPrisma.subServicoAtividade.delete).not.toHaveBeenCalled();
      });

      it('exclui o combo (hard delete) quando existe', async () => {
        const combo = comboCriado();
        mockPrisma.subServicoAtividade.findUnique.mockResolvedValue(combo);
        mockPrisma.subServicoAtividade.delete.mockResolvedValue(combo);

        const resultado = await service.removerCombo(500);
        expect(resultado).toEqual(combo);
        expect(mockPrisma.subServicoAtividade.delete).toHaveBeenCalledWith({
          where: { id: 500 },
          include: expect.objectContaining({
            verbo: { select: { id: true, nome: true } },
          }),
        });
      });
    });
  });
});
