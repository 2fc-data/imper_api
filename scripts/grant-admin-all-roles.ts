import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@imper.local' } });
  if (!user) throw new Error('admin@imper.local not found');
  console.log('User ID:', user.id, '| Nome:', user.nome);

  // Busca todos os papéis existentes
  const papeis = await prisma.papelRbac.findMany();
  console.log('Papéis disponíveis:', papeis.map((p) => p.nome).join(', '));

  // Remove atribuições existentes
  await prisma.usuarioPapel.deleteMany({ where: { userId: user.id } });

  // Atribui TODOS os papéis ao admin
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

  console.log('\n✅ Papéis atribuídos ao admin:', updated!.papeis.map((up) => up.papel.nome).join(', '));
  console.log('🔑 Total de permissões únicas:', allPerms.size);
  console.log('📋 Permissões:', [...allPerms].sort().join('\n  - '));
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
