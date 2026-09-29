import { Test, type TestingModule } from '@nestjs/testing';
import { VisitasController } from './visitas.controller.js';
import { VisitasService } from './visitas.service.js';

const mockService = {
  criar: vi.fn(),
  listar: vi.fn(),
  atualizar: vi.fn(),
};

describe('VisitasController', () => {
  let controller: VisitasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitasController],
      providers: [{ provide: VisitasService, useValue: mockService }],
    }).compile();

    controller = module.get<VisitasController>(VisitasController);
    vi.clearAllMocks();
  });

  describe('POST /visitas', () => {
    it('should pass validated dto to service', async () => {
      const dto = { agendamentoId: 12, tecnicoId: 3 };
      const created = { id: 1, ...dto };
      mockService.criar.mockResolvedValue(created);
      const result = await controller.criar(dto);
      expect(result).toEqual(created);
      expect(mockService.criar).toHaveBeenCalledWith(dto);
    });

    it('should accept dto without tecnicoId', async () => {
      const dto = { agendamentoId: 12 };
      mockService.criar.mockResolvedValue({ id: 1, ...dto });
      await controller.criar(dto);
      expect(mockService.criar).toHaveBeenCalledWith(dto);
    });
  });

  describe('GET /visitas', () => {
    it('should pass numeric atendimentoId filter', async () => {
      const itens = [{ id: 1 }];
      mockService.listar.mockResolvedValue(itens);
      const result = await controller.listar('15');
      expect(result).toEqual(itens);
      expect(mockService.listar).toHaveBeenCalledWith({ atendimentoId: 15 });
    });

    it('should call listar without filter when no query', async () => {
      mockService.listar.mockResolvedValue([]);
      await controller.listar();
      expect(mockService.listar).toHaveBeenCalledWith(undefined);
    });
  });

  describe('PATCH /visitas/:id', () => {
    it('should pass Number(id) and dto to service', async () => {
      const dto = {
        status: 'REALIZADA' as const,
        resultado: 'SEM_ACAO' as const,
      };
      const updated = { id: 1, ...dto };
      mockService.atualizar.mockResolvedValue(updated);
      const result = await controller.atualizar('1', dto);
      expect(result).toEqual(updated);
      expect(mockService.atualizar).toHaveBeenCalledWith(1, dto);
    });
  });
});
