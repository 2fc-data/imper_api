import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

async function main() {
  const sql = readFileSync(
    new URL('./migrations/20261019000000_add_colaborador_registro_km/migration.sql', import.meta.url),
    'utf8',
  ).trim();
  for (const stmt of sql.split(/;\s*\n/)) {
    const s = stmt.replace(/;$/, '').trim();
    if (!s) continue;
    console.log('→', s.slice(0, 80) + '...');
    await prisma.$executeRawUnsafe(s);
  }
  console.log('OK: migracao aplicada');
}

main()
  .catch((e) => {
    console.error('ERRO:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
