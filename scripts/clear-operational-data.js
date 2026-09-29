import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting deletion of operational data (Atendimentos, Visitas, Agendamentos, Orçamentos, OS, Execução, etc)...');

  // Disable foreign key checks
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  const tablesToClear = [
    // Execution & Checklist
    'checklist_execucao',
    'atividades_os_linhas',
    'atividades_os',
    'membros_equipe',
    'equipes',

    // Separation & Items
    'separacao_itens',
    'separacoes',

    // Etapas OS & Materials
    'etapa_os_materiais',
    'etapas_os',

    // Aditivos & Items
    'aditivo_itens',
    'aditivos_os',

    // OS Tracking, Signatures, Financial & Access
    'historicos_posicao',
    'assinaturas',
    'pagamentos_os',
    'acessos_cliente',
    'notificacoes',

    // Stock & Movement related to OS / operational activity
    'movimentos_estoque',
    'retiradas_equipamentos',
    'entregas_epi',

    // Purchases
    'compra_itens',
    'compras',

    // Ordem de Serviço
    'ordens_servico',

    // Orçamentos & Fichas & Activities
    'orcamento_atividade_materiais',
    'orcamento_atividades',
    'orcamento_obra_fichas',
    'orcamentos',

    // Visitas & Photos
    'fotos_visitas',
    'visitas_tecnicas',

    // Agendamentos
    'agendamentos',

    // Atendimentos & Logs
    'atendimento_logs',
    'atendimentos',
  ];

  for (const table of tablesToClear) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      console.log(`Cleared table: ${table}`);
    } catch (err) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\`;`);
        console.log(`Deleted rows from table: ${table}`);
      } catch (deleteErr) {
        console.error(`Error clearing ${table}:`, deleteErr.message);
      }
    }
  }

  // Re-enable foreign key checks
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

  console.log('✅ Operational data successfully cleared!');
}

main()
  .catch((e) => {
    console.error('Error during cleanup script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
