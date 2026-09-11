import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// ── Dados de entrada ──────────────────────────────────────────────
type Row = {
  nome: string;
  unidade: string;
  fornecedor: string | null;
  numeroPatrimonio: string | null;
  numeroCa: string | null;
};

const ROWS: Row[] = [
  { nome: 'ACRÍLICO PARA PROTETOR FACIAL', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: null },
  { nome: 'BONÉ ARABE', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: '39856' },
  { nome: 'BOTA DE PVC', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: null },
  { nome: 'BOTINA DE SEGURANÇA C/ BIQUEIRA', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: '28511' },
  { nome: 'CALÇA EM PVC FORRADA', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: null },
  { nome: 'CALÇA JEANS', unidade: 'UNIDADE', fornecedor: 'ATACADÃO DO JEANS', numeroPatrimonio: null, numeroCa: null },
  { nome: 'CAMISA', unidade: 'UNIDADE', fornecedor: 'CAMISARIA ITALIANA', numeroPatrimonio: null, numeroCa: null },
  { nome: 'CAMISETA (DRYFIT – MANGA CURTA)', unidade: 'UNIDADE', fornecedor: 'HODA D', numeroPatrimonio: null, numeroCa: null },
  { nome: 'CAMISETA (DRYFIT – MANGA LONGA)', unidade: 'UNIDADE', fornecedor: 'HODA D', numeroPatrimonio: null, numeroCa: null },
  { nome: 'CAMISETA MALHA (MANGA CURTA)', unidade: 'UNIDADE', fornecedor: 'HODA D', numeroPatrimonio: null, numeroCa: null },
  { nome: 'CAMISETA MALHA (MANGA LONGA)', unidade: 'UNIDADE', fornecedor: 'HODA D', numeroPatrimonio: null, numeroCa: null },
  { nome: 'CAPA DE CHUVA PVC FORRADA', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: null },
  { nome: 'CAPACETE (PLASTICOR – MOD. ELT)', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: '25883' },
  { nome: 'CAPACETE (PLASTICOR – MOD. PLT)', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: '31469' },
  { nome: 'CARNEIRA', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: null },
  { nome: 'COLETE REFLETIVO', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: null },
  { nome: 'FILTRO PARA RESPIRADOR MIG', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: null },
  { nome: 'JALECO', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: null },
  { nome: 'JOELHEIRA DE PROTEÇÃO', unidade: 'PAR', fornecedor: 'FERUNI', numeroPatrimonio: '60538', numeroCa: null },
  { nome: 'LUVA NITRÍLICA', unidade: 'PAR', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '32069' },
  { nome: 'LUVA PRETA (MULTITÁTIL – VOLK)', unidade: 'PAR', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '30916' },
  { nome: 'LUVA PRETA (PU – MULTITÁTIL – IMBAT)', unidade: 'PAR', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '41761' },
  { nome: 'LUVA PRETA (PU – MULTITÁTIL – KALIPSO)', unidade: 'PAR', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '15272' },
  { nome: 'LUVA VAQUETA', unidade: 'PAR', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '17074' },
  { nome: 'LUVA VAQUETA LONGA', unidade: 'PAR', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: '36845' },
  { nome: 'MÁSCARA PFFII', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '38503' },
  { nome: 'MÁSCARA PFFIII', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: null },
  { nome: 'ÓCULOS DE PROTEÇÃO ESCURO (MEDIX)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '48553' },
  { nome: 'ÓCULOS DE PROTEÇÃO ESCURO (VVISION 100 - VOLK)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '42716' },
  { nome: 'ÓCULOS DE PROTEÇÃO ESCURO (VVISION 100 - VOLK)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '50610' },
  { nome: 'ÓCULOS DE PROTEÇÃO TRANSPARENTE (MEDIX)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '48553' },
  { nome: 'ÓCULOS DE PROTEÇÃO TRANSPARENTE (VVISION 100 - VOLK)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '42716' },
  { nome: 'ÓCULOS DE PROTEÇÃO TRANSPARENTE (VVISION 100 - VOLK)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '51536' },
  { nome: 'PROTETOR AUDITIVO', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '14470' },
  { nome: 'PROTETOR AURICULAR TIPO CONCHA (ABAFADOR – KALIPSO – K40)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '16050' },
  { nome: 'PROTETOR FACIAL INCOLOR', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: null },
  { nome: 'PROTETOR LOMBAR', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: null, numeroCa: null },
  { nome: 'PROTETOR SOLAR', unidade: 'UNIDADE', fornecedor: 'FERUNI', numeroPatrimonio: null, numeroCa: null },
  { nome: 'RESPIRADOR PURIFICADOR (MIG 11 VO – DESTRA)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '37393' },
  { nome: 'RESPIRADOR PURIFICADOR (MIG 12 VO – DESTRA)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '27999' },
  { nome: 'RESPIRADOR/PURIFICADOR (MIG – MASTT - ALLTEC)', unidade: 'UNIDADE', fornecedor: 'MERCANTIL', numeroPatrimonio: null, numeroCa: '33596' },
  { nome: 'TRAVA-QUEDAS', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '175', numeroCa: null },
  { nome: 'TRAVA-QUEDAS', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '410', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CABO DE AÇO)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '25', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CABO DE AÇO)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '26', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CABO DE AÇO)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '260', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CABO DE AÇO)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '261', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA - BRANCO)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '6', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA - RETRÁTIL)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '259', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA - RETRÁTIL)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '387', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA - RETRÁTIL)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '490', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '177', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '262', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '264', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '265', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '268', numeroCa: null },
  { nome: 'TRAVA-QUEDAS (PARA CORDA)', unidade: 'UNIDADE', fornecedor: null, numeroPatrimonio: '491', numeroCa: null },
];

// ── Lookups auxiliares ────────────────────────────────────────────
const UNIDADES = [...new Set(ROWS.map(r => r.unidade))];
const FORNECEDORES = [...new Set(ROWS.filter(r => r.fornecedor !== null).map(r => r.fornecedor!))];

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  const rollback = process.argv.includes('--rollback');

  if (rollback) {
    console.log('Rollback: removendo dados do seed-epis...');
    const epi = await p.epi.deleteMany({ where: { codigo: { startsWith: 'EPI-' } } });
    const um = await p.unidadeMedida.deleteMany({ where: { nome: { in: UNIDADES } } });
    console.log(`Removidos: epis=${epi.count} unidade_medida=${um.count}`);
    return;
  }

  // 1. Unidades de medida
  console.log('--- Unidades de medida ---');
  const umMap: Record<string, number> = {};
  for (const nome of UNIDADES) {
    const rec = await p.unidadeMedida.upsert({
      where: { nome },
      create: { nome },
      update: {},
    });
    umMap[nome] = rec.id;
    console.log(`  ${rec.nome} (id=${rec.id})`);
  }

  // 2. Fornecedores (apenas os que já existem ou são reais)
  console.log('--- Fornecedores ---');
  const fornMap: Record<string, number> = {};
  for (const nome of FORNECEDORES) {
    const existing = await p.fornecedor.findFirst({ where: { nome } });
    if (existing) {
      fornMap[nome] = existing.id;
      console.log(`  ${existing.nome} (id=${existing.id}) [existente]`);
    } else {
      const rec = await p.fornecedor.create({ data: { nome } });
      fornMap[nome] = rec.id;
      console.log(`  ${rec.nome} (id=${rec.id}) [criado]`);
    }
  }

  // 3. Limpar EPIs antigos
  console.log('--- Limpando EPIs antigos ---');
  const deleted = await p.epi.deleteMany({ where: { codigo: { startsWith: 'EPI-' } } });
  console.log(`  Deletados: ${deleted.count}`);

  // 4. Inserir novos EPIs
  console.log('--- Inserindo EPIs ---');
  let criados = 0;
  for (let i = 0; i < ROWS.length; i++) {
    const r = ROWS[i];
    const codigo = `EPI-${String(i + 1).padStart(3, '0')}`;
    await p.epi.create({
      data: {
        codigo,
        nome: r.nome,
        numeroCa: r.numeroCa,
        numeroPatrimonio: r.numeroPatrimonio,
        unidadeMedidaId: umMap[r.unidade],
        fornecedorId: r.fornecedor ? fornMap[r.fornecedor] ?? null : null,
        quantidade: 0,
      },
    });
    criados++;
    const pat = r.numeroPatrimonio ? ` [PAT: ${r.numeroPatrimonio}]` : '';
    const ca = r.numeroCa ? ` [CA: ${r.numeroCa}]` : '';
    console.log(`  ${codigo} - ${r.nome}${pat}${ca}`);
  }

  console.log(`\n✅ Seed concluído: ${criados} EPIs criados.`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
