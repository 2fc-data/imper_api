/**
 * Seed de subcategorias — EPI (categoriaEpi), equipamentos (categoriaEquipamento)
 * e materiais (categoriaMaterial).
 * Resolve categorias por NOME (sem IDs fixos) e é idempotente (upsert por nome+categoria).
 *
 * Requer: prisma/seed-cadastros.ts executado antes (cria as categorias).
 *
 * Uso: npx tsx prisma/seed-subcategorias.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Tipo = 'epi' | 'equipamento' | 'material';

interface SubcategoriaInput {
  tipo: Tipo;
  categoria: string;
  nome: string;
  ordem: number;
}

const EPI = (categoria: string, itens: string[]): SubcategoriaInput[] =>
  itens.map((nome, i) => ({
    tipo: 'epi' as const,
    categoria,
    nome,
    ordem: i + 1,
  }));

const EQP = (categoria: string, itens: string[]): SubcategoriaInput[] =>
  itens.map((nome, i) => ({
    tipo: 'equipamento' as const,
    categoria,
    nome,
    ordem: i + 1,
  }));

const MAT = (categoria: string, itens: string[]): SubcategoriaInput[] =>
  itens.map((nome, i) => ({
    tipo: 'material' as const,
    categoria,
    nome,
    ordem: i + 1,
  }));

const subcategorias: SubcategoriaInput[] = [
  // ─── EQUIPAMENTO ──────────────────────────────────────────
  ...EQP('Equipamentos de Aplicação', [
    'Airless',
    'Truque',
    'Rolo',
    'Espátula',
    'Desempenadeira',
  ]),
  ...EQP('Equipamentos de Segurança', [
    'Cinturão Tipo Paraquedista',
    'Talabarte',
    'Mosquetão',
    'Trava-Queda',
    'Linha de Vida',
  ]),
  ...EQP('Escadas', [
    'Escada Extensível',
    'Escada Convolúvel',
    'Escada Triangular',
    'Escada Plataforma',
  ]),
  ...EQP('Ferramentas Elétricas', [
    'Furadeira',
    'Serra',
    'Esmerilhadeira',
    'Lixadeira',
    'Misturador Elétrico',
  ]),
  ...EQP('Ferramentas Manuais', [
    'Tesoura',
    'Facão',
    'Chave de Fenda',
    'Martelo',
    'Nível',
  ]),
  ...EQP('Materiais Diversos', [
    'Fita Adesiva',
    'Lona',
    'Plástico',
    'Isqueiro',
    'Barbante',
  ]),
  ...EQP('Outros', [
    'Caixa de Ferramenta',
    'Carrinho de Mão',
    'Compressor',
    'Gerador',
    'Outros',
  ]),

  // ─── EPI ──────────────────────────────────────────────────
  ...EPI('Proteção da Cabeça', [
    'Capacete de Segurança',
    'Capacete com Abafador',
    'Boné de Segurança',
  ]),
  ...EPI('Proteção do Corpo', [
    'Macacão',
    'Aventil',
    'Colete Refletivo',
    'Calça',
  ]),
  ...EPI('Proteção Respiratória', [
    'Máscara PFF2',
    'Máscara com Filtro',
    'Respirador Sem Filtro',
    'Filtro Separado',
  ]),
  ...EPI('Proteção das Mãos', [
    'Luva de Vaqueta',
    'Luva Nitrílica',
    'Luva de Borracha',
    'Luva Térmica',
  ]),
  ...EPI('Proteção dos Olhos', [
    'Óculos de Segurança',
    'Óculos Ampla Visão',
    'Máscara Facial',
  ]),
  ...EPI('Proteção Auditiva', [
    'Abafador de Ruído',
    'Protetor Auricular',
    'Canaleta',
  ]),
  ...EPI('Proteção de Quedas', [
    'Cinturão Paraquedista',
    'Talabarte',
    'Trava-Queda',
    'Linha de Vida',
  ]),
  ...EPI('Proteção Articular', ['Joelheira', 'Cotoveleira', 'Munhequeira']),

  // ─── MATERIAL ─────────────────────────────────────────────
  ...MAT('Argamassas', ['Argamassa AC', 'Rejunte', 'Contramarcha', 'Massa Pó']),
  ...MAT('Tintas', [
    'Tinta Látex',
    'Tinta Texturizada',
    'Esmalte',
    'Fundimento/Primer',
    'Verniz',
  ]),
  ...MAT('Elétricos', [
    'Fiação e Cabos',
    'Disjuntores',
    'Tomadas e Interruptores',
    'Iluminação',
    'Quadros de Distribuição',
  ]),
  ...MAT('Hidráulicos', [
    'Tubos',
    'Conexões',
    'Registros e Torneiras',
    'Acessórios de Hidráulica',
  ]),
  ...MAT('Ferragens', [
    'Parafusos',
    'Pregos',
    'Dobradiças',
    'Fechaduras',
    'Porcas e Arruelas',
  ]),
  ...MAT('Madeiras', [
    'Compensado e Contraplacado',
    'Tábuas e Vigas',
    'MDF e MDP',
    'Madeira Pintada',
  ]),
  ...MAT('Revestimentos', [
    'Cerâmicas',
    'Porcelanatos',
    'Pastilhas',
    'Revestimento de Parede',
  ]),
  ...MAT('Diversos', [
    'Impermeabilizantes',
    'Consumíveis',
    'Acessórios Diversos',
    'Diversos',
  ]),
];

async function main() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Seed: Subcategorias (EPI/Equip/Materiais)         │');
  console.log('└─────────────────────────────────────────────┘\n');

  const catsEpi = await prisma.categoriaEpi.findMany({
    select: { id: true, nome: true },
  });
  const catsEqp = await prisma.categoriaEquipamento.findMany({
    select: { id: true, nome: true },
  });
  const catsMat = await prisma.categoriaMaterial.findMany({
    select: { id: true, nome: true },
  });
  const catEpiMap = new Map(catsEpi.map((c) => [c.nome, c.id]));
  const catEqpMap = new Map(catsEqp.map((c) => [c.nome, c.id]));
  const catMatMap = new Map(catsMat.map((c) => [c.nome, c.id]));

  // agrupar por tipo+categoria para log
  const grupos = new Map<string, SubcategoriaInput[]>();
  for (const s of subcategorias) {
    const key = `${s.tipo}:${s.categoria}`;
    const arr = grupos.get(key) ?? [];
    arr.push(s);
    grupos.set(key, arr);
  }

  let criadas = 0;
  let atualizadas = 0;
  const pendentes: string[] = [];

  for (const [key, lista] of grupos) {
    const [tipo, nomeCat] = key.split(/:(.+)/);
    const catId =
      tipo === 'epi'
        ? catEpiMap.get(nomeCat)
        : tipo === 'material'
          ? catMatMap.get(nomeCat)
          : catEqpMap.get(nomeCat);

    if (!catId) {
      pendentes.push(`${nomeCat} (${tipo})`);
      console.log(
        `  ⚠️  Categoria "${nomeCat}" (${tipo}) não encontrada — ignorando`,
      );
      continue;
    }

    console.log(`\n  ${nomeCat} [${tipo}] (id=${catId})`);
    for (const s of lista) {
      if (tipo === 'epi') {
        const existente = await prisma.subcategoriaEpi.findFirst({
          where: { categoriaId: catId, nome: s.nome },
        });
        if (existente) {
          await prisma.subcategoriaEpi.update({
            where: { id: existente.id },
            data: { ordem: s.ordem, ativo: true },
          });
          atualizadas += 1;
          console.log(`    = ${s.ordem}. ${s.nome} (existente)`);
        } else {
          await prisma.subcategoriaEpi.create({
            data: {
              categoriaId: catId,
              nome: s.nome,
              ordem: s.ordem,
              ativo: true,
            },
          });
          criadas += 1;
          console.log(`    ✓ ${s.ordem}. ${s.nome}`);
        }
      } else if (tipo === 'material') {
        const existente = await prisma.subcategoriaMaterial.findFirst({
          where: { categoriaId: catId, nome: s.nome },
        });
        if (existente) {
          await prisma.subcategoriaMaterial.update({
            where: { id: existente.id },
            data: { ordem: s.ordem, ativo: true },
          });
          atualizadas += 1;
          console.log(`    = ${s.ordem}. ${s.nome} (existente)`);
        } else {
          await prisma.subcategoriaMaterial.create({
            data: {
              categoriaId: catId,
              nome: s.nome,
              ordem: s.ordem,
              ativo: true,
            },
          });
          criadas += 1;
          console.log(`    ✓ ${s.ordem}. ${s.nome}`);
        }
      } else {
        const existente = await prisma.subcategoriaEquipamento.findFirst({
          where: { categoriaId: catId, nome: s.nome },
        });
        if (existente) {
          await prisma.subcategoriaEquipamento.update({
            where: { id: existente.id },
            data: { ordem: s.ordem, ativo: true },
          });
          atualizadas += 1;
          console.log(`    = ${s.ordem}. ${s.nome} (existente)`);
        } else {
          await prisma.subcategoriaEquipamento.create({
            data: {
              categoriaId: catId,
              nome: s.nome,
              ordem: s.ordem,
              ativo: true,
            },
          });
          criadas += 1;
          console.log(`    ✓ ${s.ordem}. ${s.nome}`);
        }
      }
    }
  }

  const [totalEpi, totalEqp, totalMat] = await Promise.all([
    prisma.subcategoriaEpi.count(),
    prisma.subcategoriaEquipamento.count(),
    prisma.subcategoriaMaterial.count(),
  ]);

  console.log(`\n┌─────────────────────────────────────────────┐`);
  console.log(
    `│  Criadas: ${String(criadas).padStart(3)} · Atualizadas: ${String(atualizadas).padStart(3)}        │`,
  );
  console.log(
    `│  epi=${totalEpi} · equipamentos=${totalEqp} · materiais=${totalMat}       │`,
  );
  console.log(`└─────────────────────────────────────────────┘`);

  if (pendentes.length > 0) {
    console.log(
      `\n⚠️  Categorias pendentes (rode seed-cadastros antes): ${pendentes.join(', ')}`,
    );
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
