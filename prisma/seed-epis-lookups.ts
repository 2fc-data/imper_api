import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const MARCAS_EPI = [
  '3M',
  'Danny',
  'Delta Plus',
  'Volk',
  'Kalipso',
  'Marluvas',
  'Bracol',
  'Carbografite',
  'MSA',
  'Protercap',
  'Soft Works',
  'Plasticor',
  'Feruni',
];

  console.log('\n✅ Marcas sincronizadas com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
