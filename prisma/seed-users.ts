import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const p = new PrismaClient();

const SENHA_HASH = bcrypt.hashSync('senha123', 10);

const USERS = [
  { id: 1, nome: 'Admin Sistema', email: 'admin@imper.local', papel: 'ADMIN' },
  { id: 2, nome: 'Rodrigo Carvalho', email: 'rodrigo@imper.local', papel: 'ADMIN' },
  { id: 3, nome: 'Leila', email: 'leila@imper.local', papel: 'CONTABIL, FINANCEIRO' },
  { id: 4, nome: 'Priscila', email: 'priscila@imper.local', papel: 'ALMOXARIFE, ATENDIMENTO, FINANCEIRO, VENDAS' },
  { id: 5, nome: 'Fernando', email: 'fernando@imper.local', papel: 'ALMOXARIFE' },
];


async function main() {
  for (const u of USERS) {
    const user = await p.user.upsert({
      where: { email: u.email },
      update: { nome: u.nome, ativo: true, senhaHash: SENHA_HASH },
      create: { id: u.id, nome: u.nome, email: u.email, senhaHash: SENHA_HASH, ativo: true },
    });

    const papel = await p.papelRbac.findUnique({ where: { nome: u.papel } });
    if (papel) {
      await p.usuarioPapel.deleteMany({ where: { userId: user.id } });
      await p.usuarioPapel.create({ data: { userId: user.id, papelId: papel.id } });
    }
    console.log(`✅ ${u.email} → ${u.papel}`);
  }
  console.log('\n🔑 Login: admin@imper.local / senha123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());
