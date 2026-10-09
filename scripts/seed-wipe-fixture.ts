import { PrismaClient } from '@prisma/client';

/**
 * Fixture sintético para validar o wipe OS → Obra (spec Seção 4).
 *
 * - Roda APENAS em um banco recém-criado com o schema NOVO do Plano A
 *   (pós-T4: OrdemServico referencia Obra via obraId; aditivos vivem em
 *   `aditivos_obra` / `aditivo_obra_itens`) — aborta se já existirem dados.
 *
 * Uso:
 *   DATABASE_URL='mysql://.../impermeab_wipe_test' npx tsx scripts/seed-wipe-fixture.ts
 */

const prisma = new PrismaClient();

const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const em60Dias = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000);

async function main() {
  const [orc, usr, mat] = await Promise.all([
    prisma.orcamento.count(),
    prisma.user.count(),
    prisma.material.count(),
  ]);
  if (orc > 0 || usr > 0 || mat > 0) {
    throw new Error(
      `Banco não vazio (orcamentos=${orc}, users=${usr}, materiais=${mat}). ` +
        'Este fixture só roda em um banco recém-criado (ex.: impermeab_wipe_test).',
    );
  }

  console.log('1/7 Cadastros-base...');
  const unidade = await prisma.unidadeMedida.create({ data: { nome: 'm2' } });
  const verbo = await prisma.verbo.create({ data: { nome: 'aplicar' } });
  const objeto = await prisma.objeto.create({ data: { nome: 'manta' } });
  const etapa1 = await prisma.etapa.create({ data: { nome: 'Preparação', ordem: 1 } });
  const etapa2 = await prisma.etapa.create({ data: { nome: 'Execução', ordem: 2 } });
  const subServico = await prisma.subServico.create({
    data: { etapaId: etapa2.id, nome: 'Impermeabilização de cobertura' },
  });
  const statusEquip = await prisma.statusEquipamento.create({ data: { nome: 'Disponível' } });
  const equipamento = await prisma.equipamento.create({
    data: { codigo: 'EQ-901', descricao: 'Bomba de impermeabilização', statusId: statusEquip.id },
  });
  const epi = await prisma.epi.create({ data: { codigo: 'EPI-901', nome: 'Luva de nitrílico' } });
  const material = await prisma.material.create({
    data: { nome: 'Manta asfáltica 3mm', unidadeId: unidade.id },
  });
  const catalogo = await prisma.catalogoAtividade.create({
    data: {
      nome: 'Aplicação de manta asfáltica',
      especialidadeNecessaria: 'IMPERMEABILIZACAO',
      subServicoId: subServico.id,
    },
  });
  const subStep1 = await prisma.subStepAtividade.create({
    data: { catalogoAtividadeId: catalogo.id, ordem: 1, descricao: 'Limpar a superfície' },
  });
  const subStep2 = await prisma.subStepAtividade.create({
    data: { catalogoAtividadeId: catalogo.id, ordem: 2, descricao: 'Aplicar a manta' },
  });

  console.log('2/7 Usuários e atendimentos...');
  const u1 = await prisma.user.create({
    data: { nome: 'Cliente Wipe', email: 'cliente.wipe@example.com', senhaHash: 'hash-wipe' },
  });
  const u2 = await prisma.user.create({
    data: { nome: 'Técnico Wipe', email: 'tecnico.wipe@example.com', senhaHash: 'hash-wipe' },
  });
  const u3 = await prisma.user.create({
    data: { nome: 'Operador Wipe', email: 'operador.wipe@example.com', senhaHash: 'hash-wipe' },
  });
  const atend1 = await prisma.atendimento.create({
    data: { canal: 'FORMULARIO', atendenteId: u3.id, userId: u1.id, urgencia: 'URGENTE' },
  });
  const atend2 = await prisma.atendimento.create({
    data: { canal: 'WHATSAPP', atendenteId: u3.id, userId: u1.id },
  });

  console.log('3/7 Orçamentos (1 APROVADO, 1 ENVIADO)...');
  const orc1 = await prisma.orcamento.create({
    data: {
      codigo: 'ORC-901',
      atendimentoId: atend1.id,
      userId: u1.id,
      urgencia: 'URGENTE',
      validade: em30Dias,
      status: 'APROVADO',
      valorTotal: 1234.56,
      observacoes: 'Fixture wipe: orçamento aprovado.',
      formaPagamento: 'PIX',
      criadoPorId: u3.id,
      aprovadoPorId: u3.id,
      aprovadoEm: new Date(),
    },
  });
  const orc2 = await prisma.orcamento.create({
    data: {
      codigo: 'ORC-902',
      atendimentoId: atend2.id,
      userId: u1.id,
      urgencia: 'NORMAL',
      validade: em60Dias,
      status: 'ENVIADO',
      valorTotal: 999.99,
      criadoPorId: u3.id,
    },
  });

  console.log('4/7 Obra OBR-901, OS-901 e etapas...');
  const obra1 = await prisma.obra.create({
    data: {
      codigo: 'OBR-901',
      orcamentoId: orc1.id,
      atendimentoId: atend1.id,
      userId: u1.id,
      urgencia: 'URGENTE',
      aprovadoPorId: u3.id,
      aprovadoEm: new Date(),
      valorContratado: 1234.56,
    },
  });
  const os1 = await prisma.ordemServico.create({
    data: {
      codigo: 'OS-901',
      obraId: obra1.id,
      userId: u1.id,
      atendimentoId: atend1.id,
      urgencia: 'NORMAL',
      valorTotal: 1500,
    },
  });
  const etapaOs1 = await prisma.etapaOS.create({
    data: { ordemServicoId: os1.id, etapaId: etapa1.id, nome: 'Preparação', ordem: 1 },
  });
  const etapaOs2 = await prisma.etapaOS.create({
    data: { ordemServicoId: os1.id, etapaId: etapa2.id, nome: 'Execução', ordem: 2 },
  });
  await prisma.etapaOSMaterial.create({
    data: { etapaOsId: etapaOs1.id, materialId: material.id, quantidadePlanejada: 10 },
  });

  console.log('5/7 Atividade, checklist, separação, compras, estoque...');
  const atividade = await prisma.atividadeOS.create({
    data: { osId: os1.id, etapaOSId: etapaOs2.id, catalogoAtividadeId: catalogo.id },
  });
  await prisma.atividadeOSLinha.create({
    data: {
      atividadeOSId: atividade.id,
      ordem: 1,
      descricao: 'Aplicar manta asfáltica no telhado',
      verboId: verbo.id,
      objetoId: objeto.id,
    },
  });
  await prisma.checklistExecucao.create({
    data: { atividadeOSId: atividade.id, subStepAtividadeId: subStep1.id },
  });
  await prisma.checklistExecucao.create({
    data: { atividadeOSId: atividade.id, subStepAtividadeId: subStep2.id },
  });
  const separacao = await prisma.separacao.create({
    data: {
      codigo: 'SEP-901',
      etapaOsId: etapaOs2.id,
      dataNecessidade: amanha,
      osId: os1.id,
      criadoPorId: u3.id,
    },
  });
  const sepItem = await prisma.separacaoItem.create({
    data: { separacaoId: separacao.id, materialId: material.id, quantidadeNecessaria: 10 },
  });
  const compraOs = await prisma.compra.create({
    data: { codigo: 'CMP-901', ordemServicoId: os1.id, criadoPorId: u3.id, valorTotal: 420 },
  });
  const compraAvulsa = await prisma.compra.create({
    data: { codigo: 'CMP-902', criadoPorId: u3.id, valorTotal: 300 },
  });
  const compraItemOs = await prisma.compraItem.create({
    data: {
      compraId: compraOs.id,
      materialId: material.id,
      quantidade: 5,
      valorUnitario: 84,
      valorTotal: 420,
    },
  });
  const compraItemAvulso = await prisma.compraItem.create({
    data: {
      compraId: compraAvulsa.id,
      materialId: material.id,
      quantidade: 4,
      valorUnitario: 75,
      valorTotal: 300,
    },
  });

  // 5 movimentos: M1 (os), M2 (sepItem), M3 (compraItem de compra na OS) morrem;
  // M4 (avulso) e M5 (compraItem de compra avulsa) sobrevivem ao wipe.
  await prisma.movimentoEstoque.create({
    data: { materialId: material.id, tipo: 'SAIDA', quantidade: 2, saldoApos: 8, ordemServicoId: os1.id },
  });
  await prisma.movimentoEstoque.create({
    data: {
      materialId: material.id,
      tipo: 'SAIDA',
      quantidade: 1,
      saldoApos: 7,
      separacaoItemId: sepItem.id,
    },
  });
  await prisma.movimentoEstoque.create({
    data: {
      materialId: material.id,
      tipo: 'ENTRADA',
      quantidade: 5,
      saldoApos: 12,
      compraItemId: compraItemOs.id,
    },
  });
  await prisma.movimentoEstoque.create({
    data: { materialId: material.id, tipo: 'ENTRADA', quantidade: 10, saldoApos: 22 },
  });
  await prisma.movimentoEstoque.create({
    data: {
      materialId: material.id,
      tipo: 'ENTRADA',
      quantidade: 4,
      saldoApos: 26,
      compraItemId: compraItemAvulso.id,
    },
  });

  console.log('6/7 Pagamentos/lançamentos circulares, aditivo, demais linhas de OS...');
  // Lançamento circular: LP ← PagamentoOS.lancamentoId ← LP.origemId (= pag.id)
  const lancPag = await prisma.lancamentoFinanceiro.create({
    data: {
      tipo: 'ENTRADA',
      descricao: 'Pagamento OS-901',
      valor: 750,
      origem: 'PAGAMENTO',
      origemId: null,
    },
  });
  const pagamento = await prisma.pagamentoOS.create({
    data: {
      ordemServicoId: os1.id,
      valor: 750,
      formaPagamento: 'PIX',
      lancamentoId: lancPag.id,
    },
  });
  await prisma.lancamentoFinanceiro.update({
    where: { id: lancPag.id },
    data: { origemId: pagamento.id },
  });
  await prisma.lancamentoFinanceiro.create({
    data: { tipo: 'SAIDA', descricao: 'Compra CMP-901', valor: 420, origem: 'COMPRA', origemId: compraOs.id },
  });
  await prisma.lancamentoFinanceiro.create({
    data: {
      tipo: 'SAIDA',
      descricao: 'Compra CMP-902',
      valor: 300,
      origem: 'COMPRA',
      origemId: compraAvulsa.id,
    },
  });
  await prisma.lancamentoFinanceiro.create({
    data: { tipo: 'ENTRADA', descricao: 'Ajuste avulso', valor: 50, origem: 'AJUSTE' },
  });

  const aditivo = await prisma.aditivoObra.create({
    data: {
      obraId: obra1.id,
      orcamentoId: orc1.id,
      descricao: 'Adição de calha',
      valor: 350,
    },
  });
  await prisma.aditivoObraItem.create({
    data: {
      aditivoId: aditivo.id,
      nome: 'Calha galvanizada',
      tipo: 'SERVICO',
      quantidade: 12,
      valorUnitario: 29.17,
      valorTotal: 350,
      unidadeId: unidade.id,
    },
  });
  await prisma.historicoPosicao.create({
    data: { ordemServicoId: os1.id, lat: -23.5505, lng: -46.6333 },
  });
  await prisma.assinatura.create({
    data: { ordemServicoId: os1.id, url: '/assinaturas/os-901.png', nomeUser: 'Cliente Wipe' },
  });
  await prisma.acessoUser.create({
    data: {
      ordemServicoId: os1.id,
      nome: 'Cliente Wipe',
      token: 'tok-wipe-001',
      expiraEm: em30Dias,
    },
  });

  console.log('7/7 Notificações, retiradas e entregas de EPI...');
  await prisma.notificacao.create({
    data: { userId: u1.id, titulo: 'OS em execução', mensagem: 'Sua OS-901 está em execução.', ordemServicoId: os1.id },
  });
  await prisma.notificacao.create({
    data: { userId: u2.id, titulo: 'Lembrete', mensagem: 'Lembrete avulso sem OS.' },
  });
  // Retiradas: R1 (osId) morre; R2 (avulsa) sobrevive.
  await prisma.retiradaEquipamento.create({
    data: { equipamentoId: equipamento.id, colaboradorId: u2.id, osId: os1.id },
  });
  await prisma.retiradaEquipamento.create({
    data: { equipamentoId: equipamento.id, colaboradorId: u2.id },
  });
  // Entregas: E1 (osId) e E3 (separacaoId) morrem; E2 (tudo nulo) sobrevive.
  await prisma.entregaEpi.create({
    data: { epiId: epi.id, colaboradorId: u2.id, quantidade: 1, osId: os1.id },
  });
  await prisma.entregaEpi.create({
    data: { epiId: epi.id, colaboradorId: u2.id, quantidade: 1 },
  });
  await prisma.entregaEpi.create({
    data: { epiId: epi.id, colaboradorId: u2.id, quantidade: 1, separacaoId: separacao.id },
  });

  const resumo = {
    orcamentos: await prisma.orcamento.count(),
    orcamentosAprovados: await prisma.orcamento.count({ where: { status: 'APROVADO' } }),
    obras: await prisma.obra.count(),
    ordensServico: await prisma.ordemServico.count(),
    aditivosObra: await prisma.aditivoObra.count(),
    lancamentos: await prisma.lancamentoFinanceiro.count(),
    movimentos: await prisma.movimentoEstoque.count(),
    users: await prisma.user.count(),
  };
  console.log('Fixture criado:', JSON.stringify(resumo, null, 2));
  console.log('Próximo passo: DATABASE_URL=... npx tsx scripts/wipe-os-obra.ts --dry-run');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
