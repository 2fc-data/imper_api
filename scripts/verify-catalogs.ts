import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function count(label: string, fn: () => Promise<number>) {
  const n = await fn();
  console.log(`  ${label.padEnd(34)} ${n}`);
  return n;
}

async function main() {
  console.log('--- Contagens dos catálogos ---');
  await count('categoriaEpi', () => p.categoriaEpi.count());
  await count('categoriaEquipamento', () => p.categoriaEquipamento.count());
  await count('categoriaMaterial', () => p.categoriaMaterial.count());
  await count('subcategoriaEpi', () => p.subcategoriaEpi.count());
  await count('subcategoriaEquipamento', () =>
    p.subcategoriaEquipamento.count(),
  );
  await count('subcategoriaMaterial', () => p.subcategoriaMaterial.count());
  await count('localizacao', () => p.localizacao.count());
  await count('estadoConservacao', () => p.estadoConservacao.count());
  await count('statusEquipamento', () => p.statusEquipamento.count());
  await count('tipoManutencao', () => p.tipoManutencao.count());
  await count('unidadeMedida', () => p.unidadeMedida.count());
  await count('marca', () => p.marca.count());
  await count('fornecedor', () => p.fornecedor.count());

  console.log('--- Dados operacionais ---');
  await count('etapa', () => p.etapa.count());
  await count('subServico', () => p.subServico.count());
  await count('veiculo', () => p.veiculo.count());
  await count('material', () => p.material.count());
  await count('epi', () => p.epi.count());
  await count('equipamento', () => p.equipamento.count());
  await count('verbo', () => p.verbo.count());
  await count('objeto', () => p.objeto.count());
  await count('localObra', () => p.localObra.count());
  await count('caracteristica', () => p.caracteristica.count());

  console.log('--- RBAC ---');
  await count('papelRbac', () => p.papelRbac.count());
  const admin = await p.user.findUnique({
    where: { email: 'admin@imper.local' },
    include: { papeis: { include: { papel: true } } },
  });
  console.log(
    `  admin@imper.local: ${admin ? `id=${admin.id} papeis=[${admin.papeis.map((x) => x.papel.nome).join(', ')}]` : 'AUSENTE'}`,
  );
  const gerenciar = await p.permissao.findUnique({
    where: { chave: 'gerenciar_catalogo' },
    include: { papeis: { include: { papel: true } } },
  });
  console.log(
    `  gerenciar_catalogo papeis: [${gerenciar?.papeis.map((x) => x.papel.nome).join(', ') ?? '—'}]`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => p.$disconnect());
