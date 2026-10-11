-- Remove o módulo Catálogo de Atividades.
-- 1) ChecklistAtividade passa a ter descricao/ordem próprios (backfill de substep_atividades).
-- 2) Remove FKs/colunas catalogoAtividadeId de orcamento_atividades e obras_atividades.
-- 3) Dropa tabelas recurso_atividades, substep_atividades, catalogo_atividades.
-- Enums do MySQL são inline nas colunas; desaparecem com os drops.

-- 1. Novas colunas (nullable temporariamente para backfill)
ALTER TABLE `checklist_atividade`
  ADD COLUMN `descricao` VARCHAR(300) NULL,
  ADD COLUMN `ordem` INT NULL;

-- Backfill a partir dos sub-steps do catálogo
UPDATE `checklist_atividade` c
  INNER JOIN `substep_atividades` s ON c.`subStepAtividadeId` = s.`id`
SET c.`descricao` = s.`descricao`,
    c.`ordem` = s.`ordem`;

-- Linhas órfãs (se houver): defaults defensivos
UPDATE `checklist_atividade`
SET `descricao` = '' WHERE `descricao` IS NULL;
UPDATE `checklist_atividade`
SET `ordem` = 0 WHERE `ordem` IS NULL;

-- Agora NOT NULL
ALTER TABLE `checklist_atividade`
  MODIFY COLUMN `descricao` VARCHAR(300) NOT NULL,
  MODIFY COLUMN `ordem` INT NOT NULL;

-- Índice por execução+ordem (substitui o antigo por subStep)
CREATE INDEX `checklist_atividade_executucaoAtividadeId_ordem_idx`
  ON `checklist_atividade` (`executucaoAtividadeId`, `ordem`);

-- 2. Drop FK + coluna subStepAtividadeId
ALTER TABLE `checklist_atividade` DROP FOREIGN KEY `checklist_atividade_subStepAtividadeId_fkey`;
ALTER TABLE `checklist_atividade` DROP INDEX `checklist_atividade_subStepAtividadeId_fkey`;
ALTER TABLE `checklist_atividade` DROP COLUMN `subStepAtividadeId`;

-- 3. Drop FKs e colunas catalogoAtividadeId
ALTER TABLE `orcamento_atividades` DROP FOREIGN KEY `orcamento_atividades_catalogoAtividadeId_fkey`;
ALTER TABLE `orcamento_atividades` DROP COLUMN `catalogoAtividadeId`;

ALTER TABLE `obras_atividades` DROP FOREIGN KEY `obras_atividades_catalogoAtividadeId_fkey`;
ALTER TABLE `obras_atividades` DROP COLUMN `catalogoAtividadeId`;

-- 4. Drop tabelas (ordem: dependentes primeiro)
DROP TABLE IF EXISTS `recurso_atividades`;
DROP TABLE IF EXISTS `substep_atividades`;
DROP TABLE IF EXISTS `catalogo_atividades`;
