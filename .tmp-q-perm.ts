import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const per = await p.permissao.findMany({ where: { chave: { in: ['criar_os', 'aprovar_os', 'ver_obras'] } } });
  for (const x of per) {
    const links = await p.papelPermissao.findMany({ where: { permissaoId: x.id }, include: { papel: true } });
    console.log(x.id, x.chave, x.categoria, '→', links.map((l) => l.papel.nome).join(','));
  }
  await p.$disconnect();
}
main();
