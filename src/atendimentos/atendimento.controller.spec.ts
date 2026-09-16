import { Test, type TestingModule } from '@nestjs/testing';
import { AtendimentoController } from './atendimento.controller.js';
import { AtendimentoService } from './atendimento.service.js';

const mockService = {
  listar: vi.fn(),
  detalhar: vi.fn(),
  criar: vi.fn(),
  atualizarStatus: vi.fn(),
};

describe('AtendimentoController', () => {
  let controller: AtendimentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtendimentoController],
      providers: [
        { provide: AtendimentoService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<AtendimentoController>(AtendimentoController);
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('should return paginated atendimentos', async () => {
      const result = { itens: [{ id: 1 }], count: 1 };
      mockService.listar.mockResolvedValue(result);
      const response = await controller.listar();
      expect(response).toEqual(result);
      expect(mockService.listar).toHaveBeenCalledWith({
        q: undefined, status: undefined,
        criadoDe: undefined, criadoAte: undefined,
        atualizadoDe: undefined, atualizadoAte: undefined,
      });
    });

    it('should pass filters to service', async () => {
      mockService.listar.mockResolvedValue({ itens: [], count: 0 });
      await controller.listar('teste', 'NOVO', '2026-01-01', '2026-12-31', undefined, undefined);
      expect(mockService.listar).toHaveBeenCalledWith({
        q: 'teste',
        status: 'NOVO',
        criadoDe: '2026-01-01',
        criadoAte: '2026-12-31',
        atualizadoDe: undefined,
        atualizadoAte: undefined,
      });
    });
  });

  describe('detalhar', () => {
    it('should return atendimento by id', async () => {
      const item = { id: 1, canal: 'LOJA', motivo: 'Consulta' };
      mockService.detalhar.mockResolvedValue(item);
      const result = await controller.detalhar('1');
      expect(result).toEqual(item);
      expect(mockService.detalhar).toHaveBeenCalledWith(1);
    });
  });

  describe('criar', () => {
    it('should create a new atendimento', async () => {
      const dto = { canal: 'LOJA' as const, motivo: 'Duvida' };
      const created = { id: 1, ...dto, status: 'NOVO' };
      mockService.criar.mockResolvedValue(created);
      const result = await controller.criar(dto);
      expect(result).toEqual(created);
      expect(mockService.criar).toHaveBeenCalledWith(dto);
    });
  });

  describe('atualizarStatus', () => {
    it('should update status of an atendimento', async () => {
      mockService.atualizarStatus.mockResolvedValue({ id: 1, status: 'EM_ANDAMENTO' });
      const result = await controller.atualizarStatus('1', 'EM_ANDAMENTO');
      expect(result).toEqual({ id: 1, status: 'EM_ANDAMENTO' });
      expect(mockService.atualizarStatus).toHaveBeenCalledWith(1, 'EM_ANDAMENTO');
    });
  });
});
