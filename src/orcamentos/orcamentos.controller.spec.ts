import 'reflect-metadata';
import { Test, type TestingModule } from '@nestjs/testing';
import { PERMISSIONS_KEY } from '../auth/decorators/permissions.decorator.js';
import { OrcamentosController } from './orcamentos.controller.js';
import { OrcamentosService } from './orcamentos.service.js';

const mockService = {
  listar: vi.fn(),
  detalhar: vi.fn(),
  criar: vi.fn(),
  atualizar: vi.fn(),
  remover: vi.fn(),
  enviar: vi.fn(),
  aprovar: vi.fn(),
  recusar: vi.fn(),
};

describe('OrcamentosController', () => {
  let controller: OrcamentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrcamentosController],
      providers: [{ provide: OrcamentosService, useValue: mockService }],
    }).compile();

    controller = module.get<OrcamentosController>(OrcamentosController);
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('repassa status, q e atendimentoId numérico ao service', async () => {
      mockService.listar.mockResolvedValue([]);

      await controller.listar('RASCUNHO', 'caio', '2');

      expect(mockService.listar).toHaveBeenCalledWith({
        status: 'RASCUNHO',
        q: 'caio',
        atendimentoId: 2,
      });
    });

    it('descarta atendimentoId inválido (não numérico ou <= 0)', async () => {
      mockService.listar.mockResolvedValue([]);

      await controller.listar(undefined, undefined, 'abc');
      await controller.listar(undefined, undefined, '-5');
      await controller.listar(undefined, undefined, undefined);

      expect(mockService.listar).toHaveBeenCalledTimes(3);
      for (const call of mockService.listar.mock.calls) {
        expect(call[0].atendimentoId).toBeUndefined();
      }
    });
  });

  describe('recusar', () => {
    it('delega id numérico e motivo ao service', async () => {
      const resultado = { id: 5, status: 'RECUSADO' };
      mockService.recusar.mockResolvedValue(resultado);

      const response = await controller.recusar('5', {
        motivo: 'Fora de escopo',
      });

      expect(response).toEqual(resultado);
      expect(mockService.recusar).toHaveBeenCalledWith(5, 'Fora de escopo');
    });
  });

  describe('aprovar', () => {
    it('delega id numérico e userId ao service', async () => {
      const resultado = { id: 5, status: 'APROVADO' };
      mockService.aprovar.mockResolvedValue(resultado);

      const req = { user: { id: 99 } } as any;
      const response = await controller.aprovar('5', req);

      expect(response).toEqual(resultado);
      expect(mockService.aprovar).toHaveBeenCalledWith(5, 99);
    });
  });

  describe('decorator @Permissions', () => {
    it('exige aprovar_os na rota aprovar', () => {
      const perms = Reflect.getMetadata(PERMISSIONS_KEY, controller.aprovar);
      expect(perms).toEqual(['aprovar_os']);
    });

    it('exige aprovar_os na rota recusar', () => {
      const perms = Reflect.getMetadata(PERMISSIONS_KEY, controller.recusar);
      expect(perms).toEqual(['aprovar_os']);
    });

    it('enviar não exige permissão extra (apenas JWT)', () => {
      const perms = Reflect.getMetadata(PERMISSIONS_KEY, controller.enviar);
      expect(perms).toBeUndefined();
    });
  });
});
