import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const TIPOS_PADRAO = [
  {
    nome: 'Copa e Limpeza / Supermercado',
    descricao:
      'Itens de consumo contínuo para copa, cozinha e limpeza da empresa',
    requerObra: false,
    ordem: 1,
  },
  {
    nome: 'Alimentação em Obra',
    descricao: 'Despesas com refeições, lanches e água na execução da obra',
    requerObra: true,
    ordem: 2,
  },
  {
    nome: 'Transporte e Combustível',
    descricao:
      'Despesas extras com combustível, pedágios e estacionamentos para obras',
    requerObra: true,
    ordem: 3,
  },
  {
    nome: 'Hospedagem e Diárias',
    descricao: 'Hospedagem e diárias para equipes deslocadas',
    requerObra: true,
    ordem: 4,
  },
];

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
    console.log('Rollback: removendo despesas extras e tipos...');
    const delItens = await p.material.deleteMany({
      where: { tipo: 'DESPESAS_EXTRAS', nome: { in: ITENS } },
    });
    console.log(`Removidos: ${delItens.count} itens de despesas extras`);

    const delTipos = await p.tipoDespesa.deleteMany({
      where: { nome: { in: TIPOS_PADRAO.map((t) => t.nome) } },
    });
    console.log(`Removidos: ${delTipos.count} tipos de despesas`);
    return;
  }

  console.log('--- Tipos de Despesas Extras ---');
  const tiposMap = new Map<string, number>();
  for (const t of TIPOS_PADRAO) {
    const tipo = await p.tipoDespesa.upsert({
      where: { nome: t.nome },
      create: {
        nome: t.nome,
        descricao: t.descricao,
        requerObra: t.requerObra,
        ativo: true,
        ordem: t.ordem,
      },
      update: {
        descricao: t.descricao,
        requerObra: t.requerObra,
        ordem: t.ordem,
      },
    });
    tiposMap.set(t.nome, tipo.id);
    console.log(`  🏷️  Tipo: ${t.nome} (ID: ${tipo.id}, requerObra: ${t.requerObra})`);
  }

  // Garante unidade de medida padrão
  const um = await p.unidadeMedida.upsert({
    where: { nome: 'UNIDADE' },
    create: { nome: 'UNIDADE' },
    update: {},
  });

  const tipoCopaId = tiposMap.get('Copa e Limpeza / Supermercado')!;

  console.log(`\n--- Itens de Despesas Extras (${ITENS.length}) ---`);
  let criados = 0;
  let existentes = 0;

  for (const nome of ITENS) {
    const existing = await p.material.findFirst({
      where: { nome, tipo: 'DESPESAS_EXTRAS' },
    });
    if (existing) {
      if (!existing.tipoDespesaId) {
        await p.material.update({
          where: { id: existing.id },
          data: { tipoDespesaId: tipoCopaId },
        });
      }
      existentes++;
      console.log(`  ⏭  ${nome} [existente]`);
      continue;
    }
    await p.material.create({
      data: {
        nome,
        tipo: 'DESPESAS_EXTRAS',
        unidadeId: um.id,
        tipoDespesaId: tipoCopaId,
        quantidadeMinima: 1,
        status: 'ATIVO',
        saldo: { create: { saldo: 0 } },
      },
    });
    criados++;
    console.log(`  ✅ ${nome}`);
  }

  console.log(`\n✅ Seed despesas extras concluído: ${criados} criados, ${existentes} já existiam.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
