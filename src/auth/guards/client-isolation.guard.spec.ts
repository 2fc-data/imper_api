import { ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PORTAL_KEY } from '../decorators/portal.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { ClientIsolationGuard } from './client-isolation.guard.js';

type Meta = { public?: boolean; portal?: boolean };

function ctx(meta: Meta, user?: { papel: string }) {
  const handler = function handler() {};
  const classe = class Alvo {};
  if (meta.public) {
    SetMetadata(IS_PUBLIC_KEY, true)(handler);
    SetMetadata(IS_PUBLIC_KEY, true)(classe);
  }
  if (meta.portal) {
    SetMetadata(IS_PORTAL_KEY, true)(handler);
    SetMetadata(IS_PORTAL_KEY, true)(classe);
  }
  return {
    getHandler: () => handler,
    getClass: () => classe,
    switchToHttp: () => ({ getRequest: () => (user ? { user } : {}) }),
  };
}

function run(meta: Meta, user?: { papel: string }) {
  const guard = new ClientIsolationGuard(new Reflector());
  return guard.canActivate(ctx(meta, user) as never);
}

describe('ClientIsolationGuard', () => {
  it('permite rota @Public sem usuário', () => {
    expect(run({ public: true })).toBe(true);
  });

  it('prioriza @Public sobre CLIENTE', () => {
    expect(run({ public: true }, { papel: 'CLIENTE' })).toBe(true);
  });

  it('permite CLIENTE em rota @Portal', () => {
    expect(run({ portal: true }, { papel: 'CLIENTE' })).toBe(true);
  });

  it('permite ADMIN em rota de backoffice', () => {
    expect(run({}, { papel: 'ADMIN' })).toBe(true);
  });

  it('permite requisição sem usuário (JwtAuthGuard decide depois)', () => {
    expect(run({})).toBe(true);
  });

  it('bloqueia CLIENTE em backoffice com 403', () => {
    expect(() => run({}, { papel: 'CLIENTE' })).toThrow(ForbiddenException);
    expect(() => run({}, { papel: 'CLIENTE' })).toThrow('Acesso restrito');
  });
});
