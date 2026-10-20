-- AlterTable
ALTER TABLE `materiais` MODIFY `tipo` ENUM('MATERIAL', 'EQUIPAMENTO', 'SUPERMERCADO') NOT NULL DEFAULT 'MATERIAL';

-- RenameIndex
ALTER TABLE `registros_km_veiculo` RENAME INDEX `registros_km_veiculo_colaboradorId_fkey` TO `registros_km_veiculo_colaboradorId_idx`;
