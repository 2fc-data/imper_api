/**
 * Seed de cadastros gerais — categorias (EPI, equipamento, material),
 * localizações e estados de conservação.
 * Idempotente: pode ser rodado múltiplas vezes sem duplicar registros.
 *
 * Uso: npx tsx prisma/seed-cadastros.ts
 */
import { PrismaClient, TipoInsumo } from '@prisma/client';

const p = new PrismaClient();

const CATEGORIAS_EPI = [
  'Proteção da Cabeça',
  'Proteção do Corpo',
  'Proteção Respiratória',
  'Proteção das Mãos',
  'Proteção dos Olhos',
  'Proteção Auditiva',
  'Proteção de Quedas',
  'Proteção Articular',
];

const CATEGORIAS_EQUIPAMENTO = [
  'Equipamentos de Aplicação',
  'Equipamentos de Segurança',
  'Escadas',
  'Ferramentas Elétricas',
  'Ferramentas Manuais',
  'Materiais Diversos',
  'Outros',
];

const CATEGORIAS_MATERIAL = [
  'Argamassas',
  'Tintas',
  'Elétricos',
  'Hidráulicos',
  'Ferragens',
  'Madeiras',
  'Revestimentos',
  'Diversos',
];

const LOCALIZACOES = [
  'Almoxarifado',
  'Oficina',
  'Escritório',
  'Obra – Obra 1',
  'Veículo',
  'Cliente',
];

const ESTADOS_CONSERVACAO = ['Bom', 'Regular', 'Ruim'];

type NomeOrdem = { nome: string; ordem: number };

const comOrdem = (lista: string[]): NomeOrdem[] =>
  lista.map((nome, i) => ({ nome, ordem: i + 1 }));

async function upsertCategoria(
  tipoInsumo: TipoInsumo,
  item: NomeOrdem,
): Promise<number> {
  const existente = await p.categoria.findFirst({
    where: { nome: item.nome, tipoInsumo },
  });
  if (existente) {
    await p.categoria.update({
      where: { id: existente.id },
      data: { ordem: item.ordem, ativo: true },
    });
    return existente.id;
  }
  const criado = await p.categoria.create({
    data: { nome: item.nome, ordem: item.ordem, tipoInsumo },
  });
  return criado.id;
}

async function upsertLocalizacao(item: NomeOrdem): Promise<number> {
  const existente = await p.localizacao.findFirst({
    where: { nome: item.nome, tipoInsumo: 'EQUIPAMENTO' },
  });
  if (existente) {
    await p.localizacao.update({
      where: { id: existente.id },
      data: { ordem: item.ordem, ativo: true },
    });
    return existente.id;
  }
  const criado = await p.localizacao.create({
    data: { nome: item.nome, ordem: item.ordem, tipoInsumo: 'EQUIPAMENTO' },
  });
  return criado.id;
}

async function upsertEstadoConservacao(item: NomeOrdem): Promise<number> {
  const existente = await p.estadoConservacao.findFirst({
    where: { nome: item.nome, tipoInsumo: 'EQUIPAMENTO' },
  });
  if (existente) {
    await p.estadoConservacao.update({
      where: { id: existente.id },
      data: { ordem: item.ordem, ativo: true },
    });
    return existente.id;
  }
  const criado = await p.estadoConservacao.create({
    data: {
      nome: item.nome,
      ordem: item.ordem,
      tipoInsumo: 'EQUIPAMENTO',
    },
  });
  return criado.id;
}

async function main() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Seed: Cadastros gerais (catálogos)         │');
  console.log('└─────────────────────────────────────────────┘\n');

  const gruposCategoria: Array<[string, TipoInsumo, NomeOrdem[]]> = [
    ['Categorias de EPI', 'EPI', comOrdem(CATEGORIAS_EPI)],
    [
      'Categorias de equipamento',
      'EQUIPAMENTO',
      comOrdem(CATEGORIAS_EQUIPAMENTO),
    ],
    ['Categorias de material', 'MATERIAL', comOrdem(CATEGORIAS_MATERIAL)],
  ];

  for (const [titulo, tipo, itens] of gruposCategoria) {
    console.log(`--- ${titulo} (${itens.length}) ---`);
    for (const item of itens) {
      const id = await upsertCategoria(tipo, item);
      console.log(`  ✓ [${id}] ${item.nome} (ordem=${item.ordem})`);
    }
    console.log('');
  }

  console.log(`--- Localizações (${LOCALIZACOES.length}) ---`);
  for (const item of comOrdem(LOCALIZACOES)) {
    const id = await upsertLocalizacao(item);
    console.log(`  ✓ [${id}] ${item.nome} (ordem=${item.ordem})`);
  }
  console.log('');

  console.log(`--- Estados de conservação (${ESTADOS_CONSERVACAO.length}) ---`);
  for (const item of comOrdem(ESTADOS_CONSERVACAO)) {
    const id = await upsertEstadoConservacao(item);
    console.log(`  ✓ [${id}] ${item.nome} (ordem=${item.ordem})`);
  }
  console.log('');

  const [catsEpi, catsEqp, catsMat, locs, ests] = await Promise.all([
    p.categoria.count({ where: { tipoInsumo: 'EPI' } }),
    p.categoria.count({ where: { tipoInsumo: 'EQUIPAMENTO' } }),
    p.categoria.count({ where: { tipoInsumo: 'MATERIAL' } }),
    p.localizacao.count({ where: { tipoInsumo: 'EQUIPAMENTO' } }),
    p.estadoConservacao.count({ where: { tipoInsumo: 'EQUIPAMENTO' } }),
  ]);

  console.log(
    `OK — categorias EPI=${catsEpi}, EQUIPAMENTO=${catsEqp}, ` +
      `MATERIAL=${catsMat}, localizacoes=${locs}, estados_conservacao=${ests}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
