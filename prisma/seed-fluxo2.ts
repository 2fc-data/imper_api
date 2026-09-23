import { PrismaClient, Prisma } from '@prisma/client';

const p = new PrismaClient();
const PREFIX = 'seed2';
const TS = Date.now().toString(36).slice(-5);

async function main() {
  const rollback = process.argv.includes('--rollback');

  if (rollback) {
    console.log('Rollback: removendo dados do seed-fluxo2...');
    const cli = await p.user.deleteMany({ where: { perfil: 'CLIENTE' } });
    const sepItens = await p.separacaoItem.deleteMany({ where: { separacao: { os: { codigo: { startsWith: PREFIX } } } } });
    const sep = await p.separacao.deleteMany({ where: { os: { codigo: { startsWith: PREFIX } } } });
    const check = await p.checklistExecucao.deleteMany({ where: { atividadeOS: { os: { codigo: { startsWith: PREFIX } } } } });
    const atv = await p.atividadeOS.deleteMany({ where: { os: { codigo: { startsWith: PREFIX } } } });
    const mem = await p.membroEquipe.deleteMany({ where: { equipe: { os: { codigo: { startsWith: PREFIX } } } } });
    const eq = await p.equipe.deleteMany({ where: { os: { codigo: { startsWith: PREFIX } } } });
    const fase = await p.faseOS.deleteMany({ where: { ordemServico: { codigo: { startsWith: PREFIX } } } });
    const os = await p.ordemServico.deleteMany({ where: { codigo: { startsWith: PREFIX } } });
    const orc = await p.orcamento.deleteMany({ where: { codigo: { startsWith: PREFIX } } });
    const atend = await p.atendimento.deleteMany({ where: { descricao: { startsWith: PREFIX } } });
    const rec = await p.recursoAtividade.deleteMany({ where: { catalogoAtividade: { nome: { startsWith: PREFIX } } } });
    const sub = await p.subStepAtividade.deleteMany({ where: { catalogoAtividade: { nome: { startsWith: PREFIX } } } });
    const cat = await p.catalogoAtividade.deleteMany({ where: { nome: { startsWith: PREFIX } } });
    console.log(`Removidos: cli=${cli.count} sepItens=${sepItens.count} sep=${sep.count} check=${check.count} atv=${atv.count} mem=${mem.count} eq=${eq.count} fase=${fase.count} os=${os.count} orc=${orc.count} atend=${atend.count} rec=${rec.count} sub=${sub.count} cat=${cat.count}`);
    return;
  }

  // 1. Criar usuário cliente
  const clienteUser = await p.user.create({
    data: {
      nome: `${PREFIX} - Obra Teste`,
      perfil: 'CLIENTE',
      cpfCnpj: '999.999.999-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      telefone: '(00) 0000-0000',
      email: 'seed@example.com',
    },
  });
  console.log('Cliente criado:', clienteUser.id);

  // 2. Criar atendimento
  const atendimento = await p.atendimento.create({
    data: {
      canal: 'WHATSAPP',
      descricao: `${PREFIX} - Atendimento inicial`,
      userId: clienteUser.id,
      atendenteId: 1,
      status: 'CONCLUIDO',
    },
  });
  console.log('Atendimento criado:', atendimento.id);

  // 3. Criar orçamento
  const orcamento = await p.orcamento.create({
    data: {
      codigo: `${PREFIX}-${TS}-ORC`,
      userId: clienteUser.id,
      atendimentoId: atendimento.id,
      criadoPorId: 1,
      status: 'APROVADO',
      urgencia: 'NORMAL',
      validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      valorTotal: new Prisma.Decimal('10000.00'),
    },
  });
  console.log('Orçamento criado:', orcamento.id);

  // 4. Criar OS
  const os = await p.ordemServico.create({
    data: {
      codigo: `${PREFIX}-${TS}-OS`,
      orcamentoId: orcamento.id,
      userId: clienteUser.id,
      atendimentoId: atendimento.id,
      urgencia: 'NORMAL',
      status: 'EM_ANDAMENTO',
      valorTotal: new Prisma.Decimal('10000.00'),
    },
  });
  console.log('OS criada:', os.id);

  // 5. Criar Fase (se não existir nenhuma)
  let fase = await p.fase.findFirst({ where: { ativo: true } });
  if (!fase) {
    fase = await p.fase.create({
      data: { nome: 'Acabamento', ordem: 1, ativo: true },
    });
    console.log('Fase criada:', fase.id);
  } else {
    console.log('Fase existente:', fase.id);
  }

  // 6. Criar FaseOS
  const faseOS = await p.faseOS.create({
    data: {
      ordemServicoId: os.id,
      faseId: fase.id,
      nome: `${PREFIX} - Fase de Acabamento`,
      ordem: 1,
      status: 'PENDENTE',
    },
  });
  console.log('FaseOS criada:', faseOS.id);

  // 7. Criar catálogo de atividades
  const catalogo = await p.catalogoAtividade.create({
    data: {
      nome: `${PREFIX} - Assentamento de Piso Cerâmico`,
      descricao: 'Atividade de assentamento de piso cerâmico com acabamento',
      especialidadeNecessaria: 'CIVIL',
      tempoEstimadoHoras: new Prisma.Decimal('8.00'),
      ativo: true,
      subSteps: {
        create: [
          { ordem: 1, descricao: 'Limpeza do contrapiso', observacao: 'Remover toda sujeira e poeira' },
          { ordem: 2, descricao: 'Aplicação de argamassa AC-II', observacao: 'Espalhar uniformemente' },
          { ordem: 3, descricao: 'Assentamento das peças cerâmicas', observacao: 'Alinhar com esquadro' },
          { ordem: 4, descricao: 'Rejuntamento', observacao: 'Preencher juntas completamente' },
          { ordem: 5, descricao: 'Limpeza final', observacao: 'Remover resíduos de rejunte' },
        ],
      },
      recursos: {
        create: [
          { tipo: 'MATERIAL', itemCatalogoId: 1, quantidade: new Prisma.Decimal('50') },
          { tipo: 'MATERIAL', itemCatalogoId: 2, quantidade: new Prisma.Decimal('25') },
          { tipo: 'MATERIAL', itemCatalogoId: 3, quantidade: new Prisma.Decimal('5') },
          { tipo: 'EQUIPAMENTO', itemCatalogoId: 1, quantidade: new Prisma.Decimal('1') },
          { tipo: 'EQUIPAMENTO', itemCatalogoId: 2, quantidade: new Prisma.Decimal('1') },
          { tipo: 'EPI', itemCatalogoId: 1, quantidade: new Prisma.Decimal('4') },
          { tipo: 'EPI', itemCatalogoId: 2, quantidade: new Prisma.Decimal('4') },
          { tipo: 'EPI', itemCatalogoId: 3, quantidade: new Prisma.Decimal('4') },
        ],
      },
    },
    include: { subSteps: true, recursos: true },
  });
  console.log('Catálogo criado:', catalogo.id);

  // 8. Criar Equipe
  const equipe = await p.equipe.create({
    data: {
      nome: `${PREFIX} - Equipe A Acabamento`,
      osId: os.id,
      liderId: 2,
      membros: {
        create: [
          { usuarioId: 3, funcao: 'Marceneiro' },
          { usuarioId: 4, funcao: 'Ajudante' },
        ],
      },
    },
  });
  console.log('Equipe criada:', equipe.id);

  // 9. Criar AtividadeOS
  const atv = await p.atividadeOS.create({
    data: {
      osId: os.id,
      faseOSId: faseOS.id,
      catalogoAtividadeId: catalogo.id,
      equipeId: equipe.id,
      status: 'EM_ANDAMENTO',
    },
  });
  console.log('AtividadeOS criada:', atv.id);

  // 10. Criar ChecklistExecucao (um por sub-step)
  for (const s of catalogo.subSteps) {
    await p.checklistExecucao.create({
      data: {
        atividadeOSId: atv.id,
        subStepAtividadeId: s.id,
        status: 'PENDENTE',
      },
    });
  }
  console.log(`Checklist criado: ${catalogo.subSteps.length} itens`);

  // 11. Criar Separacao
  const sep = await p.separacao.create({
    data: {
      codigo: `${PREFIX}-${TS}-SEP`,
      faseOsId: faseOS.id,
      osId: os.id,
      equipeId: equipe.id,
      dataNecessidade: new Date(),
      status: 'PENDENTE',
      statusNovo: 'SEPARACAO_PENDENTE',
    },
  });
  console.log('Separação criada:', sep.id);

  // 12. Criar SeparacaoItem (apenas para materiais)
  const materiais = catalogo.recursos.filter(r => r.tipo === 'MATERIAL');
  for (const r of materiais) {
    await p.separacaoItem.create({
      data: {
        separacaoId: sep.id,
        materialId: r.itemCatalogoId,
        quantidadeNecessaria: r.quantidade,
        quantidadeSeparada: new Prisma.Decimal('0'),
      },
    });
  }
  console.log(`Separação Itens criados: ${materiais.length} materiais`);

  console.log('\n✅ Seed completo!');
  console.log(`   Cliente: ${clienteUser.id}`);
  console.log(`   OS: ${os.id} (${os.codigo})`);
  console.log(`   Equipe: ${equipe.id}`);
  console.log(`   AtividadeOS: ${atv.id}`);
  console.log(`   Separação: ${sep.id}`);
  console.log('\nExecute com --rollback para limpar.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());
