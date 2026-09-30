import type { User } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import {
  findUserByTelefone,
  somenteDigitos,
  temDddValido,
} from './telefone.js';

function prismaCom(telefones: (string | null)[]) {
  const users = telefones.map((t, i) => ({ id: i + 1, telefone: t }) as User);
  return {
    user: { findMany: vi.fn().mockResolvedValue(users) },
  } as unknown as PrismaService;
}

describe('somenteDigitos', () => {
  it('remove máscara', () => {
    expect(somenteDigitos('(35) 99951-5354')).toBe('35999515354');
    expect(somenteDigitos('35999515354')).toBe('35999515354');
  });
});

describe('temDddValido', () => {
  it('aceita 10 e 11 dígitos (fixo e celular com DDD)', () => {
    expect(temDddValido('(35) 3721-1234')).toBe(true);
    expect(temDddValido('(35) 99951-5354')).toBe(true);
    expect(temDddValido('35999515354')).toBe(true);
  });

  it('rejeita menos de 10 dígitos (sem DDD) e acima de 11', () => {
    expect(temDddValido('999515354')).toBe(false);
    expect(temDddValido('3599951')).toBe(false);
    expect(temDddValido('359995153540')).toBe(false);
    expect(temDddValido('')).toBe(false);
  });
});

describe('findUserByTelefone', () => {
  it('casa com e sem máscara quando há DDD', async () => {
    const prisma = prismaCom(['(35) 99951-5354', null]);
    await expect(
      findUserByTelefone(prisma, '(35) 99951-5354'),
    ).resolves.toMatchObject({ id: 1 });
    await expect(
      findUserByTelefone(prisma, '35999515354'),
    ).resolves.toMatchObject({ id: 1 });
  });

  it('exige DDD: 9 dígitos não casa (mesmo que seja o número sem DDD)', async () => {
    const prisma = prismaCom(['(35) 99951-5354']);
    await expect(findUserByTelefone(prisma, '999515354')).resolves.toBeNull();
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('não faz match parcial entre números parecidos', async () => {
    const prisma = prismaCom(['(35) 99951-5354', '(35) 99951-5355']);
    await expect(
      findUserByTelefone(prisma, '35999515355'),
    ).resolves.toMatchObject({ id: 2 });
  });

  it('ignora usuários sem telefone', async () => {
    const prisma = prismaCom([null, '(35) 99951-5354']);
    await expect(
      findUserByTelefone(prisma, '35999515354'),
    ).resolves.toMatchObject({ id: 2 });
  });

  it('retorna null quando ninguém casa', async () => {
    const prisma = prismaCom(['(35) 99951-5354']);
    await expect(
      findUserByTelefone(prisma, '(11) 91234-5678'),
    ).resolves.toBeNull();
  });
});
