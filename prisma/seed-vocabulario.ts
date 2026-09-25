import { PrismaClient } from '@prisma/client';

// Executar: npx tsx prisma/seed-vocabulario.ts (idempotente)
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
];

// 1–2 sub-serviços por etapa existente
const SUBS: Record<string, string[]> = {
  'Preparação da superfície': [
    'Limpeza e preparação',
    'Reparo de imperfeições',
  ],
  'Primeira camada': ['Aplicação de fundo', 'Impermeabilização de base'],
  'Segunda camada': ['Reforço de juntas', 'Segunda demão'],
  'Acabamento e inspeção': [
    'Acabamento e vedações',
    'Inspeção e tratamento final',
  ],
};

// Itens de demonstração do catálogo (criados se não existirem)
const CATALOGO = [
  {
    nome: 'Lavagem e desengorduramento',
    esp: 'LIMPEZA',
    h: 2,
    etapa: 'Preparação da superfície',
    sub: 'Limpeza e preparação',
  },
  {
    nome: 'Reparo de trincas e furos',
    esp: 'CIVIL',
    h: 3,
    etapa: 'Preparação da superfície',
    sub: 'Reparo de imperfeições',
  },
  {
    nome: 'Aplicação de primer (fundo)',
    esp: 'PINTURA',
    h: 2,
    etapa: 'Primeira camada',
    sub: 'Aplicação de fundo',
  },
  {
    nome: 'Impermeabilização — 1ª demão',
    esp: 'IMPERMEABILIZACAO',
    h: 4,
    etapa: 'Primeira camada',
    sub: 'Impermeabilização de base',
  },
  {
    nome: 'Reforço de juntas com fita',
    esp: 'IMPERMEABILIZACAO',
    h: 3,
    etapa: 'Segunda camada',
    sub: 'Reforço de juntas',
  },
  {
    nome: 'Impermeabilização — 2ª demão',
    esp: 'IMPERMEABILIZACAO',
    h: 4,
    etapa: 'Segunda camada',
    sub: 'Segunda demão',
  },
  {
    nome: 'Vedação de esquadrias',
    esp: 'CIVIL',
    h: 2,
    etapa: 'Acabamento e inspeção',
    sub: 'Acabamento e vedações',
  },
  {
    nome: 'Inspeção e relatório final',
    esp: 'OUTROS',
    h: 1.5,
    etapa: 'Acabamento e inspeção',
    sub: 'Inspeção e tratamento final',
  },
] as const;

// ── Combos determinísticos por sub-serviço (16, com offset p/ variar) ──
type Combo = { v: string; o: string; l?: string; c?: string };

function montarCombos(off: number): Combo[] {
  const combos: Combo[] = [];
  for (let i = 0; i < 16; i++) {
    const combo: Combo = {
      v: VERBOS[(i + off) % VERBOS.length]!,
      o: OBJETOS[(i * 3 + off) % OBJETOS.length]!,
    };
    // 50%+ das linhas com local/característica (segundo bloco sempre preenchido
    // para não colidir com o primeiro — NULL ≠ NULL no MySQL)
    if (i % 2 === 0 || i >= 10)
      combo.l = LOCAIS[(Math.floor(i / 2) + off) % LOCAIS.length]!;
    if (i % 4 === 0 || i >= 12)
      combo.c =
        CARACTERISTICAS[(Math.floor(i / 4) + off) % CARACTERISTICAS.length]!;
    combos.push(combo);
  }
  return combos;
}

function key(v: string, o: string, l?: string, c?: string): string {
  return `${v}||${o}||${l ?? ''}||${c ?? ''}`;
}

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
  const verbos = await upsertNomes('verbo', VERBOS);
  const objetos = await upsertNomes('objeto', OBJETOS);
  const locais = await upsertNomes('localObra', LOCAIS);
  const caracts = await upsertNomes('caracteristica', CARACTERISTICAS);

  console.log('\n--- Sub-serviços (por etapa existente) ---');
  const etapas = await p.etapa.findMany({ orderBy: { ordem: 'asc' } });
  if (!etapas.length)
    throw new Error(
      'Nenhuma etapa encontrada — rode as seeds/migrations de etapas.',
    );

  let totalCombos = 0;
  let combosCriados = 0;
  let off = 0;

  for (const etapa of etapas) {
    const nomesSub = SUBS[etapa.nome];
    if (!nomesSub?.length) {
      console.log(
        `  ⚠️  etapa "${etapa.nome}" sem sub-serviços definidos no seed — pulando`,
      );
      continue;
    }
    for (const nomeSub of nomesSub) {
      const sub = await p.subServico.upsert({
        where: { etapaId_nome: { etapaId: etapa.id, nome: nomeSub } },
        create: { etapaId: etapa.id, nome: nomeSub },
        update: {},
      });
      console.log(`  ${etapa.nome} → ${sub.nome} (id=${sub.id})`);

      // Combos: dedup manual (NULL ≠ NULL ⇒ normalizar com ?? antes de comparar)
      const existentes = await p.subServicoAtividade.findMany({
        where: { subServicoId: sub.id },
      });
      const has = new Set(
        existentes.map((e) =>
          key(
            e.verboId.toString(),
            e.objetoId.toString(),
            e.localId?.toString(),
            e.caracteristicaId?.toString(),
          ),
        ),
      );

      let criados = 0;
      for (const combo of montarCombos(off)) {
        const k = key(
          verbos[combo.v]!.toString(),
          objetos[combo.o]!.toString(),
          combo.l ? locais[combo.l]!.toString() : undefined,
          combo.c ? caracts[combo.c]!.toString() : undefined,
        );
        if (has.has(k)) continue;
        has.add(k);
        await p.subServicoAtividade.create({
          data: {
            subServicoId: sub.id,
            verboId: verbos[combo.v]!,
            objetoId: objetos[combo.o]!,
            localId: combo.l ? locais[combo.l]! : null,
            caracteristicaId: combo.c ? caracts[combo.c]! : null,
          },
        });
        criados++;
        totalCombos++;
      }
      combosCriados += criados;
      off++;
      console.log(
        `      combos: ${existentes.length} existentes + ${criados} criados`,
      );
    }
  }

  console.log(`\n--- Catálogo de demonstração (${CATALOGO.length}) ---`);
  let catOk = 0;
  for (const item of CATALOGO) {
    const etapa = etapas.find((e) => e.nome === item.etapa);
    if (!etapa) continue;
    const sub = await p.subServico.findFirst({
      where: { etapaId: etapa.id, nome: item.sub },
    });
    const dados = {
      etapaId: etapa.id,
      subServicoId: sub?.id ?? null,
      especialidadeNecessaria: item.esp as never,
      tempoEstimadoHoras: item.h,
      descricao: `Item de demonstração vinculado a ${item.etapa} / ${item.sub}`,
    };
    const existente = await p.catalogoAtividade.findFirst({
      where: { nome: item.nome },
    });
    if (existente) {
      await p.catalogoAtividade.update({
        where: { id: existente.id },
        data: dados,
      });
      console.log(
        `  ${item.nome} [atualizado, etapa=${etapa.id}, sub=${sub?.id ?? '—'}]`,
      );
    } else {
      await p.catalogoAtividade.create({ data: { nome: item.nome, ...dados } });
      console.log(
        `  ${item.nome} [criado, etapa=${etapa.id}, sub=${sub?.id ?? '—'}]`,
      );
    }
    catOk++;
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
      `${combosCriados} combos novos (de ${totalCombos} processados), ${catOk} itens de catálogo.`,
  );
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
