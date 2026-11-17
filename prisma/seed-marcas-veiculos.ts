import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const MONTADORAS_VEICULOS = [
  'Fiat',
  'Volkswagen',
  'Chevrolet',
  'Ford',
  'Toyota',
  'Renault',
  'Hyundai',
  'Honda',
  'Nissan',
  'Jeep',
  'Mitsubishi',
  'Peugeot',
  'Citroën',
  'Mercedes-Benz',
  'Iveco',
  'Scania',
  'Volvo',
  'BYD',
  'Caoa Chery',
  'RAM',
  'BMW',
  'Audi',
  'Kia',
];

async function main() {
  console.log('--- Sincronizando Marcas de Veículos ---');

  // 1. Reativar Volkswagen se existir
  await p.marca.updateMany({
    where: { nome: { in: ['VOLKSWAGEN', 'Volkswagen'] }, tipoInsumo: 'VEICULO' },
    data: { ativo: true },
  });

  // 2. Upsert/create montadoras
  let adicionadas = 0;
  for (const nome of MONTADORAS_VEICULOS) {
    const existing = await p.marca.findFirst({
      where: {
        nome: { equals: nome },
        tipoInsumo: 'VEICULO',
      },
    });

    if (!existing) {
      // Checa case-insensitive
      const existingCase = await p.marca.findFirst({
        where: {
          tipoInsumo: 'VEICULO',
          nome: { equals: nome.toUpperCase() },
        },
      });
      if (existingCase) {
        await p.marca.update({
          where: { id: existingCase.id },
          data: { ativo: true },
        });
        console.log(`  = Marca existente reativada: ${existingCase.nome} (id=${existingCase.id})`);
        continue;
      }

      const rec = await p.marca.create({
        data: { nome, tipoInsumo: 'VEICULO', ativo: true },
      });
      adicionadas++;
      console.log(`  + Marca de veículo criada: ${rec.nome} (id=${rec.id})`);
    } else {
      if (!existing.ativo) {
        await p.marca.update({ where: { id: existing.id }, data: { ativo: true } });
        console.log(`  = Marca existente reativada: ${existing.nome} (id=${existing.id})`);
      } else {
        console.log(`  = Marca já existente e ativa: ${existing.nome} (id=${existing.id})`);
      }
    }
  }

  console.log(`\n✅ Concluído: ${adicionadas} novas marcas de veículos cadastradas.`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
