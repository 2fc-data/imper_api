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

// Combos curados por sub-serviço (verbo + objeto)
type Combo = { v: string; o: string };

const COMBOS: Record<string, Combo[]> = {
  // ── Início ──────────────────────────────────────────────────────
  // Split: ambos os nomes herdam os combos da fonte "Limpeza e preparação"
  Limpeza: [
    { v: 'limpar', o: 'telhado' },
    { v: 'limpar', o: 'laje' },
    { v: 'remover', o: 'manta' },
    { v: 'verificar', o: 'telhado' },
    { v: 'inspecionar', o: 'laje' },
    { v: 'limpar', o: 'calha' },
    { v: 'limpar', o: 'beiral' },
  ],
  Preparação: [
    { v: 'limpar', o: 'telhado' },
    { v: 'limpar', o: 'laje' },
    { v: 'remover', o: 'manta' },
    { v: 'verificar', o: 'telhado' },
    { v: 'inspecionar', o: 'laje' },
    { v: 'limpar', o: 'calha' },
    { v: 'limpar', o: 'beiral' },
  ],
  Montagem: [
    { v: 'montar', o: 'andaime' },
    { v: 'verificar', o: 'andaime' },
    { v: 'desmontar', o: 'andaime' },
  ],
  Inspeção: [
    { v: 'verificar', o: 'telhado' },
    { v: 'inspecionar', o: 'laje' },
    { v: 'verificar', o: 'calha' },
    { v: 'inspecionar', o: 'beiral' },
    { v: 'verificar', o: 'ralo' },
    { v: 'verificar', o: 'trinca' },
    { v: 'inspecionar', o: 'muro' },
    { v: 'verificar', o: 'telha' },
  ],
  Remoção: [
    { v: 'remover', o: 'manta' },
    { v: 'remover', o: 'manta asfaltica' },
    { v: 'remover', o: 'asfalto' },
    { v: 'remover', o: 'manta cor' },
    { v: 'remover', o: 'fita' },
    { v: 'limpar', o: 'laje' },
  ],
  Reparo: [
    // Início (Reparar imperfeições)
    { v: 'reparar', o: 'trinca' },
    { v: 'reparar', o: 'muro' },
    { v: 'aplicar', o: 'argamassa' },
    { v: 'chumbar', o: 'viga' },
    { v: 'vedar', o: 'emenda' },
    // Em andamento (Reparar trincas e fissuras)
    { v: 'vedar', o: 'trinca' },
    { v: 'chumbar', o: 'trinca' },
    { v: 'aplicar', o: 'epoxi' },
  ],

  // ── Em andamento ────────────────────────────────────────────────
  // Mescla: união de Impermeabilizar base + laje + telhado + fachada/muro + piscina/deck
  'Impermeabilização': [
    { v: 'aplicar', o: 'impermeabilizante' },
    { v: 'aplicar', o: 'resina' },
    { v: 'aplicar', o: 'acrilico' },
    { v: 'aplicar', o: 'asfalto' },
    { v: 'aplicar', o: 'pu' },
    { v: 'aplicar', o: 'epoxi' },
    { v: 'aplicar', o: 'oleo' },
    { v: 'impermeabilizar', o: 'laje' },
    { v: 'colar', o: 'manta' },
    { v: 'aplicar', o: 'verniz' },
    { v: 'impermeabilizar', o: 'telhado' },
    { v: 'colar', o: 'manta asfaltica' },
    { v: 'colar', o: 'manta cor' },
    { v: 'colar', o: 'manta aluminio' },
    { v: 'impermeabilizar', o: 'fachada' },
    { v: 'impermeabilizar', o: 'muro' },
    { v: 'impermeabilizar', o: 'piscina' },
    { v: 'impermeabilizar', o: 'deck' },
  ],
  Calafetação: [
    { v: 'calafetar', o: 'emenda' },
    { v: 'calafetar', o: 'quina' },
    { v: 'vedar', o: 'quina' },
    { v: 'aplicar', o: 'fita' },
  ],
  Colagem: [
    { v: 'colar', o: 'manta asfaltica' },
    { v: 'colar', o: 'manta' },
    { v: 'colar', o: 'asfalto' },
    { v: 'aplicar', o: 'asfalto' },
  ],
  // Instalação em e2 (calhas/condutores) + e3 (ralos/caixas) — mesma chave
  Instalação: [
    { v: 'instalar', o: 'calha' },
    { v: 'instalar', o: 'condutor' },
    { v: 'instalar', o: 'dreno' },
    { v: 'instalar', o: 'goteira' },
    { v: 'instalar', o: 'valvula' },
    { v: 'instalar', o: 'canleta' },
    { v: 'instalar', o: 'ralo' },
    { v: 'instalar', o: 'caixa' },
    { v: 'instalar', o: 'bomba' },
    { v: 'impermeabilizar', o: 'caixa' },
  ],

  // ── Acabamento ──────────────────────────────────────────────────
  // Mescla: união de Reforçar juntas + Reforçar emendas e quinas
  'Reforço': [
    { v: 'calafetar', o: 'emenda' },
    { v: 'aplicar', o: 'fita' },
    { v: 'vedar', o: 'quina' },
    { v: 'aplicar', o: 'resina' },
    { v: 'colar', o: 'fita' },
    { v: 'vedar', o: 'emenda' },
    { v: 'colar', o: 'manta aluminio' },
    { v: 'colar', o: 'manta cor' },
    { v: 'calafetar', o: 'quina' },
    { v: 'colar', o: 'manta' },
  ],
  Demão: [
    { v: 'aplicar', o: 'impermeabilizante' },
    { v: 'aplicar', o: 'resina' },
    { v: 'aplicar', o: 'acrilico' },
    { v: 'pintar', o: 'tinta' },
    { v: 'aplicar', o: 'verniz' },
    { v: 'aplicar', o: 'pu' },
    { v: 'impermeabilizar', o: 'laje' },
  ],
  Pintura: [
    { v: 'pintar', o: 'tinta' },
    { v: 'aplicar', o: 'verniz' },
    { v: 'aplicar', o: 'acrilico' },
  ],
  // Vedação em e3 (esquadrias/portas) + e4 (acabamento e vedações) — mesma chave
  Vedação: [
    { v: 'vedar', o: 'esquadria' },
    { v: 'vedar', o: 'janela' },
    { v: 'vedar', o: 'portao' },
    { v: 'aplicar', o: 'resina' },
    { v: 'instalar', o: 'esquadria' },
    { v: 'reparar', o: 'esquadria' },
    { v: 'instalar', o: 'soleira' },
    { v: 'aplicar', o: 'verniz' },
    { v: 'tratar', o: 'soleira' },
  ],

  // ── Finalizado ──────────────────────────────────────────────────
  // Inspeção herdada do início se chama Inspeção, mesclamos as duas em Inspeção no SUBS ou unificamos os termos

  Tratamento: [
    { v: 'tratar', o: 'fachada' },
    { v: 'aplicar', o: 'resina' },
    { v: 'impermeabilizar', o: 'fachada' },
    { v: 'pintar', o: 'tinta' },
    { v: 'aplicar', o: 'verniz' },
    { v: 'tratar', o: 'muro' },
    { v: 'aplicar', o: 'acrilico' },
    { v: 'impermeabilizar', o: 'muro' },
  ],
  Estancamento: [
    { v: 'verificar', o: 'telhado' },
    { v: 'verificar', o: 'laje' },
    { v: 'inspecionar', o: 'piscina' },
    { v: 'verificar', o: 'emenda' },
    { v: 'verificar', o: 'drenagem' },
    { v: 'verificar', o: 'calha' },
    { v: 'inspecionar', o: 'fachada' },
  ],
  // Split: ambos herdam os combos da fonte "Liberar obra e relatório"
  'Relatório': [
    { v: 'verificar', o: 'telhado' },
    { v: 'inspecionar', o: 'laje' },
    { v: 'verificar', o: 'fachada' },
    { v: 'inspecionar', o: 'piscina' },
    { v: 'verificar', o: 'drenagem' },
    { v: 'inspecionar', o: 'muro' },
    { v: 'verificar', o: 'calha' },
    { v: 'inspecionar', o: 'deck' },
    { v: 'verificar', o: 'esquadria' },
  ],
  'Liberação da obra': [
    { v: 'verificar', o: 'telhado' },
    { v: 'inspecionar', o: 'laje' },
    { v: 'verificar', o: 'fachada' },
    { v: 'inspecionar', o: 'piscina' },
    { v: 'verificar', o: 'drenagem' },
    { v: 'inspecionar', o: 'muro' },
    { v: 'verificar', o: 'calha' },
    { v: 'inspecionar', o: 'deck' },
    { v: 'verificar', o: 'esquadria' },
  ],
};

function key(v: string, o: string): string {
  return `${v}||${o}`;
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
  let combosInativos = 0;

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

      const combosSub = COMBOS[nomeSub];
      if (!combosSub?.length) {
        console.log(`      ⚠️  sem combos curados para "${nomeSub}"`);
        continue;
      }

      const curados = new Set(
        combosSub.map((c) =>
          key(verbos[c.v]!.toString(), objetos[c.o]!.toString()),
        ),
      );

      // 1) Garante combos curados
      const existentes = await p.subServicoAtividade.findMany({
        where: { subServicoId: sub.id },
      });
      const has = new Set(
        existentes
          .filter((e) => e.localId == null && e.caracteristicaId == null)
          .map((e) => key(e.verboId.toString(), e.objetoId.toString())),
      );

      let criados = 0;
      for (const combo of combosSub) {
        const vId = verbos[combo.v]!;
        const oId = objetos[combo.o]!;
        const k = key(vId.toString(), oId.toString());
        if (has.has(k)) continue;
        has.add(k);
        await p.subServicoAtividade.create({
          data: {
            subServicoId: sub.id,
            verboId: vId,
            objetoId: oId,
            localId: null,
            caracteristicaId: null,
          },
        });
        criados++;
        totalCombos++;
      }

      // 2) Desativa combos sintéticos antigos ou com local/característica legados fora da lista curada
      const sinteticos = existentes.filter(
        (e) =>
          e.localId != null ||
          e.caracteristicaId != null ||
          !curados.has(key(e.verboId.toString(), e.objetoId.toString())),
      );
      if (sinteticos.length) {
        await p.subServicoAtividade.updateMany({
          where: {
            id: { in: sinteticos.map((e) => e.id) },
            ativo: true,
          },
          data: { ativo: false },
        });
        combosInativos += sinteticos.length;
      }

      combosCriados += criados;
      console.log(
        `      combos: ${existentes.length} existentes, ${criados} curados criados, ${sinteticos.length} sintéticos desativados`,
      );
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
      `${combosCriados} combos novos (de ${totalCombos} processados), ${combosInativos} sintéticos desativados.`,
  );
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
