-- CreateTable tipos_despesas
CREATE TABLE IF NOT EXISTS `tipos_despesas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `requerObra` BOOLEAN NOT NULL DEFAULT false,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tipos_despesas_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable materiais: enum change and new columns
ALTER TABLE `materiais` MODIFY `tipo` ENUM('MATERIAL', 'EQUIPAMENTO', 'SUPERMERCADO', 'DESPESAS_EXTRAS') NOT NULL DEFAULT 'MATERIAL';

UPDATE `materiais` SET `tipo` = 'DESPESAS_EXTRAS' WHERE `tipo` = 'SUPERMERCADO';

ALTER TABLE `materiais` MODIFY `tipo` ENUM('MATERIAL', 'EQUIPAMENTO', 'DESPESAS_EXTRAS') NOT NULL DEFAULT 'MATERIAL';

-- Add columns tipoDespesaId and obraId if not exists
SET @exist_col_tipo_despesa := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materiais' AND COLUMN_NAME = 'tipoDespesaId');
SET @sql_add_tipo_despesa := IF(@exist_col_tipo_despesa = 0, 'ALTER TABLE `materiais` ADD COLUMN `tipoDespesaId` INTEGER NULL', 'SELECT 1');
PREPARE stmt FROM @sql_add_tipo_despesa;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_col_obra := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materiais' AND COLUMN_NAME = 'obraId');
SET @sql_add_obra := IF(@exist_col_obra = 0, 'ALTER TABLE `materiais` ADD COLUMN `obraId` INTEGER NULL', 'SELECT 1');
PREPARE stmt FROM @sql_add_obra;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Indexes and foreign keys
SET @exist_idx_tipo_despesa := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materiais' AND INDEX_NAME = 'materiais_tipoDespesaId_idx');
SET @sql_add_idx_tipo_despesa := IF(@exist_idx_tipo_despesa = 0, 'CREATE INDEX `materiais_tipoDespesaId_idx` ON `materiais`(`tipoDespesaId`)', 'SELECT 1');
PREPARE stmt FROM @sql_add_idx_tipo_despesa;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_idx_obra := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materiais' AND INDEX_NAME = 'materiais_obraId_idx');
SET @sql_add_idx_obra := IF(@exist_idx_obra = 0, 'CREATE INDEX `materiais_obraId_idx` ON `materiais`(`obraId`)', 'SELECT 1');
PREPARE stmt FROM @sql_add_idx_obra;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign keys
ALTER TABLE `materiais` DROP FOREIGN KEY IF EXISTS `materiais_tipoDespesaId_fkey`;
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_tipoDespesaId_fkey` FOREIGN KEY (`tipoDespesaId`) REFERENCES `tipos_despesas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `materiais` DROP FOREIGN KEY IF EXISTS `materiais_obraId_fkey`;
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `obras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable listas_compras: update enum
ALTER TABLE `listas_compras` MODIFY `tipo` ENUM('SUPERMERCADO', 'DESPESAS_EXTRAS', 'MATERIAL', 'EPI', 'EQUIPAMENTO') NOT NULL;
UPDATE `listas_compras` SET `tipo` = 'DESPESAS_EXTRAS' WHERE `tipo` = 'SUPERMERCADO';
ALTER TABLE `listas_compras` MODIFY `tipo` ENUM('DESPESAS_EXTRAS', 'MATERIAL', 'EPI', 'EQUIPAMENTO') NOT NULL;

-- Seed default initial tipos_despesas
INSERT IGNORE INTO `tipos_despesas` (`nome`, `descricao`, `requerObra`, `ativo`, `ordem`) VALUES
('Copa e Limpeza / Supermercado', 'Itens de consumo contínuo para copa, cozinha e limpeza da empresa', false, true, 1),
('Alimentação em Obra', 'Despesas com refeições, lanches e água na execução da obra', true, true, 2),
('Transporte e Combustível', 'Despesas extras com combustível, pedágios e estacionamentos para obras', true, true, 3),
('Hospedagem e Diárias', 'Hospedagem e diárias para equipes deslocadas', true, true, 4);

-- Link existing despesas_extras to default type
UPDATE `materiais`
SET `tipoDespesaId` = (SELECT `id` FROM `tipos_despesas` WHERE `nome` = 'Copa e Limpeza / Supermercado' LIMIT 1)
WHERE `tipo` = 'DESPESAS_EXTRAS' AND `tipoDespesaId` IS NULL;
