import { PrismaClient } from '@prisma/client';

/**
 * Wipe OS → Obra (spec Seção 4): apaga TODOS os dados vinculados a
 * ordens_servico + aditivos_os, e reseta orçamentos APROVADO → ENVIADO.
 *
 * Modos:
 *   --dry-run                                  só mostra o que seria apagado
 *   --confirm-backup <ID> --yes                executa (exige backup declarado)
 *   --verify                                   24 verificações (exit 1 se falhar)
 *
 * Pré-requisito: rode ANTES de `prisma db push` (a tabela aditivos_os
 * precisa existir). Ver docs/runbook-wipe-os-para-obra.md.
 */

const prisma = new PrismaClient();

type Modo = 'dry-run' | 'execute' | 'verify';

interface Args {
  modo: Modo;
  confirmBackup?: string;
  yes: boolean;
}

interface Passo {
  passo: string;
  tabela: string;
  where?: string;
}

function parseArgs(argv: string[]): Args {
  if (argv.includes('--verify')) return { modo: 'verify', yes: false };
  if (argv.includes('--dry-run')) return { modo: 'dry-run', yes: false };
  const idx = argv.indexOf('--confirm-backup');
  const confirmBackup = idx >= 0 ? argv[idx + 1] : undefined;
  return { modo: 'execute', confirmBackup, yes: argv.includes('--yes') };
}

function inList(ids: Array<number | null | undefined>): string {
  return ids.filter((v): v is number => typeof v === 'number').join(', ');
}

async function tabelaExiste(nome: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<Array<{ n: number }>>(
    `SELECT COUNT(*) AS n FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = '${nome}'`,
  );
  return Number(rows[0]?.n ?? 0) > 0;
}

async function contar(tabela: string, where?: string): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<Array<{ n: number }>>(
    `SELECT COUNT(*) AS n FROM \`${tabela}\`${where ? ` WHERE ${where}` : ''}`,
  );
  return Number(rows[0]?.n ?? 0);
}

async function montarPassos(): Promise<Passo[]> {
  const pagamentos = await prisma.$queryRawUnsafe<Array<{ id: number; lancamentoId: number | null }>>(
    'SELECT id, lancamentoId FROM pagamentos_os',
  );
  const compras = await prisma.$queryRawUnsafe<Array<{ id: number }>>(
    'SELECT id FROM compras WHERE ordemServicoId IS NOT NULL',
  );
  const aditivos = await prisma.$queryRawUnsafe<Array<{ id: number }>>('SELECT id FROM aditivos_os');

  const pagLancIds = inList(pagamentos.map((p) => p.lancamentoId));
  const pagIds = inList(pagamentos.map((p) => p.id));
  const compraIds = inList(compras.map((c) => c.id));
  const aditivoIds = inList(aditivos.map((a) => a.id));

  const lancParts: string[] = [];
  if (pagLancIds) lancParts.push(`(id IN (${pagLancIds}))`);
  if (pagIds) lancParts.push(`(origem = 'PAGAMENTO' AND origemId IN (${pagIds}))`);
  if (compraIds) lancParts.push(`(origem = 'COMPRA' AND origemId IN (${compraIds}))`);
  if (aditivoIds) lancParts.push(`(origem = 'ADITIVO' AND origemId IN (${aditivoIds}))`);
  const lancWhere = lancParts.length > 0 ? lancParts.join(' OR ') : '1 = 0';

  const movParts: string[] = ['ordemServicoId IS NOT NULL', 'separacaoItemId IS NOT NULL'];
  if (compraIds) {
    movParts.push(`compraItemId IN (SELECT id FROM compra_itens WHERE compraId IN (${compraIds}))`);
  }
  const movWhere = movParts.join(' OR ');

  return [
    { passo: 'movimentos', tabela: 'movimentos_estoque', where: movWhere },
    { passo: 'checklist', tabela: 'checklist_execucao' },
    { passo: 'linhas', tabela: 'atividades_os_linhas' },
    { passo: 'retiradas', tabela: 'retiradas_equipamentos', where: 'osId IS NOT NULL OR atividadeOSId IS NOT NULL' },
    { passo: 'entregas', tabela: 'entregas_epi', where: 'osId IS NOT NULL OR atividadeOSId IS NOT NULL OR separacaoId IS NOT NULL' },
    { passo: 'atividades_os', tabela: 'atividades_os' },
    { passo: 'sep_itens', tabela: 'separacao_itens' },
    { passo: 'separacoes', tabela: 'separacoes' },
    { passo: 'compras', tabela: 'compras', where: 'ordemServicoId IS NOT NULL' },
    { passo: 'membros', tabela: 'membros_equipe' },
    { passo: 'equipes', tabela: 'equipes' },
    { passo: 'etapa_materiais', tabela: 'etapa_os_materiais' },
    { passo: 'etapas_os', tabela: 'etapas_os' },
    { passo: 'pagamentos', tabela: 'pagamentos_os' },
    { passo: 'historico', tabela: 'historicos_posicao' },
    { passo: 'assinatura', tabela: 'assinaturas' },
    { passo: 'acesso', tabela: 'acessos_cliente' },
    { passo: 'notificacoes', tabela: 'notificacoes', where: 'ordemServicoId IS NOT NULL' },
    { passo: 'aditivo_itens', tabela: 'aditivo_itens' },
    { passo: 'aditivos_os', tabela: 'aditivos_os' },
    { passo: 'lancamentos', tabela: 'lancamentos_financeiros', where: lancWhere },
    { passo: 'ordens_servico', tabela: 'ordens_servico' },
  ];
}

async function dryRun(passos: Passo[]): Promise<void> {
  console.log('=== DRY RUN (nenhuma linha será alterada) ===');
  let i = 1;
  for (const p of passos) {
    const apagaria = await contar(p.tabela, p.where);
    const total = await contar(p.tabela);
    const sobraria = p.where ? total - apagaria : 0;
    console.log(`[${String(i).padStart(2, '0')}] ${p.tabela}: apagaria ${apagaria}, sobraria ${sobraria}`);
    i++;
  }
  const aprovados = await contar('orcamentos', "status = 'APROVADO'");
  console.log(`orçamentos APROVADO a resetar para ENVIADO: ${aprovados}`);
}

async function execute(passos: Passo[], confirmBackup: string | undefined, yes: boolean): Promise<void> {
  if (!confirmBackup || !yes) {
    console.error('ERRO: execução exige --confirm-backup <ID_DO_BACKUP> --yes');
    console.error('Uso: npx tsx scripts/wipe-os-obra.ts --confirm-backup <ID> --yes');
    process.exitCode = 1;
    return;
  }
  console.log(`Backup declarado: ${confirmBackup}`);

  await prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
      try {
        let i = 1;
        for (const p of passos) {
          const apagaria = await contarVia(tx, p.tabela, p.where);
          await tx.$executeRawUnsafe(
            `DELETE FROM \`${p.tabela}\`${p.where ? ` WHERE ${p.where}` : ''}`,
          );
          console.log(`[${String(i).padStart(2, '0')}] ${p.tabela}: apagados ${apagaria}`);
          if (!p.where) {
            const restantes = await contarVia(tx, p.tabela);
            if (restantes !== 0) {
              throw new Error(`${p.tabela}: esperava 0 linhas após wipe, restaram ${restantes}`);
            }
          }
          i++;
        }
      } finally {
        await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
      }
    },
    { timeout: 120000, maxWait: 10000 },
  );

  const resetados = await prisma.$executeRawUnsafe(
    "UPDATE orcamentos SET status = 'ENVIADO', aprovadoPorId = NULL, aprovadoEm = NULL WHERE status = 'APROVADO'",
  );
  console.log(`orçamentos resetados APROVADO → ENVIADO: ${Number(resetados)}`);

  const restantes = await contar('orcamentos', "status = 'APROVADO'");
  if (restantes !== 0) {
    console.error(`[ERRO] restam ${restantes} orçamentos APROVADO após reset`);
    process.exitCode = 1;
    return;
  }
  console.log('[OK] nenhum orçamento permanece APROVADO');
}

async function contarVia(
  tx: Prisma.TransactionClient,
  tabela: string,
  where?: string,
): Promise<number> {
  const rows = await tx.$queryRawUnsafe<Array<{ n: number }>>(
    `SELECT COUNT(*) AS n FROM \`${tabela}\`${where ? ` WHERE ${where}` : ''}`,
  );
  return Number(rows[0]?.n ?? 0);
}

async function verify(): Promise<void> {
  const checks: Array<{ rotulo: string; tabela: string; where?: string; esperado: number }> = [];
  const populadas: Array<[string, number]> = [
    ['movimentos_estoque', 2],
    ['retiradas_equipamentos', 1],
    ['entregas_epi', 1],
    ['compras', 1],
    ['notificacoes', 1],
    ['lancamentos_financeiros', 2],
  ];
  for (const [tabela, esperado] of populadas) {
    checks.push({ rotulo: `${tabela} = ${esperado} (linhas avulsas sobrevivem)`, tabela, esperado });
  }
  const zeradas = [
    'checklist_execucao',
    'atividades_os_linhas',
    'atividades_os',
    'separacao_itens',
    'separacoes',
    'membros_equipe',
    'equipes',
    'etapa_os_materiais',
    'etapas_os',
    'pagamentos_os',
    'historicos_posicao',
    'assinaturas',
    'acessos_cliente',
    'aditivo_itens',
    'aditivos_os',
    'ordens_servico',
  ];
  for (const tabela of zeradas) {
    checks.push({ rotulo: `${tabela} = 0`, tabela, esperado: 0 });
  }
  checks.push({ rotulo: "orcamentos APROVADO = 0", tabela: 'orcamentos', where: "status = 'APROVADO'", esperado: 0 });
  checks.push({ rotulo: 'orcamentos total = 2 (fixture)', tabela: 'orcamentos', esperado: 2 });

  let falhas = 0;
  let i = 1;
  for (const c of checks) {
    const n = await contar(c.tabela, c.where);
    const ok = n === c.esperado;
    if (!ok) falhas++;
    console.log(
      `[${ok ? 'OK' : 'ERRO'}] ${String(i).padStart(2, '0')} ${c.rotulo} — obtido ${n}`,
    );
    i++;
  }
  console.log(`${checks.length} verificações, ${falhas} falha(s)`);
  if (falhas > 0) process.exitCode = 1;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!(await tabelaExiste('aditivos_os'))) {
    console.error('ERRO: tabela aditivos_os não existe — rode ANTES de prisma db push (spec Seção 4).');
    process.exitCode = 1;
    return;
  }

  if (args.modo === 'verify') {
    await verify();
    return;
  }

  const passos = await montarPassos();

  if (args.modo === 'dry-run') {
    await dryRun(passos);
    return;
  }

  await execute(passos, args.confirmBackup, args.yes);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
