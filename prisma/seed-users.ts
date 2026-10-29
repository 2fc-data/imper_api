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
  { id: 6, nome: 'Waldivino', email: 'waldivino@imper.local', papel: 'ALMOXARIFE, COLABORADOR, SUPERVISOR OBRAS' },
];


const PAPEL_ALIASES: Record<string, string> = { ADMIN: 'ADMINISTRATIVO' };

async function main() {
  for (const u of USERS) {
    let user = await p.user.findUnique({ where: { id: u.id } });
    if (user) {
      user = await p.user.update({
        where: { id: user.id },
        data: { nome: u.nome, email: u.email, ativo: true, senhaHash: SENHA_HASH },
      });
    } else {
      const byEmail = await p.user.findUnique({ where: { email: u.email } });
      if (byEmail) {
        user = await p.user.update({
          where: { id: byEmail.id },
          data: { nome: u.nome, ativo: true, senhaHash: SENHA_HASH },
        });
      } else {
        user = await p.user.create({
          data: { id: u.id, nome: u.nome, email: u.email, senhaHash: SENHA_HASH, ativo: true },
        });
      }
    }

    const nomes = u.papel
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((n) => PAPEL_ALIASES[n] ?? n);

    await p.usuarioPapel.deleteMany({ where: { userId: user.id } });
    for (const nome of nomes) {
      const papel = await p.papelRbac.findUnique({ where: { nome } });
      if (papel) {
        await p.usuarioPapel.create({ data: { userId: user.id, papelId: papel.id } });
      } else {
        console.warn(`  ⚠ papel não encontrado: ${nome} (rode seed-rbac)`);
      }
    }
    console.log(`✅ ${u.email} → ${u.papel}`);
  }
  console.log('\n🔑 Login: admin@imper.local / senha123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());
