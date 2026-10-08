import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
  obra: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
  obraEtapa: { create: vi.fn() },
  obraAtividade: { create: vi.fn() },
  obraAtividadeMaterial: { create: vi.fn() },
};

const mockPrisma = {
  atendimento: { findUnique: vi.fn() },
  visitaTecnica: { findFirst: vi.fn(), findUnique: vi.fn() },
  material: { findMany: vi.fn() },
  catalogoAtividade: { findMany: vi.fn() },
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
      mockPrisma.atendimento.findUnique.mockResolvedValue({
        userId: 7,
        status: 'ORCAMENTAMENTO',
        visitaSolicitada: false,
      });
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
      const result: any = await service.criar(dtoBase(), 1);

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

    it('gate 4: status EM_ANDAMENTO → 400 deve estar em ORCAMENTAMENTO', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue({
        userId: 7,
        status: 'EM_ANDAMENTO',
        visitaSolicitada: false,
      });
      await expect(service.criar(dtoBase(), 1)).rejects.toThrow(
        'Atendimento deve estar em ORCAMENTAMENTO para gerar orçamento',
      );
      expect(mockPrisma.orcamento.create).not.toHaveBeenCalled();
    });

    it('gate 4: status CONCLUIDO → 400 idem', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue({
        userId: 7,
        status: 'CONCLUIDO',
        visitaSolicitada: true,
      });
      await expect(service.criar(dtoBase(), 1)).rejects.toThrow(
        'Atendimento deve estar em ORCAMENTAMENTO para gerar orçamento',
      );
      expect(mockPrisma.orcamento.create).not.toHaveBeenCalled();
    });

    it('gate 4: flag=true sem agendamentoId/visitaId → 400', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue({
        userId: 7,
        status: 'ORCAMENTAMENTO',
        visitaSolicitada: true,
      });
      await expect(service.criar(dtoBase(), 1)).rejects.toThrow(
        'Informe agendamentoId e visitaId da visita realizada',
      );
      expect(mockPrisma.orcamento.create).not.toHaveBeenCalled();
    });

    it('gate 4: flag=true com visita inexistente → 400 visita não pertence', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue({
        userId: 7,
        status: 'ORCAMENTAMENTO',
        visitaSolicitada: true,
      });
      mockPrisma.visitaTecnica.findUnique.mockResolvedValue(null);
      await expect(
        service.criar({ ...dtoBase(), agendamentoId: 3, visitaId: 5 }, 1),
      ).rejects.toThrow(
        'Visita não pertence ao atendimento/agendamento informado',
      );
      expect(mockPrisma.orcamento.create).not.toHaveBeenCalled();
    });

    it('gate 4: flag=true com visita divergente → 400', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue({
        userId: 7,
        status: 'ORCAMENTAMENTO',
        visitaSolicitada: true,
      });
      mockPrisma.visitaTecnica.findUnique.mockResolvedValue({
        id: 5,
        atendimentoId: 99,
        agendamentoId: 88,
      });
      await expect(
        service.criar({ ...dtoBase(), agendamentoId: 3, visitaId: 5 }, 1),
      ).rejects.toThrow(
        'Visita não pertence ao atendimento/agendamento informado',
      );
    });

    it('gate 4: flag=true com visita coerente → create com agendamentoId', async () => {
      mockPrisma.atendimento.findUnique.mockResolvedValue({
        userId: 7,
        status: 'ORCAMENTAMENTO',
        visitaSolicitada: true,
      });
      mockPrisma.visitaTecnica.findUnique.mockResolvedValue({
        id: 5,
        atendimentoId: 10,
        agendamentoId: 3,
      });
      const result = await service.criar(
        { ...dtoBase(), agendamentoId: 3, visitaId: 5 },
        1,
      );
      expect(mockPrisma.orcamento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ agendamentoId: 3 }),
        }),
      );
      expect(result.status).toBe('RASCUNHO');
    });

    it('gate 4: flag=false com agendamentoId → 400 não tem visita solicitada', async () => {
      await expect(
        service.criar({ ...dtoBase(), agendamentoId: 3 }, 1),
      ).rejects.toThrow(
        'Atendimento não tem visita solicitada para vincular agendamento/visita',
      );
      expect(mockPrisma.orcamento.create).not.toHaveBeenCalled();
    });

    it('gate 4: flag=false dto limpo → create com agendamentoId null', async () => {
      await service.criar(dtoBase(), 1);
      expect(mockPrisma.orcamento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ agendamentoId: null }),
        }),
      );
    });

    it('auto-resolve: omite catalogoAtividadeId → usa primeiro catálogo ativo do sub-serviço', async () => {
      mockPrisma.catalogoAtividade.findMany.mockResolvedValue([
        { id: 'cat-auto', subServicoId: 1 },
      ]);

      const dto = dtoBase();
      delete dto.atividades[0].catalogoAtividadeId;

      const result: any = await service.criar(dto, 1);

      expect(mockPrisma.catalogoAtividade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { subServicoId: { in: [1] }, ativo: true },
        }),
      );
      const linhas = result.atividades.create;
      expect(linhas).toHaveLength(2);
      expect(linhas[0].catalogoAtividadeId).toBe('cat-auto');
      expect(linhas[1].catalogoAtividadeId).toBe('cat-auto');
    });

    it('auto-resolve: catálogo ausente → 400 Sub-serviço sem atividade de catálogo', async () => {
      mockPrisma.catalogoAtividade.findMany.mockResolvedValue([]);

      const dto = dtoBase();
      delete dto.atividades[0].catalogoAtividadeId;

      await expect(service.criar(dto, 1)).rejects.toThrow(
        'Sub-serviço sem atividade de catálogo',
      );
      expect(mockPrisma.orcamento.create).not.toHaveBeenCalled();
    });

    it('auto-resolve: mantém id explícito quando enviado', async () => {
      const result: any = await service.criar(dtoBase(), 1);

      expect(mockPrisma.catalogoAtividade.findMany).not.toHaveBeenCalled();
      expect(result.atividades.create[0].catalogoAtividadeId).toBe('cat-1');
      expect(result.atividades.create[1].catalogoAtividadeId).toBe('cat-1');
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
      expect(arg.include).toHaveProperty('obra');
    });

    it('filtra por atendimentoId quando informado', async () => {
      mockPrisma.orcamento.findMany.mockResolvedValue([]);
      await service.listar({ atendimentoId: 2 });

      const arg = mockPrisma.orcamento.findMany.mock.calls[0][0];
      expect(arg.where).toEqual({ atendimentoId: 2 });
    });

    it('não filtra atendimentoId quando ausente', async () => {
      mockPrisma.orcamento.findMany.mockResolvedValue([]);
      await service.listar({ status: 'RASCUNHO' });

      const arg = mockPrisma.orcamento.findMany.mock.calls[0][0];
      expect(arg.where).toEqual({ status: 'RASCUNHO' });
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
        obra: null,
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

    it('aprova: cria Obra OBR-NNN, etapas e atividades do orçamento', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue(orcamentoAprovavel());

      mockTx.obra.findMany.mockResolvedValue([]);
      mockTx.obra.create.mockResolvedValue({ id: 50, codigo: 'OBR-001' });
      mockTx.etapa.findMany.mockResolvedValue([
        { id: 1, nome: 'Preparação', ordem: 1 },
        { id: 2, nome: 'Execução', ordem: 2 },
      ]);
      mockTx.obraEtapa.create
        .mockResolvedValueOnce({ id: 11 })
        .mockResolvedValueOnce({ id: 12 });
      mockTx.obraAtividade.create.mockResolvedValue({ id: 'obat-1' });
      mockTx.orcamento.findUnique.mockResolvedValue({
        id: 1,
        status: 'APROVADO',
      });
      mockTx.obra.findUnique.mockResolvedValue({ id: 50, codigo: 'OBR-001' });

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
      expect(mockTx.etapa.findMany).toHaveBeenCalledTimes(1);
      expect(mockTx.obra.create).toHaveBeenCalledTimes(1);
      expect(mockTx.obra.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          codigo: 'OBR-001',
          orcamentoId: 1,
          userId: 7,
          atendimentoId: 10,
          enderecoId: 3,
          urgencia: 'NORMAL',
          valorContratado: 1234.56,
          observacoes: 'Obs do orçamento',
          aprovadoPorId: 99,
        }),
      });
      expect(mockTx.obraEtapa.create).toHaveBeenCalledTimes(2);
      expect(mockTx.obraEtapa.create).toHaveBeenNthCalledWith(1, {
        data: { obraId: 50, etapaId: 1, nome: 'Preparação', ordem: 1 },
      });
      expect(mockTx.obraEtapa.create).toHaveBeenNthCalledWith(2, {
        data: { obraId: 50, etapaId: 2, nome: 'Execução', ordem: 2 },
      });
      expect(mockTx.obraAtividade.create).toHaveBeenCalledTimes(3);
      expect(mockTx.obraAtividade.create).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          obraEtapaId: 11,
          subServicoId: 1,
          catalogoAtividadeId: 'cat-1',
          descricao: 'Linha A',
          ordem: 0,
          aditivoId: null,
          cancelada: false,
        }),
      });
      expect(mockTx.obraAtividade.create).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          obraEtapaId: 11,
          subServicoId: 1,
          catalogoAtividadeId: 'cat-1',
          descricao: 'Linha B',
          ordem: 1,
        }),
      });
      expect(mockTx.obraAtividade.create).toHaveBeenNthCalledWith(3, {
        data: expect.objectContaining({
          obraEtapaId: 12,
          subServicoId: 2,
          catalogoAtividadeId: 'cat-2',
          descricao: 'Linha C',
          ordem: 2,
        }),
      });
      expect(mockTx.obraAtividadeMaterial.create).toHaveBeenCalledTimes(3);
      expect(mockTx.obraAtividadeMaterial.create).toHaveBeenNthCalledWith(1, {
        data: {
          obraAtividadeId: 'obat-1',
          materialId: 1,
          quantidade: 2,
          custoUnitario: 0,
        },
      });
      expect(mockTx.obraAtividadeMaterial.create).toHaveBeenNthCalledWith(2, {
        data: {
          obraAtividadeId: 'obat-1',
          materialId: 1,
          quantidade: 3,
          custoUnitario: 0,
        },
      });
      expect(mockTx.obraAtividadeMaterial.create).toHaveBeenNthCalledWith(3, {
        data: {
          obraAtividadeId: 'obat-1',
          materialId: 5,
          quantidade: 1,
          custoUnitario: 0,
        },
      });
      expect(mockTx.ordemServico.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        orcamento: { id: 1, status: 'APROVADO' },
        obra: { id: 50, codigo: 'OBR-001' },
      });
    });

    it('lança 409 ao aprovar duas vezes', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue({
        ...orcamentoAprovavel(),
        status: 'APROVADO',
        obra: { id: 50 },
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

    it('lança 409 e não retorna obra quando a criação da Obra falha', async () => {
      mockPrisma.orcamento.findUnique.mockResolvedValue(orcamentoAprovavel());
      mockTx.obra.findMany.mockResolvedValue([]);
      mockTx.obra.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: 'test',
          meta: { target: ['orcamentoId'] },
        }),
      );

      try {
        await service.aprovar(1, 99);
        expect.unreachable('deveria lançar AppError');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).getStatus()).toBe(409);
        expect((e as AppError).message).toBe('Orçamento já aprovado');
      }
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('listarDoUsuario', () => {
    it('filtra por userId com includeResumo e orderBy createdAt desc', async () => {
      mockPrisma.orcamento.findMany.mockResolvedValue([]);
      await service.listarDoUsuario(7);
      expect(mockPrisma.orcamento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 7 },
          orderBy: { createdAt: 'desc' },
          include: expect.objectContaining({
            atendimento: expect.anything(),
            _count: expect.anything(),
          }),
        }),
      );
    });

    it('devolve os itens do findMany', async () => {
      const itens = [{ id: 5, userId: 7 }];
      mockPrisma.orcamento.findMany.mockResolvedValue(itens);
      const res = await service.listarDoUsuario(7);
      expect(res).toEqual(itens);
    });
  });

  describe('detalharParaUsuario', () => {
    it('lança 404 Orçamento não encontrado sem chamar detalhar quando não é dono', async () => {
      mockPrisma.orcamento.findFirst.mockResolvedValue(null);
      const spy = vi.spyOn(service, 'detalhar');
      await expect(service.detalharParaUsuario(7, 999)).rejects.toThrow(
        'Orçamento não encontrado',
      );
      expect(mockPrisma.orcamento.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 999, userId: 7 } }),
      );
      expect(spy).not.toHaveBeenCalled();
    });

    it('delega para detalhar quando o usuário é dono', async () => {
      mockPrisma.orcamento.findFirst.mockResolvedValue({ id: 10 });
      const spy = vi
        .spyOn(service, 'detalhar')
        .mockResolvedValue({ id: 10, atividades: [] } as never);
      const res = await service.detalharParaUsuario(7, 10);
      expect(spy).toHaveBeenCalledWith(10);
      expect(res).toEqual({ id: 10, atividades: [] });
    });
  });
});
