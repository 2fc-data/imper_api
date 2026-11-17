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

const LOCALIZACOES_EPI = [
  'Almoxarifado',
  'Oficina',
  'Escritório',
  'Obra – Obra 1',
  'Veículo',
  'Cliente',
];

async function main() {
  console.log('--- Sincronizando Marcas para EPI ---');
  for (const nome of MARCAS_EPI) {
    const existing = await p.marca.findFirst({
      where: { nome, tipoInsumo: 'EPI' },
    });
    if (!existing) {
      const rec = await p.marca.create({
        data: { nome, tipoInsumo: 'EPI', ativo: true },
      });
      console.log(`  + Marca EPI criada: ${rec.nome} (id=${rec.id})`);
    } else {
      console.log(`  = Marca EPI existente: ${existing.nome} (id=${existing.id})`);
    }
  }

  console.log('\n--- Sincronizando Localizações para EPI ---');
  for (const nome of LOCALIZACOES_EPI) {
    const existing = await p.localizacao.findFirst({
      where: { nome, tipoInsumo: 'EPI' },
    });
    if (!existing) {
      const rec = await p.localizacao.create({
        data: { nome, tipoInsumo: 'EPI', ativo: true },
      });
      console.log(`  + Localização EPI criada: ${rec.nome} (id=${rec.id})`);
    } else {
      console.log(`  = Localização EPI existente: ${existing.nome} (id=${existing.id})`);
    }
  }

  console.log('\n✅ Marcas e Localizações sincronizadas com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
