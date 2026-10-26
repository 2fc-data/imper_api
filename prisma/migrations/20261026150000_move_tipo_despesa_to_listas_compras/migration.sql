-- 1. Remove foreign key, index and column tipoDespesaId from materiais
SET @exist_fk_mat := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materiais' AND CONSTRAINT_NAME = 'materiais_tipoDespesaId_fkey');
SET @sql_drop_fk_mat := IF(@exist_fk_mat > 0, 'ALTER TABLE `materiais` DROP FOREIGN KEY `materiais_tipoDespesaId_fkey`', 'SELECT 1');
PREPARE stmt FROM @sql_drop_fk_mat;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_idx_mat_td := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materiais' AND INDEX_NAME = 'materiais_tipoDespesaId_idx');
SET @sql_drop_idx_mat_td := IF(@exist_idx_mat_td > 0, 'ALTER TABLE `materiais` DROP INDEX `materiais_tipoDespesaId_idx`', 'SELECT 1');
PREPARE stmt FROM @sql_drop_idx_mat_td;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_col_tipo_despesa := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materiais' AND COLUMN_NAME = 'tipoDespesaId');
SET @sql_drop_tipo_despesa := IF(@exist_col_tipo_despesa > 0, 'ALTER TABLE `materiais` DROP COLUMN `tipoDespesaId`', 'SELECT 1');
PREPARE stmt FROM @sql_drop_tipo_despesa;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Add column tipoDespesaId to listas_compras
SET @exist_col_lc_tipo_despesa := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'listas_compras' AND COLUMN_NAME = 'tipoDespesaId');
SET @sql_add_lc_tipo_despesa := IF(@exist_col_lc_tipo_despesa = 0, 'ALTER TABLE `listas_compras` ADD COLUMN `tipoDespesaId` INTEGER NULL', 'SELECT 1');
PREPARE stmt FROM @sql_add_lc_tipo_despesa;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add foreign key on listas_compras(tipoDespesaId) references tipos_despesas(id)
SET @exist_fk_lc := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'listas_compras' AND CONSTRAINT_NAME = 'listas_compras_tipoDespesaId_fkey');
SET @sql_add_fk_lc := IF(@exist_fk_lc = 0, 'ALTER TABLE `listas_compras` ADD CONSTRAINT `listas_compras_tipoDespesaId_fkey` FOREIGN KEY (`tipoDespesaId`) REFERENCES `tipos_despesas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @sql_add_fk_lc;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add index on listas_compras(tipoDespesaId)
SET @exist_idx_lc_tipo_despesa := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'listas_compras' AND INDEX_NAME = 'listas_compras_tipoDespesaId_idx');
SET @sql_add_idx_lc_tipo_despesa := IF(@exist_idx_lc_tipo_despesa = 0, 'ALTER TABLE `listas_compras` ADD INDEX `listas_compras_tipoDespesaId_idx`(`tipoDespesaId`)', 'SELECT 1');
PREPARE stmt FROM @sql_add_idx_lc_tipo_despesa;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Drop previous unique index and create new unique index on (tipo, setor, mes, ano, tipoDespesaId)
SET @exist_idx_lc_prev := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'listas_compras' AND INDEX_NAME = 'listas_compras_tipo_setor_mes_ano_key');
SET @sql_drop_idx_lc_prev := IF(@exist_idx_lc_prev > 0, 'ALTER TABLE `listas_compras` DROP INDEX `listas_compras_tipo_setor_mes_ano_key`', 'SELECT 1');
PREPARE stmt FROM @sql_drop_idx_lc_prev;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Link any existing DESPESAS_EXTRAS listas_compras to the default tipoDespesaId if null
UPDATE `listas_compras`
SET `tipoDespesaId` = (SELECT `id` FROM `tipos_despesas` WHERE `nome` = 'Copa e Limpeza / Supermercado' LIMIT 1)
WHERE `tipo` = 'DESPESAS_EXTRAS' AND `tipoDespesaId` IS NULL;

SET @exist_idx_lc_unique := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'listas_compras' AND INDEX_NAME = 'listas_compras_tipo_setor_mes_ano_tipoDespesaId_key');
SET @sql_add_idx_lc_unique := IF(@exist_idx_lc_unique = 0, 'ALTER TABLE `listas_compras` ADD UNIQUE INDEX `listas_compras_tipo_setor_mes_ano_tipoDespesaId_key`(`tipo`, `setor`, `mes`, `ano`, `tipoDespesaId`)', 'SELECT 1');
PREPARE stmt FROM @sql_add_idx_lc_unique;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
