import type { ArgumentsHost } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpExceptionFilter } from './http-exception.filter';

function hostComResposta() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const host = {
    switchToHttp: () => ({ getResponse: () => res }),
  } as unknown as ArgumentsHost;
  return { res, host };
}

function erroPrisma(
  code: 'P2002' | 'P2003' | 'P2025',
  meta?: Record<string, unknown>,
) {
  return new Prisma.PrismaClientKnownRequestError('db error', {
    code,
    clientVersion: 'test',
    meta,
  });
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    const logger = (filter as any).logger;
    vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    vi.spyOn(logger, 'error').mockImplementation(() => undefined);
  });

  it('repassa HttpException com status e message originais', () => {
    const { res, host } = hostComResposta();
    filter.catch(new HttpException('algo falhou', 409), host);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'algo falhou' });
  });

  it('P2003 mantém 400/code e expõe o campo da constraint', () => {
    const { res, host } = hostComResposta();
    filter.catch(
      erroPrisma('P2003', { target: ['orcamentos_atividades_etapaId_fkey'] }),
      host,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'P2003',
        message: expect.stringContaining('orcamentos_atividades_etapaId_fkey'),
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('não existe mais'),
      }),
    );
  });

  it('P2003 sem meta cai em mensagem genérica explicativa', () => {
    const { res, host } = hostComResposta();
    filter.catch(erroPrisma('P2003'), host);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'P2003',
        message:
          'Violação de chave estrangeira — o registro referenciado não existe mais. Recarregue os dados e tente novamente.',
      }),
    );
  });

  it('P2002 → 409 Registro duplicado', () => {
    const { res, host } = hostComResposta();
    filter.catch(erroPrisma('P2002'), host);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Registro duplicado',
      code: 'P2002',
    });
  });

  it('P2025 → 404 Registro não encontrado', () => {
    const { res, host } = hostComResposta();
    filter.catch(erroPrisma('P2025'), host);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Registro não encontrado',
      code: 'P2025',
    });
  });

  it('PrismaClientValidationError → 400 amigável', () => {
    const { res, host } = hostComResposta();
    const err = new Prisma.PrismaClientValidationError('invalid', {
      clientVersion: 'test',
    });
    filter.catch(err, host);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'Os dados enviados são inválidos. Verifique os campos e tente novamente.',
    });
  });

  it('erro desconhecido → 500', () => {
    const { res, host } = hostComResposta();
    filter.catch(new Error('boom'), host);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
  });
});
