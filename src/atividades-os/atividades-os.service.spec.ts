import { NotFoundException } from '@nestjs/common';
import { AtividadesOSService } from './atividades-os.service.js';

const atividadeBase = {
  id: 'at-1',
  osId: 1,
  etapaOSId: 2,
  catalogoAtividadeId: 'cat-1',
  dataPrevisao: null,
  status: 'PENDENTE',
};

const mockPrisma = {
  atividadeOS: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  etapaOS: { findUnique: vi.fn() },
  separacao: { count: vi.fn(), create: vi.fn() },
  catalogoAtividade: { findUnique: vi.fn() },
  checklistExecucao: { create: vi.fn() },
  $transaction: vi.fn((arg: unknown) =>
    typeof arg === 'function'
      ? (arg as (tx: unknown) => unknown)(mockPrisma)
      : Promise.all(arg as Promise<unknown>[]),
  ),
};

describe('AtividadesOSService', () => {
  let service: AtividadesOSService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AtividadesOSService(mockPrisma as any);
    mockPrisma.atividadeOS.findUnique.mockResolvedValue(atividadeBase);
    mockPrisma.atividadeOS.update.mockResolvedValue(atividadeBase);
  });

  describe('planificar (SEP estável)', () => {
    function planificarComRecursos(
      recursos: Record<string, unknown>[],
      sepExistentes = 0,
    ) {
      mockPrisma.etapaOS.findUnique.mockResolvedValue({ ordem: 2 });
      mockPrisma.separacao.count.mockResolvedValue(sepExistentes);
      mockPrisma.catalogoAtividade.findUnique.mockResolvedValue({
        id: 'cat-1',
        subSteps: [{ id: 'sub-1' }],
        recursos,
      });
      mockPrisma.atividadeOS.create.mockResolvedValue(atividadeBase);
      mockPrisma.separacao.create.mockResolvedValue({ id: 1 });
      mockPrisma.checklistExecucao.create.mockResolvedValue({});

      return service.planificar({
        osId: 1,
        etapaOSId: 2,
        atividades: [{ catalogoAtividadeId: 'cat-1' }],
      });
    }

    it('gera SEP-{osId}-{etapaOrdem}-{seq} estável (SEP-1-2-1)', async () => {
      await planificarComRecursos([
        { tipo: 'MATERIAL', quantidade: 3, itemCatalogoId: 7 },
      ]);

      expect(mockPrisma.separacao.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.separacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ codigo: 'SEP-1-2-1' }),
        }),
      );
    });

    it('incrementa seq por separação criada na mesma etapa', async () => {
      await planificarComRecursos([
        { tipo: 'MATERIAL', quantidade: 3, itemCatalogoId: 7 },
        { tipo: 'EPI', quantidade: 1, itemCatalogoId: 2 },
      ]);

      const codigos = mockPrisma.separacao.create.mock.calls.map(
        (c: unknown[]) => (c[0] as { data: { codigo: string } }).data.codigo,
      );
      expect(codigos).toEqual(['SEP-1-2-1', 'SEP-1-2-2']);
    });

    it('continua a numeração a partir das separações já existentes da etapa', async () => {
      await planificarComRecursos(
        [{ tipo: 'MATERIAL', quantidade: 1, itemCatalogoId: 7 }],
        4,
      );

      expect(mockPrisma.separacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ codigo: 'SEP-1-2-5' }),
        }),
      );
    });

    it('lança 404 quando a EtapaOS não existe', async () => {
      mockPrisma.etapaOS.findUnique.mockResolvedValue(null);

      await expect(
        service.planificar({
          osId: 1,
          etapaOSId: 999,
          atividades: [{ catalogoAtividadeId: 'cat-1' }],
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.separacao.create).not.toHaveBeenCalled();
    });
  });
});
