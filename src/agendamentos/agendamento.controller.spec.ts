import { Test, type TestingModule } from '@nestjs/testing';
import { AgendamentoController } from './agendamento.controller.js';
import { AgendamentoService } from './agendamento.service.js';
import { RotaAgendamentoService } from './rota-agendamento.service.js';

const mockService = {
  listar: vi.fn(),
  detalhar: vi.fn(),
  criar: vi.fn(),
  atualizar: vi.fn(),
  atualizarStatus: vi.fn(),
  remover: vi.fn(),
};

const mockRotaService = {
  calcularRota: vi.fn(),
};

describe('AgendamentoController', () => {
  let controller: AgendamentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgendamentoController],
      providers: [
        { provide: AgendamentoService, useValue: mockService },
        { provide: RotaAgendamentoService, useValue: mockRotaService },
      ],
    }).compile();

    controller = module.get<AgendamentoController>(AgendamentoController);
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('should return list of agendamentos', async () => {
      const result = [{ id: 1, userId: 10, status: 'PENDENTE' }];
      mockService.listar.mockResolvedValue(result);
      const response = await controller.listar();
      expect(response).toEqual(result);
      expect(mockService.listar).toHaveBeenCalledWith({
        status: undefined,
        tipo: undefined,
        userId: undefined,
        dataDe: undefined,
        dataAte: undefined,
      });
    });

    it('should pass parameters to service', async () => {
      mockService.listar.mockResolvedValue([]);
      await controller.listar(
        'PENDENTE',
        'VISITA',
        '10',
        '2026-09-01',
        '2026-09-30',
      );
      expect(mockService.listar).toHaveBeenCalledWith({
        status: 'PENDENTE',
        tipo: 'VISITA',
        userId: 10,
        dataDe: '2026-09-01',
        dataAte: '2026-09-30',
      });
    });
  });

  describe('detalhar', () => {
    it('should return agendamento by id', async () => {
      const item = { id: 1, userId: 10 };
      mockService.detalhar.mockResolvedValue(item);
      const result = await controller.detalhar('1');
      expect(result).toEqual(item);
      expect(mockService.detalhar).toHaveBeenCalledWith(1);
    });
  });

  describe('rota', () => {
    it('should return rota result', async () => {
      const rota = {
        disponivel: true,
        distanciaM: 1234.5,
        duracaoSeg: 300.2,
        fonte: 'cep',
        aviso: null,
      };
      mockRotaService.calcularRota.mockResolvedValue(rota);
      const result = await controller.rota('1');
      expect(result).toEqual(rota);
      expect(mockRotaService.calcularRota).toHaveBeenCalledWith(1);
    });

    it('should return indisponivel when service fails softly', async () => {
      const rota = {
        disponivel: false,
        distanciaM: null,
        duracaoSeg: null,
        fonte: 'indisponivel',
        aviso: 'Endereço sem CEP ou cidade',
      };
      mockRotaService.calcularRota.mockResolvedValue(rota);
      const result = await controller.rota('2');
      expect(result).toEqual(rota);
    });
  });

  describe('criar', () => {
    it('should create agendamento', async () => {
      const dto = { userId: 10, dataPrevista: '2026-10-01T10:00:00Z' };
      const created = { id: 1, ...dto, status: 'PENDENTE' };
      mockService.criar.mockResolvedValue(created);
      const req = { user: { id: 5 } } as any;
      const result = await controller.criar(dto, req);
      expect(result).toEqual(created);
      expect(mockService.criar).toHaveBeenCalledWith(dto, 5);
    });
  });

  describe('atualizar', () => {
    it('should update agendamento', async () => {
      const dto = { observacoes: 'Alterado' };
      const updated = { id: 1, userId: 10, observacoes: 'Alterado' };
      mockService.atualizar.mockResolvedValue(updated);
      const result = await controller.atualizar('1', dto);
      expect(result).toEqual(updated);
      expect(mockService.atualizar).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('atualizarStatus', () => {
    it('should update status', async () => {
      const updated = { id: 1, status: 'REALIZADO' };
      mockService.atualizarStatus.mockResolvedValue(updated);
      const result = await controller.atualizarStatus('1', {
        status: 'REALIZADO',
        dataRealizada: '2026-09-18T15:00:00Z',
      });
      expect(result).toEqual(updated);
      expect(mockService.atualizarStatus).toHaveBeenCalledWith(
        1,
        'REALIZADO',
        '2026-09-18T15:00:00Z',
      );
    });
  });

  describe('remover', () => {
    it('should remove agendamento', async () => {
      mockService.remover.mockResolvedValue(undefined);
      await controller.remover('1');
      expect(mockService.remover).toHaveBeenCalledWith(1);
    });
  });
});
