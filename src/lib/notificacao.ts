import { prisma } from './db.js';

export async function notificarUsuarios(
  userIds: number[],
  input: {
    titulo: string;
    mensagem: string;
    link?: string | null;
    ordemServicoId?: number | null;
  },
): Promise<void> {
  const ids = [...new Set(userIds)];
  if (!ids.length) return;
  await prisma.notificacao.createMany({
    data: ids.map((userId) => ({
      userId,
      titulo: input.titulo,
      mensagem: input.mensagem,
      link: input.link ?? null,
      ordemServicoId: input.ordemServicoId ?? null,
    })),
  });
}

export async function notificarPapeis(
  nomesPapeis: string[],
  input: {
    titulo: string;
    mensagem: string;
    link?: string | null;
    ordemServicoId?: number | null;
  },
): Promise<void> {
  const papeis = await prisma.papelRbac.findMany({
    where: { nome: { in: nomesPapeis } },
    select: { id: true },
  });
  const vinculacoes = await prisma.usuarioPapel.findMany({
    where: { papelId: { in: papeis.map((p) => p.id) } },
    select: { userId: true },
  });
  const uniqueIds = [...new Set(vinculacoes.map((v) => v.userId))];
  if (uniqueIds.length) {
    await notificarUsuarios(uniqueIds, input);
  }
}
