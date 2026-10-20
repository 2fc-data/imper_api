-- AlterTable
ALTER TABLE `abastecimentos_veiculo` ADD COLUMN `motoristaId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `abastecimentos_veiculo_motoristaId_fkey` ON `abastecimentos_veiculo`(`motoristaId`);

-- AddForeignKey
ALTER TABLE `abastecimentos_veiculo` ADD CONSTRAINT `abastecimentos_veiculo_motoristaId_fkey` FOREIGN KEY (`motoristaId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
