import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service.js';

describe('NotificacoesService', () => {
  const mockPrisma = {
    notificacao: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  const service = new NotificacoesService(mockPrisma as any);

  it('listar retorna notificações do usuário ordenadas desc', async () => {
    mockPrisma.notificacao.findMany.mockResolvedValue([{ id: 1, userId: 10 }]);
    const res = await service.listar(10, { status: 'NAO_LIDA' });
    expect(res).toEqual([{ id: 1, userId: 10 }]);
    expect(mockPrisma.notificacao.findMany).toHaveBeenCalledWith({
      where: { userId: 10, status: 'NAO_LIDA' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  });

  it('naoLidasCount retorna total de não lidas', async () => {
    mockPrisma.notificacao.count.mockResolvedValue(3);
    const count = await service.naoLidasCount(10);
    expect(count).toBe(3);
    expect(mockPrisma.notificacao.count).toHaveBeenCalledWith({
      where: { userId: 10, status: 'NAO_LIDA' },
    });
  });

  it('marcarLida atualiza notificação para LIDA', async () => {
    mockPrisma.notificacao.findUnique.mockResolvedValue({ id: 5, userId: 10 });
    mockPrisma.notificacao.update.mockResolvedValue({ id: 5, status: 'LIDA' });

    const res = await service.marcarLida(10, 5);
    expect(res.status).toBe('LIDA');
    expect(mockPrisma.notificacao.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { status: 'LIDA' },
    });
  });

  it('marcarLida lança NotFoundException se notificação pertencer a outro usuário', async () => {
    mockPrisma.notificacao.findUnique.mockResolvedValue({ id: 5, userId: 99 });
    await expect(service.marcarLida(10, 5)).rejects.toThrow(NotFoundException);
  });

  it('marcarTodasLidas atualiza todas as notificações não lidas', async () => {
    mockPrisma.notificacao.updateMany.mockResolvedValue({ count: 2 });
    const res = await service.marcarTodasLidas(10);
    expect(res.count).toBe(2);
    expect(mockPrisma.notificacao.updateMany).toHaveBeenCalledWith({
      where: { userId: 10, status: 'NAO_LIDA' },
      data: { status: 'LIDA' },
    });
  });
});
