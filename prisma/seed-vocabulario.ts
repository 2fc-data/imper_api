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

// Combos curados por sub-serviço (verb + objeto + local? + característica?)
type Combo = { v: string; o: string; l?: string; c?: string };

const COMBOS: Record<string, Combo[]> = {
  // ── Início ──────────────────────────────────────────────────────
  // Split: ambos os nomes herdam os combos da fonte "Limpeza e preparação"
  Limpeza: [
    { v: 'limpar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'limpar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'remover', o: 'manta', l: 'telhado', c: 'gasta' },
    { v: 'verificar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'inspecionar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'limpar', o: 'calha', l: 'calha', c: 'externa' },
    { v: 'limpar', o: 'beiral', l: 'beiral', c: 'externa' },
  ],
  Preparação: [
    { v: 'limpar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'limpar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'remover', o: 'manta', l: 'telhado', c: 'gasta' },
    { v: 'verificar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'inspecionar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'limpar', o: 'calha', l: 'calha', c: 'externa' },
    { v: 'limpar', o: 'beiral', l: 'beiral', c: 'externa' },
  ],
  Montagem: [
    { v: 'montar', o: 'andaime', l: 'telhado', c: 'externa' },
    { v: 'montar', o: 'andaime', l: 'fachada', c: 'externa' },
    { v: 'montar', o: 'andaime', l: 'muro', c: 'externa' },
    { v: 'verificar', o: 'andaime', l: 'fachada', c: 'externa' },
    { v: 'desmontar', o: 'andaime', l: 'telhado', c: 'externa' },
  ],
  Inspeção: [
    { v: 'verificar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'inspecionar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'verificar', o: 'calha', l: 'calha', c: 'externa' },
    { v: 'inspecionar', o: 'beiral', l: 'beiral', c: 'externa' },
    { v: 'verificar', o: 'ralo', l: 'telhado', c: 'externa' },
    { v: 'verificar', o: 'trinca', l: 'telhado', c: 'trincada' },
    { v: 'inspecionar', o: 'muro', l: 'muro', c: 'externa' },
    { v: 'verificar', o: 'telha', l: 'telhado', c: 'externa' },
  ],
  Remoção: [
    { v: 'remover', o: 'manta', l: 'telhado', c: 'gasta' },
    { v: 'remover', o: 'manta asfaltica', l: 'laje', c: 'gasta' },
    { v: 'remover', o: 'manta', l: 'laje', c: 'trincada' },
    { v: 'remover', o: 'asfalto', l: 'telhado', c: 'gasta' },
    { v: 'remover', o: 'manta cor', l: 'telhado', c: 'gasta' },
    { v: 'remover', o: 'fita', l: 'telhado', c: 'gasta' },
    { v: 'limpar', o: 'laje', l: 'laje', c: 'externa' },
  ],
  Reparo: [
    // Início (Reparar imperfeições)
    { v: 'reparar', o: 'trinca', l: 'laje', c: 'trincada' },
    { v: 'reparar', o: 'trinca', l: 'fachada', c: 'rachada' },
    { v: 'reparar', o: 'muro', l: 'muro', c: 'trincada' },
    { v: 'aplicar', o: 'argamassa', l: 'laje', c: 'trincada' },
    { v: 'chumbar', o: 'viga', l: 'laje', c: 'trincada' },
    { v: 'vedar', o: 'emenda', l: 'telhado', c: 'emendada' },
    { v: 'reparar', o: 'trinca', l: 'telhado', c: 'trincada' },
    // Em andamento (Reparar trincas e fissuras)
    { v: 'aplicar', o: 'argamassa', l: 'fachada', c: 'trincada' },
    { v: 'vedar', o: 'trinca', l: 'laje', c: 'trincada' },
    { v: 'reparar', o: 'trinca', l: 'muro', c: 'rachada' },
    { v: 'chumbar', o: 'trinca', l: 'laje', c: 'trincada' },
    { v: 'aplicar', o: 'epoxi', l: 'laje', c: 'trincada' },
  ],

  // ── Em andamento ────────────────────────────────────────────────
  // Mescla: união de Impermeabilizar base + laje + telhado + fachada/muro + piscina/deck
  'Impermeabilização': [
    { v: 'aplicar', o: 'impermeabilizante', l: 'laje', c: 'externa' },
    { v: 'aplicar', o: 'resina', l: 'laje', c: 'externa' },
    { v: 'aplicar', o: 'acrilico', l: 'laje', c: 'externa' },
    { v: 'aplicar', o: 'asfalto', l: 'telhado', c: 'asfaltica' },
    { v: 'aplicar', o: 'pu', l: 'laje', c: 'externa' },
    { v: 'aplicar', o: 'epoxi', l: 'laje', c: 'externa' },
    { v: 'aplicar', o: 'oleo', l: 'telhado', c: 'externa' },
    { v: 'impermeabilizar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'colar', o: 'manta', l: 'laje', c: 'asfaltica' },
    { v: 'aplicar', o: 'verniz', l: 'laje', c: 'externa' },
    { v: 'impermeabilizar', o: 'laje', l: 'varanda', c: 'externa' },
    { v: 'impermeabilizar', o: 'laje', l: 'garagem', c: 'externa' },
    { v: 'impermeabilizar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'colar', o: 'manta asfaltica', l: 'telhado', c: 'asfaltica' },
    { v: 'aplicar', o: 'resina', l: 'telhado', c: 'externa' },
    { v: 'colar', o: 'manta cor', l: 'telhado', c: 'cor' },
    { v: 'colar', o: 'manta aluminio', l: 'telhado', c: 'aluminio' },
    { v: 'impermeabilizar', o: 'telhado', l: 'cobertura', c: 'externa' },
    { v: 'aplicar', o: 'acrilico', l: 'telhado', c: 'externa' },
    { v: 'impermeabilizar', o: 'telhado', l: 'sotao', c: 'externa' },
    { v: 'aplicar', o: 'pu', l: 'telhado', c: 'externa' },
    { v: 'impermeabilizar', o: 'fachada', l: 'fachada', c: 'externa' },
    { v: 'impermeabilizar', o: 'muro', l: 'muro', c: 'externa' },
    { v: 'aplicar', o: 'resina', l: 'fachada', c: 'externa' },
    { v: 'aplicar', o: 'acrilico', l: 'fachada', c: 'externa' },
    { v: 'colar', o: 'manta', l: 'muro', c: 'externa' },
    { v: 'aplicar', o: 'verniz', l: 'fachada', c: 'externa' },
    { v: 'impermeabilizar', o: 'muro', l: 'muro de divisa', c: 'externa' },
    { v: 'aplicar', o: 'pu', l: 'fachada', c: 'externa' },
    { v: 'impermeabilizar', o: 'piscina', l: 'piscina', c: 'externa' },
    { v: 'impermeabilizar', o: 'deck', l: 'deck', c: 'externa' },
    { v: 'aplicar', o: 'resina', l: 'piscina', c: 'externa' },
    { v: 'aplicar', o: 'acrilico', l: 'deck', c: 'externa' },
    { v: 'colar', o: 'manta', l: 'piscina', c: 'externa' },
    { v: 'impermeabilizar', o: 'piscina', l: 'piscina', c: 'borda infinita' },
    { v: 'aplicar', o: 'verniz', l: 'deck', c: 'externa' },
    { v: 'impermeabilizar', o: 'deck', l: 'piscina', c: 'externa' },
  ],
  Calafetação: [
    { v: 'calafetar', o: 'emenda', l: 'telhado', c: 'emendada' },
    { v: 'calafetar', o: 'quina', l: 'laje', c: 'emendada' },
    { v: 'calafetar', o: 'emenda', l: 'laje', c: 'emendada' },
    { v: 'vedar', o: 'quina', l: 'telhado', c: 'emendada' },
    { v: 'calafetar', o: 'emenda', l: 'fachada', c: 'emendada' },
    { v: 'calafetar', o: 'quina', l: 'muro', c: 'emendada' },
    { v: 'aplicar', o: 'fita', l: 'telhado', c: 'emendada' },
    { v: 'calafetar', o: 'emenda', l: 'piscina', c: 'emendada' },
  ],
  Colagem: [
    { v: 'colar', o: 'manta asfaltica', l: 'telhado', c: 'asfaltica' },
    { v: 'colar', o: 'manta asfaltica', l: 'laje', c: 'asfaltica' },
    { v: 'colar', o: 'manta', l: 'telhado', c: 'asfaltica' },
    { v: 'colar', o: 'manta asfaltica', l: 'telhado', c: '4mm' },
    { v: 'colar', o: 'manta asfaltica', l: 'laje', c: '4mm' },
    { v: 'colar', o: 'asfalto', l: 'telhado', c: 'asfaltica' },
    { v: 'aplicar', o: 'asfalto', l: 'telhado', c: 'asfaltica' },
    { v: 'colar', o: 'manta asfaltica', l: 'beiral', c: 'asfaltica' },
    { v: 'colar', o: 'manta asfaltica', l: 'calha', c: 'asfaltica' },
  ],
  // Instalação em e2 (calhas/condutores) + e3 (ralos/caixas) — mesma chave
  Instalação: [
    { v: 'instalar', o: 'calha', l: 'telhado', c: 'externa' },
    { v: 'instalar', o: 'condutor', l: 'fachada', c: 'externa' },
    { v: 'instalar', o: 'calha', l: 'beiral', c: 'externa' },
    { v: 'instalar', o: 'dreno', l: 'telhado', c: 'externa' },
    { v: 'instalar', o: 'goteira', l: 'telhado', c: 'externa' },
    { v: 'instalar', o: 'calha', l: 'laje', c: 'externa' },
    { v: 'instalar', o: 'valvula', l: 'drenagem', c: 'externa' },
    { v: 'instalar', o: 'canleta', l: 'fachada', c: 'externa' },
    { v: 'instalar', o: 'ralo', l: 'telhado', c: 'externa' },
    { v: 'instalar', o: 'caixa', l: 'drenagem', c: 'externa' },
    { v: 'instalar', o: 'ralo', l: 'laje', c: 'externa' },
    { v: 'instalar', o: 'dreno', l: 'drenagem', c: 'externa' },
    { v: 'instalar', o: 'valvula', l: 'piscina', c: 'externa' },
    { v: 'instalar', o: 'ralo', l: 'area de servico', c: 'interna' },
    { v: 'instalar', o: 'caixa', l: 'subsolo', c: 'interna' },
    { v: 'instalar', o: 'bomba', l: 'drenagem', c: 'externa' },
    { v: 'impermeabilizar', o: 'caixa', l: 'drenagem', c: 'externa' },
  ],

  // ── Acabamento ──────────────────────────────────────────────────
  // Mescla: união de Reforçar juntas + Reforçar emendas e quinas
  'Reforço': [
    { v: 'calafetar', o: 'emenda', l: 'telhado', c: 'emendada' },
    { v: 'aplicar', o: 'fita', l: 'laje', c: 'emendada' },
    { v: 'vedar', o: 'quina', l: 'laje', c: 'emendada' },
    { v: 'calafetar', o: 'emenda', l: 'laje', c: 'emendada' },
    { v: 'aplicar', o: 'resina', l: 'telhado', c: 'emendada' },
    { v: 'calafetar', o: 'emenda', l: 'fachada', c: 'emendada' },
    { v: 'colar', o: 'fita', l: 'telhado', c: 'emendada' },
    { v: 'vedar', o: 'emenda', l: 'piscina', c: 'emendada' },
    { v: 'colar', o: 'manta aluminio', l: 'telhado', c: 'aluminio' },
    { v: 'colar', o: 'manta cor', l: 'telhado', c: 'cor' },
    { v: 'calafetar', o: 'quina', l: 'telhado', c: 'emendada' },
    { v: 'colar', o: 'manta', l: 'beiral', c: 'asfaltica' },
    { v: 'aplicar', o: 'resina', l: 'quina', c: 'emendada' },
    { v: 'colar', o: 'manta aluminio', l: 'laje', c: 'aluminio' },
    { v: 'colar', o: 'manta cor', l: 'laje', c: 'cor' },
  ],
  Demão: [
    { v: 'aplicar', o: 'impermeabilizante', l: 'laje', c: 'externa' },
    { v: 'aplicar', o: 'resina', l: 'laje', c: 'externa' },
    { v: 'aplicar', o: 'acrilico', l: 'laje', c: 'externa' },
    { v: 'pintar', o: 'tinta', l: 'fachada', c: 'externa' },
    { v: 'aplicar', o: 'verniz', l: 'laje', c: 'externa' },
    { v: 'aplicar', o: 'pu', l: 'telhado', c: 'externa' },
    { v: 'impermeabilizar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'pintar', o: 'tinta', l: 'muro', c: 'externa' },
  ],
  Pintura: [
    { v: 'pintar', o: 'tinta', l: 'fachada', c: 'externa' },
    { v: 'pintar', o: 'tinta', l: 'muro', c: 'externa' },
    { v: 'pintar', o: 'tinta', l: 'telhado', c: 'externa' },
    { v: 'aplicar', o: 'verniz', l: 'fachada', c: 'externa' },
    { v: 'pintar', o: 'tinta', l: 'laje', c: 'externa' },
    { v: 'aplicar', o: 'acrilico', l: 'fachada', c: 'externa' },
    { v: 'pintar', o: 'tinta', l: 'calha', c: 'externa' },
    { v: 'aplicar', o: 'verniz', l: 'deck', c: 'externa' },
  ],
  // Vedação em e3 (esquadrias/portas) + e4 (acabamento e vedações) — mesma chave
  Vedação: [
    { v: 'vedar', o: 'esquadria', l: 'fachada', c: 'externa' },
    { v: 'vedar', o: 'janela', l: 'fachada', c: 'externa' },
    { v: 'vedar', o: 'portao', l: 'entrada', c: 'externa' },
    { v: 'aplicar', o: 'resina', l: 'fachada', c: 'externa' },
    { v: 'vedar', o: 'janela', l: 'quarto', c: 'interna' },
    { v: 'instalar', o: 'esquadria', l: 'fachada', c: 'externa' },
    { v: 'reparar', o: 'esquadria', l: 'banheiro', c: 'interna' },
    { v: 'vedar', o: 'portao', l: 'fundos', c: 'externa' },
    { v: 'vedar', o: 'janela', l: 'banheiro', c: 'interna' },
    { v: 'aplicar', o: 'resina', l: 'banheiro', c: 'interna' },
    { v: 'instalar', o: 'soleira', l: 'banheiro', c: 'interna' },
    { v: 'aplicar', o: 'verniz', l: 'banheiro', c: 'interna' },
    { v: 'vedar', o: 'janela', l: 'cozinha', c: 'interna' },
    { v: 'tratar', o: 'soleira', l: 'banheiro', c: 'interna' },
  ],

  // ── Finalizado ──────────────────────────────────────────────────
  // Inspeção em e1 (telhado) + e4 (tratar final) — mesma chave
  Inspeção: [
    { v: 'verificar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'inspecionar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'verificar', o: 'calha', l: 'calha', c: 'externa' },
    { v: 'inspecionar', o: 'beiral', l: 'beiral', c: 'externa' },
    { v: 'verificar', o: 'ralo', l: 'telhado', c: 'externa' },
    { v: 'verificar', o: 'trinca', l: 'telhado', c: 'trincada' },
    { v: 'inspecionar', o: 'muro', l: 'muro', c: 'externa' },
    { v: 'verificar', o: 'telha', l: 'telhado', c: 'externa' },
    { v: 'verificar', o: 'esquadria', l: 'fachada', c: 'externa' },
    { v: 'inspecionar', o: 'piscina', l: 'piscina', c: 'externa' },
    { v: 'verificar', o: 'drenagem', l: 'drenagem', c: 'externa' },
    { v: 'inspecionar', o: 'fachada', l: 'fachada', c: 'externa' },
    { v: 'tratar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'tratar', o: 'laje', l: 'laje', c: 'externa' },
  ],
  Tratamento: [
    { v: 'tratar', o: 'fachada', l: 'fachada', c: 'externa' },
    { v: 'aplicar', o: 'resina', l: 'fachada', c: 'externa' },
    { v: 'impermeabilizar', o: 'fachada', l: 'fachada', c: 'externa' },
    { v: 'pintar', o: 'tinta', l: 'fachada', c: 'externa' },
    { v: 'aplicar', o: 'verniz', l: 'fachada', c: 'externa' },
    { v: 'tratar', o: 'muro', l: 'muro', c: 'externa' },
    { v: 'aplicar', o: 'acrilico', l: 'fachada', c: 'externa' },
    { v: 'impermeabilizar', o: 'muro', l: 'muro', c: 'externa' },
  ],
  Estancamento: [
    { v: 'verificar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'verificar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'inspecionar', o: 'piscina', l: 'piscina', c: 'externa' },
    { v: 'verificar', o: 'emenda', l: 'telhado', c: 'emendada' },
    { v: 'verificar', o: 'drenagem', l: 'drenagem', c: 'externa' },
    { v: 'inspecionar', o: 'telhado', l: 'cobertura', c: 'externa' },
    { v: 'verificar', o: 'calha', l: 'calha', c: 'externa' },
    { v: 'inspecionar', o: 'fachada', l: 'fachada', c: 'externa' },
  ],
  // Split: ambos herdam os combos da fonte "Liberar obra e relatório"
  'Relatório': [
    { v: 'verificar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'inspecionar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'verificar', o: 'fachada', l: 'fachada', c: 'externa' },
    { v: 'inspecionar', o: 'piscina', l: 'piscina', c: 'externa' },
    { v: 'verificar', o: 'drenagem', l: 'drenagem', c: 'externa' },
    { v: 'inspecionar', o: 'muro', l: 'muro', c: 'externa' },
    { v: 'verificar', o: 'calha', l: 'calha', c: 'externa' },
    { v: 'inspecionar', o: 'deck', l: 'deck', c: 'externa' },
    { v: 'verificar', o: 'esquadria', l: 'fachada', c: 'externa' },
  ],
  'Liberação da obra': [
    { v: 'verificar', o: 'telhado', l: 'telhado', c: 'externa' },
    { v: 'inspecionar', o: 'laje', l: 'laje', c: 'externa' },
    { v: 'verificar', o: 'fachada', l: 'fachada', c: 'externa' },
    { v: 'inspecionar', o: 'piscina', l: 'piscina', c: 'externa' },
    { v: 'verificar', o: 'drenagem', l: 'drenagem', c: 'externa' },
    { v: 'inspecionar', o: 'muro', l: 'muro', c: 'externa' },
    { v: 'verificar', o: 'calha', l: 'calha', c: 'externa' },
    { v: 'inspecionar', o: 'deck', l: 'deck', c: 'externa' },
    { v: 'verificar', o: 'esquadria', l: 'fachada', c: 'externa' },
  ],
};

// Itens de demonstração do catálogo (criados se não existirem)
const CATALOGO = [
  {
    nome: 'Lavar e desengordurar',
    esp: 'LIMPEZA',
    h: 2,
    etapa: 'Início',
    sub: 'Limpeza',
  },
  {
    nome: 'Preparar superfície',
    esp: 'CIVIL',
    h: 2,
    etapa: 'Início',
    sub: 'Preparação',
  },
  {
    nome: 'Reparar trincas e furos',
    esp: 'CIVIL',
    h: 3,
    etapa: 'Início',
    sub: 'Reparo',
  },
  {
    nome: 'Montar andaime',
    esp: 'OUTROS',
    h: 4,
    etapa: 'Início',
    sub: 'Montagem',
  },
  {
    nome: 'Inspecionar telhado e laje',
    esp: 'OUTROS',
    h: 2,
    etapa: 'Início',
    sub: 'Inspeção',
  },
  {
    nome: 'Remover manta danificada',
    esp: 'IMPERMEABILIZACAO',
    h: 5,
    etapa: 'Início',
    sub: 'Remoção',
  },
  {
    nome: 'Impermeabilizar — 1ª demão',
    esp: 'IMPERMEABILIZACAO',
    h: 4,
    etapa: 'Em andamento',
    sub: 'Impermeabilização',
  },
  {
    nome: 'Colar manta asfáltica 4mm',
    esp: 'IMPERMEABILIZACAO',
    h: 8,
    etapa: 'Em andamento',
    sub: 'Colagem',
  },
  {
    nome: 'Impermeabilizar laje (resina/acrílico)',
    esp: 'IMPERMEABILIZACAO',
    h: 6,
    etapa: 'Em andamento',
    sub: 'Impermeabilização',
  },
  {
    nome: 'Impermeabilizar telhado',
    esp: 'IMPERMEABILIZACAO',
    h: 8,
    etapa: 'Em andamento',
    sub: 'Impermeabilização',
  },
  {
    nome: 'Impermeabilizar fachada e muro',
    esp: 'IMPERMEABILIZACAO',
    h: 6,
    etapa: 'Em andamento',
    sub: 'Impermeabilização',
  },
  {
    nome: 'Reparar trincas e fissuras',
    esp: 'CIVIL',
    h: 3,
    etapa: 'Em andamento',
    sub: 'Reparo',
  },
  {
    nome: 'Calafetar juntas e quinas',
    esp: 'IMPERMEABILIZACAO',
    h: 3,
    etapa: 'Em andamento',
    sub: 'Calafetação',
  },
  {
    nome: 'Instalar calhas e condutores',
    esp: 'CIVIL',
    h: 4,
    etapa: 'Em andamento',
    sub: 'Instalação',
  },
  {
    nome: 'Impermeabilizar piscina e deck',
    esp: 'IMPERMEABILIZACAO',
    h: 10,
    etapa: 'Em andamento',
    sub: 'Impermeabilização',
  },
  {
    nome: 'Reforçar juntas com fita',
    esp: 'IMPERMEABILIZACAO',
    h: 3,
    etapa: 'Acabamento',
    sub: 'Reforço',
  },
  {
    nome: 'Impermeabilizar — 2ª demão',
    esp: 'IMPERMEABILIZACAO',
    h: 4,
    etapa: 'Acabamento',
    sub: 'Demão',
  },
  {
    nome: 'Reforçar emendas e quinas',
    esp: 'IMPERMEABILIZACAO',
    h: 3,
    etapa: 'Acabamento',
    sub: 'Reforço',
  },
  {
    nome: 'Pintar e proteger final',
    esp: 'PINTURA',
    h: 4,
    etapa: 'Acabamento',
    sub: 'Pintura',
  },
  {
    nome: 'Vedar esquadrias e portas',
    esp: 'CIVIL',
    h: 2,
    etapa: 'Acabamento',
    sub: 'Vedação',
  },
  {
    nome: 'Instalar ralos e caixas',
    esp: 'HIDRAULICA',
    h: 3,
    etapa: 'Acabamento',
    sub: 'Instalação',
  },
  {
    nome: 'Vedar esquadrias (final)',
    esp: 'CIVIL',
    h: 2,
    etapa: 'Finalizado',
    sub: 'Vedação',
  },
  {
    nome: 'Inspecionar e relatório final',
    esp: 'OUTROS',
    h: 1.5,
    etapa: 'Finalizado',
    sub: 'Inspeção',
  },
  {
    nome: 'Tratar fachadas',
    esp: 'PINTURA',
    h: 5,
    etapa: 'Finalizado',
    sub: 'Tratamento',
  },
  {
    nome: 'Testar estanqueidade',
    esp: 'IMPERMEABILIZACAO',
    h: 2,
    etapa: 'Finalizado',
    sub: 'Estancamento',
  },
  {
    nome: 'Relatório final de obra',
    esp: 'OUTROS',
    h: 1.5,
    etapa: 'Finalizado',
    sub: 'Relatório',
  },
  {
    nome: 'Liberar obra e entregar',
    esp: 'OUTROS',
    h: 1,
    etapa: 'Finalizado',
    sub: 'Liberação da obra',
  },
] as const;

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
          key(
            verbos[c.v]!.toString(),
            objetos[c.o]!.toString(),
            c.l ? locais[c.l]!.toString() : undefined,
            c.c ? caracts[c.c]!.toString() : undefined,
          ),
        ),
      );

      // 1) Garante combos curados
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
      for (const combo of combosSub) {
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

      // 2) Desativa combos sintéticos antigos fora da lista curada
      //    (não apaga — mantém histórico; some do cascade da UI)
      const sinteticos = existentes.filter(
        (e) =>
          !curados.has(
            key(
              e.verboId.toString(),
              e.objetoId.toString(),
              e.localId?.toString(),
              e.caracteristicaId?.toString(),
            ),
          ),
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
      `${combosCriados} combos novos (de ${totalCombos} processados), ${combosInativos} sintéticos desativados, ${catOk} itens de catálogo.`,
  );
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
