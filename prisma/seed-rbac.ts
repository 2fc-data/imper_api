/**
 * Seed RBAC completo — papéis, permissões e atribuição aos usuários dev.
 * Idempotente: pode ser rodado múltiplas vezes sem duplicar registros.
 *
 * Uso: npx tsx prisma/seed-rbac.ts
 */
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// ── Permissões do sistema ───────────────────────────────────────────────────
const PERMISSOES = [
  // Atendimento
  { chave: 'criar_atendimento',    descricao: 'Criar atendimento',              categoria: 'atendimento' },
  { chave: 'editar_atendimento',   descricao: 'Editar atendimento',             categoria: 'atendimento' },
  // Orçamentos / financeiro
  { chave: 'ver_financeiro',       descricao: 'Ver dados financeiros',          categoria: 'financeiro' },
  { chave: 'aprovar_compra',       descricao: 'Aprovar compras',                categoria: 'financeiro' },
  // Serviços
  { chave: 'criar_servico',        descricao: 'Criar serviço',                  categoria: 'configuracoes' },
  { chave: 'editar_servico',       descricao: 'Editar serviço',                 categoria: 'configuracoes' },
  // Ordens de Serviço
  { chave: 'criar_os',             descricao: 'Criar OS',                       categoria: 'ordens_servico' },
  { chave: 'editar_os',            descricao: 'Editar OS',                      categoria: 'ordens_servico' },
  { chave: 'iniciar_os',           descricao: 'Iniciar OS',                     categoria: 'ordens_servico' },
  { chave: 'concluir_os',          descricao: 'Concluir OS',                    categoria: 'ordens_servico' },
  { chave: 'aprovar_os',           descricao: 'Aprovar OS',                     categoria: 'ordens_servico' },
  { chave: 'cancelar_os',          descricao: 'Cancelar OS',                    categoria: 'ordens_servico' },
  { chave: 'gerenciar_os',         descricao: 'Gerenciar OS (visão completa)',  categoria: 'ordens_servico' },
  // Obras
  { chave: 'ver_obras',            descricao: 'Ver obras e painel',             categoria: 'ordens_servico' },
  { chave: 'editar_obra',          descricao: 'Editar mestre da obra',          categoria: 'ordens_servico' },
  { chave: 'criar_aditivo',        descricao: 'Criar aditivo de obra',          categoria: 'ordens_servico' },
  { chave: 'aprovar_aditivo',      descricao: 'Aprovar/recusar aditivo',        categoria: 'ordens_servico' },
  // Estoque / insumos
  { chave: 'gerenciar_estoque',    descricao: 'Gerenciar estoque e materiais',  categoria: 'estoque' },
  { chave: 'entrada_estoque',      descricao: 'Registrar entradas de estoque',  categoria: 'estoque' },
  { chave: 'criar_material',       descricao: 'Criar material',                 categoria: 'estoque' },
  { chave: 'gerenciar_equipamentos', descricao: 'Gerenciar equipamentos',       categoria: 'estoque' },
  { chave: 'gerenciar_epis',       descricao: 'Gerenciar EPIs',                 categoria: 'estoque' },
  // Usuários / RBAC
  { chave: 'criar_usuario',        descricao: 'Criar usuário',                  categoria: 'usuarios' },
  { chave: 'editar_usuario',       descricao: 'Editar usuário',                 categoria: 'usuarios' },
  { chave: 'definir_perfil',       descricao: 'Definir perfil/papel do usuário',categoria: 'usuarios' },
  { chave: 'resetar_senha_usuario',descricao: 'Resetar senha de usuário',       categoria: 'usuarios' },
  { chave: 'gerenciar_papeis',     descricao: 'Gerenciar papéis e permissões',  categoria: 'usuarios' },
  // Catálogo
  { chave: 'gerenciar_catalogo',   descricao: 'Gerenciar catálogo de atividades', categoria: 'configuracoes' },
  // Frota
  { chave: 'visualizar_frota',     descricao: 'Visualizar veículos e relatórios da frota', categoria: 'frota' },
  { chave: 'registrar_km_frota',   descricao: 'Registrar quilometragem diária',            categoria: 'frota' },
  { chave: 'gerenciar_frota',      descricao: 'Gerenciar veículos, abastecimentos e manutenções', categoria: 'frota' },
];

// ── Mapeamento papel → permissões concedidas ────────────────────────────────
const PAPEL_PERMISSOES: Record<string, string[]> = {
  ADMIN: PERMISSOES.map((p) => p.chave), // ADMIN tem tudo

  SUPERVISOR: [
    'criar_atendimento', 'editar_atendimento',
    'ver_financeiro', 'aprovar_compra',
    'criar_servico', 'editar_servico',
    'criar_os', 'editar_os', 'iniciar_os', 'concluir_os', 'aprovar_os', 'cancelar_os', 'gerenciar_os',
    'ver_obras', 'editar_obra', 'criar_aditivo',
    'gerenciar_estoque', 'entrada_estoque', 'criar_material', 'gerenciar_equipamentos', 'gerenciar_epis',
    'criar_usuario', 'editar_usuario', 'definir_perfil',
    'gerenciar_catalogo',
    'visualizar_frota', 'registrar_km_frota', 'gerenciar_frota',
  ],

  TECNICO: [
    'editar_os', 'iniciar_os', 'concluir_os', 'gerenciar_os',
    'ver_obras',
  ],

  ALMOXARIFE: [
    'gerenciar_estoque', 'entrada_estoque', 'criar_material', 'gerenciar_equipamentos', 'gerenciar_epis',
    'ver_obras',
    'visualizar_frota', 'registrar_km_frota', 'gerenciar_frota',
  ],

  ATENDENTE: [
    'criar_atendimento', 'editar_atendimento',
    'criar_os', 'editar_os',
    'ver_obras',
  ],

  CLIENTE: [], // sem permissões internas — usa apenas o portal
};

// ── Usuários dev e seus papéis ──────────────────────────────────────────────
const DEV_USERS: Record<string, string> = {
  'admin@imper.local':      'ADMIN',
  'supervisor@imper.local': 'SUPERVISOR',
  'tecnico@imper.local':    'TECNICO',
  'almoxarife@imper.local': 'ALMOXARIFE',
  'atendente@imper.local':  'ATENDENTE',
};

async function main() {
  console.log('=== Seed RBAC completo ===\n');

  // 1. Upsert permissões
  console.log('1/3 Upsertando permissões...');
  const permMap: Record<string, number> = {};
  for (const perm of PERMISSOES) {
    const reg = await p.permissao.upsert({
      where: { chave: perm.chave },
      update: { descricao: perm.descricao, categoria: perm.categoria },
      create: perm,
    });
    permMap[perm.chave] = reg.id;
    process.stdout.write('.');
  }
  console.log(`\n  ✅ ${PERMISSOES.length} permissões`);

  // 2. Upsert papéis e vincular permissões
  console.log('2/3 Upsertando papéis e permissões...');
  const papelMap: Record<string, number> = {};
  for (const [nomePapel, permChaves] of Object.entries(PAPEL_PERMISSOES)) {
    const papel = await p.papelRbac.upsert({
      where: { nome: nomePapel },
      update: {},
      create: { nome: nomePapel, descricao: `Papel ${nomePapel}` },
    });
    papelMap[nomePapel] = papel.id;

    // Vincular permissões
    for (const chave of permChaves) {
      const permissaoId = permMap[chave];
      if (!permissaoId) continue;
      await p.papelPermissao.upsert({
        where: { papelId_permissaoId: { papelId: papel.id, permissaoId } },
        create: { papelId: papel.id, permissaoId },
        update: {},
      });
    }
    console.log(`  ${nomePapel}: ${permChaves.length} permissões`);
  }

  // 3. Atribuir papéis aos usuários dev
  console.log('3/3 Atribuindo papéis aos usuários dev...');
  let atribuidos = 0;
  for (const [email, nomePapel] of Object.entries(DEV_USERS)) {
    const user = await p.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`  ⚠️  Usuário ${email} não encontrado, pulando.`);
      continue;
    }
    const papelId = papelMap[nomePapel];
    if (!papelId) {
      console.log(`  ⚠️  Papel ${nomePapel} não encontrado, pulando ${email}.`);
      continue;
    }
    // Remove papéis anteriores e atribui o correto (idempotente)
    await p.usuarioPapel.deleteMany({ where: { userId: user.id } });
    await p.usuarioPapel.create({ data: { userId: user.id, papelId } });
    console.log(`  ✅ ${email} → ${nomePapel}`);
    atribuidos++;
  }

  console.log(`\n=== Concluído: ${PERMISSOES.length} permissões, ${Object.keys(PAPEL_PERMISSOES).length} papéis, ${atribuidos} usuários configurados ===`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
