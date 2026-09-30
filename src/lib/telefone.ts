import type { User } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service.js';

export const somenteDigitos = (s: string): string => s.replace(/\D/g, '');

export function temDddValido(telefone: string): boolean {
  const digitos = somenteDigitos(telefone);
  return digitos.length >= 10 && digitos.length <= 11;
}

export async function findUserByTelefone(
  prisma: PrismaService,
  input: string,
): Promise<User | null> {
  const digitos = somenteDigitos(input);
  if (digitos.length < 10 || digitos.length > 11) return null;
  const candidatos = await prisma.user.findMany({
    where: { telefone: { not: null } },
  });
  return (
    candidatos.find(
      (u) => u.telefone && somenteDigitos(u.telefone) === digitos,
    ) ?? null
  );
}
