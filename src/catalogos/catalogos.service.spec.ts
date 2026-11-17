import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LookupService } from '../common/services/lookup.service.js';
import { AppError } from '../lib/errors.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { CatalogosService } from './catalogos.service.js';

function prismaMock() {
  return {
    categoria: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    subcategoria: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    fornecedor: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    tamanhoEquipamento: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  };
}

async function capturarErro(promessa: Promise<unknown>) {
  try {
    await promessa;
  } catch (erro) {
    return erro;
  }
  throw new Error('Esperava que a operação falhasse');
}

describe('CatalogosService.atualizar', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let service: CatalogosService;

  beforeEach(() => {
    prisma = prismaMock();
    service = new CatalogosService(
      prisma as unknown as PrismaService,
      new LookupService(),
    );
    prisma.fornecedor.findFirst.mockResolvedValue(null);
    prisma.categoria.findFirst.mockResolvedValue(null);
    prisma.subcategoria.findFirst.mockResolvedValue(null);
    prisma.tamanhoEquipamento.findFirst.mockResolvedValue(null);
  });

  it('persiste a troca de tipo do fornecedor', async () => {
    prisma.fornecedor.findUnique.mockResolvedValue({
      tipoInsumo: 'EQUIPAMENTO',
      cnpj: null,
    });
    prisma.fornecedor.update.mockResolvedValue({ id: 27 });

    await service.atualizar('fornecedores', 27, {
      nome: 'TOP GAS',
      tipoInsumo: 'MATERIAL',
    });

    expect(prisma.fornecedor.update).toHaveBeenCalledWith({
      where: { id: 27 },
      data: expect.objectContaining({
        nome: 'TOP GAS',
        tipoInsumo: 'MATERIAL',
      }),
    });
  });

  it('usa o tipo atual como escopo quando nenhum tipo é informado', async () => {
    prisma.fornecedor.findUnique.mockResolvedValue({
      tipoInsumo: 'EPI',
      cnpj: null,
    });
    prisma.fornecedor.update.mockResolvedValue({ id: 8 });

    await service.atualizar('fornecedores', 8, { nome: 'ACME' });

    expect(prisma.fornecedor.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tipoInsumo: 'EPI' }),
      }),
    );
    expect(prisma.fornecedor.update).toHaveBeenCalledWith({
      where: { id: 8 },
      data: { nome: 'ACME' },
    });
  });

  it('bloqueia CNPJ já usado no tipo destino', async () => {
    prisma.fornecedor.findUnique.mockResolvedValue({
      tipoInsumo: 'EPI',
      cnpj: '13.425.964/0001-23',
    });
    prisma.fornecedor.findFirst.mockResolvedValue({ id: 99 });

    const erro = await capturarErro(
      service.atualizar('fornecedores', 27, {
        nome: 'TOP GAS',
        tipoInsumo: 'MATERIAL',
      }),
    );

    expect(erro).toBeInstanceOf(AppError);
    expect((erro as AppError).getStatus()).toBe(409);
    expect(prisma.fornecedor.update).not.toHaveBeenCalled();
  });

  it('rejeita tipo divergente em recurso fixo', async () => {
    const erro = await capturarErro(
      service.atualizar('tamanhos', 1, {
        nome: 'PP',
        tipoInsumo: 'MATERIAL',
      }),
    );

    expect(erro).toBeInstanceOf(AppError);
    expect((erro as AppError).getStatus()).toBe(400);
    expect(prisma.tamanhoEquipamento.update).not.toHaveBeenCalled();
  });

  it('rejeita tipo de insumo inválido no corpo', async () => {
    const erro = await capturarErro(
      service.atualizar('cores', 1, { tipoInsumo: 'INVALIDO' }),
    );

    expect(erro).toBeInstanceOf(AppError);
    expect((erro as AppError).getStatus()).toBe(400);
  });

  it('rejeita tipo de insumo que não é texto', async () => {
    const erro = await capturarErro(
      service.atualizar('cores', 1, { tipoInsumo: 7 }),
    );

    expect(erro).toBeInstanceOf(AppError);
    expect((erro as AppError).getStatus()).toBe(400);
  });

  it('bloqueia troca de tipo de categoria com subcategorias', async () => {
    prisma.categoria.findUnique.mockResolvedValue({
      tipoInsumo: 'EQUIPAMENTO',
    });
    prisma.subcategoria.count.mockResolvedValue(3);

    const erro = await capturarErro(
      service.atualizar('categorias', 4, {
        nome: 'FERRAMENTAS',
        tipoInsumo: 'MATERIAL',
      }),
    );

    expect(erro).toBeInstanceOf(AppError);
    expect((erro as AppError).getStatus()).toBe(409);
    expect(prisma.categoria.update).not.toHaveBeenCalled();
  });

  it('permite troca de tipo de categoria sem subcategorias', async () => {
    prisma.categoria.findUnique.mockResolvedValue({
      tipoInsumo: 'EQUIPAMENTO',
    });
    prisma.categoria.count.mockResolvedValue(0);
    prisma.categoria.update.mockResolvedValue({ id: 4 });

    await service.atualizar('categorias', 4, {
      nome: 'FERRAMENTAS',
      tipoInsumo: 'MATERIAL',
    });

    expect(prisma.categoria.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: expect.objectContaining({ tipoInsumo: 'MATERIAL' }),
    });
  });

  it('rejeita subcategoria com categoria incompatível com o tipo', async () => {
    prisma.subcategoria.findUnique.mockResolvedValue({
      id: 10,
      categoriaId: 5,
      nome: 'SUB',
    });
    prisma.categoria.findFirst.mockResolvedValue({
      id: 5,
      tipoInsumo: 'MATERIAL',
    });

    const erro = await capturarErro(
      service.atualizar('subcategorias', 10, {
        nome: 'SUB',
        tipoInsumo: 'EPI',
      }),
    );

    expect(erro).toBeInstanceOf(AppError);
    expect((erro as AppError).getStatus()).toBe(400);
    expect(prisma.subcategoria.update).not.toHaveBeenCalled();
  });

  it('honra o tipo do corpo em subcategoria compatível', async () => {
    prisma.subcategoria.findUnique.mockResolvedValue({
      id: 10,
      categoriaId: 5,
      nome: 'SUB',
    });
    prisma.categoria.findFirst.mockResolvedValue({
      id: 5,
      tipoInsumo: 'EPI',
    });
    prisma.subcategoria.update.mockResolvedValue({ id: 10 });

    await service.atualizar('subcategorias', 10, {
      nome: 'SUB',
      tipoInsumo: 'EPI',
    });

    expect(prisma.subcategoria.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({
        categoriaId: 5,
        tipoInsumo: 'EPI',
      }),
    });
  });
});
