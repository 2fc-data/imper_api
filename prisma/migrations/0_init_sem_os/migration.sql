-- CreateTable
CREATE TABLE `unidade_medida` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `unidade_medida_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `email` VARCHAR(120) NULL,
    `cpfCnpj` VARCHAR(20) NULL,
    `senhaHash` VARCHAR(255) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `cargoId` INTEGER NULL,
    `telefone` VARCHAR(20) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_cpfCnpj_key`(`cpfCnpj`),
    INDEX `users_cargoId_fkey`(`cargoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cargos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracoes` (
    `chave` VARCHAR(100) NOT NULL,
    `valor` VARCHAR(255) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`chave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atendimentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `canal` ENUM('WHATSAPP', 'FORMULARIO', 'LOJA', 'TELEFONE') NOT NULL,
    `urgencia` ENUM('NORMAL', 'URGENTE', 'URGENTISSIMO') NULL DEFAULT 'NORMAL',
    `status` ENUM('NOVO', 'EM_ANDAMENTO', 'ORCAMENTAMENTO', 'CONCLUIDO', 'INATIVO') NOT NULL DEFAULT 'NOVO',
    `visitaSolicitada` BOOLEAN NOT NULL DEFAULT false,
    `descricao` VARCHAR(1000) NULL,
    `userId` INTEGER NULL,
    `atendenteId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `atendimentos_atendenteId_fkey`(`atendenteId`),
    INDEX `atendimentos_clienteId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atendimento_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `atendimentoId` INTEGER NOT NULL,
    `atendenteId` INTEGER NULL,
    `tipo` ENUM('TEXTO', 'STATUS') NOT NULL DEFAULT 'TEXTO',
    `descricao` VARCHAR(1000) NULL,
    `statusDe` ENUM('NOVO', 'EM_ANDAMENTO', 'ORCAMENTAMENTO', 'CONCLUIDO', 'INATIVO') NULL,
    `statusPara` ENUM('NOVO', 'EM_ANDAMENTO', 'ORCAMENTAMENTO', 'CONCLUIDO', 'INATIVO') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `atendimento_logs_atendenteId_fkey`(`atendenteId`),
    INDEX `atendimento_logs_atendimentoId_fkey`(`atendimentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enderecos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rotulo` ENUM('RESIDENCIAL', 'OBRA') NOT NULL DEFAULT 'RESIDENCIAL',
    `logradouro` VARCHAR(255) NOT NULL,
    `numero` VARCHAR(10) NULL,
    `complemento` VARCHAR(120) NULL,
    `bairro` VARCHAR(120) NULL,
    `cidade` VARCHAR(120) NULL,
    `estado` VARCHAR(2) NULL,
    `cep` VARCHAR(9) NULL,
    `principal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `enderecos_clienteId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicos_marketing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(200) NOT NULL,
    `descricao` VARCHAR(500) NOT NULL,
    `icone` VARCHAR(500) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `servicos_marketing_titulo_key`(`titulo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cidades_atendidas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `uf` VARCHAR(2) NOT NULL,
    `lat` DECIMAL(10, 7) NOT NULL,
    `lng` DECIMAL(10, 7) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cidades_atendidas_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitas_tecnicas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `atendimentoId` INTEGER NOT NULL,
    `agendamentoId` INTEGER NULL,
    `tecnicoId` INTEGER NULL,
    `dataPrevista` DATETIME(3) NOT NULL,
    `dataRealizada` DATETIME(3) NULL,
    `status` ENUM('AGENDADA', 'REALIZADA', 'CANCELADA') NOT NULL DEFAULT 'AGENDADA',
    `urgencia` ENUM('NORMAL', 'URGENTE', 'URGENTISSIMO') NULL,
    `enderecoId` INTEGER NULL,
    `relatorio` VARCHAR(2000) NULL,
    `resultado` ENUM('SEM_ACAO', 'ORCAMENTO_NECESSARIO', 'OBRA_NECESSARIA', 'CLIENTE_AUSENTE') NULL,
    `constatacao` VARCHAR(2000) NULL,
    `necessitaOrcamento` BOOLEAN NOT NULL DEFAULT false,
    `necessitaObra` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visitas_tecnicas_agendamentoId_key`(`agendamentoId`),
    INDEX `visitas_tecnicas_atendimentoId_fkey`(`atendimentoId`),
    INDEX `visitas_tecnicas_enderecoId_fkey`(`enderecoId`),
    INDEX `visitas_tecnicas_tecnicoId_fkey`(`tecnicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fotos_visitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visitaId` INTEGER NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `caption` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fotos_visitas_visitaId_fkey`(`visitaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agendamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `atendimentoId` INTEGER NOT NULL,
    `enderecoId` INTEGER NULL,
    `tipo` ENUM('VISITA', 'ORCAMENTO', 'RETORNO', 'REUNIAO') NOT NULL DEFAULT 'VISITA',
    `status` ENUM('PENDENTE', 'CONFIRMADO', 'REALIZADO', 'CANCELADO', 'NAO_COMPARECEU') NOT NULL DEFAULT 'PENDENTE',
    `dataPrevista` DATETIME(3) NOT NULL,
    `dataRealizada` DATETIME(3) NULL,
    `observacoes` VARCHAR(1000) NULL,
    `criadoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `agendamentos_userId_idx`(`userId`),
    INDEX `agendamentos_dataPrevista_idx`(`dataPrevista`),
    INDEX `agendamentos_status_idx`(`status`),
    INDEX `agendamentos_atendimentoId_fkey`(`atendimentoId`),
    INDEX `agendamentos_criadoPorId_fkey`(`criadoPorId`),
    INDEX `agendamentos_enderecoId_fkey`(`enderecoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disponibilidade_padroes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `diaSemana` INTEGER NOT NULL,
    `horaInicio` VARCHAR(5) NOT NULL,
    `horaFim` VARCHAR(5) NOT NULL,
    `capacidade` INTEGER NOT NULL DEFAULT 1,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `disponibilidade_padroes_userId_idx`(`userId`),
    INDEX `disponibilidade_padroes_diaSemana_idx`(`diaSemana`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disponibilidade_datas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `horaInicio` VARCHAR(5) NOT NULL,
    `horaFim` VARCHAR(5) NOT NULL,
    `capacidade` INTEGER NOT NULL DEFAULT 1,
    `excluida` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `disponibilidade_datas_userId_idx`(`userId`),
    INDEX `disponibilidade_datas_data_idx`(`data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etapas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servico_itens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `tipo` ENUM('SERVICO', 'MATERIAL', 'EQUIPAMENTO') NOT NULL,
    `etapaId` INTEGER NULL,
    `materialId` INTEGER NULL,
    `precoSugerido` DECIMAL(12, 2) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `unidadeId` INTEGER NOT NULL,

    INDEX `servico_itens_etapaId_fkey`(`etapaId`),
    INDEX `servico_itens_materialId_fkey`(`materialId`),
    INDEX `servico_itens_unidadeId_fkey`(`unidadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orcamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `atendimentoId` INTEGER NOT NULL,
    `visitaId` INTEGER NULL,
    `agendamentoId` INTEGER NULL,
    `userId` INTEGER NULL,
    `enderecoId` INTEGER NULL,
    `urgencia` ENUM('NORMAL', 'URGENTE', 'URGENTISSIMO') NOT NULL,
    `status` ENUM('RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO', 'CANCELADO') NOT NULL DEFAULT 'RASCUNHO',
    `versao` INTEGER NOT NULL DEFAULT 1,
    `valorTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `validade` DATETIME(3) NOT NULL,
    `observacoes` VARCHAR(2000) NULL,
    `areaM2` DECIMAL(10, 2) NULL,
    `valorM2` DECIMAL(10, 2) NULL,
    `servicoMarketingId` INTEGER NULL,
    `motivoRejeicao` VARCHAR(500) NULL,
    `criadoPorId` INTEGER NOT NULL,
    `aprovadoPorId` INTEGER NULL,
    `aprovadoEm` DATETIME(3) NULL,
    `confirmadoPorUser` BOOLEAN NOT NULL DEFAULT false,
    `dataConfirmacao` DATETIME(3) NULL,
    `formaPagamento` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TRANSFERENCIA') NULL,
    `tokenConfirmacao` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orcamentos_codigo_key`(`codigo`),
    UNIQUE INDEX `orcamentos_tokenConfirmacao_key`(`tokenConfirmacao`),
    INDEX `orcamentos_atendimentoId_idx`(`atendimentoId`),
    INDEX `orcamentos_agendamentoId_idx`(`agendamentoId`),
    INDEX `orcamentos_aprovadoPorId_fkey`(`aprovadoPorId`),
    INDEX `orcamentos_clienteId_fkey`(`userId`),
    INDEX `orcamentos_criadoPorId_fkey`(`criadoPorId`),
    INDEX `orcamentos_enderecoId_fkey`(`enderecoId`),
    INDEX `orcamentos_visitaId_fkey`(`visitaId`),
    INDEX `orcamentos_servicoMarketingId_idx`(`servicoMarketingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aditivos_obra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `obraId` INTEGER NOT NULL,
    `orcamentoId` INTEGER NULL,
    `descricao` VARCHAR(500) NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADO', 'RECUSADO') NOT NULL DEFAULT 'PENDENTE',
    `aprovadoPorId` INTEGER NULL,
    `aprovadoEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `aditivos_obra_orcamentoId_fkey`(`orcamentoId`),
    INDEX `aditivos_obra_obraId_fkey`(`obraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aditivo_obra_itens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aditivoId` INTEGER NOT NULL,
    `servicoItemId` INTEGER NULL,
    `nome` VARCHAR(150) NOT NULL,
    `tipo` ENUM('SERVICO', 'MATERIAL', 'EQUIPAMENTO') NOT NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL,
    `valorUnitario` DECIMAL(12, 2) NOT NULL,
    `valorTotal` DECIMAL(12, 2) NOT NULL,
    `unidadeId` INTEGER NOT NULL,

    INDEX `aditivo_obra_itens_aditivoId_fkey`(`aditivoId`),
    INDEX `aditivo_obra_itens_servicoItemId_fkey`(`servicoItemId`),
    INDEX `aditivo_obra_itens_unidadeId_fkey`(`unidadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assinaturas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `obraId` INTEGER NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `nomeUser` VARCHAR(120) NOT NULL,
    `assinadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `assinaturas_obraId_key`(`obraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias_materiais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subcategorias_materiais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoriaId` INTEGER NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `subcategorias_materiais_categoriaId_idx`(`categoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materiais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `tipo` ENUM('MATERIAL', 'EQUIPAMENTO') NOT NULL DEFAULT 'MATERIAL',
    `quantidadeMinima` DECIMAL(12, 3) NULL,
    `custoUnitario` DECIMAL(12, 2) NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `corId` INTEGER NULL,
    `marcaId` INTEGER NULL,
    `modelo` VARCHAR(150) NULL,
    `unidadeId` INTEGER NOT NULL,
    `categoriaId` INTEGER NULL,
    `fornecedorId` INTEGER NULL,

    INDEX `materiais_nome_idx`(`nome`),
    INDEX `materiais_marcaId_idx`(`marcaId`),
    INDEX `materiais_corId_idx`(`corId`),
    INDEX `materiais_categoriaId_idx`(`categoriaId`),
    INDEX `materiais_fornecedorId_idx`(`fornecedorId`),
    INDEX `materiais_unidadeId_fkey`(`unidadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saldos_estoque` (
    `materialId` INTEGER NOT NULL,
    `saldo` DECIMAL(14, 3) NOT NULL DEFAULT 0.000,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`materialId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimentos_estoque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materialId` INTEGER NOT NULL,
    `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL,
    `saldoApos` DECIMAL(14, 3) NOT NULL,
    `compraItemId` INTEGER NULL,
    `obraId` INTEGER NULL,
    `separacaoItemId` INTEGER NULL,
    `registradoPorId` INTEGER NULL,
    `observacao` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `movimentos_estoque_materialId_idx`(`materialId`),
    INDEX `movimentos_estoque_obraId_idx`(`obraId`),
    INDEX `movimentos_estoque_compraItemId_fkey`(`compraItemId`),
    INDEX `movimentos_estoque_registradoPorId_fkey`(`registradoPorId`),
    INDEX `movimentos_estoque_separacaoItemId_fkey`(`separacaoItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `obraId` INTEGER NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'RECUSADA', 'RECEBIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `valorTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `criadoPorId` INTEGER NOT NULL,
    `aprovadoPorId` INTEGER NULL,
    `aprovadoEm` DATETIME(3) NULL,
    `recebidoEm` DATETIME(3) NULL,
    `observacoes` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `compras_codigo_key`(`codigo`),
    INDEX `compras_aprovadoPorId_fkey`(`aprovadoPorId`),
    INDEX `compras_criadoPorId_fkey`(`criadoPorId`),
    INDEX `compras_obraId_idx`(`obraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compra_itens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compraId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL,
    `quantidadeRecebida` DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    `valorUnitario` DECIMAL(12, 2) NOT NULL,
    `valorTotal` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDENTE', 'RECEBIDO') NOT NULL DEFAULT 'PENDENTE',

    INDEX `compra_itens_materialId_idx`(`materialId`),
    UNIQUE INDEX `compra_itens_compraId_materialId_key`(`compraId`, `materialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `separacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `executucaoAtividadeId` VARCHAR(191) NOT NULL,
    `dataNecessidade` DATETIME(3) NOT NULL,
    `status` ENUM('PENDENTE', 'PARCIAL', 'CONCLUIDA') NOT NULL DEFAULT 'PENDENTE',
    `statusNovo` ENUM('SEPARACAO_PENDENTE', 'SEPARACAO_CONCLUIDA', 'RETIRADA_PENDENTE', 'RETIRADA_CONCLUIDA', 'DEVOLUCAO_PENDENTE', 'DEVOLUCAO_CONCLUIDA') NOT NULL DEFAULT 'SEPARACAO_PENDENTE',
    `criadoPorId` INTEGER NULL,
    `confirmadoPorId` INTEGER NULL,
    `dataConfirmacao` DATETIME(3) NULL,
    `dataPrevista` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `separacoes_codigo_key`(`codigo`),
    INDEX `separacoes_criadoPorId_fkey`(`criadoPorId`),
    INDEX `separacoes_confirmadoPorId_fkey`(`confirmadoPorId`),
    INDEX `separacoes_statusNovo_idx`(`statusNovo`),
    UNIQUE INDEX `separacoes_executucaoAtividadeId_key`(`executucaoAtividadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `separacao_itens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `separacaoId` INTEGER NOT NULL,
    `materialId` INTEGER NULL,
    `epiId` INTEGER NULL,
    `equipamentoId` INTEGER NULL,
    `quantidadeNecessaria` DECIMAL(12, 3) NOT NULL,
    `quantidadeSeparada` DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    `status` ENUM('PENDENTE', 'SEPARADO', 'EM_FALTA', 'RETIRADO', 'CONFERIDO') NOT NULL DEFAULT 'PENDENTE',
    `retiradoPorId` INTEGER NULL,
    `colaboradorId` INTEGER NULL,
    `retiradoEm` DATETIME(3) NULL,
    `conferidoPorId` INTEGER NULL,
    `conferidoEm` DATETIME(3) NULL,
    `observacao` VARCHAR(500) NULL,

    INDEX `separacao_itens_separacaoId_materialId_idx`(`separacaoId`, `materialId`),
    INDEX `separacao_itens_materialId_idx`(`materialId`),
    INDEX `separacao_itens_epiId_idx`(`epiId`),
    INDEX `separacao_itens_equipamentoId_idx`(`equipamentoId`),
    INDEX `separacao_itens_colaboradorId_idx`(`colaboradorId`),
    INDEX `separacao_itens_conferidoPorId_fkey`(`conferidoPorId`),
    INDEX `separacao_itens_retiradoPorId_fkey`(`retiradoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lancamentos_financeiros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `categoria` VARCHAR(100) NULL,
    `formaPagamento` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TRANSFERENCIA') NULL,
    `origem` ENUM('PAGAMENTO', 'COMPRA', 'ADITIVO', 'AJUSTE', 'OUTRO') NOT NULL DEFAULT 'AJUSTE',
    `origemId` INTEGER NULL,
    `criadoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lancamentos_financeiros_data_idx`(`data`),
    INDEX `lancamentos_financeiros_criadoPorId_fkey`(`criadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PagamentoObra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `obraId` INTEGER NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `formaPagamento` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TRANSFERENCIA') NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacoes` VARCHAR(500) NULL,
    `registradoPorId` INTEGER NULL,
    `lancamentoId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PagamentoObra_obraId_idx`(`obraId`),
    INDEX `pagamentos_obra_lancamentoId_fkey`(`lancamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `acessos_cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `obraId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `nome` VARCHAR(120) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `expiraEm` DATETIME(3) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ultimoAcesso` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `acessos_cliente_token_key`(`token`),
    INDEX `acessos_cliente_obraId_idx`(`obraId`),
    INDEX `acessos_cliente_clienteId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `mensagem` VARCHAR(500) NOT NULL,
    `link` VARCHAR(255) NULL,
    `status` ENUM('NAO_LIDA', 'LIDA') NOT NULL DEFAULT 'NAO_LIDA',
    `obraId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notificacoes_userId_status_idx`(`userId`, `status`),
    INDEX `notificacoes_obraId_idx`(`obraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `expiraEm` DATETIME(3) NOT NULL,
    `usadoEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_key`(`token`),
    INDEX `password_reset_tokens_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `uploaderId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `uploads_uploaderId_fkey`(`uploaderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias_equipamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subcategorias_equipamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoriaId` INTEGER NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `subcategorias_equipamentos_categoriaId_idx`(`categoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias_epis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subcategorias_epis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoriaId` INTEGER NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `subcategorias_epis_categoriaId_idx`(`categoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marcas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `cnpj` VARCHAR(20) NULL,
    `telefone` VARCHAR(20) NULL,
    `email` VARCHAR(120) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fornecedores_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `localizacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_equipamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estados_conservacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_manutencao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(80) NOT NULL,
    `codigoHex` VARCHAR(7) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tamanhos_equipamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(30) NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `numeroPatrimonio` VARCHAR(50) NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `modelo` VARCHAR(120) NULL,
    `numeroSerie` VARCHAR(120) NULL,
    `marcaId` INTEGER NULL,
    `categoriaId` INTEGER NULL,
    `subcategoriaId` INTEGER NULL,
    `localizacaoId` INTEGER NULL,
    `fornecedorId` INTEGER NULL,
    `statusId` INTEGER NOT NULL,
    `estadoConservacaoId` INTEGER NULL,
    `responsavelId` INTEGER NULL,
    `dataAquisicao` DATETIME(3) NULL,
    `valorAquisicao` DECIMAL(12, 2) NULL,
    `dataGarantia` DATETIME(3) NULL,
    `observacoes` VARCHAR(1000) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `unidadeMedidaId` INTEGER NULL,

    UNIQUE INDEX `equipamentos_codigo_key`(`codigo`),
    INDEX `equipamentos_statusId_idx`(`statusId`),
    INDEX `equipamentos_categoriaId_idx`(`categoriaId`),
    INDEX `equipamentos_descricao_idx`(`descricao`),
    INDEX `equipamentos_estadoConservacaoId_fkey`(`estadoConservacaoId`),
    INDEX `equipamentos_fornecedorId_fkey`(`fornecedorId`),
    INDEX `equipamentos_localizacaoId_fkey`(`localizacaoId`),
    INDEX `equipamentos_marcaId_fkey`(`marcaId`),
    INDEX `equipamentos_responsavelId_fkey`(`responsavelId`),
    INDEX `equipamentos_subcategoriaId_fkey`(`subcategoriaId`),
    INDEX `equipamentos_unidadeMedidaId_fkey`(`unidadeMedidaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retiradas_equipamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipamentoId` INTEGER NOT NULL,
    `colaboradorId` INTEGER NOT NULL,
    `dataRetirada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataDevolucao` DATETIME(3) NULL,
    `observacao` VARCHAR(500) NULL,
    `registradoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `executucaoAtividadeId` VARCHAR(191) NULL,
    `dataPrevisaoDevolucao` DATETIME(3) NULL,
    `status` ENUM('EM_USO', 'DEVOLVIDO', 'EM_MANUTENCAO', 'PERDIDO') NOT NULL DEFAULT 'EM_USO',

    INDEX `retiradas_equipamentos_equipamentoId_dataRetirada_idx`(`equipamentoId`, `dataRetirada`),
    INDEX `retiradas_equipamentos_colaboradorId_fkey`(`colaboradorId`),
    INDEX `retiradas_equipamentos_registradoPorId_fkey`(`registradoPorId`),
    INDEX `retiradas_equipamentos_executucaoAtividadeId_idx`(`executucaoAtividadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manutencoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipamentoId` INTEGER NOT NULL,
    `tipoId` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `descricao` VARCHAR(500) NOT NULL,
    `custo` DECIMAL(12, 2) NULL,
    `status` ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `responsavelManutencaoId` INTEGER NULL,
    `proximaManutencao` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `manutencoes_equipamentoId_idx`(`equipamentoId`),
    INDEX `manutencoes_status_idx`(`status`),
    INDEX `manutencoes_responsavelManutencaoId_fkey`(`responsavelManutencaoId`),
    INDEX `manutencoes_tipoId_fkey`(`tipoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `epis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `numeroCa` VARCHAR(50) NULL,
    `dataValidade` DATETIME(3) NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    `quantidadeMinima` DECIMAL(12, 3) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoriaId` INTEGER NULL,
    `fornecedorId` INTEGER NULL,
    `localizacaoId` INTEGER NULL,
    `marcaId` INTEGER NULL,
    `subcategoriaId` INTEGER NULL,
    `corId` INTEGER NULL,
    `modelo` VARCHAR(150) NULL,
    `tamanhoId` INTEGER NULL,
    `unidadeMedidaId` INTEGER NULL,
    `numeroPatrimonio` VARCHAR(50) NULL,

    UNIQUE INDEX `epis_codigo_key`(`codigo`),
    INDEX `epis_nome_idx`(`nome`),
    INDEX `epis_categoriaId_idx`(`categoriaId`),
    INDEX `epis_corId_idx`(`corId`),
    INDEX `epis_tamanhoId_idx`(`tamanhoId`),
    INDEX `epis_fornecedorId_fkey`(`fornecedorId`),
    INDEX `epis_localizacaoId_fkey`(`localizacaoId`),
    INDEX `epis_marcaId_fkey`(`marcaId`),
    INDEX `epis_subcategoriaId_fkey`(`subcategoriaId`),
    INDEX `epis_unidadeMedidaId_fkey`(`unidadeMedidaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entregas_epi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `epiId` INTEGER NOT NULL,
    `colaboradorId` INTEGER NOT NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacao` VARCHAR(500) NULL,
    `registradoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `executucaoAtividadeId` VARCHAR(191) NULL,
    `separacaoId` INTEGER NULL,
    `dataDevolucao` DATETIME(3) NULL,
    `status` ENUM('EM_USO', 'DEVOLVIDO', 'PERDIDO') NOT NULL DEFAULT 'EM_USO',

    INDEX `entregas_epi_epiId_idx`(`epiId`),
    INDEX `entregas_epi_colaboradorId_fkey`(`colaboradorId`),
    INDEX `entregas_epi_registradoPorId_fkey`(`registradoPorId`),
    INDEX `entregas_epi_executucaoAtividadeId_idx`(`executucaoAtividadeId`),
    INDEX `entregas_epi_separacaoId_idx`(`separacaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `papeis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `descricao` VARCHAR(200) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `papeis_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chave` VARCHAR(80) NOT NULL,
    `descricao` VARCHAR(200) NOT NULL,
    `categoria` VARCHAR(60) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissoes_chave_key`(`chave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `papel_permissao` (
    `papelId` INTEGER NOT NULL,
    `permissaoId` INTEGER NOT NULL,

    INDEX `papel_permissao_permissaoId_fkey`(`permissaoId`),
    PRIMARY KEY (`papelId`, `permissaoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_papel` (
    `userId` INTEGER NOT NULL,
    `papelId` INTEGER NOT NULL,

    INDEX `usuario_papel_papelId_fkey`(`papelId`),
    PRIMARY KEY (`userId`, `papelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalogo_atividades` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `especialidadeNecessaria` ENUM('IMPERMEABILIZACAO', 'PINTURA', 'ELETRICA', 'HIDRAULICA', 'CIVIL', 'LIMPEZA', 'OUTROS') NOT NULL,
    `tempoEstimadoHoras` DECIMAL(5, 2) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `etapaId` INTEGER NULL,
    `subServicoId` INTEGER NULL,

    INDEX `catalogo_atividades_etapaId_idx`(`etapaId`),
    INDEX `catalogo_atividades_subServicoId_idx`(`subServicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `substep_atividades` (
    `id` VARCHAR(191) NOT NULL,
    `catalogoAtividadeId` VARCHAR(191) NOT NULL,
    `ordem` INTEGER NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NULL,

    UNIQUE INDEX `substep_atividades_catalogoAtividadeId_ordem_key`(`catalogoAtividadeId`, `ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurso_atividades` (
    `id` VARCHAR(191) NOT NULL,
    `catalogoAtividadeId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL') NOT NULL,
    `itemCatalogoId` INTEGER NOT NULL,
    `quantidade` DECIMAL(10, 2) NOT NULL DEFAULT 1.00,

    INDEX `recurso_atividades_catalogoAtividadeId_fkey`(`catalogoAtividadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `execucoes_atividade` (
    `id` VARCHAR(191) NOT NULL,
    `atividadeId` VARCHAR(191) NOT NULL,
    `dataPrevisao` DATETIME(3) NULL,
    `dataInicio` DATETIME(3) NULL,
    `dataConclusao` DATETIME(3) NULL,
    `status` ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `atribuidoAId` INTEGER NULL,
    `criadoPorId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `execucoes_atividade_atividadeId_idx`(`atividadeId`),
    INDEX `execucoes_atividade_atribuidoAId_idx`(`atribuidoAId`),
    INDEX `execucoes_atividade_criadoPorId_idx`(`criadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checklist_atividade` (
    `id` VARCHAR(191) NOT NULL,
    `executucaoAtividadeId` VARCHAR(191) NOT NULL,
    `subStepAtividadeId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDENTE', 'CONCLUIDA', 'BLOQUEADA') NOT NULL DEFAULT 'PENDENTE',
    `concluidoEm` DATETIME(3) NULL,
    `concluidoPorId` INTEGER NULL,
    `observacao` VARCHAR(191) NULL,

    INDEX `checklist_atividade_executucaoAtividadeId_idx`(`executucaoAtividadeId`),
    INDEX `checklist_atividade_concluidoPorId_fkey`(`concluidoPorId`),
    INDEX `checklist_atividade_subStepAtividadeId_fkey`(`subStepAtividadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verbos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verbos_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `objetos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `objetos_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locais_obra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `locais_obra_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `caracteristicas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `caracteristicas_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_servicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `etapaId` INTEGER NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sub_servicos_etapaId_nome_key`(`etapaId`, `nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_servico_atividades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subServicoId` INTEGER NOT NULL,
    `verboId` INTEGER NOT NULL,
    `objetoId` INTEGER NOT NULL,
    `localId` INTEGER NULL,
    `caracteristicaId` INTEGER NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sub_servico_atividades_subServicoId_verboId_objetoId_localId_key`(`subServicoId`, `verboId`, `objetoId`, `localId`, `caracteristicaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orcamento_obra_fichas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orcamentoId` INTEGER NOT NULL,
    `areaPisoM2` DECIMAL(10, 2) NULL,
    `areaParedeM2` DECIMAL(10, 2) NULL,
    `areaTetoM2` DECIMAL(10, 2) NULL,
    `perimetroM` DECIMAL(10, 2) NULL,
    `acabamentoPiso` ENUM('CERAMICA', 'PORCELANATO', 'CIMENTO', 'REVESTIMENTO', 'OUTRO') NULL,
    `acabamentoParede` ENUM('PINTURA', 'REVESTIMENTO_CERAMICO', 'APLICACAO', 'OUTRO') NULL,
    `tipoForro` ENUM('GESSO', 'PVC', 'DRYWALL', 'ALVENARIA', 'NENHUM') NULL,
    `tipoEsquadria` ENUM('ALUMINIO', 'MADEIRA', 'FERRO', 'PVC', 'OUTRO') NULL,
    `padraoAcabamento` ENUM('BASICO', 'STANDARD', 'PREMIUM') NULL,
    `caixasLuz` INTEGER NULL,
    `cuidados` JSON NOT NULL,
    `risco1` VARCHAR(500) NULL,
    `acao1` VARCHAR(500) NULL,
    `risco2` VARCHAR(500) NULL,
    `acao2` VARCHAR(500) NULL,
    `risco3` VARCHAR(500) NULL,
    `acao3` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orcamento_obra_fichas_orcamentoId_key`(`orcamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orcamento_atividades` (
    `id` VARCHAR(191) NOT NULL,
    `orcamentoId` INTEGER NOT NULL,
    `etapaId` INTEGER NOT NULL,
    `subServicoId` INTEGER NOT NULL,
    `catalogoAtividadeId` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(1000) NOT NULL,
    `verboId` INTEGER NOT NULL,
    `objetoId` INTEGER NOT NULL,
    `localId` INTEGER NULL,
    `caracteristicaId` INTEGER NULL,
    `unidadeId` INTEGER NULL,
    `quantidade` DECIMAL(10, 3) NULL,
    `areaM2` DECIMAL(10, 2) NULL,
    `moValorHora` DECIMAL(10, 2) NULL,
    `moPessoas` INTEGER NULL,
    `moHoras` DECIMAL(10, 2) NULL,
    `moValorTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `materiaisValor` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `linhaValorTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `ordem` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `orcamento_atividades_orcamentoId_idx`(`orcamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orcamento_atividade_materiais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orcamentoAtividadeId` VARCHAR(191) NOT NULL,
    `materialId` INTEGER NOT NULL,
    `quantidade` DECIMAL(10, 3) NOT NULL,
    `custoUnitario` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `orcamento_atividade_materiais_orcamentoAtividadeId_idx`(`orcamentoAtividadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL,
    `orcamentoId` INTEGER NOT NULL,
    `atendimentoId` INTEGER NOT NULL,
    `visitaId` INTEGER NULL,
    `userId` INTEGER NULL,
    `enderecoId` INTEGER NULL,
    `urgencia` ENUM('NORMAL', 'URGENTE', 'URGENTISSIMO') NOT NULL,
    `status` ENUM('EM_PREPARACAO', 'EM_EXECUCAO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'EM_PREPARACAO',
    `valorContratado` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `areaM2` DECIMAL(10, 2) NULL,
    `valorM2` DECIMAL(10, 2) NULL,
    `observacoes` VARCHAR(2000) NULL,
    `formaPagamento` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TRANSFERENCIA') NULL,
    `aprovadoPorId` INTEGER NOT NULL,
    `aprovadoEm` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `obras_codigo_key`(`codigo`),
    UNIQUE INDEX `obras_orcamentoId_key`(`orcamentoId`),
    INDEX `obras_atendimentoId_idx`(`atendimentoId`),
    INDEX `obras_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obras_etapas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `obraId` INTEGER NOT NULL,
    `etapaId` INTEGER NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `ordem` INTEGER NOT NULL,
    `inativo` BOOLEAN NOT NULL DEFAULT false,

    INDEX `obras_etapas_obraId_idx`(`obraId`),
    INDEX `obras_etapas_etapaId_idx`(`etapaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obras_atividades` (
    `id` VARCHAR(191) NOT NULL,
    `obraEtapaId` INTEGER NOT NULL,
    `subServicoId` INTEGER NOT NULL,
    `catalogoAtividadeId` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(1000) NOT NULL,
    `verboId` INTEGER NOT NULL,
    `objetoId` INTEGER NOT NULL,
    `localId` INTEGER NULL,
    `caracteristicaId` INTEGER NULL,
    `unidadeId` INTEGER NULL,
    `quantidade` DECIMAL(10, 3) NULL,
    `areaM2` DECIMAL(10, 2) NULL,
    `moValorHora` DECIMAL(10, 2) NULL,
    `moPessoas` INTEGER NULL,
    `moHoras` DECIMAL(10, 3) NULL,
    `moValorTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `materiaisValor` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `linhaValorTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `ordem` INTEGER NOT NULL,
    `aditivoId` INTEGER NULL,
    `cancelada` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `obras_atividades_obraEtapaId_idx`(`obraEtapaId`),
    INDEX `obras_atividades_aditivoId_idx`(`aditivoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obras_atividades_materiais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `obraAtividadeId` VARCHAR(191) NOT NULL,
    `materialId` INTEGER NOT NULL,
    `quantidade` DECIMAL(10, 3) NOT NULL,
    `custoUnitario` DECIMAL(10, 2) NOT NULL,

    INDEX `obras_atividades_materiais_obraAtividadeId_idx`(`obraAtividadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_veiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `status_veiculo_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_veiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tipo_veiculo_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `veiculos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `placa` VARCHAR(10) NOT NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `modelo` VARCHAR(120) NULL,
    `ano` INTEGER NULL,
    `combustivel` ENUM('GASOLINA', 'ALCOOL', 'DIESEL', 'FLEX', 'ELETRICO', 'OUTRO') NOT NULL DEFAULT 'GASOLINA',
    `odometroAtual` DECIMAL(7, 1) NOT NULL DEFAULT 0,
    `observacoes` VARCHAR(1000) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `marcaId` INTEGER NULL,
    `corId` INTEGER NULL,
    `tipoId` INTEGER NOT NULL,
    `statusId` INTEGER NOT NULL,
    `responsavelId` INTEGER NULL,

    UNIQUE INDEX `veiculos_codigo_key`(`codigo`),
    UNIQUE INDEX `veiculos_placa_key`(`placa`),
    INDEX `veiculos_statusId_idx`(`statusId`),
    INDEX `veiculos_tipoId_idx`(`tipoId`),
    INDEX `veiculos_marcaId_idx`(`marcaId`),
    INDEX `veiculos_responsavelId_idx`(`responsavelId`),
    INDEX `veiculos_descricao_idx`(`descricao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registros_km_veiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATE NOT NULL,
    `odometro` DECIMAL(7, 1) NOT NULL,
    `kmPercorrido` DECIMAL(9, 2) NOT NULL,
    `observacao` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `veiculoId` INTEGER NOT NULL,
    `registradoPorId` INTEGER NULL,

    INDEX `registros_km_veiculo_veiculoId_data_idx`(`veiculoId`, `data`),
    UNIQUE INDEX `registros_km_veiculo_veiculoId_data_key`(`veiculoId`, `data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `abastecimentos_veiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATE NOT NULL,
    `odometro` DECIMAL(7, 1) NOT NULL,
    `litros` DECIMAL(12, 3) NOT NULL,
    `valorTotal` DECIMAL(12, 2) NOT NULL,
    `precoLitro` DECIMAL(12, 4) NOT NULL,
    `kmDesdeUltimo` DECIMAL(9, 2) NULL,
    `kmPorLitro` DECIMAL(12, 4) NULL,
    `observacao` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `veiculoId` INTEGER NOT NULL,
    `fornecedorId` INTEGER NULL,
    `registradoPorId` INTEGER NULL,

    INDEX `abastecimentos_veiculo_veiculoId_idx`(`veiculoId`),
    INDEX `abastecimentos_veiculo_data_idx`(`data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manutencoes_veiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATE NOT NULL,
    `descricao` VARCHAR(500) NOT NULL,
    `local` VARCHAR(200) NULL,
    `custoPecas` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `custoMaoDeObra` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `custoTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `status` ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `proximaManutencao` DATE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `veiculoId` INTEGER NOT NULL,
    `tipoId` INTEGER NOT NULL,
    `responsavelManutencaoId` INTEGER NULL,

    INDEX `manutencoes_veiculo_veiculoId_idx`(`veiculoId`),
    INDEX `manutencoes_veiculo_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `cargos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimentos` ADD CONSTRAINT `atendimentos_atendenteId_fkey` FOREIGN KEY (`atendenteId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimentos` ADD CONSTRAINT `atendimentos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_logs` ADD CONSTRAINT `atendimento_logs_atendenteId_fkey` FOREIGN KEY (`atendenteId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_logs` ADD CONSTRAINT `atendimento_logs_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enderecos` ADD CONSTRAINT `enderecos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas_tecnicas` ADD CONSTRAINT `visitas_tecnicas_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas_tecnicas` ADD CONSTRAINT `visitas_tecnicas_agendamentoId_fkey` FOREIGN KEY (`agendamentoId`) REFERENCES `agendamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas_tecnicas` ADD CONSTRAINT `visitas_tecnicas_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas_tecnicas` ADD CONSTRAINT `visitas_tecnicas_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fotos_visitas` ADD CONSTRAINT `fotos_visitas_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `visitas_tecnicas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disponibilidade_padroes` ADD CONSTRAINT `disponibilidade_padroes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disponibilidade_datas` ADD CONSTRAINT `disponibilidade_datas_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servico_itens` ADD CONSTRAINT `servico_itens_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servico_itens` ADD CONSTRAINT `servico_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servico_itens` ADD CONSTRAINT `servico_itens_unidadeId_fkey` FOREIGN KEY (`unidadeId`) REFERENCES `unidade_medida`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_servicoMarketingId_fkey` FOREIGN KEY (`servicoMarketingId`) REFERENCES `servicos_marketing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `visitas_tecnicas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_agendamentoId_fkey` FOREIGN KEY (`agendamentoId`) REFERENCES `agendamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivos_obra` ADD CONSTRAINT `aditivos_obra_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivos_obra` ADD CONSTRAINT `aditivos_obra_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `obras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivo_obra_itens` ADD CONSTRAINT `aditivo_obra_itens_aditivoId_fkey` FOREIGN KEY (`aditivoId`) REFERENCES `aditivos_obra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivo_obra_itens` ADD CONSTRAINT `aditivo_obra_itens_servicoItemId_fkey` FOREIGN KEY (`servicoItemId`) REFERENCES `servico_itens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aditivo_obra_itens` ADD CONSTRAINT `aditivo_obra_itens_unidadeId_fkey` FOREIGN KEY (`unidadeId`) REFERENCES `unidade_medida`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `obras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subcategorias_materiais` ADD CONSTRAINT `subcategorias_materiais_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_materiais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `cores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `marcas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_unidadeId_fkey` FOREIGN KEY (`unidadeId`) REFERENCES `unidade_medida`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saldos_estoque` ADD CONSTRAINT `saldos_estoque_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_compraItemId_fkey` FOREIGN KEY (`compraItemId`) REFERENCES `compra_itens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `obras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_separacaoItemId_fkey` FOREIGN KEY (`separacaoItemId`) REFERENCES `separacao_itens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `obras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compra_itens` ADD CONSTRAINT `compra_itens_compraId_fkey` FOREIGN KEY (`compraId`) REFERENCES `compras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compra_itens` ADD CONSTRAINT `compra_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacoes` ADD CONSTRAINT `separacoes_executucaoAtividadeId_fkey` FOREIGN KEY (`executucaoAtividadeId`) REFERENCES `execucoes_atividade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacoes` ADD CONSTRAINT `separacoes_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacoes` ADD CONSTRAINT `separacoes_confirmadoPorId_fkey` FOREIGN KEY (`confirmadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_conferidoPorId_fkey` FOREIGN KEY (`conferidoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_epiId_fkey` FOREIGN KEY (`epiId`) REFERENCES `epis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_retiradoPorId_fkey` FOREIGN KEY (`retiradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_colaboradorId_fkey` FOREIGN KEY (`colaboradorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `separacao_itens` ADD CONSTRAINT `separacao_itens_separacaoId_fkey` FOREIGN KEY (`separacaoId`) REFERENCES `separacoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lancamentos_financeiros` ADD CONSTRAINT `lancamentos_financeiros_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagamentoObra` ADD CONSTRAINT `PagamentoObra_lancamentoId_fkey` FOREIGN KEY (`lancamentoId`) REFERENCES `lancamentos_financeiros`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagamentoObra` ADD CONSTRAINT `PagamentoObra_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `obras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagamentoObra` ADD CONSTRAINT `PagamentoObra_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `acessos_cliente` ADD CONSTRAINT `acessos_cliente_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `acessos_cliente` ADD CONSTRAINT `acessos_cliente_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `obras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `obras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subcategorias_equipamentos` ADD CONSTRAINT `subcategorias_equipamentos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_equipamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subcategorias_epis` ADD CONSTRAINT `subcategorias_epis_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_epis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_equipamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_estadoConservacaoId_fkey` FOREIGN KEY (`estadoConservacaoId`) REFERENCES `estados_conservacao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_localizacaoId_fkey` FOREIGN KEY (`localizacaoId`) REFERENCES `localizacoes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `marcas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `status_equipamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_subcategoriaId_fkey` FOREIGN KEY (`subcategoriaId`) REFERENCES `subcategorias_equipamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_unidadeMedidaId_fkey` FOREIGN KEY (`unidadeMedidaId`) REFERENCES `unidade_medida`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retiradas_equipamentos` ADD CONSTRAINT `retiradas_equipamentos_executucaoAtividadeId_fkey` FOREIGN KEY (`executucaoAtividadeId`) REFERENCES `execucoes_atividade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retiradas_equipamentos` ADD CONSTRAINT `retiradas_equipamentos_colaboradorId_fkey` FOREIGN KEY (`colaboradorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retiradas_equipamentos` ADD CONSTRAINT `retiradas_equipamentos_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retiradas_equipamentos` ADD CONSTRAINT `retiradas_equipamentos_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_responsavelManutencaoId_fkey` FOREIGN KEY (`responsavelManutencaoId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_tipoId_fkey` FOREIGN KEY (`tipoId`) REFERENCES `tipos_manutencao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `epis` ADD CONSTRAINT `epis_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_epis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `epis` ADD CONSTRAINT `epis_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `cores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `epis` ADD CONSTRAINT `epis_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `epis` ADD CONSTRAINT `epis_localizacaoId_fkey` FOREIGN KEY (`localizacaoId`) REFERENCES `localizacoes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `epis` ADD CONSTRAINT `epis_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `marcas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `epis` ADD CONSTRAINT `epis_subcategoriaId_fkey` FOREIGN KEY (`subcategoriaId`) REFERENCES `subcategorias_epis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `epis` ADD CONSTRAINT `epis_tamanhoId_fkey` FOREIGN KEY (`tamanhoId`) REFERENCES `tamanhos_equipamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `epis` ADD CONSTRAINT `epis_unidadeMedidaId_fkey` FOREIGN KEY (`unidadeMedidaId`) REFERENCES `unidade_medida`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entregas_epi` ADD CONSTRAINT `entregas_epi_executucaoAtividadeId_fkey` FOREIGN KEY (`executucaoAtividadeId`) REFERENCES `execucoes_atividade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entregas_epi` ADD CONSTRAINT `entregas_epi_colaboradorId_fkey` FOREIGN KEY (`colaboradorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entregas_epi` ADD CONSTRAINT `entregas_epi_epiId_fkey` FOREIGN KEY (`epiId`) REFERENCES `epis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entregas_epi` ADD CONSTRAINT `entregas_epi_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entregas_epi` ADD CONSTRAINT `entregas_epi_separacaoId_fkey` FOREIGN KEY (`separacaoId`) REFERENCES `separacoes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `papel_permissao` ADD CONSTRAINT `papel_permissao_papelId_fkey` FOREIGN KEY (`papelId`) REFERENCES `papeis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `papel_permissao` ADD CONSTRAINT `papel_permissao_permissaoId_fkey` FOREIGN KEY (`permissaoId`) REFERENCES `permissoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_papel` ADD CONSTRAINT `usuario_papel_papelId_fkey` FOREIGN KEY (`papelId`) REFERENCES `papeis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_papel` ADD CONSTRAINT `usuario_papel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catalogo_atividades` ADD CONSTRAINT `catalogo_atividades_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catalogo_atividades` ADD CONSTRAINT `catalogo_atividades_subServicoId_fkey` FOREIGN KEY (`subServicoId`) REFERENCES `sub_servicos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `substep_atividades` ADD CONSTRAINT `substep_atividades_catalogoAtividadeId_fkey` FOREIGN KEY (`catalogoAtividadeId`) REFERENCES `catalogo_atividades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurso_atividades` ADD CONSTRAINT `recurso_atividades_catalogoAtividadeId_fkey` FOREIGN KEY (`catalogoAtividadeId`) REFERENCES `catalogo_atividades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `execucoes_atividade` ADD CONSTRAINT `execucoes_atividade_atividadeId_fkey` FOREIGN KEY (`atividadeId`) REFERENCES `obras_atividades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `execucoes_atividade` ADD CONSTRAINT `execucoes_atividade_atribuidoAId_fkey` FOREIGN KEY (`atribuidoAId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `execucoes_atividade` ADD CONSTRAINT `execucoes_atividade_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_atividade` ADD CONSTRAINT `checklist_atividade_executucaoAtividadeId_fkey` FOREIGN KEY (`executucaoAtividadeId`) REFERENCES `execucoes_atividade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_atividade` ADD CONSTRAINT `checklist_atividade_concluidoPorId_fkey` FOREIGN KEY (`concluidoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_atividade` ADD CONSTRAINT `checklist_atividade_subStepAtividadeId_fkey` FOREIGN KEY (`subStepAtividadeId`) REFERENCES `substep_atividades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_servicos` ADD CONSTRAINT `sub_servicos_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_servico_atividades` ADD CONSTRAINT `sub_servico_atividades_subServicoId_fkey` FOREIGN KEY (`subServicoId`) REFERENCES `sub_servicos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_servico_atividades` ADD CONSTRAINT `sub_servico_atividades_verboId_fkey` FOREIGN KEY (`verboId`) REFERENCES `verbos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_servico_atividades` ADD CONSTRAINT `sub_servico_atividades_objetoId_fkey` FOREIGN KEY (`objetoId`) REFERENCES `objetos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_servico_atividades` ADD CONSTRAINT `sub_servico_atividades_localId_fkey` FOREIGN KEY (`localId`) REFERENCES `locais_obra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_servico_atividades` ADD CONSTRAINT `sub_servico_atividades_caracteristicaId_fkey` FOREIGN KEY (`caracteristicaId`) REFERENCES `caracteristicas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_obra_fichas` ADD CONSTRAINT `orcamento_obra_fichas_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividades` ADD CONSTRAINT `orcamento_atividades_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividades` ADD CONSTRAINT `orcamento_atividades_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividades` ADD CONSTRAINT `orcamento_atividades_subServicoId_fkey` FOREIGN KEY (`subServicoId`) REFERENCES `sub_servicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividades` ADD CONSTRAINT `orcamento_atividades_catalogoAtividadeId_fkey` FOREIGN KEY (`catalogoAtividadeId`) REFERENCES `catalogo_atividades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividades` ADD CONSTRAINT `orcamento_atividades_verboId_fkey` FOREIGN KEY (`verboId`) REFERENCES `verbos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividades` ADD CONSTRAINT `orcamento_atividades_objetoId_fkey` FOREIGN KEY (`objetoId`) REFERENCES `objetos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividades` ADD CONSTRAINT `orcamento_atividades_localId_fkey` FOREIGN KEY (`localId`) REFERENCES `locais_obra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividades` ADD CONSTRAINT `orcamento_atividades_caracteristicaId_fkey` FOREIGN KEY (`caracteristicaId`) REFERENCES `caracteristicas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividade_materiais` ADD CONSTRAINT `orcamento_atividade_materiais_orcamentoAtividadeId_fkey` FOREIGN KEY (`orcamentoAtividadeId`) REFERENCES `orcamento_atividades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividade_materiais` ADD CONSTRAINT `orcamento_atividade_materiais_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras` ADD CONSTRAINT `obras_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras` ADD CONSTRAINT `obras_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras` ADD CONSTRAINT `obras_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `visitas_tecnicas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras` ADD CONSTRAINT `obras_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras` ADD CONSTRAINT `obras_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras` ADD CONSTRAINT `obras_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_etapas` ADD CONSTRAINT `obras_etapas_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `obras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_etapas` ADD CONSTRAINT `obras_etapas_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_atividades` ADD CONSTRAINT `obras_atividades_obraEtapaId_fkey` FOREIGN KEY (`obraEtapaId`) REFERENCES `obras_etapas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_atividades` ADD CONSTRAINT `obras_atividades_subServicoId_fkey` FOREIGN KEY (`subServicoId`) REFERENCES `sub_servicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_atividades` ADD CONSTRAINT `obras_atividades_catalogoAtividadeId_fkey` FOREIGN KEY (`catalogoAtividadeId`) REFERENCES `catalogo_atividades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_atividades` ADD CONSTRAINT `obras_atividades_verboId_fkey` FOREIGN KEY (`verboId`) REFERENCES `verbos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_atividades` ADD CONSTRAINT `obras_atividades_objetoId_fkey` FOREIGN KEY (`objetoId`) REFERENCES `objetos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_atividades` ADD CONSTRAINT `obras_atividades_localId_fkey` FOREIGN KEY (`localId`) REFERENCES `locais_obra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_atividades` ADD CONSTRAINT `obras_atividades_caracteristicaId_fkey` FOREIGN KEY (`caracteristicaId`) REFERENCES `caracteristicas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_atividades_materiais` ADD CONSTRAINT `obras_atividades_materiais_obraAtividadeId_fkey` FOREIGN KEY (`obraAtividadeId`) REFERENCES `obras_atividades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obras_atividades_materiais` ADD CONSTRAINT `obras_atividades_materiais_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `veiculos` ADD CONSTRAINT `veiculos_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `marcas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `veiculos` ADD CONSTRAINT `veiculos_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `cores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `veiculos` ADD CONSTRAINT `veiculos_tipoId_fkey` FOREIGN KEY (`tipoId`) REFERENCES `tipo_veiculo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `veiculos` ADD CONSTRAINT `veiculos_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `status_veiculo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `veiculos` ADD CONSTRAINT `veiculos_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registros_km_veiculo` ADD CONSTRAINT `registros_km_veiculo_veiculoId_fkey` FOREIGN KEY (`veiculoId`) REFERENCES `veiculos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registros_km_veiculo` ADD CONSTRAINT `registros_km_veiculo_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abastecimentos_veiculo` ADD CONSTRAINT `abastecimentos_veiculo_veiculoId_fkey` FOREIGN KEY (`veiculoId`) REFERENCES `veiculos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abastecimentos_veiculo` ADD CONSTRAINT `abastecimentos_veiculo_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abastecimentos_veiculo` ADD CONSTRAINT `abastecimentos_veiculo_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manutencoes_veiculo` ADD CONSTRAINT `manutencoes_veiculo_veiculoId_fkey` FOREIGN KEY (`veiculoId`) REFERENCES `veiculos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manutencoes_veiculo` ADD CONSTRAINT `manutencoes_veiculo_tipoId_fkey` FOREIGN KEY (`tipoId`) REFERENCES `tipos_manutencao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manutencoes_veiculo` ADD CONSTRAINT `manutencoes_veiculo_responsavelManutencaoId_fkey` FOREIGN KEY (`responsavelManutencaoId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

