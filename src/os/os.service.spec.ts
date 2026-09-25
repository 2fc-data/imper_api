import { StatusOS } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { type CancelarOsDto, cancelarOsSchema } from './dto/os.dto.js';
import { OsService } from './os.service.js';

const osBase = {
  id: 1,
  codigo: 'OS-001',
  orcamentoId: 10,
  userId: 7,
  atendimentoId: 5,
  urgencia: 'NORMAL' as const,
  status: StatusOS.AGENDADO,
  valorTotal: '1500.00',
  dataInicioPrevista: null,
  tecnicoResponsavelId: null,
  createdAt: new Date('2026-01-01T10:00:00Z'),
  updatedAt: new Date('2026-01-01T10:00:00Z'),
  user: { id: 7, nome: 'Cliente Teste' },
  atendimento: { id: 5 },
  tecnicoResponsavel: null,
  endereco: {
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: 'Ap 1',
    bairro: 'Centro',
  },
  _count: { etapas: 2, compras: 1 },
};

const mockPrisma = {
  ordemServico: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('OsService', () => {
  let service: OsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OsService(mockPrisma as any);
    mockPrisma.ordemServico.findUnique.mockResolvedValue(osBase);
    mockPrisma.ordemServico.update.mockResolvedValue(osBase);
  });

  describe('listar', () => {
    it('filtra por status e q e retorna endereco formatado como string', async () => {
      mockPrisma.ordemServico.findMany.mockResolvedValue([osBase]);

      const resultado = await service.listar({
        status: 'AGENDADO',
        q: 'OS-001',
      });

      expect(mockPrisma.ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: StatusOS.AGENDADO,
            OR: [
              { codigo: { contains: 'OS-001' } },
              { user: { nome: { contains: 'OS-001' } } },
              { tecnicoResponsavel: { nome: { contains: 'OS-001' } } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(resultado).toHaveLength(1);
      expect(resultado[0].endereco).toBe('Rua das Flores, 123, Ap 1 - Centro');
      expect(resultado[0].codigo).toBe('OS-001');
      expect(resultado[0]._count).toEqual({ etapas: 2, compras: 1 });
    });

    it('retorna endereco null quando a OS não tem endereco', async () => {
      mockPrisma.ordemServico.findMany.mockResolvedValue([
        { ...osBase, endereco: null },
      ]);

      const resultado = await service.listar();

      expect(resultado[0].endereco).toBeNull();
      expect(mockPrisma.ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('aprovar', () => {
    it('transiciona AGUARDANDO_APROVACAO → AGENDADO gravando aprovador', async () => {
      mockPrisma.ordemServico.findUnique
        .mockResolvedValueOnce({
          ...osBase,
          status: StatusOS.AGUARDANDO_APROVACAO,
        })
        .mockResolvedValueOnce({ ...osBase, status: StatusOS.AGENDADO });

      const resultado = await service.aprovar(1, 99);

      expect(mockPrisma.ordemServico.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            status: StatusOS.AGENDADO,
            aprovadoPorId: 99,
            aprovadoEm: expect.any(Date),
          }),
        }),
      );
      expect(resultado.status).toBe(StatusOS.AGENDADO);
    });

    it('lança 404 quando a OS não existe', async () => {
      mockPrisma.ordemServico.findUnique.mockResolvedValue(null);

      await expect(service.aprovar(999, 99)).rejects.toThrow(AppError);
      await expect(service.aprovar(999, 99)).rejects.toMatchObject({
        status: 404,
        message: 'Ordem de serviço não encontrada',
      });
      expect(mockPrisma.ordemServico.update).not.toHaveBeenCalled();
    });

    it('lança 409 quando o status atual não é AGUARDANDO_APROVACAO', async () => {
      mockPrisma.ordemServico.findUnique.mockResolvedValue({
        ...osBase,
        status: StatusOS.CONCLUIDO,
      });

      await expect(service.aprovar(1, 99)).rejects.toMatchObject({
        status: 409,
        message: `Transição inválida: ${StatusOS.CONCLUIDO} → ${StatusOS.AGENDADO}`,
      });
      expect(mockPrisma.ordemServico.update).not.toHaveBeenCalled();
    });
  });

  describe('iniciar', () => {
    it('transiciona AGENDADO → EM_ANDAMENTO', async () => {
      mockPrisma.ordemServico.findUnique
        .mockResolvedValueOnce({ ...osBase, status: StatusOS.AGENDADO })
        .mockResolvedValueOnce({ ...osBase, status: StatusOS.EM_ANDAMENTO });

      const resultado = await service.iniciar(1);

      expect(mockPrisma.ordemServico.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: StatusOS.EM_ANDAMENTO },
        }),
      );
      expect(resultado.status).toBe(StatusOS.EM_ANDAMENTO);
    });

    it('lança 409 com status diferente de AGENDADO', async () => {
      mockPrisma.ordemServico.findUnique.mockResolvedValue({
        ...osBase,
        status: StatusOS.EM_ANDAMENTO,
      });

      await expect(service.iniciar(1)).rejects.toMatchObject({
        status: 409,
        message: `Transição inválida: ${StatusOS.EM_ANDAMENTO} → ${StatusOS.EM_ANDAMENTO}`,
      });
      expect(mockPrisma.ordemServico.update).not.toHaveBeenCalled();
    });
  });

  describe('concluir', () => {
    it('transiciona EM_ANDAMENTO → CONCLUIDO', async () => {
      mockPrisma.ordemServico.findUnique
        .mockResolvedValueOnce({ ...osBase, status: StatusOS.EM_ANDAMENTO })
        .mockResolvedValueOnce({ ...osBase, status: StatusOS.CONCLUIDO });

      const resultado = await service.concluir(1);

      expect(mockPrisma.ordemServico.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: StatusOS.CONCLUIDO },
        }),
      );
      expect(resultado.status).toBe(StatusOS.CONCLUIDO);
    });

    it('lança 409 com status AGENDADO (ainda não iniciada)', async () => {
      await expect(service.concluir(1)).rejects.toMatchObject({
        status: 409,
        message: `Transição inválida: ${StatusOS.AGENDADO} → ${StatusOS.CONCLUIDO}`,
      });
    });
  });

  describe('cancelar', () => {
    it('transiciona qualquer status ativo → CANCELADO gravando o motivo', async () => {
      mockPrisma.ordemServico.findUnique
        .mockResolvedValueOnce({ ...osBase, status: StatusOS.AGENDADO })
        .mockResolvedValueOnce({ ...osBase, status: StatusOS.CANCELADO });

      const dto: CancelarOsDto = { motivo: 'Cliente desistiu' };

      const resultado = await service.cancelar(1, dto);

      expect(mockPrisma.ordemServico.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            status: StatusOS.CANCELADO,
            motivoRejeicao: 'Cliente desistiu',
          },
        }),
      );
      expect(resultado.status).toBe(StatusOS.CANCELADO);
    });

    it('exige motivo no schema (spec 3.5: cancelar exige motivo)', () => {
      expect(() => cancelarOsSchema.parse({})).toThrow();
      expect(() => cancelarOsSchema.parse({ motivo: '   ' })).toThrow();
      expect(
        cancelarOsSchema.parse({ motivo: ' Cliente desistiu ' }).motivo,
      ).toBe('Cliente desistiu');
    });

    it('lança 409 quando a OS está CONCLUIDO', async () => {
      mockPrisma.ordemServico.findUnique.mockResolvedValue({
        ...osBase,
        status: StatusOS.CONCLUIDO,
      });

      await expect(service.cancelar(1)).rejects.toMatchObject({
        status: 409,
        message: `Transição inválida: ${StatusOS.CONCLUIDO} → ${StatusOS.CANCELADO}`,
      });
      expect(mockPrisma.ordemServico.update).not.toHaveBeenCalled();
    });

    it('lança 404 quando a OS não existe', async () => {
      mockPrisma.ordemServico.findUnique.mockResolvedValue(null);

      await expect(service.cancelar(404)).rejects.toMatchObject({
        status: 404,
      });
    });
  });
});
