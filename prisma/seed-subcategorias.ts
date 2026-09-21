import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SubcategoriaInput {
  categoriaId: number;
  nome: string;
  ordem: number;
}

const subcategorias: SubcategoriaInput[] = [
  // ─── EQUIPAMENTO ──────────────────────────────────────────
  // 9 · Equipamentos de Aplicação
  { categoriaId: 9, nome: 'Airless', ordem: 1 },
  { categoriaId: 9, nome: 'Truque', ordem: 2 },
  { categoriaId: 9, nome: 'Rolo', ordem: 3 },
  { categoriaId: 9, nome: 'Espátula', ordem: 4 },
  { categoriaId: 9, nome: 'Desempenadeira', ordem: 5 },

  // 10 · Equipamentos de Segurança
  { categoriaId: 10, nome: 'Cinturão Tipo Paraquedista', ordem: 1 },
  { categoriaId: 10, nome: 'Talabarte', ordem: 2 },
  { categoriaId: 10, nome: 'Mosquetão', ordem: 3 },
  { categoriaId: 10, nome: 'Trava-Queda', ordem: 4 },
  { categoriaId: 10, nome: 'Linha de Vida', ordem: 5 },

  // 11 · Escadas
  { categoriaId: 11, nome: 'Escada Extensível', ordem: 1 },
  { categoriaId: 11, nome: 'Escada Convolúvel', ordem: 2 },
  { categoriaId: 11, nome: 'Escada Triangular', ordem: 3 },
  { categoriaId: 11, nome: 'Escada Plataforma', ordem: 4 },

  // 12 · Ferramentas Elétricas
  { categoriaId: 12, nome: 'Furadeira', ordem: 1 },
  { categoriaId: 12, nome: 'Serra', ordem: 2 },
  { categoriaId: 12, nome: 'Esmerilhadeira', ordem: 3 },
  { categoriaId: 12, nome: 'Lixadeira', ordem: 4 },
  { categoriaId: 12, nome: 'Misturador Elétrico', ordem: 5 },

  // 13 · Ferramentas Manuais
  { categoriaId: 13, nome: 'Tesoura', ordem: 1 },
  { categoriaId: 13, nome: 'Facão', ordem: 2 },
  { categoriaId: 13, nome: 'Chave de Fenda', ordem: 3 },
  { categoriaId: 13, nome: 'Martelo', ordem: 4 },
  { categoriaId: 13, nome: 'Nível', ordem: 5 },

  // 14 · Materiais Diversos
  { categoriaId: 14, nome: 'Fita Adesiva', ordem: 1 },
  { categoriaId: 14, nome: 'Lona', ordem: 2 },
  { categoriaId: 14, nome: 'Plástico', ordem: 3 },
  { categoriaId: 14, nome: 'Isqueiro', ordem: 4 },
  { categoriaId: 14, nome: 'Barbante', ordem: 5 },

  // 15 · Outros
  { categoriaId: 15, nome: 'Caixa de Ferramenta', ordem: 1 },
  { categoriaId: 15, nome: 'Carrinho de Mão', ordem: 2 },
  { categoriaId: 15, nome: 'Compressor', ordem: 3 },
  { categoriaId: 15, nome: 'Gerador', ordem: 4 },
  { categoriaId: 15, nome: 'Outros', ordem: 5 },

  // ─── EPI ──────────────────────────────────────────────────
  // 1 · Proteção da Cabeça
  { categoriaId: 1, nome: 'Capacete de Segurança', ordem: 1 },
  { categoriaId: 1, nome: 'Capacete com Abafador', ordem: 2 },
  { categoriaId: 1, nome: 'Boné de Segurança', ordem: 3 },

  // 2 · Proteção do Corpo
  { categoriaId: 2, nome: 'Macacão', ordem: 1 },
  { categoriaId: 2, nome: 'Aventil', ordem: 2 },
  { categoriaId: 2, nome: 'Colete Refletivo', ordem: 3 },
  { categoriaId: 2, nome: 'Calça', ordem: 4 },

  // 3 · Proteção Respiratória
  { categoriaId: 3, nome: 'Máscara PFF2', ordem: 1 },
  { categoriaId: 3, nome: 'Máscara com Filtro', ordem: 2 },
  { categoriaId: 3, nome: 'Respirador Sem Filtro', ordem: 3 },
  { categoriaId: 3, nome: 'Filtro Separado', ordem: 4 },

  // 4 · Proteção das Mãos
  { categoriaId: 4, nome: 'Luva de Vaqueta', ordem: 1 },
  { categoriaId: 4, nome: 'Luva Nitrílica', ordem: 2 },
  { categoriaId: 4, nome: 'Luva de Borracha', ordem: 3 },
  { categoriaId: 4, nome: 'Luva Térmica', ordem: 4 },

  // 5 · Proteção dos Olhos
  { categoriaId: 5, nome: 'Óculos de Segurança', ordem: 1 },
  { categoriaId: 5, nome: 'Óculos Ampla Visão', ordem: 2 },
  { categoriaId: 5, nome: 'Máscara Facial', ordem: 3 },

  // 6 · Proteção Auditiva
  { categoriaId: 6, nome: 'Abafador de Ruído', ordem: 1 },
  { categoriaId: 6, nome: 'Protetor Auricular', ordem: 2 },
  { categoriaId: 6, nome: 'Canaleta', ordem: 3 },

  // 7 · Proteção de Quedas
  { categoriaId: 7, nome: 'Cinturão Paraquedista', ordem: 1 },
  { categoriaId: 7, nome: 'Talabarte', ordem: 2 },
  { categoriaId: 7, nome: 'Trava-Queda', ordem: 3 },
  { categoriaId: 7, nome: 'Linha de Vida', ordem: 4 },

  // 8 · Proteção Articular
  { categoriaId: 8, nome: 'Joelheira', ordem: 1 },
  { categoriaId: 8, nome: 'Cotoveleira', ordem: 2 },
  { categoriaId: 8, nome: 'Munhequeira', ordem: 3 },
];

async function main() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Seed: Subcategorias de Equipamentos/EPIs   │');
  console.log('└─────────────────────────────────────────────┘\n');

  const existentes = await prisma.subcategoriaEquipamento.count();
  console.log(`Subcategorias existentes: ${existentes}`);

  if (existentes > 0) {
    console.log('\n⚠️  Já existem subcategorias. Abortando.');
    return;
  }

  // agrupar por categoria para log
  const porCategoria = new Map<number, SubcategoriaInput[]>();
  for (const s of subcategorias) {
    const arr = porCategoria.get(s.categoriaId) ?? [];
    arr.push(s);
    porCategoria.set(s.categoriaId, arr);
  }

  const categorias = await prisma.categoriaEquipamento.findMany({
    select: { id: true, nome: true },
  });
  const catMap = new Map(categorias.map((c) => [c.id, c]));

  let criadas = 0;
  for (const [catId, lista] of porCategoria) {
    const cat = catMap.get(catId);
    if (!cat) {
      console.log(`  ⚠️  Categoria ${catId} não encontrada — ignorando`);
      continue;
    }
    console.log(`\n  ${cat.nome} (id=${catId})`);
    for (const s of lista) {
      await prisma.subcategoriaEquipamento.create({
        data: {
          categoriaId: s.categoriaId,
          nome: s.nome,
          ordem: s.ordem,
        },
      });
      console.log(`    ✓ ${s.ordem}. ${s.nome}`);
      criadas++;
    }
  }

  const total = await prisma.subcategoriaEquipamento.count();
  console.log(`\n┌─────────────────────────────────────────────┐`);
  console.log(`│  Criadas: ${String(criadas).padStart(3)}  ·  Total no banco: ${String(total).padStart(3)}  │`);
  console.log(`└─────────────────────────────────────────────┘`);
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
