import 'reflect-metadata';
import { Test, type TestingModule } from '@nestjs/testing';
import { PERMISSIONS_KEY } from '../auth/decorators/permissions.decorator.js';
import { OsController } from './os.controller.js';
import { OsService } from './os.service.js';

const mockService = {
  listar: vi.fn(),
  aprovar: vi.fn(),
  iniciar: vi.fn(),
  concluir: vi.fn(),
  cancelar: vi.fn(),
};

describe('OsController', () => {
  let controller: OsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OsController],
      providers: [{ provide: OsService, useValue: mockService }],
    }).compile();

    controller = module.get<OsController>(OsController);
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('delega status e q ao service', async () => {
      const resultado = [{ id: 1, codigo: 'OS-001' }];
      mockService.listar.mockResolvedValue(resultado);

      const response = await controller.listar('AGENDADO', 'OS-001');

      expect(response).toEqual(resultado);
      expect(mockService.listar).toHaveBeenCalledWith({
        status: 'AGENDADO',
        q: 'OS-001',
      });
    });
  });

  describe('aprovar', () => {
    it('delega id numérico e userId do JWT ao service', async () => {
      const resultado = { id: 5, status: 'AGENDADO' };
      mockService.aprovar.mockResolvedValue(resultado);

      const req = { user: { id: 42 } } as any;
      const response = await controller.aprovar('5', req);

      expect(response).toEqual(resultado);
      expect(mockService.aprovar).toHaveBeenCalledWith(5, 42);
    });
  });

  describe('iniciar', () => {
    it('converte o param para número', async () => {
      mockService.iniciar.mockResolvedValue({ id: 5, status: 'EM_ANDAMENTO' });

      await controller.iniciar('5');

      expect(mockService.iniciar).toHaveBeenCalledWith(5);
    });
  });

  describe('concluir', () => {
    it('converte o param para número', async () => {
      mockService.concluir.mockResolvedValue({ id: 5, status: 'CONCLUIDO' });

      await controller.concluir('5');

      expect(mockService.concluir).toHaveBeenCalledWith(5);
    });
  });

  describe('cancelar', () => {
    it('delega id e dto de cancelamento ao service', async () => {
      mockService.cancelar.mockResolvedValue({ id: 5, status: 'CANCELADO' });

      const response = await controller.cancelar('5', {
        motivo: 'Fora de escopo',
      });

      expect(response).toEqual({ id: 5, status: 'CANCELADO' });
      expect(mockService.cancelar).toHaveBeenCalledWith(5, {
        motivo: 'Fora de escopo',
      });
    });
  });

  describe('decorator @Permissions', () => {
    it('exige aprovar_os na rota aprovar', () => {
      const perms = Reflect.getMetadata(PERMISSIONS_KEY, controller.aprovar);
      expect(perms).toEqual(['aprovar_os']);
    });

    it('exige iniciar_os na rota iniciar', () => {
      const perms = Reflect.getMetadata(PERMISSIONS_KEY, controller.iniciar);
      expect(perms).toEqual(['iniciar_os']);
    });

    it('exige concluir_os na rota concluir', () => {
      const perms = Reflect.getMetadata(PERMISSIONS_KEY, controller.concluir);
      expect(perms).toEqual(['concluir_os']);
    });

    it('exige cancelar_os na rota cancelar', () => {
      const perms = Reflect.getMetadata(PERMISSIONS_KEY, controller.cancelar);
      expect(perms).toEqual(['cancelar_os']);
    });

    it('listar não exige permissão extra (apenas JWT)', () => {
      const perms = Reflect.getMetadata(PERMISSIONS_KEY, controller.listar);
      expect(perms).toBeUndefined();
    });
  });
});
