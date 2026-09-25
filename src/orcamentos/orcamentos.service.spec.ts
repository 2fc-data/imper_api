import { HttpException } from '@nestjs/common';
import { AppError } from '../lib/errors.js';
import type { CriarOrcamentoDto } from './dto/orcamentos.dto.js';
import { OrcamentosService } from './orcamentos.service.js';

const mockTx = {
  orcamento: { update: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
  orcamentoObraFicha: { upsert: vi.fn(), deleteMany: vi.fn() },
  orcamentoAtividade: { deleteMany: vi.fn(), create: vi.fn() },
  ordemServico: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
  etapa: { findMany: vi.fn() },
  etapaOS: { create: vi.fn() },
  atividadeOS: { create: vi.fn() },
  atividadeOSLinha: { create: vi.fn() },
  catalogoAtividade: { findMany: vi.fn() },
  checklistExecucao: { create: vi.fn() },
  separacao: { create: vi.fn() },
  etapaOSMaterial: { upsert: vi.fn() },
};

const mockPrisma = {
  atendimento: { findUnique: vi.fn() },
  material: { findMany: vi.fn() },
  orcamento: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  orcamentoObraFicha: { deleteMany: vi.fn() },
  orcamentoAtividade: { deleteMany: vi.fn() },
  $transaction: vi.fn((arg: any) =>
    typeof arg === 'function' ? arg(mockTx) : Promise.all(arg),
  ),
};

function dtoBase(): CriarOrcamentoDto {
  return {
    atendimentoId: 10,
    urgencia: 'NORMAL',
    areaM2: 100,
    valorM2: 25.5,
    ficha: {
      cuidados: ['proteger pisos'],
      acabamentoPiso: 'CERAMICA',
      risco1: 'Queda de objetos',
      acao1: 'Isolar a área de trabalho',
    },
    atividades: [
      {
        etapaId: 1,
        subServicoId: 1,
        catalogoAtividadeId: 'cat-1',
        linhas: [
          {
            descricao: 'Aplicar tinta PVA na parede',
            verboId: 1,
            objetoId: 2,
            moPessoas: 2,
            moHoras: 3.5,
            moValorHora: 50,
            materiais: [{ materialId: 1, quantidade: 2 }],
          },
          {
            descricao: 'Segunda linha sem MO',
            verboId: 2,
            objetoId: 3,
            localId: 5,
            materiais: [{ materialId: 2, quantidade: 1 }],
          },
        ],
      },
    ],
  };
}

describe('OrcamentosService', () => {
  let service: OrcamentosService;

  beforeEach(() => {
    service = new OrcamentosService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('criar', () => {
    beforeEach(() => {
      mockPrisma.atendimento.findUnique.mockResolvedValue({ userId: 7 });
      mockPrisma.orcamento.findFirst.mockResolvedValue({ codigo: 'ORM-005' });
      mockPrisma.material.findMany.mockResolvedValue([
        { id: 1, custoUnitario: 10.5 },
        { id: 2, custoUnitario: 3 },
      ]);
      mockPrisma.orcamento.create.mockImplementation((args: any) =>
        Promise.resolve(args.data),
      );
    });

    it('persiste atividades com custoUnitario snapshotado e totais calculados', async () => {
      const result = await service.criar(dtoBase(), 1);

      expect(result.codigo).toBe('ORM-006');
      expect(result.status).toBe('RASCUNHO');
      expect(result.criadoPorId).toBe(1);
      expect(result.userId).toBe(7);
      expect(result.areaM2).toBe(100);
      expect(result.validade).toBeInstanceOf(Date);

      // 100 × 25.5 = 2550; linhas: (350 + 2×10.5) + (0 + 1×3) = 371 + 3
      expect(result.valorTotal).toBe(2924);

      const linhas = result.atividades.create;
      expect(linhas).toHaveLength(2);

      expect(linhas[0]).toMatchObject({
        ordem: 0,
        etapaId: 1,
        subServicoId: 1,
        catalogoAtividadeId: 'cat-1',
        moValorTotal: 350,
        materiaisValor: 21,
        linhaValorTotal: 371,
      });
      expect(linhas[0].materiais.create).toEqual([
        { materialId: 1, quantidade: 2, custoUnitario: 10.5 },
      ]);

      expect(linhas[1]).toMatchObject({
        ordem: 1,
        localId: 5,
        caracteristicaId: null,
        moValorTotal: 0,
        materiaisValor: 3,
        linhaValorTotal: 3,
      });
      expect(linhas[1].materiais.create).toEqual([
        { materialId: 2, quantidade: 1, custoUnitario: 3 },
      ]);

      expect(result.ficha.create).toMatchObject({
        cuidados: ['proteger pisos'],
        acabamentoPiso: 'CERAMICA',
        risco1: 'Queda de objetos',
      });
    });

    it('usa validade padrão de 30 dias quando ausente', async () => {
      const dto = dtoBase();
      delete dto.validade;
      const antes = Date.now();
      const result = await service.criar(dto, 1);

      const diff = result.validade.getTime() - antes;
      expect(diff).toBeGreaterThan(29 * 86400000);
      expect(diff).toBeLessThan(31 * 86400000);
    });

    it('lança 404 quando o atendimento não existe', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue(null);
      await expect(service.criar(dtoBase(), 1)).rejects.toThrow(AppError);
    });
  });

  describe('listar', () => {
    it('conta atividades (não itens) e inclui servicoMarketing', async () => {
      mockPrisma.orcamento.findMany.mockResolvedValue([]);
      await service.listar();

      const arg = mockPrisma.orcamento.findMany.mock.calls[0][0];
      expect(arg.include._count.select).toEqual({ atividades: true });
      expect(arg.include._count.select.itens).toBeUndefined();
      expect(arg.include).toHaveProperty('servicoMarketing');
      expect(arg.include).toHaveProperty('ordemServico');
    });
  });

  describe('detalhar', () => {
    it('lança 404 quando não encontra', async () => {
      mockPrisma.orcamento.findFirst.mockResolvedValue(null);
      try {
        await service.detalhar(999);
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(404);
      }
    });

    it('retorna o orçamento com include de detalhe', async () => {
      const esperado = { id: 5, codigo: 'ORM-005' };
      mockPrisma.orcamento.findFirst.mockResolvedValue(esperado);
      const result = await service.detalhar(5);

      expect(result).toEqual(esperado);
      const arg = mockPrisma.orcamento.findFirst.mock.calls[0][0];
      expect(arg.where).toEqual({ id: 5 });
      expect(arg.include).toHaveProperty('atividades');
      expect(arg.include).toHaveProperty('ficha');
      expect(arg.include._count.select).toEqual({ atividades: true });
    });
  });

  describe('atualizar', () => {
    beforeEach(() => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        id: 1,
        status: 'RASCUNHO',
      });
      mockPrisma.atendimento.findUnique.mockResolvedValue({ userId: 7 });
      mockPrisma.material.findMany.mockResolvedValue([
        { id: 1, custoUnitario: 10.5 },
        { id: 2, custoUnitario: 3 },
      ]);
      mockTx.orcamento.update.mockResolvedValue({});
      mockTx.orcamentoObraFicha.upsert.mockResolvedValue({});
      mockTx.orcamentoAtividade.deleteMany.mockResolvedValue({ count: 2 });
      mockTx.orcamentoAtividade.create.mockResolvedValue({});
      mockTx.orcamento.findUnique.mockResolvedValue({ id: 1 });
    });

    it('atualiza, recria atividades e recalcula o total na transação', async () => {
      const result = await service.atualizar(1, dtoBase());

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.orcamento.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            atendimentoId: 10,
            userId: 7,
            valorTotal: 2924,
          }),
        }),
      );
      expect(mockTx.orcamentoAtividade.deleteMany).toHaveBeenCalledWith({
        where: { orcamentoId: 1 },
      });
      expect(mockTx.orcamentoAtividade.create).toHaveBeenCalledTimes(2);

      const primeira = mockTx.orcamentoAtividade.create.mock.calls[0][0];
      expect(primeira.data).toMatchObject({
        orcamentoId: 1,
        ordem: 0,
        linhaValorTotal: 371,
      });
      expect(primeira.data.materiais.create).toEqual([
        { materialId: 1, quantidade: 2, custoUnitario: 10.5 },
      ]);

      expect(mockTx.orcamento.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
      expect(result).toEqual({ id: 1 });
    });

    it('não toca a ficha quando dto.ficha está ausente', async () => {
      const dto = dtoBase();
      delete dto.ficha;
      await service.atualizar(1, dto);

      expect(mockTx.orcamentoObraFicha.upsert).not.toHaveBeenCalled();
      expect(mockTx.orcamento.update).toHaveBeenCalled();
    });

    it('faz upsert da ficha quando dto.ficha está presente', async () => {
      await service.atualizar(1, dtoBase());

      expect(mockTx.orcamentoObraFicha.upsert).toHaveBeenCalledWith({
        where: { orcamentoId: 1 },
        update: expect.objectContaining({ acabamentoPiso: 'CERAMICA' }),
        create: expect.objectContaining({
          orcamentoId: 1,
          acabamentoPiso: 'CERAMICA',
        }),
      });
    });

    it('lança 409 quando o status não permite edição', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        id: 1,
        status: 'APROVADO',
      });

      try {
        await service.atualizar(1, dtoBase());
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(409);
      }
    });

    it('lança 404 quando não encontra o orçamento', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue(null);

      try {
        await service.atualizar(999, dtoBase());
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(404);
      }
    });
  });

  describe('remover', () => {
    it('lança 409 para orçamentos que não estão em rascunho', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        id: 1,
        status: 'ENVIADO',
      });

      try {
        await service.remover(1);
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(409);
      }
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('remove rascunho em transação (ficha + atividades + orçamento)', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        id: 1,
        status: 'RASCUNHO',
      });
      mockPrisma.orcamentoObraFicha.deleteMany.mockResolvedValue({});
      mockPrisma.orcamentoAtividade.deleteMany.mockResolvedValue({});
      mockPrisma.orcamento.delete.mockResolvedValue({});

      const result = await service.remover(1);

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrisma.orcamentoObraFicha.deleteMany).toHaveBeenCalledWith({
        where: { orcamentoId: 1 },
      });
      expect(mockPrisma.orcamentoAtividade.deleteMany).toHaveBeenCalledWith({
        where: { orcamentoId: 1 },
      });
      expect(mockPrisma.orcamento.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ ok: true });
    });

    it('lança 404 quando não encontra o orçamento', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue(null);

      try {
        await service.remover(999);
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(404);
      }
    });
  });

  describe('recusar', () => {
    it('recusa orçamento enviado e grava o motivo', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        id: 1,
        status: 'ENVIADO',
      });
      mockPrisma.orcamento.update.mockResolvedValue({
        id: 1,
        status: 'RECUSADO',
        motivoRejeicao: 'Valor acima do orçado',
      });

      const result = await service.recusar(1, 'Valor acima do orçado');

      expect(mockPrisma.orcamento.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'RECUSADO', motivoRejeicao: 'Valor acima do orçado' },
        include: expect.any(Object),
      });
      expect(result).toEqual({
        id: 1,
        status: 'RECUSADO',
        motivoRejeicao: 'Valor acima do orçado',
      });
    });

    it('recusa orçamento em rascunho', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        id: 2,
        status: 'RASCUNHO',
      });
      mockPrisma.orcamento.update.mockResolvedValue({
        id: 2,
        status: 'RECUSADO',
        motivoRejeicao: 'Desistência do cliente',
      });

      await service.recusar(2, 'Desistência do cliente');

      expect(mockPrisma.orcamento.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            status: 'RECUSADO',
            motivoRejeicao: 'Desistência do cliente',
          },
        }),
      );
    });

    it('lança 409 para status APROVADO', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        id: 1,
        status: 'APROVADO',
      });

      try {
        await service.recusar(1, 'motivo qualquer');
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toContain('APROVADO');
      }
      expect(mockPrisma.orcamento.update).not.toHaveBeenCalled();
    });

    it('lança 404 quando não encontra o orçamento', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue(null);

      try {
        await service.recusar(999, 'motivo');
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(404);
      }
    });
  });

  describe('aprovar', () => {
    function orcamentoAprovavel(): any {
      return {
        id: 1,
        status: 'ENVIADO',
        userId: 7,
        atendimentoId: 10,
        enderecoId: 3,
        urgencia: 'NORMAL',
        valorTotal: 1234.56,
        observacoes: 'Obs do orçamento',
        areaM2: 100,
        valorM2: 25,
        ordemServico: null,
        ficha: {
          risco1: 'Queda de objetos',
          acao1: 'Isolar a área',
          risco2: null,
          acao2: null,
          risco3: null,
          acao3: null,
        },
        atividades: [
          {
            id: 1,
            ordem: 0,
            etapaId: 1,
            subServicoId: 1,
            catalogoAtividadeId: 'cat-1',
            descricao: 'Linha A',
            verboId: 1,
            objetoId: 2,
            localId: null,
            caracteristicaId: null,
            unidadeId: null,
            quantidade: null,
            areaM2: null,
            materiais: [{ materialId: 1, quantidade: 2 }],
          },
          {
            id: 2,
            ordem: 1,
            etapaId: 1,
            subServicoId: 1,
            catalogoAtividadeId: 'cat-1',
            descricao: 'Linha B',
            verboId: 2,
            objetoId: 3,
            localId: null,
            caracteristicaId: null,
            unidadeId: null,
            quantidade: null,
            areaM2: null,
            materiais: [{ materialId: 1, quantidade: 3 }],
          },
          {
            id: 3,
            ordem: 2,
            etapaId: 2,
            subServicoId: 2,
            catalogoAtividadeId: 'cat-2',
            descricao: 'Linha C',
            verboId: 3,
            objetoId: 4,
            localId: null,
            caracteristicaId: null,
            unidadeId: null,
            quantidade: null,
            areaM2: null,
            materiais: [{ materialId: 5, quantidade: 1 }],
          },
        ],
      };
    }

    it('bloqueia com ANALISE_CRITICA quando a ficha está ausente', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        ...orcamentoAprovavel(),
        ficha: null,
      });

      try {
        await service.aprovar(1, 99);
        expect.unreachable('deveria lançar HttpException');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(409);
        expect((e as HttpException).getResponse()).toEqual({
          codigo: 'ANALISE_CRITICA',
          pendencias: ['ficha-ausente'],
        });
      }
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('bloqueia com ANALISE_CRITICA quando risco1 não tem acao1', async () => {
      const orcamento = orcamentoAprovavel();
      orcamento.ficha.risco1 = 'Queda de objetos';
      orcamento.ficha.acao1 = null;
      mockPrisma.orcamento.findUnique.mockResolvedValue(orcamento);

      try {
        await service.aprovar(1, 99);
        expect.unreachable('deveria lançar HttpException');
      } catch (e) {
        expect((e as HttpException).getResponse()).toEqual({
          codigo: 'ANALISE_CRITICA',
          pendencias: ['analise-critica-incompleta'],
        });
      }
    });

    it('bloqueia com ANALISE_CRITICA quando areaM2 está nula', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        ...orcamentoAprovavel(),
        areaM2: null,
      });

      try {
        await service.aprovar(1, 99);
        expect.unreachable('deveria lançar HttpException');
      } catch (e) {
        expect((e as HttpException).getResponse()).toEqual({
          codigo: 'ANALISE_CRITICA',
          pendencias: ['medicao-ausentes'],
        });
      }
    });

    it('aprova: cria OS-NNN, etapas, atividades agrupadas e separações', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue(orcamentoAprovavel());

      mockTx.ordemServico.findMany.mockResolvedValue([]);
      mockTx.ordemServico.create.mockResolvedValue({
        id: 50,
        codigo: 'OS-001',
      });
      mockTx.etapa.findMany.mockResolvedValue([
        { id: 1, nome: 'Preparação', ordem: 1 },
        { id: 2, nome: 'Execução', ordem: 2 },
      ]);
      mockTx.etapaOS.create
        .mockResolvedValueOnce({ id: 11 })
        .mockResolvedValueOnce({ id: 12 });
      mockTx.atividadeOS.create
        .mockResolvedValueOnce({ id: 'act-1' })
        .mockResolvedValueOnce({ id: 'act-2' });
      mockTx.catalogoAtividade.findMany.mockResolvedValue([
        {
          id: 'cat-1',
          subSteps: [{ id: 'sub1' }, { id: 'sub2' }],
          recursos: [{ tipo: 'MATERIAL', itemCatalogoId: 1, quantidade: 2 }],
        },
        {
          id: 'cat-2',
          subSteps: [],
          recursos: [{ tipo: 'EPI', itemCatalogoId: 9, quantidade: 1 }],
        },
      ]);
      mockTx.atividadeOSLinha.create.mockResolvedValue({});
      mockTx.checklistExecucao.create.mockResolvedValue({});
      mockTx.separacao.create.mockResolvedValue({});
      mockTx.etapaOSMaterial.upsert.mockResolvedValue({});
      mockTx.orcamento.findUnique.mockResolvedValue({
        id: 1,
        status: 'APROVADO',
      });
      mockTx.ordemServico.findUnique.mockResolvedValue({
        id: 50,
        codigo: 'OS-001',
      });

      const result = await service.aprovar(1, 99);

      expect(mockTx.orcamento.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'APROVADO',
          aprovadoPorId: 99,
          aprovadoEm: expect.any(Date),
          motivoRejeicao: null,
        },
      });
      expect(mockTx.ordemServico.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          codigo: 'OS-001',
          orcamentoId: 1,
          userId: 7,
          atendimentoId: 10,
          enderecoId: 3,
          urgencia: 'NORMAL',
          valorTotal: 1234.56,
          observacoes: 'Obs do orçamento',
        }),
      });
      expect(mockTx.etapaOS.create).toHaveBeenCalledTimes(2);
      expect(mockTx.etapaOS.create).toHaveBeenNthCalledWith(1, {
        data: {
          ordemServicoId: 50,
          etapaId: 1,
          nome: 'Preparação',
          ordem: 1,
          status: 'PENDENTE',
        },
      });
      expect(mockTx.atividadeOS.create).toHaveBeenCalledTimes(2);
      expect(mockTx.atividadeOS.create).toHaveBeenNthCalledWith(1, {
        data: {
          osId: 50,
          etapaOSId: 11,
          catalogoAtividadeId: 'cat-1',
          status: 'PENDENTE',
        },
      });
      expect(mockTx.atividadeOSLinha.create).toHaveBeenCalledTimes(3);
      expect(mockTx.checklistExecucao.create).toHaveBeenCalledTimes(2);
      expect(mockTx.separacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          codigo: 'SEP-50-1-1',
          etapaOsId: 11,
          osId: 50,
          equipeId: null,
        }),
      });
      expect(mockTx.separacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          codigo: 'SEP-50-2-1',
          etapaOsId: 12,
          osId: 50,
        }),
      });
      expect(mockTx.etapaOSMaterial.upsert).toHaveBeenCalledWith({
        where: {
          etapaOsId_materialId: { etapaOsId: 11, materialId: 1 },
        },
        update: { quantidadePlanejada: { increment: 5 } },
        create: { etapaOsId: 11, materialId: 1, quantidadePlanejada: 5 },
      });
      expect(result).toEqual({
        orcamento: { id: 1, status: 'APROVADO' },
        ordemServico: { id: 50, codigo: 'OS-001' },
      });
    });

    it('lança 409 ao aprovar duas vezes', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        ...orcamentoAprovavel(),
        status: 'APROVADO',
        ordemServico: { id: 50 },
      });

      try {
        await service.aprovar(1, 99);
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toBe('Orçamento já aprovado');
      }
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
