import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Migração: Categorias EPI → tabelas novas   │');
  console.log('└─────────────────────────────────────────────┘\n');

  // ── 1. Identificar categorias EPI antigas (ids 1-8) ──────────
  const categoriasEpiAntigas = await prisma.$queryRawUnsafe<
    { id: number; nome: string; descricao: string | null; ativo: number; ordem: number }[]
  >(
    `SELECT id, nome, descricao, ativo, ordem
     FROM categorias_equipamentos
     WHERE id BETWEEN 1 AND 8
     ORDER BY id`,
  );

  console.log(`Categorias EPI encontradas: ${categoriasEpiAntigas.length}`);
  for (const c of categoriasEpiAntigas) {
    console.log(`  ${c.id}. ${c.nome} (ordem=${c.ordem})`);
  }

  if (categoriasEpiAntigas.length === 0) {
    console.log('\n⚠️  Nenhuma categoria EPI encontrada. Abortando.');
    return;
  }

  // ── 2. Criar categorias na nova tabela ────────────────────────
  const idMap = new Map<number, number>(); // idAntigo → idNovo

  for (const cat of categoriasEpiAntigas) {
    const nova = await prisma.categoriaEpi.create({
      data: {
        nome: cat.nome,
        descricao: cat.descricao,
        ativo: cat.ativo === 1,
        ordem: cat.ordem,
      },
    });
    idMap.set(cat.id, nova.id);
    console.log(`  ✓ Categoria "${cat.nome}": ${cat.id} → ${nova.id}`);
  }

  // ── 3. Migrar subcategorias ──────────────────────────────────
  const subcatsAntigas = await prisma.$queryRawUnsafe<
    { id: number; categoriaId: number; nome: string; descricao: string | null; ativo: number; ordem: number }[]
  >(
    `SELECT id, categoriaId, nome, descricao, ativo, ordem
     FROM subcategorias_equipamentos
     WHERE categoriaId IN (${categoriasEpiAntigas.map((c) => c.id).join(',')})
     ORDER BY id`,
  );

  console.log(`\nSubcategorias EPI encontradas: ${subcatsAntigas.length}`);
  const subIdMap = new Map<number, number>();

  for (const sub of subcatsAntigas) {
    const novaCatId = idMap.get(sub.categoriaId);
    if (!novaCatId) {
      console.log(`  ⚠️  Subcategoria "${sub.nome}" (catId=${sub.categoriaId}) sem mapeamento — ignorando`);
      continue;
    }
    const nova = await prisma.subcategoriaEpi.create({
      data: {
        categoriaId: novaCatId,
        nome: sub.nome,
        descricao: sub.descricao,
        ativo: sub.ativo === 1,
        ordem: sub.ordem,
      },
    });
    subIdMap.set(sub.id, nova.id);
    console.log(`  ✓ Subcategoria "${sub.nome}": ${sub.id} → ${nova.id}`);
  }

  // ── 4. Atualizar referências nos registros Epi ───────────────
  const epis = await prisma.epi.findMany({
    where: {
      OR: [
        { categoriaId: { in: categoriasEpiAntigas.map((c) => c.id) } },
        { subcategoriaId: { in: subcatsAntigas.map((s) => s.id) } },
      ],
    },
    select: { id: true, categoriaId: true, subcategoriaId: true },
  });

  console.log(`\nRegistros Epi para atualizar: ${epis.length}`);

  for (const epi of epis) {
    const updates: Record<string, number> = {};
    if (epi.categoriaId && idMap.has(epi.categoriaId)) {
      updates.categoriaId = idMap.get(epi.categoriaId)!;
    }
    if (epi.subcategoriaId && subIdMap.has(epi.subcategoriaId)) {
      updates.subcategoriaId = subIdMap.get(epi.subcategoriaId)!;
    }
    if (Object.keys(updates).length > 0) {
      await prisma.epi.update({ where: { id: epi.id }, data: updates });
      console.log(`  ✓ EPI id=${epi.id}: ${JSON.stringify(updates)}`);
    }
  }

  // ── 5. Resumo ────────────────────────────────────────────────
  const totalCategorias = await prisma.categoriaEpi.count();
  const totalSubcats = await prisma.subcategoriaEpi.count();

  console.log(`\n┌─────────────────────────────────────────────┐`);
  console.log(`│  Migração concluída                         │`);
  console.log(`│  Categorias EPI: ${String(totalCategorias).padStart(3)}                         │`);
  console.log(`│  Subcategorias:  ${String(totalSubcats).padStart(3)}                         │`);
  console.log(`└─────────────────────────────────────────────┘`);
}

main()
  .catch((e) => {
    console.error('Erro na migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
