-- Add AGUARDANDO_APROVACAO to StatusManutencao enum on manutencoes_veiculo table
ALTER TABLE `manutencoes_veiculo` MODIFY COLUMN `status` ENUM('PENDENTE','EM_ANDAMENTO','CONCLUIDA','CANCELADA','AGUARDANDO_APROVACAO') NOT NULL DEFAULT 'PENDENTE';

-- Add new columns for approval workflow
ALTER TABLE `manutencoes_veiculo` 
  ADD COLUMN `criadoPorId` INTEGER NULL,
  ADD COLUMN `aprovadoPorId` INTEGER NULL,
  ADD COLUMN `decididoEm` DATETIME(3) NULL,
  ADD COLUMN `motivoDecisao` VARCHAR(500) NULL;

-- Create indexes for the new foreign keys
CREATE INDEX `manutencoes_veiculo_criadoPorId_idx` ON `manutencoes_veiculo`(`criadoPorId`);
CREATE INDEX `manutencoes_veiculo_aprovadoPorId_idx` ON `manutencoes_veiculo`(`aprovadoPorId`);

-- Add foreign key constraints
ALTER TABLE `manutencoes_veiculo` 
  ADD CONSTRAINT `manutencoes_veiculo_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `manutencoes_veiculo` 
  ADD CONSTRAINT `manutencoes_veiculo_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
