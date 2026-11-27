-- AlterTable
ALTER TABLE `manutencoes` 
    ADD COLUMN `criadoPorId` INTEGER NULL,
    ADD COLUMN `aprovadoPorId` INTEGER NULL,
    ADD COLUMN `decididoEm` DATETIME(3) NULL,
    ADD COLUMN `motivoDecisao` VARCHAR(500) NULL;

-- CreateIndex
CREATE INDEX `manutencoes_criadoPorId_idx` ON `manutencoes`(`criadoPorId`);

-- CreateIndex
CREATE INDEX `manutencoes_aprovadoPorId_idx` ON `manutencoes`(`aprovadoPorId`);

-- AddForeignKey
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
