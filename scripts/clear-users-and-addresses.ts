import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando limpeza da tabela de usuários e dados relacionados...');

  // Desativa verificação de foreign key para truncar de forma limpa
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  const tablesToClear = [
    // Operacional (para evitar registros órfãos vinculados aos usuários)
    'checklist_execucao',
    'atividades_os_linhas',
    'atividades_os',
    'separacao_itens',
    'separacoes',
    'etapa_os_materiais',
    'etapas_os',
    'aditivo_obra_itens',
    'aditivos_obra',
    'historicos_posicao',
    'assinaturas',
    'pagamentos_os',
    'acessos_cliente',
    'notificacoes',
    'movimentos_estoque',
    'retiradas_equipamentos',
    'entregas_epi',
    'compra_itens',
    'compras',
    'ordens_servico',
    'obras_atividades_materiais',
    'obras_atividades',
    'obras_etapas',
    'obras',
    'orcamento_atividade_materiais',
    'orcamento_atividades',
    'orcamento_obra_fichas',
    'orcamentos',
    'fotos_visitas',
    'visitas_tecnicas',
    'agendamentos',
    'atendimento_logs',
    'obras_atividades_materiais',
    'obras_atividades',
    'obras_etapas',
    'obras',
    'atendimentos',

    // Dados de Usuário e Endereços
    'enderecos',
    'disponibilidade_padroes',
    'disponibilidade_datas',
    'password_reset_tokens',
    'usuario_papel',
    'users',
  ];

  for (const table of tablesToClear) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      console.log(`  ✓ Tabela limpa: ${table}`);
    } catch {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\`;`);
        console.log(`  ✓ Registros removidos da tabela: ${table}`);
      } catch (err: any) {
        console.error(`  ✕ Erro ao limpar ${table}:`, err.message);
      }
    }
  }

  // Re-habilita checagem de chave estrangeira
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

  console.log('\n🌱 Recriando usuários padrão de sistema (Administrativo, Vendas, Colaborador, Almoxarife, Atendimento)...');

  const defaultPasswordHash = await bcrypt.hash('senha123', 10);

  // Cargos da lista oficial (migração 20261017111500_replace_cargos_options)
  // e papéis oficiais (migração 20261017120000_replace_papeis_options).
  const DEV_PERFIS = [
    { id: 1, nome: 'Admin Sistema', email: 'admin@imper.local',      cargo: 'Gestão',            papel: 'ADMINISTRATIVO' },
    { id: 2, nome: 'Supervisor A',  email: 'supervisor@imper.local', cargo: 'Comercial',         papel: 'VENDAS' },
    { id: 3, nome: 'Técnico 1',     email: 'tecnico@imper.local',    cargo: 'Colaboradores',     papel: 'COLABORADOR' },
    { id: 4, nome: 'Almoxarife A',  email: 'almoxarife@imper.local', cargo: 'Compras e estoque', papel: 'ALMOXARIFE' },
    { id: 6, nome: 'Atendente A',   email: 'atendente@imper.local',  cargo: 'Comercial',         papel: 'ATENDIMENTO' },
  ] as const;

  const cargoCache = new Map<string, number | null>();

  for (const perfil of DEV_PERFIS) {
    if (!cargoCache.has(perfil.cargo)) {
      const cargo = await prisma.cargo.findFirst({ where: { nome: perfil.cargo } });
      cargoCache.set(perfil.cargo, cargo?.id ?? null);
      if (!cargo) console.warn(`  ⚠ Cargo não encontrado: ${perfil.cargo}`);
    }

    const user = await prisma.user.create({
      data: {
        id: perfil.id,
        nome: perfil.nome,
        email: perfil.email,
        senhaHash: defaultPasswordHash,
        ativo: true,
        cargoId: cargoCache.get(perfil.cargo) ?? undefined,
      },
    });

    const papel = await prisma.papelRbac.findFirst({ where: { nome: perfil.papel } });
    if (papel) {
      await prisma.usuarioPapel.create({
        data: { userId: user.id, papelId: papel.id },
      });
    } else {
      console.warn(`  ⚠ Papel não encontrado: ${perfil.papel} (rode o seed-rbac antes)`);
    }
  }

  console.log('✅ Tabela `users`, `enderecos` e dados relacionados limpos com sucesso!');
  console.log('🔑 Usuário Administrador recriado: admin@imper.local / senha123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o script de limpeza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
