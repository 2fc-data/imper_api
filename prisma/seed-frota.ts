/**
 * Seed de lookups da frota — status e tipo de veículo (+ tipos de manutenção de veículo).
 * Idempotente: pode ser rodado múltiplas vezes sem duplicar registros.
 *
 * Uso: npx tsx prisma/seed-frota.ts
 */
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const STATUS_VEICULO = [
  { nome: 'ATIVO', ativo: true, ordem: 1 },
  { nome: 'EM_MANUTENCAO', ativo: true, ordem: 2 },
  { nome: 'INATIVO', ativo: false, ordem: 3 },
  { nome: 'DESATIVADO', ativo: false, ordem: 4 },
];

const TIPO_VEICULO = [
  { nome: 'CARRO', ordem: 1 },
  { nome: 'MOTO', ordem: 2 },
  { nome: 'VAN', ordem: 3 },
  { nome: 'CAMINHAO', ordem: 4 },
  { nome: 'UTILITARIO', ordem: 5 },
  { nome: 'OUTRO', ordem: 6 },
];

// nome não é unique em TipoManutencao → findFirst + create
const TIPOS_MANUTENCAO_VEICULO = [
  'Preventiva',
  'Corretiva',
  'Revisão periódica',
  'Pneus',
  'Freios',
  'Suspensão',
  'Elétrica',
  'Lavagem e estética',
];

async function main() {
  let criados = 0;
  let existentes = 0;

  for (const s of STATUS_VEICULO) {
    const r = await p.statusVeiculo.upsert({
      where: { nome: s.nome },
      update: { ativo: s.ativo, ordem: s.ordem },
      create: { nome: s.nome, ativo: s.ativo, ordem: s.ordem },
    });
    // upsert não distingue create/update facilmente; conta pelo id recente é frágil —
    // apenas reporta o estado final.
    console.log(`status_veiculo: ${r.id} ${r.nome} (ativo=${r.ativo})`);
  }

  for (const t of TIPO_VEICULO) {
    const r = await p.tipoVeiculo.upsert({
      where: { nome: t.nome },
      update: { ativo: true, ordem: t.ordem },
      create: { nome: t.nome, ativo: true, ordem: t.ordem },
    });
    console.log(`tipo_veiculo: ${r.id} ${r.nome}`);
  }

  for (const nome of TIPOS_MANUTENCAO_VEICULO) {
    const existente = await p.tipoManutencao.findFirst({ where: { nome } });
    if (existente) {
      existentes += 1;
      console.log(`tipo_manutencao: ${existente.id} ${nome} (já existe)`);
    } else {
      const r = await p.tipoManutencao.create({ data: { nome, ativo: true } });
      criados += 1;
      console.log(`tipo_manutencao: ${r.id} ${nome} (criado)`);
    }
  }

  const [sts, tps, tms] = await Promise.all([
    p.statusVeiculo.count(),
    p.tipoVeiculo.count(),
    p.tipoManutencao.count(),
  ]);
  console.log(
    `\nOK — status_veiculo=${sts}, tipo_veiculo=${tps}, tipo_manutencao=${tms} ` +
      `(tipos manutenção: ${criados} criados, ${existentes} já existiam)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
