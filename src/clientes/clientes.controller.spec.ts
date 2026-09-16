import { Test, type TestingModule } from '@nestjs/testing';
import { ClientesController } from './clientes.controller.js';
import { ClientesService } from './clientes.service.js';

const mockService = {
  buscar: vi.fn(),
  detalhar: vi.fn(),
  criar: vi.fn(),
  atualizar: vi.fn(),
};

describe('ClientesController', () => {
  let controller: ClientesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [
        { provide: ClientesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ClientesController>(ClientesController);
    vi.clearAllMocks();
  });

  describe('buscar', () => {
    it('should return empty array when query is short', async () => {
      mockService.buscar.mockResolvedValue([]);
      const result = await controller.buscar('ab');
      expect(result).toEqual([]);
      expect(mockService.buscar).toHaveBeenCalledWith('ab');
    });

    it('should return matching clients', async () => {
      const clientes = [{ id: 1, nome: 'JOAO' }];
      mockService.buscar.mockResolvedValue(clientes);
      const result = await controller.buscar('JOAO');
      expect(result).toEqual(clientes);
    });

    it('should default to empty string when q is undefined', async () => {
      mockService.buscar.mockResolvedValue([]);
      await controller.buscar(undefined);
      expect(mockService.buscar).toHaveBeenCalledWith('');
    });
  });

  describe('detalhar', () => {
    it('should return a client by id', async () => {
      const cliente = { id: 1, nome: 'JOAO', cpfCnpj: '123' };
      mockService.detalhar.mockResolvedValue(cliente);
      const result = await controller.detalhar('1');
      expect(result).toEqual(cliente);
      expect(mockService.detalhar).toHaveBeenCalledWith(1);
    });
  });

  describe('criar', () => {
    it('should create a new client', async () => {
      const dto = { nome: 'Maria', telefone: '12345' };
      const created = { id: 1, ...dto, nome: 'MARIA' };
      mockService.criar.mockResolvedValue(created);
      const result = await controller.criar(dto);
      expect(result).toEqual(created);
      expect(mockService.criar).toHaveBeenCalledWith(dto);
    });
  });

  describe('atualizar', () => {
    it('should update a client', async () => {
      const dto = { nome: 'Maria Updated' };
      const updated = { id: 1, nome: 'MARIA UPDATED' };
      mockService.atualizar.mockResolvedValue(updated);
      const result = await controller.atualizar('1', dto);
      expect(result).toEqual(updated);
      expect(mockService.atualizar).toHaveBeenCalledWith(1, dto);
    });
  });
});
