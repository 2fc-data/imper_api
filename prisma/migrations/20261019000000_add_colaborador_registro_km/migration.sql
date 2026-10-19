-- AlterTable
ALTER TABLE `registros_km_veiculo` ADD COLUMN `colaboradorId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `registros_km_veiculo_colaboradorId_fkey` ON `registros_km_veiculo`(`colaboradorId`);

-- AddForeignKey
ALTER TABLE `registros_km_veiculo` ADD CONSTRAINT `registros_km_veiculo_colaboradorId_fkey` FOREIGN KEY (`colaboradorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
