/*
  Warnings:

  - You are about to drop the column `descricao` on the `veiculos` table. All the data in the column will be lost.
  - Added the required column `nome` to the `veiculos` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `veiculos_descricao_idx` ON `veiculos`;

-- AlterTable
ALTER TABLE `checklist_atividade` MODIFY `ordem` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `epis` ADD COLUMN `custoUnitario` DECIMAL(12, 2) NULL;

-- AlterTable
ALTER TABLE `orcamento_atividades` ADD COLUMN `episValor` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `veiculos` DROP COLUMN `descricao`,
    ADD COLUMN `fabricanteId` INTEGER NULL,
    ADD COLUMN `nome` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `atendimento_itens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `atendimentoId` INTEGER NOT NULL,
    `etapaId` INTEGER NOT NULL,
    `subServicoId` INTEGER NOT NULL,
    `verboId` INTEGER NOT NULL,
    `objetoId` INTEGER NOT NULL,
    `localId` INTEGER NULL,
    `caracteristicaId` INTEGER NULL,
    `observacoes` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `atendimento_itens_atendimentoId_idx`(`atendimentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visita_itens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visitaId` INTEGER NOT NULL,
    `etapaId` INTEGER NOT NULL,
    `subServicoId` INTEGER NOT NULL,
    `verboId` INTEGER NOT NULL,
    `objetoId` INTEGER NOT NULL,
    `localId` INTEGER NULL,
    `caracteristicaId` INTEGER NULL,
    `unidadeId` INTEGER NULL,
    `quantidade` DECIMAL(10, 3) NULL,
    `areaM2` DECIMAL(10, 2) NULL,
    `observacoes` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `visita_itens_visitaId_idx`(`visitaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orcamento_atividade_epis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orcamentoAtividadeId` VARCHAR(191) NOT NULL,
    `epiId` INTEGER NOT NULL,
    `quantidade` DECIMAL(10, 3) NOT NULL,
    `custoUnitario` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `orcamento_atividade_epis_orcamentoAtividadeId_idx`(`orcamentoAtividadeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `veiculos_nome_idx` ON `veiculos`(`nome`);

-- AddForeignKey
ALTER TABLE `atendimento_itens` ADD CONSTRAINT `atendimento_itens_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_itens` ADD CONSTRAINT `atendimento_itens_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_itens` ADD CONSTRAINT `atendimento_itens_subServicoId_fkey` FOREIGN KEY (`subServicoId`) REFERENCES `sub_servicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_itens` ADD CONSTRAINT `atendimento_itens_verboId_fkey` FOREIGN KEY (`verboId`) REFERENCES `verbos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_itens` ADD CONSTRAINT `atendimento_itens_objetoId_fkey` FOREIGN KEY (`objetoId`) REFERENCES `objetos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_itens` ADD CONSTRAINT `atendimento_itens_localId_fkey` FOREIGN KEY (`localId`) REFERENCES `locais_obra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atendimento_itens` ADD CONSTRAINT `atendimento_itens_caracteristicaId_fkey` FOREIGN KEY (`caracteristicaId`) REFERENCES `caracteristicas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visita_itens` ADD CONSTRAINT `visita_itens_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `visitas_tecnicas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visita_itens` ADD CONSTRAINT `visita_itens_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visita_itens` ADD CONSTRAINT `visita_itens_subServicoId_fkey` FOREIGN KEY (`subServicoId`) REFERENCES `sub_servicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visita_itens` ADD CONSTRAINT `visita_itens_verboId_fkey` FOREIGN KEY (`verboId`) REFERENCES `verbos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visita_itens` ADD CONSTRAINT `visita_itens_objetoId_fkey` FOREIGN KEY (`objetoId`) REFERENCES `objetos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visita_itens` ADD CONSTRAINT `visita_itens_localId_fkey` FOREIGN KEY (`localId`) REFERENCES `locais_obra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visita_itens` ADD CONSTRAINT `visita_itens_caracteristicaId_fkey` FOREIGN KEY (`caracteristicaId`) REFERENCES `caracteristicas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visita_itens` ADD CONSTRAINT `visita_itens_unidadeId_fkey` FOREIGN KEY (`unidadeId`) REFERENCES `unidade_medida`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividade_epis` ADD CONSTRAINT `orcamento_atividade_epis_orcamentoAtividadeId_fkey` FOREIGN KEY (`orcamentoAtividadeId`) REFERENCES `orcamento_atividades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamento_atividade_epis` ADD CONSTRAINT `orcamento_atividade_epis_epiId_fkey` FOREIGN KEY (`epiId`) REFERENCES `epis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `veiculos` ADD CONSTRAINT `veiculos_fabricanteId_fkey` FOREIGN KEY (`fabricanteId`) REFERENCES `marcas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
