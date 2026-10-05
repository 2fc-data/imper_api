/* Seed RBAC do Plano B (B1) — permissões de obras.
   Uso: npx tsx prisma/seed-obras-rbac.ts   (idempotente: 2ª execução = mesma saída) */
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const PERMISSOES = [
  {
    chave: 'ver_obras',
    descricao: 'Ver obras, painel e comparação',
    categoria: 'ordens_servico',
  },
  {
    chave: 'editar_obra',
    descricao: 'Editar mestre da obra (etapas, atividades e sync)',
    categoria: 'ordens_servico',
  },
  {
    chave: 'criar_aditivo',
    descricao: 'Criar aditivo de obra',
    categoria: 'ordens_servico',
  },
  {
    chave: 'aprovar_aditivo',
    descricao: 'Aprovar ou recusar aditivo de obra',
    categoria: 'ordens_servico',
  },
  {
    chave: 'criar_os',
    descricao: 'Criar ordem de serviço a partir de uma obra',
    categoria: 'ordens_servico',
  },
];

// ADMIN recebe as 5 (inclui aprovar_aditivo); SUPERVISOR recebe 4 (sem aprovar_aditivo)
const VINCULOS: Record<string, string[]> = {
  ver_obras: ['ADMIN', 'SUPERVISOR'],
  editar_obra: ['ADMIN', 'SUPERVISOR'],
  criar_aditivo: ['ADMIN', 'SUPERVISOR'],
  aprovar_aditivo: ['ADMIN'],
  criar_os: ['ADMIN', 'SUPERVISOR'],
};

async function main() {
  console.log('--- Permissões de obras (Plano B) ---');
  let vinculos = 0;
  for (const perm of PERMISSOES) {
    const registro = await p.permissao.upsert({
      where: { chave: perm.chave },
      update: { descricao: perm.descricao, categoria: perm.categoria },
      create: perm,
    });
    const papeis = await p.papelRbac.findMany({
      where: { nome: { in: VINCULOS[perm.chave] } },
    });
    for (const papel of papeis) {
      await p.papelPermissao.upsert({
        where: {
          papelId_permissaoId: { papelId: papel.id, permissaoId: registro.id },
        },
        create: { papelId: papel.id, permissaoId: registro.id },
        update: {},
      });
      vinculos++;
    }
    console.log(
      `  ${perm.chave} id=${registro.id} → ${papeis.map((x) => x.nome).join(', ')}`,
    );
  }
  console.log(`✅ ${PERMISSOES.length} permissões, ${vinculos} vínculos papel↔permissão.`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
