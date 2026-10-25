import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

function normalize(str: string) {
  return str
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Dados brutos (deduped por descricao normalizada) ──────────────
const RAW: { descricao: string; patrimonio: string }[] = [
  { descricao: 'TRAVA-QUEDAS', patrimonio: '175' },
  { descricao: 'TRAVA-QUEDAS (PARA CABO DE AÇO)', patrimonio: '25' },
  { descricao: 'TRAVA-QUEDAS (PARA CABO DE AÇO)', patrimonio: '26' },
  { descricao: 'TRAVA-QUEDAS (PARA CABO DE AÇO)', patrimonio: '260' },
  { descricao: 'TRAVA-QUEDAS (PARA CABO DE AÇO)', patrimonio: '261' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA - BRANCO)', patrimonio: '6' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA - RETRÁTIL)', patrimonio: '259' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA - RETRÁTIL)', patrimonio: '387' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA - RETRÁTIL)', patrimonio: '490' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA)', patrimonio: '177' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA)', patrimonio: '262' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA)', patrimonio: '264' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA)', patrimonio: '265' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA)', patrimonio: '268' },
  { descricao: 'TRAVA-QUEDAS (PARA CORDA)', patrimonio: '491' },
];

async function main() {
  console.log('--- Inserindo equipamentos TRAVE-QUEDAS ---');

  const seen = new Set<string>();
  let criados = 0;
  let pulados = 0;

  for (const item of RAW) {
    const key = normalize(item.descricao);
    if (seen.has(key)) {
      pulados++;
      continue;
    }

    // Verifica se ja existe no banco (com ou sem patrimonio)
    const existing = await p.equipamento.findFirst({
      where: { descricao: key },
    });

    if (existing) {
      pulados++;
      console.log(`  Pulado (${existing.codigo}): ${existing.descricao}`);
      continue;
    }

    seen.add(key);

    await p.equipamento.create({
      data: {
        codigo: `EQP-${String(criados + 1).padStart(3, '0')}`,
        descricao: item.descricao.toUpperCase(),
        numeroPatrimonio: item.patrimonio,
        statusId: 1, // DISPONÍVEL = ordem 1
        unidadeMedidaId: 1, // UNIDADE
      },
    });
    criados++;
    console.log(`  Criado EQP-${String(criados).padStart(3, '0')}: ${item.descricao} | Patr: ${item.patrimonio}`);
  }

  console.log(`\n✅ Seed equipamentos TRAVE-QUEDAS: ${criados} criados, ${pulados} pulados/duplicados.`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
