import { PrismaClient } from '@prisma/client';

// Migração: reestrutura sub_servicos para nomes curtos de substantivo
// (fases de serviço) + mescla/divisão/desativação conforme plano aprovado.
// Idempotente. Executar: npx tsx prisma/migrate-nomes-subservico.ts

const p = new PrismaClient();

type Renome = { id: number; novo: string; etapaId: number };
type Mescla = {
  sobrevivente: number;
  perdedores: number[];
  novoNome: string;
  etapaId: number;
};
type Divisao = {
  fonteId: number;
  nomeFonte: string;
  novoNome: string;
  etapaId: number;
};

// Renomes simples (sobreviventes mantêm id)
const RENOMES: Renome[] = [
  // etapa 1 — Início
  { id: 1, novo: 'Limpeza', etapaId: 1 },
  { id: 9, novo: 'Montagem', etapaId: 1 },
  { id: 11, novo: 'Remoção', etapaId: 1 },
  { id: 2, novo: 'Reparo', etapaId: 1 },
  { id: 10, novo: 'Inspeção', etapaId: 1 },
  // etapa 2 — Em andamento
  { id: 18, novo: 'Calafetação', etapaId: 2 },
  { id: 13, novo: 'Colagem', etapaId: 2 },
  { id: 19, novo: 'Instalação', etapaId: 2 },
  { id: 17, novo: 'Reparo', etapaId: 2 },
  // etapa 3 — Acabamento
  { id: 6, novo: 'Demão', etapaId: 3 },
  { id: 24, novo: 'Instalação', etapaId: 3 },
  { id: 22, novo: 'Pintura', etapaId: 3 },
  { id: 23, novo: 'Vedação', etapaId: 3 },
  // etapa 4 — Finalizado
  { id: 7, novo: 'Vedação', etapaId: 4 },
  { id: 8, novo: 'Inspeção', etapaId: 4 },
  { id: 25, novo: 'Tratamento', etapaId: 4 },
  { id: 26, novo: 'Estancamento', etapaId: 4 },
  { id: 27, novo: 'Relatório', etapaId: 4 },
];

// Mesclas: re-aponta FKs perdedor→sobrevivente, renomeia sobrevivente,
// desativa perdedores (perdedores mantêm o nome antigo — unique ignora ativo)
const MESCLAS: Mescla[] = [
  {
    sobrevivente: 4,
    perdedores: [14, 15, 16, 20],
    novoNome: 'Impermeabilização',
    etapaId: 2,
  },
  {
    sobrevivente: 5,
    perdedores: [21],
    novoNome: 'Reforço',
    etapaId: 3,
  },
];

// Divisões: fonte renomeia + cria novo sub com clone de catálogo
const DIVISOES: Divisao[] = [
  {
    fonteId: 1,
    nomeFonte: 'Limpeza',
    novoNome: 'Preparação',
    etapaId: 1,
  },
  {
    fonteId: 27,
    nomeFonte: 'Relatório',
    novoNome: 'Liberação da obra',
    etapaId: 4,
  },
];

// Desativações diretas (sem mescla)
const DESATIVAR_IDS = [3, 12]; // Aplicar fundo, Aplicar primer

async function reApontarFks(deId: number, paraId: number) {
  const stats = {
    combosMove: 0,
    combosDel: 0,
    orcamento: 0,
    obra: 0,
  };

  const fonteCombos = await p.subServicoAtividade.findMany({
    where: { subServicoId: deId },
  });
  for (const combo of fonteCombos) {
    const destino = await p.subServicoAtividade.findFirst({
      where: {
        subServicoId: paraId,
        verboId: combo.verboId,
        objetoId: combo.objetoId,
        localId: combo.localId,
        caracteristicaId: combo.caracteristicaId,
      },
    });
    if (destino) {
      await p.subServicoAtividade.delete({ where: { id: combo.id } });
      stats.combosDel++;
    } else {
      await p.subServicoAtividade.update({
        where: { id: combo.id },
        data: { subServicoId: paraId },
      });
      stats.combosMove++;
    }
  }

  const rOrc = await p.orcamentoAtividade.updateMany({
    where: { subServicoId: deId },
    data: { subServicoId: paraId },
  });
  stats.orcamento = rOrc.count;

  const rObra = await p.obraAtividade.updateMany({
    where: { subServicoId: deId },
    data: { subServicoId: paraId },
  });
  stats.obra = rObra.count;

  return stats;
}

async function main() {
  console.log(
    '--- Sub-serviços: mesclas (reapontar FKs → renomear → desativar perdedores) ---',
  );

  for (const mescla of MESCLAS) {
    const sobrevivente = await p.subServico.findUnique({
      where: { id: mescla.sobrevivente },
    });
    if (!sobrevivente) {
      console.log(
        `  (skip) sobrevivente id=${mescla.sobrevivente} não existe`,
      );
      continue;
    }

    for (const perdedorId of mescla.perdedores) {
      const perdedor = await p.subServico.findUnique({
        where: { id: perdedorId },
      });
      if (!perdedor) {
        console.log(`  (skip) perdedor id=${perdedorId} não existe`);
        continue;
      }
      const stats = await reApontarFks(perdedorId, mescla.sobrevivente);
      console.log(
        `  FK id=${perdedorId} → ${mescla.sobrevivente}: combos move/del=${stats.combosMove}/${stats.combosDel}, orc=${stats.orcamento}, obra=${stats.obra}`,
      );
      await p.subServico.update({
        where: { id: perdedorId },
        data: { ativo: false },
      });
      console.log(
        `  perdedor id=${perdedorId} ("${perdedor.nome}") desativado (nome antigo preservado)`,
      );
    }

    if (sobrevivente.nome !== mescla.novoNome) {
      const colisao = await p.subServico.findFirst({
        where: {
          etapaId: mescla.etapaId,
          nome: mescla.novoNome,
          id: { not: mescla.sobrevivente },
        },
      });
      if (colisao) {
        console.log(
          `  ⚠️  não renomeou id=${mescla.sobrevivente} → "${mescla.novoNome}": já existe id=${colisao.id} na etapa ${mescla.etapaId}`,
        );
      } else {
        await p.subServico.update({
          where: { id: mescla.sobrevivente },
          data: { nome: mescla.novoNome, ativo: true },
        });
        console.log(
          `  sobrevivente id=${mescla.sobrevivente} → "${mescla.novoNome}" (etapa ${mescla.etapaId})`,
        );
      }
    } else {
      await p.subServico.update({
        where: { id: mescla.sobrevivente },
        data: { ativo: true },
      });
      console.log(
        `  sobrevivente id=${mescla.sobrevivente} já é "${mescla.novoNome}"`,
      );
    }
  }

  console.log('\n--- Sub-serviços: renomes simples ---');
  for (const r of RENOMES) {
    const sub = await p.subServico.findUnique({ where: { id: r.id } });
    if (!sub) {
      console.log(`  (skip) id=${r.id} não existe`);
      continue;
    }
    if (sub.nome === r.novo && sub.ativo) {
      console.log(`  id=${r.id} já é "${r.novo}"`);
      continue;
    }
    const colisao = await p.subServico.findFirst({
      where: {
        etapaId: r.etapaId,
        nome: r.novo,
        id: { not: r.id },
      },
    });
    if (colisao) {
      console.log(
        `  ⚠️  id=${r.id} não renomeado → "${r.novo}": colisão com id=${colisao.id} na etapa ${r.etapaId}`,
      );
      continue;
    }
    await p.subServico.update({
      where: { id: r.id },
      data: { nome: r.novo, ativo: true },
    });
    console.log(`  id=${r.id} "${sub.nome}" → "${r.novo}"`);
  }

  console.log('\n--- Sub-serviços: desativações diretas ---');
  for (const id of DESATIVAR_IDS) {
    const sub = await p.subServico.findUnique({ where: { id } });
    if (!sub) {
      console.log(`  (skip) id=${id} não existe`);
      continue;
    }
    if (!sub.ativo) {
      console.log(`  id=${id} ("${sub.nome}") já inativo`);
      continue;
    }
    await p.subServico.update({ where: { id }, data: { ativo: false } });
    console.log(`  id=${id} ("${sub.nome}") desativado`);
  }

  console.log(
    '\n--- Sub-serviços: divisões (renomear fonte + criar novo) ---',
  );
  for (const div of DIVISOES) {
    const fonte = await p.subServico.findUnique({ where: { id: div.fonteId } });
    if (!fonte) {
      console.log(`  (skip) fonte id=${div.fonteId} não existe`);
      continue;
    }

    if (fonte.nome !== div.nomeFonte) {
      const colisao = await p.subServico.findFirst({
        where: {
          etapaId: div.etapaId,
          nome: div.nomeFonte,
          id: { not: div.fonteId },
        },
      });
      if (colisao) {
        console.log(
          `  ⚠️  fonte id=${div.fonteId} não renomeada → "${div.nomeFonte}": colisão com id=${colisao.id}`,
        );
      } else {
        await p.subServico.update({
          where: { id: div.fonteId },
          data: { nome: div.nomeFonte, ativo: true },
        });
        console.log(`  fonte id=${div.fonteId} → "${div.nomeFonte}"`);
      }
    }

    const existente = await p.subServico.findFirst({
      where: { etapaId: div.etapaId, nome: div.novoNome },
    });
    if (existente) {
      console.log(
        `  novo sub "${div.novoNome}" já existe (id=${existente.id}) — mantendo`,
      );
    } else {
      const criado = await p.subServico.create({
        data: { etapaId: div.etapaId, nome: div.novoNome, ativo: true },
      });
      console.log(
        `  novo sub "${div.novoNome}" criado (id=${criado.id}, etapa ${div.etapaId})`,
      );
    }
  }

  console.log('\n--- Resumo final (subs ativos por etapa) ---');
  const finais = await p.subServico.findMany({
    where: { ativo: true },
    orderBy: [{ etapaId: 'asc' }, { id: 'asc' }],
    include: { etapa: { select: { nome: true } } },
  });
  for (const sub of finais) {
    console.log(
      `  etapa ${sub.etapaId} (${sub.etapa?.nome}) → id=${sub.id} "${sub.nome}"`,
    );
  }

  console.log('\n✅ Migração de nomes de sub-serviços concluída.');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
