-- AlterTable obras
ALTER TABLE `obras`
  ADD COLUMN `dataInicioPrevista` DATETIME(3) NULL,
  ADD COLUMN `dataDisparoWhatsapp` DATETIME(3) NULL,
  ADD COLUMN `statusWhatsapp` VARCHAR(30) NULL DEFAULT 'PENDENTE';

-- AlterTable execucoes_atividade
ALTER TABLE `execucoes_atividade`
  ADD COLUMN `veiculoId` INT NULL,
  ADD COLUMN `tokenAcesso` VARCHAR(64) NULL,
  ADD COLUMN `fotoConclusaoUrl` VARCHAR(500) NULL,
  ADD COLUMN `observacaoConclusao` VARCHAR(1000) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `execucoes_atividade_tokenAcesso_key` ON `execucoes_atividade`(`tokenAcesso`);

-- AddForeignKey
ALTER TABLE `execucoes_atividade` ADD CONSTRAINT `execucoes_atividade_veiculoId_fkey` FOREIGN KEY (`veiculoId`) REFERENCES `veiculos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

