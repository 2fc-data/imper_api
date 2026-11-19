import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const BACKUP_FILE = path.resolve(
  import.meta.dirname,
  '.epis-precos-backup.json',
);

function normalize(str: string) {
  return str
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Atualizacao {
  nome: string;
  preco: number | null;
  notas?: string;
}

const ATUALIZACOES: Atualizacao[] = [
  { nome: 'BOTINA DE SEGURANÇA C/ BIQUEIRA', preco: 85.0 },
  { nome: 'JOELHEIRA DE PROTEÇÃO', preco: 36.83 },
  { nome: 'LUVA NITRÍLICA', preco: 10.36 },
  { nome: 'LUVA PRETA (PU – MULTITÁTIL – KALIPSO)', preco: 5.2 },
  { nome: 'LUVA VAQUETA', preco: 19.3 },
  { nome: 'MÁSCARA PFFI', preco: 2.22 },
  { nome: 'MÁSCARA PFFII', preco: 2.22 },
  { nome: 'ÓCULOS DE PROTEÇÃO ESCURO (MEDIX)', preco: 4.51 },
  { nome: 'ÓCULOS DE PROTEÇÃO ESCURO (VVISION 100 - VOLK)', preco: 4.51 },
  { nome: 'ÓCULOS DE PROTEÇÃO TRANSPARENTE (MEDIX)', preco: 4.51 },
  { nome: 'ÓCULOS DE PROTEÇÃO TRANSPARENTE (VVISION 100 - VOLK)', preco: 4.51 },
  { nome: 'PROTETOR AUDITIVO', preco: 1.8 },
  { nome: 'PROTETOR FACIAL INCOLOR', preco: 32.0 },
  {
    nome: 'RESPIRADOR PURIFICADOR (MIG 12 VO – DESTRA)',
    preco: 52.0,
    notas: 'Mapeado de "Respirador Purificador MIG c/ dois filtros"',
  },
  {
    nome: 'RESPIRADOR/PURIFICADOR (MIG – MASTT - ALLTEC)',
    preco: 32.8,
    notas: 'Mapeado de "Respirador Purificador MIG c/ um filtro"',
  },
  { nome: 'CARNEIRA', preco: 6.45 },
  { nome: 'FILTRO PARA RESPIRADOR MIG', preco: 17.45 },
  {
    nome: 'PROTETOR AURICULAR TIPO CONCHA (ABAFADOR – KALIPSO – K40)',
    preco: 16.38,
  },
  { nome: 'PROTETOR LOMBAR', preco: 69.0 },
];

const IGNORADOS_SEM_PRECO = [
  'MÁSCARA PFFIII',
  'ACRÍLICO PARA PROTETOR FACIAL',
  'PROTETOR SOLAR',
];

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rollback = args.includes('--rollback');

  if (rollback) {
    console.log('--- ROLLBACK: restaurando custoUnitario anterior ---');
    if (!fs.existsSync(BACKUP_FILE)) {
      console.error(
        'Arquivo de backup não encontrado. Execute primeiro sem --rollback.',
      );
      process.exit(1);
    }
    const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
    let restaurados = 0;
    for (const [codigo, oldValue] of Object.entries(backup)) {
      await p.epi.update({
        where: { codigo: String(codigo) },
        data: { custoUnitario: oldValue as number | null },
      });
      restaurados++;
      console.log(`  Restaurado ${codigo}: custoUnitario = ${oldValue}`);
    }
    fs.unlinkSync(BACKUP_FILE);
    console.log(`\n✅ Rollback concluído: ${restaurados} EPIs restaurados.`);
    return;
  }

  console.log(`--- ${dryRun ? 'DRY RUN' : 'ATUALIZANDO'} preços de EPIs ---\n`);

  const allEpis = await p.epi.findMany({
    where: { ativo: true },
    select: { id: true, codigo: true, nome: true, custoUnitario: true },
  });

  const epiByNormName = new Map<string, (typeof allEpis)[0]>();
  for (const epi of allEpis) {
    const key = normalize(epi.nome);
    if (!epiByNormName.has(key)) {
      epiByNormName.set(key, epi);
    } else {
      console.warn(
        `  ⚠️  Nome duplicado normalizado: "${epi.nome}" (${epi.codigo}) — usando o primeiro encontrado`,
      );
    }
  }

  const backup: Record<string, number | null> = {};
  let atualizados = 0;
  let jaAtuais = 0;
  let naoEncontrados = 0;

  for (const at of ATUALIZACOES) {
    const key = normalize(at.nome);
    const epi = epiByNormName.get(key);

    if (!epi) {
      console.log(`  ❌ NÃO ENCONTRADO: "${at.nome}"`);
      naoEncontrados++;
      continue;
    }

    const oldValue = epi.custoUnitario;
    const newValue = at.preco;

    if (oldValue !== null && Number(oldValue) === newValue) {
      console.log(
        `  =  Já atualizado: ${epi.codigo} - ${epi.nome} (${oldValue})`,
      );
      jaAtuais++;
      continue;
    }

    if (!dryRun) {
      await p.epi.update({
        where: { id: epi.id },
        data: { custoUnitario: newValue },
      });
    }
    backup[epi.codigo] = oldValue;

    const nota = at.notas ? `  // ${at.notas}` : '';
    console.log(
      `  ${dryRun ? '→' : '✓'} ${epi.codigo} - ${epi.nome}: ${oldValue ?? 'NULL'} → ${newValue}${nota}`,
    );
    atualizados++;
  }

  console.log('\n--- Itens sem preço informado (mantidos como NULL) ---');
  for (const nome of IGNORADOS_SEM_PRECO) {
    const key = normalize(nome);
    const epi = epiByNormName.get(key);
    if (epi) {
      console.log(
        `  - ${epi.codigo} - ${epi.nome} (custoUnitario = ${epi.custoUnitario ?? 'NULL'})`,
      );
    } else {
      console.log(`  ⚠️  Não encontrado no seed: "${nome}"`);
    }
  }

  if (!dryRun && atualizados > 0) {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2));
    console.log(`\n💾 Backup salvo em: ${BACKUP_FILE}`);
    console.log(
      '   Para reverter: npx tsx scripts/update-epis-precos.ts --rollback',
    );
  }

  console.log(`\n${dryRun ? 'DRY RUN' : '✅'} Concluído:`);
  console.log(`  Atualizados: ${atualizados}`);
  console.log(`  Já atuais:   ${jaAtuais}`);
  console.log(`  Não encontrados: ${naoEncontrados}`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
