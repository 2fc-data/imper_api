import { PrismaClient } from '@prisma/client';

// Migração: transforma nomes de catálogo/sub-serviços de substantivo para
// verbo no infinitivo e adiciona os verbos faltantes. Idempotente.
// Executar: npx tsx prisma/migrate-verbos-catalogo.ts

const p = new PrismaClient();

const NOVOS_VERBOS = [
  'lavar',
  'desengordurar',
  'liberar',
  'proteger',
  'reforçar',
  'testar',
];

// catálogo: nome antigo -> nome novo (linhas ativas; Smoke T17 fora do mapa)
const CATALOGO: Array<[string, string]> = [
  ['Lavagem e desengorduramento', 'Lavar e desengordurar'],
  ['Reparo de trincas e furos', 'Reparar trincas e furos'],
  ['Aplicação de primer (fundo)', 'Aplicar primer (fundo)'],
  ['Impermeabilização — 1ª demão', 'Impermeabilizar — 1ª demão'],
  ['Reforço de juntas com fita', 'Reforçar juntas com fita'],
  ['Impermeabilização — 2ª demão', 'Impermeabilizar — 2ª demão'],
  ['Vedação de esquadrias', 'Vedar esquadrias'],
  ['Inspeção e relatório final', 'Inspecionar e relatório final'],
  ['Montagem de andaime', 'Montar andaime'],
  ['Inspeção técnica de telhado e laje', 'Inspecionar telhado e laje'],
  ['Remoção de manta danificada', 'Remover manta danificada'],
  ['Aplicação de primer em laje/telhado', 'Aplicar primer em laje/telhado'],
  ['Colagem de manta asfáltica 4mm', 'Colar manta asfáltica 4mm'],
  [
    'Impermeabilização de laje (resina/acrílico)',
    'Impermeabilizar laje (resina/acrílico)',
  ],
  ['Impermeabilização de telhado', 'Impermeabilizar telhado'],
  ['Impermeabilização de fachada e muro', 'Impermeabilizar fachada e muro'],
  ['Reparo de trincas e fissuras', 'Reparar trincas e fissuras'],
  ['Calafetação de juntas e quinas', 'Calafetar juntas e quinas'],
  ['Instalação de calhas e condutores', 'Instalar calhas e condutores'],
  ['Impermeabilização de piscina e deck', 'Impermeabilizar piscina e deck'],
  ['Reforço de emendas e quinas', 'Reforçar emendas e quinas'],
  ['Pintura e proteção final', 'Pintar e proteger final'],
  ['Vedação de esquadrias e portas', 'Vedar esquadrias e portas'],
  ['Instalação de ralos e caixas', 'Instalar ralos e caixas'],
  ['Vedação de esquadrias (final)', 'Vedar esquadrias (final)'],
  ['Tratamento de fachadas', 'Tratar fachadas'],
  ['Teste de estanqueidade', 'Testar estanqueidade'],
  ['Liberação da obra e relatório', 'Liberar obra e relatório'],
];

// sub-serviços: nome antigo -> nome novo (mantém: Limpeza e preparação,
// Segunda demão, Acabamento e vedações)
const SUBS: Array<[string, string]> = [
  ['Reparo de imperfeições', 'Reparar imperfeições'],
  ['Montagem de andaime', 'Montar andaime'],
  ['Inspeção técnica de telhado', 'Inspecionar telhado'],
  ['Remoção de manta danificada', 'Remover manta danificada'],
  ['Aplicação de fundo', 'Aplicar fundo'],
  ['Impermeabilização de base', 'Impermeabilizar base'],
  ['Aplicação de primer', 'Aplicar primer'],
  ['Colagem de manta asfáltica', 'Colar manta asfáltica'],
  ['Impermeabilização de laje', 'Impermeabilizar laje'],
  ['Impermeabilização de telhado', 'Impermeabilizar telhado'],
  ['Impermeabilização de fachada e muro', 'Impermeabilizar fachada e muro'],
  ['Reparo de trincas e fissuras', 'Reparar trincas e fissuras'],
  ['Calafetação de juntas e quinas', 'Calafetar juntas e quinas'],
  ['Instalação de calhas e condutores', 'Instalar calhas e condutores'],
  ['Impermeabilização de piscina e deck', 'Impermeabilizar piscina e deck'],
  ['Reforço de juntas', 'Reforçar juntas'],
  ['Reforço de emendas e quinas', 'Reforçar emendas e quinas'],
  ['Pintura e proteção final', 'Pintar e proteger final'],
  ['Vedação de esquadrias e portas', 'Vedar esquadrias e portas'],
  ['Instalação de ralos e caixas', 'Instalar ralos e caixas'],
  ['Inspeção e tratamento final', 'Inspecionar e tratar final'],
  ['Tratamento de fachadas', 'Tratar fachadas'],
  ['Teste de estanqueidade', 'Testar estanqueidade'],
  ['Liberação da obra e relatório', 'Liberar obra e relatório'],
];

async function main() {
  console.log('--- Verbos: inserindo faltantes ---');
  let verbosNovos = 0;
  for (const nome of NOVOS_VERBOS) {
    const existente = await p.verbo.findUnique({ where: { nome } });
    if (existente) {
      console.log(`  ${nome} já existe (id=${existente.id})`);
      continue;
    }
    const rec = await p.verbo.create({ data: { nome } });
    console.log(`  ${nome} criado (id=${rec.id})`);
    verbosNovos++;
  }

  console.log('\n--- Sub-serviços: renomeando ---');
  let subsOk = 0;
  for (const [antigo, novo] of SUBS) {
    const existentes = await p.subServico.findMany({ where: { nome: antigo } });
    if (!existentes.length) {
      console.log(`  (skip) ${antigo} não encontrado`);
      continue;
    }
    await p.subServico.updateMany({
      where: { nome: antigo },
      data: { nome: novo },
    });
    console.log(`  "${antigo}" -> "${novo}" (${existentes.length} row(s))`);
    subsOk++;
  }

  console.log('\n--- Catálogo: renomeando ---');
  let catOk = 0;
  for (const [antigo, novo] of CATALOGO) {
    const existentes = await p.catalogoAtividade.findMany({
      where: { nome: antigo },
    });
    if (!existentes.length) {
      console.log(`  (skip) ${antigo} não encontrado`);
      continue;
    }
    await p.catalogoAtividade.updateMany({
      where: { nome: antigo },
      data: { nome: novo },
    });
    console.log(`  "${antigo}" -> "${novo}" (${existentes.length} row(s))`);
    catOk++;
  }

  console.log(
    `\n✅ Migração: ${verbosNovos} verbos novos, ${subsOk} subs renomeados, ${catOk} itens de catálogo renomeados.`,
  );
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
