-- Permite várias listas de compra (rodadas) para o mesmo tipo/setor/mês/ano/tipoDespesaId
-- 1. Remove o índice único (mantém os dados; nenhuma deduplicação é necessária)
SET @exist_idx_lc_unique := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'listas_compras' AND INDEX_NAME = 'listas_compras_tipo_setor_mes_ano_tipoDespesaId_key');
SET @sql_drop_idx_lc_unique := IF(@exist_idx_lc_unique > 0, 'ALTER TABLE `listas_compras` DROP INDEX `listas_compras_tipo_setor_mes_ano_tipoDespesaId_key`', 'SELECT 1');
PREPARE stmt FROM @sql_drop_idx_lc_unique;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Cria índice não único para as consultas por chave
SET @exist_idx_lc_plain := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'listas_compras' AND INDEX_NAME = 'listas_compras_tipo_setor_mes_ano_tipoDespesaId_idx');
SET @sql_add_idx_lc_plain := IF(@exist_idx_lc_plain = 0, 'ALTER TABLE `listas_compras` ADD INDEX `listas_compras_tipo_setor_mes_ano_tipoDespesaId_idx`(`tipo`, `setor`, `mes`, `ano`, `tipoDespesaId`)', 'SELECT 1');
PREPARE stmt FROM @sql_add_idx_lc_plain;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
