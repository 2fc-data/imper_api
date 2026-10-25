import { PrismaClient } from '@prisma/client';

// Executar: npx tsx prisma/seed-vocabulario.ts (idempotente)
// Expandido a partir da lista real de serviços de campo
// (manta asfáltica/cor/alumínio, lajes, calhas, piscina, fachada, trincas…).
const p = new PrismaClient();

// ── Vocabulário controlado ─────────────────────────────────────────
const VERBOS = [
  'aplicar',
  'remover',
  'instalar',
  'pintar',
  'demitir',
  'verificar',
  'impermeabilizar',
  'assentar',
  'substituir',
  'reparar',
  'colar',
  'limpar',
  'inspecionar',
  'calafetar',
  'vedar',
  'tratar',
  'montar',
  'desmontar',
  'revestir',
  'drenar',
  'primar',
  'demolar',
  'forrar',
  'selar',
  'nivelar',
  'chumbar',
  'trocar',
  'lavar',
  'desengordurar',
  'liberar',
  'proteger',
  'reforçar',
  'testar',
];

const OBJETOS = [
  'tinta',
  'revestimento',
  'louca',
  'esquadria',
  'gesso',
  'piso',
  'telhado',
  'ralo',
  'caixa',
  'soleira',
  'manta',
  'manta asfaltica',
  'manta cor',
  'manta aluminio',
  'asfalto',
  'primer',
  'laje',
  'calha',
  'condutor',
  'beiral',
  'muro',
  'viga',
  'piscina',
  'deck',
  'quina',
  'emenda',
  'trinca',
  'resina',
  'verniz',
  'fita',
  'telha',
  'goteira',
  'canleta',
  'dreno',
  'valvula',
  'bomba',
  'impermeabilizante',
  'oleo',
  'cimento',
  'argamassa',
  'acrilico',
  'pu',
  'epoxi',
  'janela',
  'alcapao',
  'elevador',
  'vidro',
  'floreira',
  'tanque',
  'drenagem',
  'portao',
  'andaime',
  'fachada',
];

const LOCAIS = [
  'sala',
  'cozinha',
  'banheiro',
  'fachada',
  'varanda',
  'garagem',
  'quarto',
  'area de servico',
  'corredor',
  'cobertura',
  'telhado',
  'laje',
  'calha',
  'beiral',
  'muro',
  'piscina',
  'deck',
  'subsolo',
  'sotao',
  'poco elevador',
  'wc',
  'area externa',
  'entrada',
  'fundos',
  'quina',
  'floreira',
  'area interna',
  'drenagem',
  'area comum',
  'jardim',
  'quintal',
  'muro de divisa',
  'topo',
  'escada',
  'rampa',
  'portao',
];

const CARACTERISTICAS = [
  'branca',
  'fosca',
  'nova',
  'gasta',
  'impermeavel',
  'antiderrapante',
  'lisa',
  'texturizada',
  'clara',
  'escura',
  'asfaltica',
  'cor',
  'aluminio',
  'trincada',
  'rachada',
  'emendada',
  'externa',
  'interna',
  'coberta',
  'descoberta',
  'antifungo',
  '4mm',
  '3mm',
  'acrilica',
  'impermeabilizada',
  'seca',
  'umida',
  'drenada',
  'borda infinita',
  'ofuro',
  'flexivel',
  'reforcada',
  'subterranea',
];

// Sub-serviços de domínio por etapa canônica (mantém as 4 etapas existentes)
// Nomes curtos de substantivo (fases de serviço). Mesclas:
//   e2: Impermeabilizar base+laje+telhado+fachada+piscina → Impermeabilização
//   e3: Reforçar juntas + emendas/quinhas → Reforço
// Splits: Limpeza e preparação → Limpeza + Preparação
//         Liberar obra e relatório → Relatório + Liberação da obra
// Desativados: Aplicar fundo, Aplicar primer
const SUBS: Record<string, string[]> = {
  Início: [
    'Limpeza',
    'Preparação',
    'Montagem',
    'Inspeção',
    'Remoção',
    'Reparo',
  ],
  'Em andamento': [
    'Impermeabilização',
    'Calafetação',
    'Colagem',
    'Instalação',
    'Reparo',
  ],
  Acabamento: ['Demão', 'Instalação', 'Reforço', 'Pintura', 'Vedação'],
  Finalizado: [
    'Vedação',
    'Inspeção',
    'Tratamento',
    'Estancamento',
    'Relatório',
    'Liberação da obra',
  ],
};

// ── Upserts de vocabulário simples ─────────────────────────────────
async function upsertNomes<
  T extends 'verbo' | 'objeto' | 'localObra' | 'caracteristica',
>(model: T, nomes: string[]): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  for (const nome of nomes) {
    const rec = await p[model].upsert({
      where: { nome },
      create: { nome },
      update: {},
    });
    map[nome] = rec.id;
  }
  console.log(`  ${(model as string).padEnd(16)} ${nomes.length} upserts`);
  return map;
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log('--- Vocabulário (verbo/objeto/local/característica) ---');
  await upsertNomes('verbo', VERBOS);
  await upsertNomes('objeto', OBJETOS);
  await upsertNomes('localObra', LOCAIS);
  await upsertNomes('caracteristica', CARACTERISTICAS);

  console.log('\n--- Sub-serviços (por etapa existente) ---');
  // Garante as 4 etapas canônicas (idempotente) antes dos sub-serviços.
  let ordemEtapa = 0;
  for (const nomeEtapa of Object.keys(SUBS)) {
    ordemEtapa += 1;
    const existente = await p.etapa.findFirst({ where: { nome: nomeEtapa } });
    if (existente) {
      await p.etapa.update({
        where: { id: existente.id },
        data: { ordem: existente.ordem || ordemEtapa, ativo: true },
      });
    } else {
      const criada = await p.etapa.create({
        data: { nome: nomeEtapa, ordem: ordemEtapa, ativo: true },
      });
      console.log(`  ✓ etapa "${criada.nome}" criada (id=${criada.id})`);
    }
  }

  const etapas = await p.etapa.findMany({ orderBy: { ordem: 'asc' } });

  let totalSubs = 0;

  for (const etapa of etapas) {
    const nomesSub = SUBS[etapa.nome];
    if (!nomesSub?.length) {
      console.log(
        `  ⚠️  etapa "${etapa.nome}" sem sub-serviços definidos no seed — pulando`,
      );
      continue;
    }
    for (const nomeSub of nomesSub) {
      const existenteSub = await p.subServico.findFirst({
        where: { etapaId: etapa.id, nome: nomeSub },
      });
      const sub =
        existenteSub ??
        (await p.subServico.create({
          data: { etapaId: etapa.id, nome: nomeSub },
        }));
      console.log(`  ${etapa.nome} → ${sub.nome} (id=${sub.id})`);
      totalSubs++;
    }
  }

  // ── Permissão de gestão do catálogo (T8 — RBAC) ────────────────────
  // Idempotente: cria a chave se não existir e vincula aos papéis que já
  // têm gerenciar_servicos (ADMIN, SUPERVISOR) — evita 403 nas rotas de
  // escrita do vocabulário.
  console.log('\n--- Permissão gerenciar_catalogo (RBAC) ---');
  const perm = await p.permissao.upsert({
    where: { chave: 'gerenciar_catalogo' },
    update: {},
    create: {
      chave: 'gerenciar_catalogo',
      descricao: 'Gerenciar catálogo de vocabulário e itens de orçamento',
      categoria: 'configuracoes',
    },
  });
  const papeisGestao = await p.papelRbac.findMany({
    where: { nome: { in: ['ADMIN', 'SUPERVISOR'] } },
  });
  for (const papel of papeisGestao) {
    await p.papelPermissao.upsert({
      where: {
        papelId_permissaoId: { papelId: papel.id, permissaoId: perm.id },
      },
      create: { papelId: papel.id, permissaoId: perm.id },
      update: {},
    });
  }
  console.log(
    `  gerenciar_catalogo id=${perm.id} → ${papeisGestao.length} papéis (${papeisGestao.map((x) => x.nome).join(', ')})`,
  );

  console.log(
    `\n✅ Seed vocabulário: ${VERBOS.length + OBJETOS.length + LOCAIS.length + CARACTERISTICAS.length} termos, ` +
      `${totalSubs} sub-serviços.`,
  );
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
