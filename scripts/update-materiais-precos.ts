import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const PRICE_LIST = [
  { nome: 'ALICATE', custoUnitario: 29.55 },
  { nome: 'APLICADOR DE MASSA (CELULOIDE)', custoUnitario: 2.31 },
  { nome: 'APLICADOR STARFER REFORÇADO', custoUnitario: 45.50 },
  { nome: 'BLOCO DE ESPUMA', custoUnitario: 4.80 },
  { nome: 'BROCHA RETANGULAR MAX', custoUnitario: 6.60 },
  { nome: 'BROCHA RETANGULAR TIGRE', custoUnitario: 9.80 },
  { nome: 'CABO PARA ROLO 23"', custoUnitario: 8.20 },
  { nome: 'CABOS DE MARRETA', custoUnitario: 5.54 },
  { nome: 'CHAVE DE FENDA EMBORRACHADA', custoUnitario: 8.45 },
  { nome: 'CHAVE PHILIPS EMBORRACHADA', custoUnitario: 8.45 },
  { nome: 'COLHER DE PEDREIRO 6"', custoUnitario: 14.90 },
  { nome: 'COLHER DE PEDREIRO 8"', custoUnitario: 16.19 },
  { nome: 'COLHER DE PEDRERO 7"', custoUnitario: 15.50 },
  { nome: 'CORDA DE RAPEL TIPO BOMBEIRO - 100M', custoUnitario: 449.00 },
  { nome: 'DESEMPENADEIRA PLASTICO 18 X 30', custoUnitario: 9.67 },
  { nome: 'DESEMPENADEIRA DENTADA', custoUnitario: 12.38 },
  { nome: 'DESINGRIPANTE', custoUnitario: 7.98 },
  { nome: 'DISCO DE CORTE INOX 4"', custoUnitario: 2.35 },
  { nome: 'DISCO DE CORTE INOX 7"', custoUnitario: 5.69 },
  { nome: 'DISCO DE DESBASTE 4"', custoUnitario: 8.15 },
  { nome: 'DISCO DE DESBASTE 7"', custoUnitario: 14.98 },
  { nome: 'DISCO DE POLIMENTO 4"', custoUnitario: null },
  { nome: 'DISCO DE SERRA', custoUnitario: 14.58 },
  { nome: 'DISCO DIAMANTADO SEGMENTADO 4" NORTON MAKITA', custoUnitario: 23.00 },
  { nome: 'DISCO DIAMANTADO SEGMENTADO 4" APARTA (22MM) LIXADEIRA', custoUnitario: 13.00 },
  { nome: 'DISCO DIAMANTADO TURBO 4" MAKITA', custoUnitario: 23.00 },
  { nome: 'DISCO DIAMANTADO TURBO 4" (22MM) SPARTA LIXADEIRA', custoUnitario: 13.00 },
  { nome: 'DISCO REBOLO DIAMANTADO SEGMENTADO', custoUnitario: 59.80 },
  { nome: 'ENFORCA GATO AMARELO 2,5 X 100 (50 UNI)', custoUnitario: 3.01 },
  { nome: 'ENFORCA GATO AZUL 2,5 X 100 (50 UNI)', custoUnitario: 3.01 },
  { nome: 'ENFORCA GATO VERDE 2,5 X 100 (50 UNI)', custoUnitario: 3.01 },
  { nome: 'ENFORCA GATO VERMELHO 2,5 X 100 (50 UNI)', custoUnitario: 3.01 },
  { nome: 'ESCOVA DE AÇO', custoUnitario: 5.35 },
  { nome: 'ESPÁTULA 10 CM TRAMONTINA', custoUnitario: 14.25 },
  { nome: 'ESPATULA 2CM PACETTA', custoUnitario: 22.00 },
  { nome: 'ESPATULA 4CM', custoUnitario: 12.98 },
  { nome: 'ESPÁTULA 6 CM', custoUnitario: 13.38 },
  { nome: 'ESPUMA EXPANSIVA', custoUnitario: 19.95 },
  { nome: 'ESQUADRO', custoUnitario: 17.45 },
  { nome: 'ESTILETE FERTAK PROFISSIONAL', custoUnitario: 6.98 },
  { nome: 'FACA nº 6', custoUnitario: 19.92 },
  { nome: 'FACA nº 7', custoUnitario: 21.00 },
  { nome: 'FACA nº 8', custoUnitario: 23.00 },
  { nome: 'FITA CREPE 18MM', custoUnitario: 4.89 },
  { nome: 'FITA CREPE 24MM', custoUnitario: 6.45 },
  { nome: 'FITA CREPE 48MM', custoUnitario: 12.21 },
  { nome: 'FITA ISOLANTE', custoUnitario: 3.48 },
  { nome: 'FITA ZEBRADA', custoUnitario: 10.48 },
  { nome: "FOLHA DE LIXA D'ÁGUA FINA", custoUnitario: 2.29 },
  { nome: "FOLHA DE LIXA DE D'AGUA GROSSA", custoUnitario: 1.48 },
  { nome: "FOLHA DE LIXA DE D'ÁGUA MÉDIA", custoUnitario: 1.39 },
  { nome: 'FOLHA DE LIXA DE FERRO FINA', custoUnitario: 2.49 },
  { nome: 'FOLHA DE LIXA DE FERRO GROSSA', custoUnitario: 3.30 },
  { nome: 'FOLHA DE LIXA DE FERRO MÉDIA', custoUnitario: 2.29 },
  { nome: 'FOLHA DE LIXA DE PAREDE FINA', custoUnitario: 0.88 },
  { nome: 'FOLHA DE LIXA DE PAREDE GROSSA', custoUnitario: 0.96 },
  { nome: 'FOLHA DE LIXA DE PAREDE MÉDIA', custoUnitario: 0.88 },
  { nome: 'JOGO CHAVE ALLEN', custoUnitario: 19.00 },
  { nome: 'LÂMINAS DE ESTILETE C/ 10 CADA CAIXINHA', custoUnitario: 3.50 },
  { nome: 'LÁPIS DE PEDREIRO', custoUnitario: 1.90 },
  { nome: 'LINHA DE PEDREIRO 100 MTS', custoUnitario: 4.80 },
  { nome: 'LIXA 4" FINA', custoUnitario: 2.39 },
  { nome: 'LIXA 4" GROSSA', custoUnitario: 2.39 },
  { nome: 'LIXA 7" FINA', custoUnitario: 4.30 },
  { nome: 'LIXA 7" GROSSA', custoUnitario: 4.30 },
  { nome: 'LIXA 7" MÉDIA', custoUnitario: 4.30 },
  { nome: 'LIXA DE METRO GROSSA', custoUnitario: 4.50 },
  { nome: 'LONA PRETA 4 X 100', custoUnitario: 255.00 },
  { nome: 'MARRETA', custoUnitario: 32.40 },
  { nome: 'MARTELO', custoUnitario: 26.45 },
  { nome: 'MISTURADOR FURADEIRA 40 CM', custoUnitario: 22.00 },
  { nome: 'MISTURADOR FURADEIRA 60 CM', custoUnitario: 32.00 },
  { nome: 'PINCEL 1"', custoUnitario: 2.87 },
  { nome: 'PINCEL 2"', custoUnitario: 5.31 },
  { nome: 'PINCEL 3"', custoUnitario: 10.52 },
  { nome: 'PINO FÊMEA 20A', custoUnitario: 4.22 },
  { nome: 'PINO FÊMEA 20A', custoUnitario: 7.40 },
  { nome: 'PINO MACHO 10A', custoUnitario: 3.20 },
  { nome: 'PINO MACHO 10A', custoUnitario: 9.00 },
  { nome: 'PONTEIRA', custoUnitario: 7.55 },
  { nome: 'PREGO 17X21', custoUnitario: 18.50 },
  { nome: 'PREGO 18X30', custoUnitario: 18.50 },
  { nome: 'RISCADORES DE FORMICA', custoUnitario: 23.90 },
  { nome: 'RODO PLASTICO 40 CM', custoUnitario: 8.40 },
  { nome: 'ROLO DE ESPUMA 05CM', custoUnitario: 3.00 },
  { nome: 'ROLO DE ESPUMA 09CM', custoUnitario: 3.40 },
  { nome: 'ROLO DE ESPUMA 15CM', custoUnitario: 4.80 },
  { nome: 'ROLO DE ESPUMA 23CM', custoUnitario: 7.80 },
  { nome: 'ROLO DE LÃ RESPINGO ZERO 05CM', custoUnitario: 3.20 },
  { nome: 'ROLO DE LÃ RESPINGO ZERO 09CM', custoUnitario: 4.50 },
  { nome: 'ROLO DE LÃ RESPINGO ZERO 15CM', custoUnitario: 7.50 },
  { nome: 'ROLO DE LÃ RESPINGO ZERO 23CM', custoUnitario: 9.24 },
  { nome: 'ROLO DE LÃ SINTETICA 05CM NÃO ESTAMOS PEDINDO', custoUnitario: null },
  { nome: 'ROLO DE LÃ SINTETICA 09CM NÃO ESTAMOS PEDINDO', custoUnitario: null },
  { nome: 'ROLO DE LÃ SINTETICA 15CM NÃO ESTAMOS PEDINDO', custoUnitario: null },
  { nome: 'ROLO DE LÃ SINTETICA 23CM', custoUnitario: 9.24 },
  { nome: 'ROLO DE LÃ TIGRE 23CM (FELPUDO) 1328', custoUnitario: 48.00 },
  { nome: 'ROLO EPOXI 23CM', custoUnitario: 14.50 },
  { nome: 'SERRINHA', custoUnitario: 14.50 },
  { nome: 'TALHADEIRA', custoUnitario: 7.55 },
  { nome: 'TALHADEIRA LÂMINA', custoUnitario: 9.80 },
  { nome: 'TESOURA 7 3/4', custoUnitario: 12.30 },
  { nome: 'THINNER', custoUnitario: 143.90 },
  { nome: 'TOMADA', custoUnitario: 4.15 },
  { nome: 'TORQUES 12 SÃO ROMÃO', custoUnitario: 39.80 },
  { nome: 'TRENA 5 METROS', custoUnitario: 15.50 },
  { nome: 'VASSOURA DE PIAÇAVA', custoUnitario: 22.00 },
];

function norm(nome: string): string {
  return nome
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const rollback = process.argv.includes('--rollback');

  if (rollback) {
    console.log('Rollback not implemented for materials price update.');
    return;
  }

  // ── Dry run check ────────────────────────────────────────────────
  if (dryRun) {
    console.log('🔍 DRY RUN MODE — nenhuma alteração será feita no banco.\n');
  }

  // ── Backup current values ─────────────────────────────────────────
  const allMaterials = await p.material.findMany({
    select: { id: true, nome: true, custoUnitario: true },
  });

  const backupFile = 'scripts/.materiais-precos-backup.json';
  const fs = await import('fs');
  if (!dryRun) {
    fs.writeFileSync(backupFile, JSON.stringify(allMaterials, null, 2));
    console.log(`💾 Backup salvo em ${backupFile}\n`);
  }

  // ── Build lookup map ──────────────────────────────────────────────
  const existingMap: Record<
    string,
    { id: number; nome: string; custoUnitario: number | null }
  > = {};
  for (const m of allMaterials) {
    existingMap[norm(m.nome)] = {
      id: m.id,
      nome: m.nome,
      custoUnitario: m.custoUnitario,
    };
  }

  console.log(`Total materiais no banco: ${allMaterials.length}`);
  console.log(`Total itens na lista de preços: ${PRICE_LIST.length}\n`);

  let atualizados = 0;
  let ignorados = 0;
  let semPreco = 0;
  const naoEncontrados: string[] = [];

  // ── Process each item ─────────────────────────────────────────────
  for (const item of PRICE_LIST) {
    const key = norm(item.nome);
    const match = existingMap[key];

    if (!match) {
      console.log(`⚠️  SKIP: "${item.nome}" — não encontrado no banco`);
      ignorados++;
      naoEncontrados.push(item.nome);
      continue;
    }

    // Item has no price in the list
    if (item.custoUnitario === null) {
      console.log(`ℹ️  ${match.nome} — sem preço (será setado NULL)`);
      if (!dryRun) {
        await p.material.update({
          where: { id: match.id },
          data: { custoUnitario: null },
        });
        console.log(`   → ${match.nome}.custoUnitario = NULL`);
      } else {
        console.log(`   (dry-run) would set ${match.nome}.custoUnitario = null`);
      }
      semPreco++;
      atualizados++;
      continue;
    }

    // Already has correct price
    if (match.custoUnitario === item.custoUnitario) {
      console.log(`✅ ${match.nome} — já tem o preço correto (${item.custoUnitario})`);
      atualizados++;
      continue;
    }

    // Update price
    if (dryRun) {
      console.log(
        `   (dry-run) ${match.nome}: ${match.custoUnitario ?? 'NULL'} → ${item.custoUnitario}`,
      );
      atualizados++;
      continue;
    }

    await p.material.update({
      where: { id: match.id },
      data: { custoUnitario: item.custoUnitario },
    });
    console.log(
      `✅ Atualizado: ${match.nome} de ${match.custoUnitario ?? 'NULL'} para ${item.custoUnitario}`,
    );
    atualizados++;
  }

  // ── Summary ───────────────────────────────────────────────────────
  console.log(`
📊 Resumo:
- Total de itens na lista: ${PRICE_LIST.length}
- Atualizados: ${atualizados}
- Ignorados (não encontrados): ${ignorados}
- Sem preço (NULL): ${semPreco}
`);

  if (naoEncontrados.length > 0) {
    console.log('\nItens não encontrados no banco:');
    naoEncontrados.forEach((n) => console.log(`  - ${n}`));
  }

  await p.$disconnect();
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  });