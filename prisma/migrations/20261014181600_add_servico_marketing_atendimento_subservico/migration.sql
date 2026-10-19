-- AlterTable
ALTER TABLE `atendimentos` ADD COLUMN `servicoMarketingId` INTEGER NULL;

-- AlterTable
ALTER TABLE `sub_servicos` ADD COLUMN `servicoMarketingId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `atendimentos_servicoMarketingId_fkey` ON `atendimentos`(`servicoMarketingId`);

-- CreateIndex
CREATE INDEX `sub_servicos_servicoMarketingId_fkey` ON `sub_servicos`(`servicoMarketingId`);

-- CreateIndex
CREATE INDEX `sub_servicos_etapaId_fkey` ON `sub_servicos`(`etapaId`);

-- Drop antigo unique e add novo unique com servicoMarketingId
DROP INDEX `sub_servicos_etapaId_nome_key` ON `sub_servicos`;
CREATE UNIQUE INDEX `sub_servicos_etapaId_nome_servicoMarketingId_key` ON `sub_servicos`(`etapaId`, `nome`, `servicoMarketingId`);

-- AddForeignKey
ALTER TABLE `atendimentos` ADD CONSTRAINT `atendimentos_servicoMarketingId_fkey` FOREIGN KEY (`servicoMarketingId`) REFERENCES `servicos_marketing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_servicos` ADD CONSTRAINT `sub_servicos_servicoMarketingId_fkey` FOREIGN KEY (`servicoMarketingId`) REFERENCES `servicos_marketing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
