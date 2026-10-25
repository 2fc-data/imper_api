const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const units = await p.unidadeMedida.findMany();
  const suppliers = await p.fornecedor.findMany();
  
  console.log('=== UNIDADES ===');
  units.forEach(u => console.log(`- ${u.nome} (id=${u.id})`));
  
  console.log('\n=== FORNECEDORES ===');
  suppliers.forEach(f => console.log(`- ${f.nome} (id=${f.id})`));
}

main().finally(() => p.$disconnect());
