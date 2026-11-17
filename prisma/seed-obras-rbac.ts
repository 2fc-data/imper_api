/* Seed RBAC do Plano B (B1) — permissões de obras.
   Uso: npx tsx prisma/seed-obras-rbac.ts   (idempotente: 2ª execução = mesma saída) */
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const PERMISSOES = [
  {
    chave: 'ver_obras',
    descricao: 'Ver obras, painel e comparação',
    categoria: 'obras',
  },
  {
    chave: 'editar_obra',
    descricao: 'Editar mestre da obra (etapas, atividades e sync)',
    categoria: 'obras',
  },
  {
    chave: 'criar_aditivo',
    descricao: 'Criar aditivo de obra',
    categoria: 'obras',
  },
  {
    chave: 'aprovar_aditivo',
    descricao: 'Aprovar ou recusar aditivo de obra',
    categoria: 'obras',
  },
  {
    chave: 'criar_execucao',
    descricao: 'Criar execução de atividades a partir de uma obra',
    categoria: 'execucao',
  },
];

// ADMIN/ADMINISTRATIVO recebe as 5 (inclui aprovar_aditivo); SUPERVISOR/SUPERVISOR OBRAS recebe 4 (sem aprovar_aditivo)
const VINCULOS: Record<string, string[]> = {
  ver_obras: [
    'ADMIN',
    'ADMINISTRATIVO',
    'SUPERVISOR',
    'SUPERVISOR OBRAS',
    'FINANCEIRO',
    'CONTABIL',
    'VENDAS',
    'ATENDIMENTO',
    'ALMOXARIFE',
    'COLABORADOR',
  ],
  editar_obra: ['ADMIN', 'ADMINISTRATIVO', 'SUPERVISOR', 'SUPERVISOR OBRAS'],
  criar_aditivo: [
    'ADMIN',
    'ADMINISTRATIVO',
    'SUPERVISOR',
    'SUPERVISOR OBRAS',
    'FINANCEIRO',
  ],
  aprovar_aditivo: ['ADMIN', 'ADMINISTRATIVO', 'FINANCEIRO'],
  criar_execucao: [
    'ADMIN',
    'ADMINISTRATIVO',
    'SUPERVISOR',
    'SUPERVISOR OBRAS',
    'ATENDIMENTO',
  ],
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
