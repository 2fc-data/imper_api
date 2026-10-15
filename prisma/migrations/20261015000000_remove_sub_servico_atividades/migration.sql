-- Remove a tabela sub_servico_atividades (combos de vocabulário por sub-serviço).
-- A feature de combos foi removida; verbos/objetos passam a ser independentes.

-- Drop FKs (Prisma nomeia como <tabela>_<coluna>_fkey)
ALTER TABLE `sub_servico_atividades` DROP FOREIGN KEY `sub_servico_atividades_subServicoId_fkey`;
ALTER TABLE `sub_servico_atividades` DROP FOREIGN KEY `sub_servico_atividades_verboId_fkey`;
ALTER TABLE `sub_servico_atividades` DROP FOREIGN KEY `sub_servico_atividades_objetoId_fkey`;
ALTER TABLE `sub_servico_atividades` DROP FOREIGN KEY `sub_servico_atividades_localId_fkey`;
ALTER TABLE `sub_servico_atividades` DROP FOREIGN KEY `sub_servico_atividades_caracteristicaId_fkey`;

DROP TABLE IF EXISTS `sub_servico_atividades`;
