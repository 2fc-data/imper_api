-- Pecas detalhadas das manutencoes de veiculos e equipamentos.
-- Os totais de pecas e mao de obra sao recalculados na aplicacao.

ALTER TABLE `manutencoes`
    ADD COLUMN `custoPecas` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `custoMaoDeObra` DECIMAL(12, 2) NOT NULL DEFAULT 0;

CREATE TABLE `manutencoes_pecas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `manutencaoId` INTEGER NOT NULL,
    `descricao` VARCHAR(200) NOT NULL,
    `acao` ENUM('TROCADA', 'CONSERTADA') NOT NULL,
    `origem` ENUM('ORIGINAL_NOVA', 'ORIGINAL_USADA', 'GENERICA_NOVA', 'GENERICA_USADA') NULL,
    `valor` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `manutencoes_pecas_manutencaoId_idx`(`manutencaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `manutencoes_pecas`
    ADD CONSTRAINT `manutencoes_pecas_manutencaoId_fkey`
    FOREIGN KEY (`manutencaoId`) REFERENCES `manutencoes`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `manutencoes_veiculo_pecas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `manutencaoId` INTEGER NOT NULL,
    `descricao` VARCHAR(200) NOT NULL,
    `acao` ENUM('TROCADA', 'CONSERTADA') NOT NULL,
    `origem` ENUM('ORIGINAL_NOVA', 'ORIGINAL_USADA', 'GENERICA_NOVA', 'GENERICA_USADA') NULL,
    `valor` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `manutencoes_veiculo_pecas_manutencaoId_idx`(`manutencaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `manutencoes_veiculo_pecas`
    ADD CONSTRAINT `manutencoes_veiculo_pecas_manutencaoId_fkey`
    FOREIGN KEY (`manutencaoId`) REFERENCES `manutencoes_veiculo`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
