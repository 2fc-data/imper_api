import { VisitasService } from './visitas.service.js';

const mockPrisma = {
  visitaTecnica: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  visitaItem: {
    create: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
  },
  agendamento: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('VisitasService', () => {
  let service: VisitasService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new VisitasService(mockPrisma as any);
  });

  describe('detalhar', () => {
    it('retorna a visita com itens e dimensões', async () => {
      mockPrisma.visitaTecnica.findUnique.mockResolvedValue({
        id: 1,
        itens: [],
      });
      const res = await service.detalhar(1);
      expect(mockPrisma.visitaTecnica.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.objectContaining({
          itens: expect.any(Object),
        }),
      });
      expect(res.id).toBe(1);
    });

    it('falha 404 se visita não existe', async () => {
      mockPrisma.visitaTecnica.findUnique.mockResolvedValue(null);
      await expect(service.detalhar(999)).rejects.toThrow(
        'Visita não encontrada',
      );
    });
  });

  describe('itens de vocabulário e medições', () => {
    it('adicionarItem: falha 404 se visita não existe', async () => {
      mockPrisma.visitaTecnica.findUnique.mockResolvedValue(null);
      await expect(
        service.adicionarItem(999, {
          etapaId: 1,
          subServicoId: 2,
          verboId: 3,
          objetoId: 4,
        }),
      ).rejects.toThrow('Visita não encontrada');
    });

    it('adicionarItem: cria item com medições e retorna detalhar', async () => {
      mockPrisma.visitaTecnica.findUnique.mockResolvedValue({
        id: 10,
        status: 'AGENDADA',
      });
      const spyDetalhar = vi
        .spyOn(service, 'detalhar')
        .mockResolvedValue({ id: 10 } as any);

      const res = await service.adicionarItem(10, {
        etapaId: 1,
        subServicoId: 2,
        verboId: 3,
        objetoId: 4,
        localId: 5,
        caracteristicaId: 6,
        unidadeId: 7,
        quantidade: 12.5,
        areaM2: 50.0,
        observacoes: 'Infiltração detectada na laje',
      });

      expect(mockPrisma.visitaItem.create).toHaveBeenCalledWith({
        data: {
          visitaId: 10,
          etapaId: 1,
          subServicoId: 2,
          verboId: 3,
          objetoId: 4,
          localId: 5,
          caracteristicaId: 6,
          unidadeId: 7,
          quantidade: 12.5,
          areaM2: 50.0,
          observacoes: 'Infiltração detectada na laje',
        },
      });
      expect(spyDetalhar).toHaveBeenCalledWith(10);
      expect(res.id).toBe(10);
    });

    it('removerItem: falha 404 se item não pertence à visita', async () => {
      mockPrisma.visitaItem.findFirst.mockResolvedValue(null);
      await expect(service.removerItem(10, 999)).rejects.toThrow(
        'Item não encontrado na visita',
      );
    });

    it('removerItem: deleta item e retorna detalhar', async () => {
      mockPrisma.visitaItem.findFirst.mockResolvedValue({ id: 77 });
      const spyDetalhar = vi
        .spyOn(service, 'detalhar')
        .mockResolvedValue({ id: 10 } as any);

      const res = await service.removerItem(10, 77);

      expect(mockPrisma.visitaItem.delete).toHaveBeenCalledWith({
        where: { id: 77 },
      });
      expect(spyDetalhar).toHaveBeenCalledWith(10);
      expect(res.id).toBe(10);
    });
  });
});
