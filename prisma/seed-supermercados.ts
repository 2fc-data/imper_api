import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const ITENS = [
  'SABONETE LIQUIDO',
  'DESINFETANTE',
  'DETERGENTE',
  'SACO DE LIXO 100 LITROS',
  'PANO DE CHÃO',
  'CAFÉ 500G',
  'MANTEIGA 500G',
  'PAPEL TOALHA',
  'FILTRO DE PAPEL 103',
  'PALHA DE AÇO',
  'BUCHA DE COZINHA C/4 UNIDADE',
  'SAPÓLIO',
  'AÇUCAR CRISTAL 5KG',
  'COLHERZINHA DE CAFÉ',
  'PERFEX',
  'ÁGUA SANITÁRIA 2 LITROS',
  'AZULLIM TIRA LIMO',
  'PAPEL HIGIÊNICO',
  'INSETICIDA SPRAY',
  'ÁLCOOL GEL',
  'ÁLCOOL MÍNIMO 70%',
  'COPO DESCARTÁVEL 50ml',
  'COPO DESCARTÁVEL 300ml',
  'LÂMPADA COMUM',
];

async function main() {
  const rollback = process.argv.includes('--rollback');

  if (rollback) {
    console.log('Rollback: removendo supermercados...');
    const del = await p.material.deleteMany({
      where: { tipo: 'SUPERMERCADO', nome: { in: ITENS } },
    });
    console.log(`Removidos: ${del.count} itens`);
    return;
  }

  // Garante unidade de medida padrão
  const um = await p.unidadeMedida.upsert({
    where: { nome: 'UNIDADE' },
    create: { nome: 'UNIDADE' },
    update: {},
  });

  console.log(`--- Supermercados (${ITENS.length}) ---`);
  let criados = 0;
  let existentes = 0;

  for (const nome of ITENS) {
    const existing = await p.material.findFirst({
      where: { nome, tipo: 'SUPERMERCADO' },
    });
    if (existing) {
      existentes++;
      console.log(`  ⏭  ${nome} [existente]`);
      continue;
    }
    await p.material.create({
      data: {
        nome,
        tipo: 'SUPERMERCADO',
        unidadeId: um.id,
        quantidadeMinima: 1,
        status: 'ATIVO',
        saldo: { create: { saldo: 0 } },
      },
    });
    criados++;
    console.log(`  ✅ ${nome}`);
  }

  console.log(`\n✅ Seed supermercados: ${criados} criados, ${existentes} já existiam.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
