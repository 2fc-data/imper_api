/**
 * Seed da frota — veículos + lookups (marcas, cores) de apoio.
 * Idempotente: upsert de cores/marcas por nome e de veículos por placa.
 *
 * Uso: npx tsx prisma/seed-veiculos.ts
 */
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const CORES = [
  { nome: 'Branca', codigoHex: '#FFFFFF' },
  { nome: 'Cinza', codigoHex: '#808080' },
  { nome: 'Vermelha', codigoHex: '#FF0000' },
  { nome: 'Prata', codigoHex: '#C0C0C0' },
];

const MARCAS = ['VOLKSWAGEN', 'FIAT'];

type VeiculoSeed = {
  nome: string;
  fabricante: string;
  modelo?: string;
  placa: string;
  cor: string;
  combustivel: 'FLEX' | 'GASOLINA';
};

const VEICULOS: VeiculoSeed[] = [
  { nome: 'KOMBI', fabricante: 'VOLKSWAGEN', placa: 'HHE-8265', cor: 'Branca', combustivel: 'FLEX' },
  { nome: 'PALIO', fabricante: 'FIAT', modelo: 'EX', placa: 'GXC-9853', cor: 'Cinza', combustivel: 'GASOLINA' },
  { nome: 'FIORINO', fabricante: 'FIAT', modelo: '1.4', placa: 'PUP-3913', cor: 'Vermelha', combustivel: 'FLEX' },
  { nome: 'FIORINO', fabricante: 'FIAT', modelo: 'IE', placa: 'GXC-9449', cor: 'Vermelha', combustivel: 'GASOLINA' },
  { nome: 'UNO', fabricante: 'FIAT', modelo: 'MILLE FIRE', placa: 'HFH-3101', cor: 'Prata', combustivel: 'FLEX' },
  { nome: 'UNO', fabricante: 'FIAT', modelo: 'MILLE WAY ECON', placa: 'GRR-7855', cor: 'Vermelha', combustivel: 'FLEX' },
];

async function proximoCodigo(): Promise<string> {
  const ultimo = await p.veiculo.findFirst({
    where: { codigo: { startsWith: 'VCL-' } },
    orderBy: { id: 'desc' },
    select: { codigo: true },
  });
  let proximo = 1;
  if (ultimo) {
    const match = ultimo.codigo.match(/^VCL-(\d+)$/);
    if (match) proximo = Number(match[1]) + 1;
  }
  return `VCL-${String(proximo).padStart(2, '0')}`;
}

async function main() {
  const tipo = await p.tipoVeiculo.findUnique({ where: { nome: 'CARRO' } });
  if (!tipo) throw new Error('tipo_veiculo CARRO não encontrado (rode db:seed-frota)');

  const status = await p.statusVeiculo.findUnique({ where: { nome: 'ATIVO' } });
  if (!status) throw new Error('status_veiculo ATIVO não encontrado (rode db:seed-frota)');

  const cores = new Map<string, number>();
  for (const c of CORES) {
    const existente = await p.cor.findFirst({ where: { nome: c.nome } });
    const r = existente
      ? await p.cor.update({ where: { id: existente.id }, data: { codigoHex: c.codigoHex, ativo: true } })
      : await p.cor.create({ data: { nome: c.nome, codigoHex: c.codigoHex, ativo: true } });
    cores.set(c.nome, r.id);
  }

  const marcas = new Map<string, number>();
  for (const nome of MARCAS) {
    const existente = await p.marca.findFirst({ where: { nome } });
    const r = existente
      ? await p.marca.update({ where: { id: existente.id }, data: { ativo: true } })
      : await p.marca.create({ data: { nome, ativo: true } });
    marcas.set(nome, r.id);
  }

  for (const v of VEICULOS) {
    const fabricanteId = marcas.get(v.fabricante);
    const corId = cores.get(v.cor);
    if (!fabricanteId || !corId) throw new Error(`Lookup faltando para ${v.nome} ${v.placa}`);

    const existente = await p.veiculo.findUnique({ where: { placa: v.placa } });
    const dados = {
      nome: v.nome,
      fabricanteId,
      modelo: v.modelo ?? null,
      combustivel: v.combustivel,
      corId,
      tipoId: tipo.id,
      statusId: status.id,
      ativo: true,
    };
    const veiculo = existente
      ? await p.veiculo.update({ where: { id: existente.id }, data: dados, select: { id: true, codigo: true, nome: true } })
      : await p.veiculo.create({
          data: { ...dados, codigo: await proximoCodigo(), placa: v.placa },
          select: { id: true, codigo: true, nome: true },
        });

    console.log(`✅ ${veiculo.codigo} ${veiculo.nome} ${v.placa} (${v.fabricante}${v.modelo ? ` ${v.modelo}` : ''})`);
  }

  console.log(`\n🚗 ${VEICULOS.length} veículos, ${CORES.length} cores, ${MARCAS.length} marcas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
