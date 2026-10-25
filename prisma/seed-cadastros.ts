/**
 * Seed de cadastros gerais — categorias (EPI, equipamento, material),
 * localizações e estados de conservação.
 * Idempotente: pode ser rodado múltiplas vezes sem duplicar registros.
 *
 * Uso: npx tsx prisma/seed-cadastros.ts
 */
import { PrismaClient } from '@prisma/client';

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

async function upsertPorNome(
  model:
    | 'categoriaEpi'
    | 'categoriaEquipamento'
    | 'categoriaMaterial'
    | 'localizacao'
    | 'estadoConservacao',
  item: NomeOrdem,
): Promise<number> {
  const prisma = p[model] as {
    findFirst(args: {
      where: { nome: string };
    }): Promise<{ id: number } | null>;
    create(args: {
      data: { nome: string; ordem: number };
    }): Promise<{ id: number }>;
    update(args: {
      where: { id: number };
      data: { ordem: number; ativo: boolean };
    }): Promise<{ id: number }>;
  };

  const existente = await prisma.findFirst({ where: { nome: item.nome } });
  if (existente) {
    await prisma.update({
      where: { id: existente.id },
      data: { ordem: item.ordem, ativo: true },
    });
    return existente.id;
  }
  const criado = await prisma.create({
    data: { nome: item.nome, ordem: item.ordem },
  });
  return criado.id;
}

async function main() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Seed: Cadastros gerais (catálogos)         │');
  console.log('└─────────────────────────────────────────────┘\n');

  const grupos: Array<
    [string, Parameters<typeof upsertPorNome>[0], NomeOrdem[]]
  > = [
    ['Categorias de EPI', 'categoriaEpi', comOrdem(CATEGORIAS_EPI)],
    [
      'Categorias de equipamento',
      'categoriaEquipamento',
      comOrdem(CATEGORIAS_EQUIPAMENTO),
    ],
    [
      'Categorias de material',
      'categoriaMaterial',
      comOrdem(CATEGORIAS_MATERIAL),
    ],
    ['Localizações', 'localizacao', comOrdem(LOCALIZACOES)],
    [
      'Estados de conservação',
      'estadoConservacao',
      comOrdem(ESTADOS_CONSERVACAO),
    ],
  ];

  for (const [titulo, model, itens] of grupos) {
    console.log(`--- ${titulo} (${itens.length}) ---`);
    for (const item of itens) {
      const id = await upsertPorNome(model, item);
      console.log(`  ✓ [${id}] ${item.nome} (ordem=${item.ordem})`);
    }
    console.log('');
  }

  const [catsEpi, catsEqp, catsMat, locs, ests] = await Promise.all([
    p.categoriaEpi.count(),
    p.categoriaEquipamento.count(),
    p.categoriaMaterial.count(),
    p.localizacao.count(),
    p.estadoConservacao.count(),
  ]);

  console.log(
    `OK — categoria_epis=${catsEpi}, categoria_equipamentos=${catsEqp}, ` +
      `categoria_materiais=${catsMat}, localizacoes=${locs}, estados_conservacao=${ests}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
