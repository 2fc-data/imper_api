import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EMAIL = 'admin@imper.local';
const NOME = 'Admin Sistema';
const SENHA = 'admin123';

async function main() {
  console.log('=== Criar/Atualizar admin com todos os papéis ===\n');

  // Garante que os papéis existem
  const papeis = await prisma.papelRbac.findMany();
  if (papeis.length === 0) {
    throw new Error('Nenhum papel RBAC encontrado. Rode antes: npm run db:seed-rbac');
  }
  console.log(`Papéis disponíveis (${papeis.length}): ${papeis.map((p) => p.nome).join(', ')}\n`);

  // Upsert do usuário com a senha desejada
  const senhaHash = bcrypt.hashSync(SENHA, 10);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { nome: NOME, ativo: true, senhaHash },
    create: { nome: NOME, email: EMAIL, senhaHash, ativo: true },
  });
  console.log(`✅ Usuário: ${user.email} (id=${user.id}, ativo=${user.ativo})`);

  // Atribui TODOS os papéis
  await prisma.usuarioPapel.deleteMany({ where: { userId: user.id } });
  await prisma.usuarioPapel.createMany({
    data: papeis.map((papel) => ({ userId: user.id, papelId: papel.id })),
    skipDuplicates: true,
  });

  // Verifica o resultado
  const updated = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      papeis: {
        include: {
          papel: {
            include: { permissoes: { include: { permissao: true } } },
          },
        },
      },
    },
  });

  const allPerms = new Set<string>();
  for (const up of updated!.papeis) {
    for (const pp of up.papel.permissoes) {
      allPerms.add(pp.permissao.chave);
    }
  }

  console.log(`\n🔑 Papéis atribuídos (${updated!.papeis.length}): ${updated!.papeis.map((up) => up.papel.nome).join(', ')}`);
  console.log(`📋 Permissões únicas: ${allPerms.size}`);
  console.log(`\n✅ Login: ${EMAIL} / ${SENHA}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
