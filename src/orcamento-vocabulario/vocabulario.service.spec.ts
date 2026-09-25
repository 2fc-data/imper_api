import { AppError } from '../lib/errors.js';
import { VocabularioService } from './vocabulario.service.js';

const mockPrisma = {
  subServico: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  subServicoAtividade: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
  },
  etapa: { findUnique: vi.fn() },
  verbo: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

function combo(id: number, overrides: Record<string, unknown> = {}) {
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
    mockPrisma.$transaction.mockImplementation(async (fn: any) =>
      fn(mockPrisma),
    );
  });

  describe('cascata (faceted)', () => {
    const linhas = [
      combo(1, {
        verboId: 1,
        objetoId: 10,
        localId: null,
        verbo: { id: 1, nome: 'aplicar' },
        objeto: { id: 10, nome: 'tinta acrílica' },
        local: null,
        caracteristica: { id: 100, nome: 'branca' },
      }),
      combo(2, {
        verboId: 1,
        objetoId: 11,
        localId: 20,
        verbo: { id: 1, nome: 'aplicar' },
        objeto: { id: 11, nome: 'massa corrida' },
        local: { id: 20, nome: 'sala' },
        caracteristica: null,
      }),
      combo(3, {
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

  describe('criarLote (dedup)', () => {
    it('combos idênticos no mesmo lote (localId null) → criados 1, ignorados 1', async () => {
      mockPrisma.subServico.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.subServicoAtividade.findMany.mockResolvedValue([]);
      const resultado = await service.criarLote(1, [
        { verboId: 1, objetoId: 10 },
        { verboId: 1, objetoId: 10, localId: null },
      ]);
      expect(resultado).toEqual({ criados: 1, ignorados: 1 });
      expect(mockPrisma.subServicoAtividade.createMany).toHaveBeenCalledTimes(
        1,
      );
    });

    it('ignora combos já existentes (comparação com NULL explícito)', async () => {
      mockPrisma.subServico.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.subServicoAtividade.findMany.mockResolvedValue([
        { verboId: 1, objetoId: 10, localId: null, caracteristicaId: null },
      ]);
      const resultado = await service.criarLote(1, [
        { verboId: 1, objetoId: 10, localId: null },
        { verboId: 1, objetoId: 11, localId: 5 },
      ]);
      expect(resultado).toEqual({ criados: 1, ignorados: 1 });
      expect(mockPrisma.subServicoAtividade.createMany).toHaveBeenCalledWith({
        data: [
          {
            subServicoId: 1,
            verboId: 1,
            objetoId: 11,
            localId: 5,
            caracteristicaId: null,
          },
        ],
      });
    });

    it('lança 404 quando o sub-serviço não existe', async () => {
      mockPrisma.subServico.findUnique.mockResolvedValue(null);
      await expect(
        service.criarLote(999, [{ verboId: 1, objetoId: 10 }]),
      ).rejects.toThrow(AppError);
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
});
