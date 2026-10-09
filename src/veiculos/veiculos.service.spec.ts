import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VeiculosService } from './veiculos.service.js';
import { AppError } from '../lib/errors.js';

const mockPrisma = {
  veiculo: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  statusVeiculo: { findMany: vi.fn(), findFirst: vi.fn() },
  tipoVeiculo: { findMany: vi.fn(), findFirst: vi.fn() },
  tipoManutencao: { findMany: vi.fn() },
  cor: { findMany: vi.fn(), findFirst: vi.fn() },
  marca: { findMany: vi.fn(), findFirst: vi.fn() },
  user: { findMany: vi.fn(), findFirst: vi.fn() },
  registroKmVeiculo: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  abastecimentoVeiculo: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
    count: vi.fn(),
  },
  manutencaoVeiculo: { count: vi.fn(), groupBy: vi.fn() },
  $transaction: vi.fn(),
};

const mockLookup = {
  criarCrud: vi.fn(() => ({
    listar: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    desativar: vi.fn(),
  })),
};

function servico() {
  return new VeiculosService(mockPrisma as any, mockLookup as any);
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('VeiculosService', () => {
  describe('listar', () => {
    it('deve listar veículos ativos', async () => {
      const veiculos = [{ id: 1, codigo: 'V001', placa: 'ABC-1234' }];
      mockPrisma.veiculo.findMany.mockResolvedValue(veiculos);

      const result = await servico().listar();

      expect(mockPrisma.veiculo.findMany).toHaveBeenCalledWith({
        where: { ativo: true },
        include: expect.any(Object),
        orderBy: { codigo: 'asc' },
      });
      expect(result).toEqual(veiculos);
    });

    it('deve filtrar por q (código, placa ou modelo)', async () => {
      mockPrisma.veiculo.findMany.mockResolvedValue([]);
      await servico().listar({ q: 'ABC' });
      expect(mockPrisma.veiculo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { codigo: { contains: 'ABC' } },
              { placa: { contains: 'ABC' } },
              { modelo: { contains: 'ABC' } },
            ],
          }),
        }),
      );
    });

    it('deve filtrar por statusId e tipoId', async () => {
      mockPrisma.veiculo.findMany.mockResolvedValue([]);
      await servico().listar({ statusId: 2, tipoId: 3 });
      expect(mockPrisma.veiculo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ statusId: 2, tipoId: 3 }),
        }),
      );
    });
  });

  describe('detalhar', () => {
    it('deve retornar veículo encontrado', async () => {
      const veiculo = { id: 1, codigo: 'V001' };
      mockPrisma.veiculo.findUnique.mockResolvedValue(veiculo);
      const result = await servico().detalhar(1);
      expect(result).toEqual(veiculo);
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      mockPrisma.veiculo.findUnique.mockResolvedValue(null);
      await expect(servico().detalhar(999)).rejects.toThrow(
        'Veículo com ID 999 não encontrado',
      );
    });
  });

  describe('proximoCodigo', () => {
    it('deve retornar VCL-01 quando não há veículos VCL', async () => {
      mockPrisma.veiculo.findFirst.mockResolvedValue(null);
      const result = await servico().proximoCodigo();
      expect(result).toEqual({ codigo: 'VCL-01' });
      expect(mockPrisma.veiculo.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { codigo: { startsWith: 'VCL-' } },
        }),
      );
    });

    it('deve incrementar o último código VCL-XX', async () => {
      mockPrisma.veiculo.findFirst.mockResolvedValue({ codigo: 'VCL-07' });
      const result = await servico().proximoCodigo();
      expect(result).toEqual({ codigo: 'VCL-08' });
    });

    it('deve ignorar códigos fora do padrão VCL- e reiniciar em VCL-01', async () => {
      mockPrisma.veiculo.findFirst.mockResolvedValue({ codigo: 'V001' });
      const result = await servico().proximoCodigo();
      expect(result).toEqual({ codigo: 'VCL-01' });
    });
  });

  describe('criar', () => {
    it('deve criar veículo com descricao e lookups', async () => {
      const data = {
        codigo: 'VCL-01',
        placa: 'abc-1234',
        descricao: 'FIESTA PRATA',
        tipoId: 1,
        statusId: 1,
      };
      mockPrisma.tipoVeiculo.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.statusVeiculo.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.veiculo.findFirst.mockResolvedValue(null);
      mockPrisma.veiculo.create.mockResolvedValue({
        id: 1,
        ...data,
        placa: 'ABC-1234',
      });

      const result = await servico().criar(data);

      expect(mockPrisma.veiculo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            codigo: 'VCL-01',
            placa: 'ABC-1234',
            descricao: 'FIESTA PRATA',
            tipoId: 1,
            statusId: 1,
          }),
        }),
      );
      expect(result.id).toBe(1);
    });

    it('deve gerar código VCL-XX automático quando codigo não informado', async () => {
      mockPrisma.tipoVeiculo.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.statusVeiculo.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.veiculo.findFirst
        .mockResolvedValueOnce({ codigo: 'VCL-03' }) // proximoCodigo
        .mockResolvedValueOnce(null); // exists
      mockPrisma.veiculo.create.mockResolvedValue({
        id: 1,
        codigo: 'VCL-04',
        placa: 'ABC-1234',
        descricao: 'FIESTA',
      });

      await servico().criar({
        placa: 'abc-1234',
        descricao: 'FIESTA',
        tipoId: 1,
        statusId: 1,
      });

      expect(mockPrisma.veiculo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ codigo: 'VCL-04' }),
        }),
      );
    });

    it('deve lançar AppError 409 se código ou placa já existe', async () => {
      mockPrisma.tipoVeiculo.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.statusVeiculo.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.veiculo.findFirst.mockResolvedValue({ id: 1 });
      await expect(
        servico().criar({
          codigo: 'VCL-01',
          placa: 'ABC-1234',
          descricao: 'FIESTA',
          tipoId: 1,
          statusId: 1,
        }),
      ).rejects.toThrow(AppError);
    });

    it('deve lançar 422 se tipoId não existir', async () => {
      mockPrisma.tipoVeiculo.findFirst.mockResolvedValue(null);
      await expect(
        servico().criar({
          codigo: 'V001',
          placa: 'ABC-1234',
          descricao: 'FIESTA',
          tipoId: 99,
          statusId: 1,
        }),
      ).rejects.toThrow('Tipo de veículo inválido');
    });

    it('deve lançar 422 se statusId não existir', async () => {
      mockPrisma.tipoVeiculo.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.statusVeiculo.findFirst.mockResolvedValue(null);
      await expect(
        servico().criar({
          codigo: 'V001',
          placa: 'ABC-1234',
          descricao: 'FIESTA',
          tipoId: 1,
          statusId: 99,
        }),
      ).rejects.toThrow('Status de veículo inválido');
    });

    it('deve lançar 422 se descricao for vazia', async () => {
      await expect(
        servico().criar({
          codigo: 'V001',
          placa: 'ABC-1234',
          descricao: '   ',
          tipoId: 1,
          statusId: 1,
        }),
      ).rejects.toThrow('Descrição é obrigatória');
    });
  });

  describe('atualizar', () => {
    it('deve atualizar campos permitidos e ignorar odometroAtual', async () => {
      mockPrisma.veiculo.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.veiculo.findFirst.mockResolvedValue(null);
      mockPrisma.veiculo.update.mockResolvedValue({ id: 1 });

      await servico().atualizar(1, {
        descricao: 'FIESTA AZUL',
        odometroAtual: 9999,
      });

      const payload = mockPrisma.veiculo.update.mock.calls[0][0].data;
      expect(payload.descricao).toBe('FIESTA AZUL');
      expect(payload).not.toHaveProperty('odometroAtual');
    });

    it('deve lançar 409 se codigo/placa duplicado em outro registro', async () => {
      mockPrisma.veiculo.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.veiculo.findFirst.mockResolvedValue({ id: 2 });
      await expect(
        servico().atualizar(1, { codigo: 'V002' }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('excluir', () => {
    it('deve desativar (soft delete) veículo sem km', async () => {
      mockPrisma.veiculo.findUnique.mockResolvedValue({
        id: 1,
        odometroAtual: 0,
      });
      mockPrisma.veiculo.update.mockResolvedValue({ id: 1, ativo: false });

      await servico().excluir(1);

      expect(mockPrisma.veiculo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ativo: false },
      });
    });

    it('deve lançar 409 se veículo tem km registrado', async () => {
      mockPrisma.veiculo.findUnique.mockResolvedValue({
        id: 1,
        odometroAtual: 150,
      });
      await expect(servico().excluir(1)).rejects.toThrow(
        'Não é possível excluir veículo com km registrado',
      );
    });
  });

  describe('registrarKm', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockImplementation(
        async (fn: any) => fn(mockPrisma),
      );
    });

    it('deve registrar km e atualizar odômetro', async () => {
      const veiculo = { id: 1, odometroAtual: 1000 };
      mockPrisma.veiculo.findUnique.mockResolvedValue(veiculo);
      mockPrisma.registroKmVeiculo.findUnique.mockResolvedValue(null);
      mockPrisma.registroKmVeiculo.create.mockResolvedValue({ id: 1 });
      mockPrisma.veiculo.update.mockResolvedValue({});

      const result = await servico().registrarKm(
        1,
        { data: '2026-10-01', kmPercorrido: 50, observacao: 'Teste' },
        1,
      );

      expect(result).toEqual({ id: 1 });
      expect(mockPrisma.registroKmVeiculo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          veiculoId: 1,
          kmPercorrido: 50,
          odometro: 1050,
          registradoPorId: 1,
        }),
      });
      expect(mockPrisma.veiculo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { odometroAtual: 1050 },
      });
    });

    it('deve lançar AppError 409 se já existe registro no mesmo dia', async () => {
      mockPrisma.veiculo.findUnique.mockResolvedValue({
        id: 1,
        odometroAtual: 1000,
      });
      mockPrisma.registroKmVeiculo.findUnique.mockResolvedValue({ id: 5 });
      await expect(
        servico().registrarKm(1, { data: '2026-10-01', kmPercorrido: 10 }, 1),
      ).rejects.toThrow('Já existe registro de km');
    });

    it('deve lançar AppError 422 se kmPercorrido <= 0', async () => {
      mockPrisma.veiculo.findUnique.mockResolvedValue({
        id: 1,
        odometroAtual: 1000,
      });
      await expect(
        servico().registrarKm(
          1,
          { data: '2026-10-01', kmPercorrido: 0 },
          1,
        ),
      ).rejects.toThrow('kmPercorrido deve ser maior que zero');
    });

    it('deve lançar NotFoundException se veículo não existe', async () => {
      mockPrisma.veiculo.findUnique.mockResolvedValue(null);
      await expect(
        servico().registrarKm(999, { data: '2026-10-01', kmPercorrido: 10 }, 1),
      ).rejects.toThrow('não encontrado');
    });
  });

  describe('listarRegistrosKm', () => {
    it('deve listar registros do veículo no mês', async () => {
      const registros = [{ id: 1, veiculoId: 1, data: '2026-10-01' }];
      mockPrisma.registroKmVeiculo.findMany.mockResolvedValue(registros);
      const result = await servico().listarRegistrosKm(1, 10, 2026);
      expect(mockPrisma.registroKmVeiculo.findMany).toHaveBeenCalled();
      expect(result).toEqual(registros);
    });
  });

  describe('excluirRegistroKm', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockImplementation(
        async (fn: any) => fn(mockPrisma),
      );
    });

    it('deve excluir e rollback odômetro', async () => {
      const registro = {
        id: 1,
        veiculoId: 1,
        kmPercorrido: 50,
        data: '2026-10-01',
      };
      mockPrisma.registroKmVeiculo.findUnique.mockResolvedValue(registro);
      mockPrisma.veiculo.findUnique.mockResolvedValue({
        id: 1,
        odometroAtual: 1050,
      });
      mockPrisma.registroKmVeiculo.delete.mockResolvedValue(registro);
      mockPrisma.veiculo.update.mockResolvedValue({});

      await servico().excluirRegistroKm(1);

      expect(mockPrisma.veiculo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { odometroAtual: 1000 },
      });
    });

    it('deve lançar NotFoundException se registro não existe', async () => {
      mockPrisma.registroKmVeiculo.findUnique.mockResolvedValue(null);
      await expect(servico().excluirRegistroKm(999)).rejects.toThrow(
        'não encontrado',
      );
    });
  });

  describe('abastecimentos', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockImplementation(
        async (fn: any) => fn(mockPrisma),
      );
    });

    describe('criarAbastecimento', () => {
      it('deve criar abastecimento com cálculos', async () => {
        const veiculo = { id: 1, odometroAtual: 1000 };
        mockPrisma.veiculo.findUnique.mockResolvedValue(veiculo);
        mockPrisma.abastecimentoVeiculo.findFirst.mockResolvedValue({
          id: 9,
          odometro: 950,
        });
        mockPrisma.abastecimentoVeiculo.create.mockResolvedValue({ id: 1 });
        mockPrisma.veiculo.update.mockResolvedValue({});

        const result = await servico().criarAbastecimento(
          1,
          { data: '2026-10-01', litros: 40, valorTotal: 200, odometro: 1050 },
          1,
        );

        expect(mockPrisma.abastecimentoVeiculo.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            veiculoId: 1,
            litros: 40,
            valorTotal: 200,
            precoLitro: 5,
            odometro: 1050,
            kmDesdeUltimo: 100,
            kmPorLitro: 2.5,
            registradoPorId: 1,
          }),
        });
        expect(mockPrisma.veiculo.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { odometroAtual: 1050 },
        });
        expect(result).toEqual({ id: 1 });
      });

      it('deve lançar AppError 422 se litros <= 0', async () => {
        mockPrisma.veiculo.findUnique.mockResolvedValue({
          id: 1,
          odometroAtual: 1000,
        });
        await expect(
          servico().criarAbastecimento(
            1,
            { data: '2026-10-01', litros: 0, valorTotal: 100 },
            1,
          ),
        ).rejects.toThrow('litros deve ser maior que zero');
      });

      it('deve lançar NotFoundException se veículo não existe', async () => {
        mockPrisma.veiculo.findUnique.mockResolvedValue(null);
        await expect(
          servico().criarAbastecimento(
            999,
            { data: '2026-10-01', litros: 10, valorTotal: 50 },
            1,
          ),
        ).rejects.toThrow('não encontrado');
      });
    });

    describe('listarAbastecimentos', () => {
      it('deve listar abastecimentos do veículo', async () => {
        const abastecimentos = [{ id: 1, veiculoId: 1 }];
        mockPrisma.abastecimentoVeiculo.findMany.mockResolvedValue(
          abastecimentos,
        );
        const result = await servico().listarAbastecimentos(1);
        expect(result).toEqual(abastecimentos);
      });
    });
  });

  describe('analises', () => {
    it('deve retornar métricas do mês', async () => {
      mockPrisma.registroKmVeiculo.aggregate.mockResolvedValue({
        _sum: { kmPercorrido: 500 },
      });
      mockPrisma.abastecimentoVeiculo.aggregate.mockResolvedValue({
        _sum: { litros: 100, valorTotal: 500 },
      });
      mockPrisma.abastecimentoVeiculo.count.mockResolvedValue(5);
      mockPrisma.manutencaoVeiculo.groupBy.mockResolvedValue([
        { status: 'PENDENTE', _count: 2 },
        { status: 'CONCLUIDA', _count: 3 },
      ]);
      mockPrisma.veiculo.findMany.mockResolvedValue([]);
      mockPrisma.registroKmVeiculo.findFirst.mockResolvedValue(null);

      const result = await servico().analises(10, 2026);

      expect(result).toHaveProperty('kmTotalMes', 500);
      expect(result).toHaveProperty('abastecimentosMes');
      expect(result.abastecimentosMes).toMatchObject({
        totalLitros: 100,
        totalValor: 500,
        quantidade: 5,
      });
      expect(result).toHaveProperty('manutencoesPorStatus');
      expect(result).toHaveProperty('veiculosSemKm');
      expect(result.mes).toBe(10);
      expect(result.ano).toBe(2026);
    });
  });
});
