import { Prisma, PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const PREFIX = 'seed2';
const TS = Date.now().toString(36).slice(-5);

async function main() {
  const rollback = process.argv.includes('--rollback');

  if (rollback) {
    console.log('Rollback: removendo dados do seed-fluxo2...');
    const sepItens = await p.separacaoItem.deleteMany({
      where: {
        separacao: {
          executucaoAtividade: {
            atividade: { obraEtapa: { obra: { codigo: { startsWith: PREFIX } } } },
          },
        },
      },
    });
    const sep = await p.separacao.deleteMany({
      where: {
        executucaoAtividade: {
          atividade: { obraEtapa: { obra: { codigo: { startsWith: PREFIX } } } },
        },
      },
    });
    const check = await p.checklistAtividade.deleteMany({
      where: {
        executucaoAtividade: {
          atividade: { obraEtapa: { obra: { codigo: { startsWith: PREFIX } } } },
        },
      },
    });
    const exec = await p.execucaoAtividade.deleteMany({
      where: {
        atividade: { obraEtapa: { obra: { codigo: { startsWith: PREFIX } } } },
      },
    });
    const atv = await p.obraAtividade.deleteMany({
      where: { obraEtapa: { obra: { codigo: { startsWith: PREFIX } } } },
    });
    const obraEtapa = await p.obraEtapa.deleteMany({
      where: { obra: { codigo: { startsWith: PREFIX } } },
    });
    const obra = await p.obra.deleteMany({
      where: { codigo: { startsWith: PREFIX } },
    });
    const orc = await p.orcamento.deleteMany({
      where: { codigo: { startsWith: PREFIX } },
    });
    const atend = await p.atendimento.deleteMany({
      where: { descricao: { startsWith: PREFIX } },
    });
    const cli = await p.user.deleteMany({
      where: { email: { startsWith: 'seed-' } },
    });
    const rec = await p.recursoAtividade.deleteMany({
      where: { catalogoAtividade: { nome: { startsWith: PREFIX } } },
    });
    const sub = await p.subStepAtividade.deleteMany({
      where: { catalogoAtividade: { nome: { startsWith: PREFIX } } },
    });
    const cat = await p.catalogoAtividade.deleteMany({
      where: { nome: { startsWith: PREFIX } },
    });
    console.log(
      `Removidos: cli=${cli.count} sepItens=${sepItens.count} sep=${sep.count} check=${check.count} exec=${exec.count} atv=${atv.count} obraEtapa=${obraEtapa.count} obra=${obra.count} orc=${orc.count} atend=${atend.count} rec=${rec.count} sub=${sub.count} cat=${cat.count}`,
    );
    return;
  }

  // 1. Criar usuário cliente
  const clienteUser = await p.user.create({
    data: {
      nome: `${PREFIX} - Obra Teste`,
      cpfCnpj:
        '999.999.999-' +
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0'),
      telefone: '(00) 0000-0000',
      email: `seed-${TS}@example.com`,
      senhaHash: 'seed2-not-a-real-hash',
    },
  });
  console.log('Cliente criado:', clienteUser.id);

  // 1b. Colaborador de campo que recebe os itens na retirada
  const colaboradorEmail = 'seed-colaborador@example.com';
  let colaborador = await p.user.findFirst({
    where: { email: colaboradorEmail },
  });
  if (!colaborador) {
    colaborador = await p.user.create({
      data: {
        nome: `${PREFIX} - Colaborador`,
        email: colaboradorEmail,
        telefone: '(11) 97777-7777',
        senhaHash: 'seed2-not-a-real-hash',
      },
    });
  }
  console.log('Colaborador criado:', colaborador.id);

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

  // 4. Criar Obra (cadeia substitui a antiga OS)
  const obra = await p.obra.create({
    data: {
      codigo: `${PREFIX}-${TS}-OBR`,
      orcamentoId: orcamento.id,
      userId: clienteUser.id,
      atendimentoId: atendimento.id,
      urgencia: 'NORMAL',
      status: 'EM_EXECUCAO',
      valorContratado: new Prisma.Decimal('10000.00'),
      aprovadoPorId: clienteUser.id,
      aprovadoEm: new Date(),
    },
  });
  console.log('Obra criada:', obra.id);

  // 5. Criar Etapa (se não existir nenhuma)
  let etapa = await p.etapa.findFirst({ where: { ativo: true } });
  if (!etapa) {
    etapa = await p.etapa.create({
      data: { nome: 'Acabamento', ordem: 1, ativo: true },
    });
    console.log('Etapa criada:', etapa.id);
  } else {
    console.log('Etapa existente:', etapa.id);
  }

  // 6. Criar ObraEtapa
  const obraEtapa = await p.obraEtapa.create({
    data: {
      obraId: obra.id,
      etapaId: etapa.id,
      nome: `${PREFIX} - Etapa de Acabamento`,
      ordem: 1,
    },
  });
  console.log('ObraEtapa criada:', obraEtapa.id);

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
          {
            ordem: 1,
            descricao: 'Limpeza do contrapiso',
            observacao: 'Remover toda sujeira e poeira',
          },
          {
            ordem: 2,
            descricao: 'Aplicação de argamassa AC-II',
            observacao: 'Espalhar uniformemente',
          },
          {
            ordem: 3,
            descricao: 'Assentamento das peças cerâmicas',
            observacao: 'Alinhar com esquadro',
          },
          {
            ordem: 4,
            descricao: 'Rejuntamento',
            observacao: 'Preencher juntas completamente',
          },
          {
            ordem: 5,
            descricao: 'Limpeza final',
            observacao: 'Remover resíduos de rejunte',
          },
        ],
      },
      recursos: {
        create: [
          {
            tipo: 'MATERIAL',
            itemCatalogoId: 1,
            quantidade: new Prisma.Decimal('50'),
          },
          {
            tipo: 'MATERIAL',
            itemCatalogoId: 2,
            quantidade: new Prisma.Decimal('25'),
          },
          {
            tipo: 'MATERIAL',
            itemCatalogoId: 3,
            quantidade: new Prisma.Decimal('5'),
          },
          {
            tipo: 'EQUIPAMENTO',
            itemCatalogoId: 1,
            quantidade: new Prisma.Decimal('1'),
          },
          {
            tipo: 'EQUIPAMENTO',
            itemCatalogoId: 2,
            quantidade: new Prisma.Decimal('1'),
          },
          {
            tipo: 'EPI',
            itemCatalogoId: 1,
            quantidade: new Prisma.Decimal('4'),
          },
          {
            tipo: 'EPI',
            itemCatalogoId: 2,
            quantidade: new Prisma.Decimal('4'),
          },
          {
            tipo: 'EPI',
            itemCatalogoId: 3,
            quantidade: new Prisma.Decimal('4'),
          },
        ],
      },
    },
    include: { subSteps: true, recursos: true },
  });
  console.log('Catálogo criado:', catalogo.id);

  // 8. Garantir verbos/objetos/sub-serviço para a atividade
  const verbo = await p.verbo.upsert({
    where: { nome: 'assentar' },
    update: {},
    create: { nome: 'assentar' },
  });
  const objeto = await p.objeto.upsert({
    where: { nome: 'piso' },
    update: {},
    create: { nome: 'piso' },
  });
  const subServico = await p.subServico.upsert({
    where: { etapaId_nome: { etapaId: etapa.id, nome: 'Pisos e Revestimentos' } },
    update: {},
    create: { nome: 'Pisos e Revestimentos', etapaId: etapa.id, ativo: true },
  });
  console.log(
    `Vocabulário: verbo=${verbo.id} objeto=${objeto.id} subServico=${subServico.id}`,
  );

  // 9. Criar ObraAtividade
  const atv = await p.obraAtividade.create({
    data: {
      obraEtapaId: obraEtapa.id,
      catalogoAtividadeId: catalogo.id,
      subServicoId: subServico.id,
      verboId: verbo.id,
      objetoId: objeto.id,
      descricao: 'Assentamento de piso cerâmico',
      ordem: 1,
      cancelada: false,
    },
  });
  console.log('ObraAtividade criada:', atv.id);

  // 9. Criar ExecucaoAtividade
  const exec = await p.execucaoAtividade.create({
    data: {
      atividadeId: atv.id,
      status: 'EM_ANDAMENTO',
      dataPrevisao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      criadoPorId: 1,
    },
  });
  console.log('ExecucaoAtividade criada:', exec.id);

  // 10. Criar ChecklistAtividade (um por sub-step)
  for (const s of catalogo.subSteps) {
    await p.checklistAtividade.create({
      data: {
        executucaoAtividadeId: exec.id,
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
      executucaoAtividadeId: exec.id,
      dataNecessidade: new Date(),
      statusNovo: 'SEPARACAO_PENDENTE',
    },
  });
  console.log('Separação criada:', sep.id);

  // 12. Criar SeparacaoItem (apenas para materiais)
  const materiais = catalogo.recursos.filter((r) => r.tipo === 'MATERIAL');
  const [primeiro, ...demais] = materiais;
  if (primeiro) {
    await p.separacaoItem.create({
      data: {
        separacaoId: sep.id,
        materialId: primeiro.itemCatalogoId,
        quantidadeNecessaria: primeiro.quantidade,
        quantidadeSeparada: new Prisma.Decimal('0'),
        status: 'RETIRADO',
        colaboradorId: colaborador.id,
        retiradoPorId: 1,
        retiradoEm: new Date(),
      },
    });
  }
  for (const r of demais) {
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
  console.log(`   Obra: ${obra.id} (${obra.codigo})`);
  console.log(`   ExecucaoAtividade: ${exec.id}`);
  console.log(`   Separação: ${sep.id}`);
  console.log('\nExecute com --rollback para limpar.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
