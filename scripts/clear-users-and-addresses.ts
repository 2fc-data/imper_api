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
    'membros_equipe',
    'equipes',
    'separacao_itens',
    'separacoes',
    'etapa_os_materiais',
    'etapas_os',
    'aditivo_itens',
    'aditivos_os',
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
    'orcamento_atividade_materiais',
    'orcamento_atividades',
    'orcamento_obra_fichas',
    'orcamentos',
    'fotos_visitas',
    'visitas_tecnicas',
    'agendamentos',
    'atendimento_logs',
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

  console.log('\n🌱 Recriando usuários padrão de sistema (Admin, Supervisor, Técnico, etc)...');

  const defaultPasswordHash = await bcrypt.hash('senha123', 10);

  // Busca ID do cargo de Admin/Supervisor se existir
  const adminCargo = await prisma.cargo.findFirst({ where: { nome: 'Administrador' } });
  const supervisorCargo = await prisma.cargo.findFirst({ where: { nome: 'Supervisor' } });
  const tecnicoCargo = await prisma.cargo.findFirst({ where: { nome: 'Técnico' } });
  const almoxarifeCargo = await prisma.cargo.findFirst({ where: { nome: 'Almoxarife' } });
  const atendenteCargo = await prisma.cargo.findFirst({ where: { nome: 'Atendente' } });

  const admin = await prisma.user.create({
    data: {
      id: 1,
      nome: 'Admin Sistema',
      email: 'admin@imper.local',
      senhaHash: defaultPasswordHash,
      ativo: true,
      cargoId: adminCargo?.id,
    },
  });

  await prisma.user.createMany({
    data: [
      {
        id: 2,
        nome: 'Supervisor A',
        email: 'supervisor@imper.local',
        senhaHash: defaultPasswordHash,
        ativo: true,
        cargoId: supervisorCargo?.id,
      },
      {
        id: 3,
        nome: 'Técnico 1',
        email: 'tecnico@imper.local',
        senhaHash: defaultPasswordHash,
        ativo: true,
        cargoId: tecnicoCargo?.id,
      },
      {
        id: 4,
        nome: 'Almoxarife A',
        email: 'almoxarife@imper.local',
        senhaHash: defaultPasswordHash,
        ativo: true,
        cargoId: almoxarifeCargo?.id,
      },
      {
        id: 6,
        nome: 'Atendente A',
        email: 'atendente@imper.local',
        senhaHash: defaultPasswordHash,
        ativo: true,
        cargoId: atendenteCargo?.id,
      },
    ],
  });

  // Atribui papel de ADMIN ao usuário 1
  const adminPapel = await prisma.papelRbac.findFirst({ where: { nome: 'Administrador' } });
  if (adminPapel) {
    await prisma.usuarioPapel.create({
      data: {
        userId: admin.id,
        papelId: adminPapel.id,
      },
    });
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
