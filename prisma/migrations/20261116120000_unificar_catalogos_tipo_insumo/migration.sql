-- Unifica os catalogos de insumos em torno de TipoInsumo.
-- Estrategia "duplicar e repontar": cada catalogo compartilhado entre tipos
-- duplica suas linhas para os tipos extras, as FKs dos insumos sao
-- repontadas e a linha original permanece com o tipo de maior precedencia.
-- Tudo em uma unica transacao atomica.

-- ---------------------------------------------------------------------------
-- 1. Soltar as FKs dos insumos para poder repontar categorias/subcategorias
-- ---------------------------------------------------------------------------
ALTER TABLE `equipamentos` DROP FOREIGN KEY `equipamentos_categoriaId_fkey`;
ALTER TABLE `equipamentos` DROP FOREIGN KEY `equipamentos_subcategoriaId_fkey`;
ALTER TABLE `epis` DROP FOREIGN KEY `epis_categoriaId_fkey`;
ALTER TABLE `epis` DROP FOREIGN KEY `epis_subcategoriaId_fkey`;
ALTER TABLE `materiais` DROP FOREIGN KEY `materiais_categoriaId_fkey`;

-- ---------------------------------------------------------------------------
-- 2. Uniques globais que passam a ser compostos por tipo
-- ---------------------------------------------------------------------------
DROP INDEX `fornecedores_cnpj_key` ON `fornecedores`;
DROP INDEX `tipos_despesas_nome_key` ON `tipos_despesas`;
DROP INDEX `unidade_medida_nome_key` ON `unidade_medida`;

-- ---------------------------------------------------------------------------
-- 3. Novas tabelas de categoria/subcategoria
-- ---------------------------------------------------------------------------
CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `migracao_origem_tabela` VARCHAR(40) NULL,
    `migracao_origem_id` INTEGER NULL,

    INDEX `categorias_tipoInsumo_nome_idx`(`tipoInsumo`, `nome`),
    INDEX `categorias_migracao_idx`(`migracao_origem_tabela`, `migracao_origem_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `subcategorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoriaId` INTEGER NOT NULL,
    `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `migracao_origem_tabela` VARCHAR(40) NULL,
    `migracao_origem_id` INTEGER NULL,

    INDEX `subcategorias_categoriaId_idx`(`categoriaId`),
    INDEX `subcategorias_tipoInsumo_nome_idx`(`tipoInsumo`, `nome`),
    INDEX `subcategorias_migracao_idx`(`migracao_origem_tabela`, `migracao_origem_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `categorias` (`tipoInsumo`, `nome`, `descricao`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_tabela`, `migracao_origem_id`)
SELECT 'EQUIPAMENTO', `nome`, `descricao`, `ativo`, `ordem`, `createdAt`, `updatedAt`, 'categorias_equipamentos', `id` FROM `categorias_equipamentos`;

INSERT INTO `categorias` (`tipoInsumo`, `nome`, `descricao`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_tabela`, `migracao_origem_id`)
SELECT 'EPI', `nome`, `descricao`, `ativo`, `ordem`, `createdAt`, `updatedAt`, 'categorias_epis', `id` FROM `categorias_epis`;

INSERT INTO `categorias` (`tipoInsumo`, `nome`, `descricao`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_tabela`, `migracao_origem_id`)
SELECT 'MATERIAL', `nome`, `descricao`, `ativo`, `ordem`, `createdAt`, `updatedAt`, 'categorias_materiais', `id` FROM `categorias_materiais`;

INSERT INTO `subcategorias` (`categoriaId`, `tipoInsumo`, `nome`, `descricao`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_tabela`, `migracao_origem_id`)
SELECT c.`id`, 'EQUIPAMENTO', s.`nome`, s.`descricao`, s.`ativo`, s.`ordem`, s.`createdAt`, s.`updatedAt`, 'subcategorias_equipamentos', s.`id`
FROM `subcategorias_equipamentos` s
JOIN `categorias` c ON c.`migracao_origem_tabela` = 'categorias_equipamentos' AND c.`migracao_origem_id` = s.`categoriaId`;

INSERT INTO `subcategorias` (`categoriaId`, `tipoInsumo`, `nome`, `descricao`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_tabela`, `migracao_origem_id`)
SELECT c.`id`, 'EPI', s.`nome`, s.`descricao`, s.`ativo`, s.`ordem`, s.`createdAt`, s.`updatedAt`, 'subcategorias_epis', s.`id`
FROM `subcategorias_epis` s
JOIN `categorias` c ON c.`migracao_origem_tabela` = 'categorias_epis' AND c.`migracao_origem_id` = s.`categoriaId`;

INSERT INTO `subcategorias` (`categoriaId`, `tipoInsumo`, `nome`, `descricao`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_tabela`, `migracao_origem_id`)
SELECT c.`id`, 'MATERIAL', s.`nome`, s.`descricao`, s.`ativo`, s.`ordem`, s.`createdAt`, s.`updatedAt`, 'subcategorias_materiais', s.`id`
FROM `subcategorias_materiais` s
JOIN `categorias` c ON c.`migracao_origem_tabela` = 'categorias_materiais' AND c.`migracao_origem_id` = s.`categoriaId`;

-- ---------------------------------------------------------------------------
-- 4. Repontar categorias/subcategorias dos insumos
-- ---------------------------------------------------------------------------
UPDATE `equipamentos` e
JOIN `categorias` c ON c.`migracao_origem_tabela` = 'categorias_equipamentos' AND c.`migracao_origem_id` = e.`categoriaId`
SET e.`categoriaId` = c.`id`
WHERE e.`categoriaId` IS NOT NULL;

UPDATE `equipamentos` e
JOIN `subcategorias` s ON s.`migracao_origem_tabela` = 'subcategorias_equipamentos' AND s.`migracao_origem_id` = e.`subcategoriaId`
SET e.`subcategoriaId` = s.`id`
WHERE e.`subcategoriaId` IS NOT NULL;

UPDATE `epis` e
JOIN `categorias` c ON c.`migracao_origem_tabela` = 'categorias_epis' AND c.`migracao_origem_id` = e.`categoriaId`
SET e.`categoriaId` = c.`id`
WHERE e.`categoriaId` IS NOT NULL;

UPDATE `epis` e
JOIN `subcategorias` s ON s.`migracao_origem_tabela` = 'subcategorias_epis' AND s.`migracao_origem_id` = e.`subcategoriaId`
SET e.`subcategoriaId` = s.`id`
WHERE e.`subcategoriaId` IS NOT NULL;

UPDATE `materiais` m
JOIN `categorias` c ON c.`migracao_origem_tabela` = 'categorias_materiais' AND c.`migracao_origem_id` = m.`categoriaId`
SET m.`categoriaId` = c.`id`
WHERE m.`categoriaId` IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 5. Remover tabelas antigas e colunas de migracao; recriar FKs
-- ---------------------------------------------------------------------------
DROP TABLE `subcategorias_materiais`;
DROP TABLE `subcategorias_equipamentos`;
DROP TABLE `subcategorias_epis`;
DROP TABLE `categorias_materiais`;
DROP TABLE `categorias_equipamentos`;
DROP TABLE `categorias_epis`;

ALTER TABLE `categorias`
    DROP INDEX `categorias_migracao_idx`,
    DROP COLUMN `migracao_origem_tabela`,
    DROP COLUMN `migracao_origem_id`;

ALTER TABLE `subcategorias`
    DROP INDEX `subcategorias_migracao_idx`,
    DROP COLUMN `migracao_origem_tabela`,
    DROP COLUMN `migracao_origem_id`;

ALTER TABLE `subcategorias` ADD CONSTRAINT `subcategorias_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_subcategoriaId_fkey` FOREIGN KEY (`subcategoriaId`) REFERENCES `subcategorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `epis` ADD CONSTRAINT `epis_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `epis` ADD CONSTRAINT `epis_subcategoriaId_fkey` FOREIGN KEY (`subcategoriaId`) REFERENCES `subcategorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 6. Colunas tipoInsumo nos catalogos restantes
-- ---------------------------------------------------------------------------
ALTER TABLE `marcas` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;
ALTER TABLE `cores` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;
ALTER TABLE `fornecedores` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;
ALTER TABLE `localizacoes` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;
ALTER TABLE `unidade_medida` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;
ALTER TABLE `tipos_manutencao` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;
ALTER TABLE `status_equipamentos` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;
ALTER TABLE `estados_conservacao` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;
ALTER TABLE `tamanhos_equipamentos` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;
ALTER TABLE `tipos_despesas` ADD COLUMN `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NULL;

ALTER TABLE `marcas` ADD COLUMN `migracao_origem_id` INTEGER NULL;
ALTER TABLE `cores` ADD COLUMN `migracao_origem_id` INTEGER NULL;
ALTER TABLE `fornecedores` ADD COLUMN `migracao_origem_id` INTEGER NULL;
ALTER TABLE `localizacoes` ADD COLUMN `migracao_origem_id` INTEGER NULL;
ALTER TABLE `unidade_medida` ADD COLUMN `migracao_origem_id` INTEGER NULL;
ALTER TABLE `tipos_manutencao` ADD COLUMN `migracao_origem_id` INTEGER NULL;

UPDATE `marcas` SET `migracao_origem_id` = `id`;
UPDATE `cores` SET `migracao_origem_id` = `id`;
UPDATE `fornecedores` SET `migracao_origem_id` = `id`;
UPDATE `localizacoes` SET `migracao_origem_id` = `id`;
UPDATE `unidade_medida` SET `migracao_origem_id` = `id`;
UPDATE `tipos_manutencao` SET `migracao_origem_id` = `id`;

-- Tipo da linha original = tipo de maior precedencia que a referencia
UPDATE `marcas` m SET m.`tipoInsumo` = CASE
    WHEN EXISTS (SELECT 1 FROM `equipamentos` WHERE `marcaId` = m.`id`) THEN 'EQUIPAMENTO'
    WHEN EXISTS (SELECT 1 FROM `epis` WHERE `marcaId` = m.`id`) THEN 'EPI'
    WHEN EXISTS (SELECT 1 FROM `materiais` WHERE `marcaId` = m.`id`) THEN 'MATERIAL'
    WHEN EXISTS (SELECT 1 FROM `veiculos` WHERE `marcaId` = m.`id` OR `fabricanteId` = m.`id`) THEN 'VEICULO'
    ELSE 'EQUIPAMENTO' END;

UPDATE `cores` c SET c.`tipoInsumo` = CASE
    WHEN EXISTS (SELECT 1 FROM `epis` WHERE `corId` = c.`id`) THEN 'EPI'
    WHEN EXISTS (SELECT 1 FROM `materiais` WHERE `corId` = c.`id`) THEN 'MATERIAL'
    WHEN EXISTS (SELECT 1 FROM `veiculos` WHERE `corId` = c.`id`) THEN 'VEICULO'
    ELSE 'EPI' END;

UPDATE `fornecedores` f SET f.`tipoInsumo` = CASE
    WHEN EXISTS (SELECT 1 FROM `equipamentos` WHERE `fornecedorId` = f.`id`) THEN 'EQUIPAMENTO'
    WHEN EXISTS (SELECT 1 FROM `epis` WHERE `fornecedorId` = f.`id`) THEN 'EPI'
    WHEN EXISTS (SELECT 1 FROM `materiais` WHERE `fornecedorId` = f.`id`) THEN 'MATERIAL'
    WHEN EXISTS (SELECT 1 FROM `abastecimentos_veiculo` WHERE `fornecedorId` = f.`id`) THEN 'VEICULO'
    ELSE 'EQUIPAMENTO' END;

UPDATE `localizacoes` l SET l.`tipoInsumo` = CASE
    WHEN EXISTS (SELECT 1 FROM `equipamentos` WHERE `localizacaoId` = l.`id`) THEN 'EQUIPAMENTO'
    WHEN EXISTS (SELECT 1 FROM `epis` WHERE `localizacaoId` = l.`id`) THEN 'EPI'
    ELSE 'EQUIPAMENTO' END;

UPDATE `unidade_medida` u SET u.`tipoInsumo` = CASE
    WHEN EXISTS (SELECT 1 FROM `equipamentos` WHERE `unidadeMedidaId` = u.`id`) THEN 'EQUIPAMENTO'
    WHEN EXISTS (SELECT 1 FROM `epis` WHERE `unidadeMedidaId` = u.`id`) THEN 'EPI'
    WHEN EXISTS (SELECT 1 FROM `materiais` WHERE `unidadeId` = u.`id`) THEN 'MATERIAL'
    WHEN EXISTS (SELECT 1 FROM `servico_itens` WHERE `unidadeId` = u.`id`)
      OR EXISTS (SELECT 1 FROM `visita_itens` WHERE `unidadeId` = u.`id`)
      OR EXISTS (SELECT 1 FROM `aditivo_obra_itens` WHERE `unidadeId` = u.`id`) THEN 'SERVICO'
    ELSE 'EQUIPAMENTO' END;

UPDATE `tipos_manutencao` t SET t.`tipoInsumo` = CASE
    WHEN EXISTS (SELECT 1 FROM `manutencoes` WHERE `tipoId` = t.`id`) THEN 'EQUIPAMENTO'
    WHEN EXISTS (SELECT 1 FROM `manutencoes_veiculo` WHERE `tipoId` = t.`id`) THEN 'VEICULO'
    ELSE 'EQUIPAMENTO' END;

UPDATE `status_equipamentos` SET `tipoInsumo` = 'EQUIPAMENTO';
UPDATE `estados_conservacao` SET `tipoInsumo` = 'EQUIPAMENTO';
UPDATE `tamanhos_equipamentos` SET `tipoInsumo` = 'EPI';
UPDATE `tipos_despesas` SET `tipoInsumo` = 'DESPESAS_EXTRAS';

-- ---------------------------------------------------------------------------
-- 7. Duplicar catalogos compartilhados para os tipos extras usados
-- ---------------------------------------------------------------------------
INSERT INTO `marcas` (`nome`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT m.`nome`, 'EPI', m.`ativo`, m.`ordem`, m.`createdAt`, m.`updatedAt`, m.`id`
FROM `marcas` m
WHERE m.`migracao_origem_id` = m.`id` AND m.`tipoInsumo` <> 'EPI'
  AND EXISTS (SELECT 1 FROM `epis` WHERE `marcaId` = m.`id`);

INSERT INTO `marcas` (`nome`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT m.`nome`, 'MATERIAL', m.`ativo`, m.`ordem`, m.`createdAt`, m.`updatedAt`, m.`id`
FROM `marcas` m
WHERE m.`migracao_origem_id` = m.`id` AND m.`tipoInsumo` <> 'MATERIAL'
  AND EXISTS (SELECT 1 FROM `materiais` WHERE `marcaId` = m.`id`);

INSERT INTO `marcas` (`nome`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT m.`nome`, 'VEICULO', m.`ativo`, m.`ordem`, m.`createdAt`, m.`updatedAt`, m.`id`
FROM `marcas` m
WHERE m.`migracao_origem_id` = m.`id` AND m.`tipoInsumo` <> 'VEICULO'
  AND EXISTS (SELECT 1 FROM `veiculos` WHERE `marcaId` = m.`id` OR `fabricanteId` = m.`id`);

INSERT INTO `cores` (`nome`, `codigoHex`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT c.`nome`, c.`codigoHex`, 'MATERIAL', c.`ativo`, c.`ordem`, c.`createdAt`, c.`updatedAt`, c.`id`
FROM `cores` c
WHERE c.`migracao_origem_id` = c.`id` AND c.`tipoInsumo` <> 'MATERIAL'
  AND EXISTS (SELECT 1 FROM `materiais` WHERE `corId` = c.`id`);

INSERT INTO `cores` (`nome`, `codigoHex`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT c.`nome`, c.`codigoHex`, 'VEICULO', c.`ativo`, c.`ordem`, c.`createdAt`, c.`updatedAt`, c.`id`
FROM `cores` c
WHERE c.`migracao_origem_id` = c.`id` AND c.`tipoInsumo` <> 'VEICULO'
  AND EXISTS (SELECT 1 FROM `veiculos` WHERE `corId` = c.`id`);

INSERT INTO `fornecedores` (`nome`, `cnpj`, `telefone`, `email`, `tipoInsumo`, `ativo`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT f.`nome`, f.`cnpj`, f.`telefone`, f.`email`, 'EPI', f.`ativo`, f.`createdAt`, f.`updatedAt`, f.`id`
FROM `fornecedores` f
WHERE f.`migracao_origem_id` = f.`id` AND f.`tipoInsumo` <> 'EPI'
  AND EXISTS (SELECT 1 FROM `epis` WHERE `fornecedorId` = f.`id`);

INSERT INTO `fornecedores` (`nome`, `cnpj`, `telefone`, `email`, `tipoInsumo`, `ativo`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT f.`nome`, f.`cnpj`, f.`telefone`, f.`email`, 'MATERIAL', f.`ativo`, f.`createdAt`, f.`updatedAt`, f.`id`
FROM `fornecedores` f
WHERE f.`migracao_origem_id` = f.`id` AND f.`tipoInsumo` <> 'MATERIAL'
  AND EXISTS (SELECT 1 FROM `materiais` WHERE `fornecedorId` = f.`id`);

INSERT INTO `fornecedores` (`nome`, `cnpj`, `telefone`, `email`, `tipoInsumo`, `ativo`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT f.`nome`, f.`cnpj`, f.`telefone`, f.`email`, 'VEICULO', f.`ativo`, f.`createdAt`, f.`updatedAt`, f.`id`
FROM `fornecedores` f
WHERE f.`migracao_origem_id` = f.`id` AND f.`tipoInsumo` <> 'VEICULO'
  AND EXISTS (SELECT 1 FROM `abastecimentos_veiculo` WHERE `fornecedorId` = f.`id`);

INSERT INTO `localizacoes` (`nome`, `descricao`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT l.`nome`, l.`descricao`, 'EPI', l.`ativo`, l.`ordem`, l.`createdAt`, l.`updatedAt`, l.`id`
FROM `localizacoes` l
WHERE l.`migracao_origem_id` = l.`id` AND l.`tipoInsumo` <> 'EPI'
  AND EXISTS (SELECT 1 FROM `epis` WHERE `localizacaoId` = l.`id`);

INSERT INTO `unidade_medida` (`nome`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT u.`nome`, 'EPI', u.`ativo`, u.`ordem`, u.`createdAt`, u.`updatedAt`, u.`id`
FROM `unidade_medida` u
WHERE u.`migracao_origem_id` = u.`id` AND u.`tipoInsumo` <> 'EPI'
  AND EXISTS (SELECT 1 FROM `epis` WHERE `unidadeMedidaId` = u.`id`);

INSERT INTO `unidade_medida` (`nome`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT u.`nome`, 'MATERIAL', u.`ativo`, u.`ordem`, u.`createdAt`, u.`updatedAt`, u.`id`
FROM `unidade_medida` u
WHERE u.`migracao_origem_id` = u.`id` AND u.`tipoInsumo` <> 'MATERIAL'
  AND EXISTS (SELECT 1 FROM `materiais` WHERE `unidadeId` = u.`id`);

INSERT INTO `unidade_medida` (`nome`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT u.`nome`, 'SERVICO', u.`ativo`, u.`ordem`, u.`createdAt`, u.`updatedAt`, u.`id`
FROM `unidade_medida` u
WHERE u.`migracao_origem_id` = u.`id` AND u.`tipoInsumo` <> 'SERVICO'
  AND (EXISTS (SELECT 1 FROM `servico_itens` WHERE `unidadeId` = u.`id`)
    OR EXISTS (SELECT 1 FROM `visita_itens` WHERE `unidadeId` = u.`id`)
    OR EXISTS (SELECT 1 FROM `aditivo_obra_itens` WHERE `unidadeId` = u.`id`));

INSERT INTO `tipos_manutencao` (`nome`, `tipoInsumo`, `ativo`, `ordem`, `createdAt`, `updatedAt`, `migracao_origem_id`)
SELECT t.`nome`, 'VEICULO', t.`ativo`, t.`ordem`, t.`createdAt`, t.`updatedAt`, t.`id`
FROM `tipos_manutencao` t
WHERE t.`migracao_origem_id` = t.`id` AND t.`tipoInsumo` <> 'VEICULO'
  AND EXISTS (SELECT 1 FROM `manutencoes_veiculo` WHERE `tipoId` = t.`id`);

-- ---------------------------------------------------------------------------
-- 8. Repontar os insumos para a linha do tipo correto
-- ---------------------------------------------------------------------------
UPDATE `equipamentos` e JOIN `marcas` m ON m.`migracao_origem_id` = e.`marcaId` AND m.`tipoInsumo` = 'EQUIPAMENTO' SET e.`marcaId` = m.`id` WHERE e.`marcaId` IS NOT NULL;
UPDATE `epis` e JOIN `marcas` m ON m.`migracao_origem_id` = e.`marcaId` AND m.`tipoInsumo` = 'EPI' SET e.`marcaId` = m.`id` WHERE e.`marcaId` IS NOT NULL;
UPDATE `materiais` e JOIN `marcas` m ON m.`migracao_origem_id` = e.`marcaId` AND m.`tipoInsumo` = 'MATERIAL' SET e.`marcaId` = m.`id` WHERE e.`marcaId` IS NOT NULL;
UPDATE `veiculos` e JOIN `marcas` m ON m.`migracao_origem_id` = e.`marcaId` AND m.`tipoInsumo` = 'VEICULO' SET e.`marcaId` = m.`id` WHERE e.`marcaId` IS NOT NULL;
UPDATE `veiculos` e JOIN `marcas` m ON m.`migracao_origem_id` = e.`fabricanteId` AND m.`tipoInsumo` = 'VEICULO' SET e.`fabricanteId` = m.`id` WHERE e.`fabricanteId` IS NOT NULL;

UPDATE `epis` e JOIN `cores` c ON c.`migracao_origem_id` = e.`corId` AND c.`tipoInsumo` = 'EPI' SET e.`corId` = c.`id` WHERE e.`corId` IS NOT NULL;
UPDATE `materiais` e JOIN `cores` c ON c.`migracao_origem_id` = e.`corId` AND c.`tipoInsumo` = 'MATERIAL' SET e.`corId` = c.`id` WHERE e.`corId` IS NOT NULL;
UPDATE `veiculos` e JOIN `cores` c ON c.`migracao_origem_id` = e.`corId` AND c.`tipoInsumo` = 'VEICULO' SET e.`corId` = c.`id` WHERE e.`corId` IS NOT NULL;

UPDATE `equipamentos` e JOIN `fornecedores` f ON f.`migracao_origem_id` = e.`fornecedorId` AND f.`tipoInsumo` = 'EQUIPAMENTO' SET e.`fornecedorId` = f.`id` WHERE e.`fornecedorId` IS NOT NULL;
UPDATE `epis` e JOIN `fornecedores` f ON f.`migracao_origem_id` = e.`fornecedorId` AND f.`tipoInsumo` = 'EPI' SET e.`fornecedorId` = f.`id` WHERE e.`fornecedorId` IS NOT NULL;
UPDATE `materiais` e JOIN `fornecedores` f ON f.`migracao_origem_id` = e.`fornecedorId` AND f.`tipoInsumo` = 'MATERIAL' SET e.`fornecedorId` = f.`id` WHERE e.`fornecedorId` IS NOT NULL;
UPDATE `abastecimentos_veiculo` e JOIN `fornecedores` f ON f.`migracao_origem_id` = e.`fornecedorId` AND f.`tipoInsumo` = 'VEICULO' SET e.`fornecedorId` = f.`id` WHERE e.`fornecedorId` IS NOT NULL;

UPDATE `equipamentos` e JOIN `localizacoes` l ON l.`migracao_origem_id` = e.`localizacaoId` AND l.`tipoInsumo` = 'EQUIPAMENTO' SET e.`localizacaoId` = l.`id` WHERE e.`localizacaoId` IS NOT NULL;
UPDATE `epis` e JOIN `localizacoes` l ON l.`migracao_origem_id` = e.`localizacaoId` AND l.`tipoInsumo` = 'EPI' SET e.`localizacaoId` = l.`id` WHERE e.`localizacaoId` IS NOT NULL;

UPDATE `equipamentos` e JOIN `unidade_medida` u ON u.`migracao_origem_id` = e.`unidadeMedidaId` AND u.`tipoInsumo` = 'EQUIPAMENTO' SET e.`unidadeMedidaId` = u.`id` WHERE e.`unidadeMedidaId` IS NOT NULL;
UPDATE `epis` e JOIN `unidade_medida` u ON u.`migracao_origem_id` = e.`unidadeMedidaId` AND u.`tipoInsumo` = 'EPI' SET e.`unidadeMedidaId` = u.`id` WHERE e.`unidadeMedidaId` IS NOT NULL;
UPDATE `materiais` e JOIN `unidade_medida` u ON u.`migracao_origem_id` = e.`unidadeId` AND u.`tipoInsumo` = 'MATERIAL' SET e.`unidadeId` = u.`id` WHERE e.`unidadeId` IS NOT NULL;
UPDATE `servico_itens` e JOIN `unidade_medida` u ON u.`migracao_origem_id` = e.`unidadeId` AND u.`tipoInsumo` = 'SERVICO' SET e.`unidadeId` = u.`id` WHERE e.`unidadeId` IS NOT NULL;
UPDATE `visita_itens` e JOIN `unidade_medida` u ON u.`migracao_origem_id` = e.`unidadeId` AND u.`tipoInsumo` = 'SERVICO' SET e.`unidadeId` = u.`id` WHERE e.`unidadeId` IS NOT NULL;
UPDATE `aditivo_obra_itens` e JOIN `unidade_medida` u ON u.`migracao_origem_id` = e.`unidadeId` AND u.`tipoInsumo` = 'SERVICO' SET e.`unidadeId` = u.`id` WHERE e.`unidadeId` IS NOT NULL;

UPDATE `manutencoes` e JOIN `tipos_manutencao` t ON t.`migracao_origem_id` = e.`tipoId` AND t.`tipoInsumo` = 'EQUIPAMENTO' SET e.`tipoId` = t.`id`;
UPDATE `manutencoes_veiculo` e JOIN `tipos_manutencao` t ON t.`migracao_origem_id` = e.`tipoId` AND t.`tipoInsumo` = 'VEICULO' SET e.`tipoId` = t.`id`;

-- ---------------------------------------------------------------------------
-- 9. Fechar schema: remover colunas temporarias, NOT NULL e indices
-- ---------------------------------------------------------------------------
ALTER TABLE `marcas` DROP COLUMN `migracao_origem_id`;
ALTER TABLE `cores` DROP COLUMN `migracao_origem_id`;
ALTER TABLE `fornecedores` DROP COLUMN `migracao_origem_id`;
ALTER TABLE `localizacoes` DROP COLUMN `migracao_origem_id`;
ALTER TABLE `unidade_medida` DROP COLUMN `migracao_origem_id`;
ALTER TABLE `tipos_manutencao` DROP COLUMN `migracao_origem_id`;

ALTER TABLE `marcas` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL;
ALTER TABLE `cores` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL;
ALTER TABLE `fornecedores` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL;
ALTER TABLE `localizacoes` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL;
ALTER TABLE `unidade_medida` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL;
ALTER TABLE `status_equipamentos` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL DEFAULT 'EQUIPAMENTO';
ALTER TABLE `estados_conservacao` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL DEFAULT 'EQUIPAMENTO';
ALTER TABLE `tipos_manutencao` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL DEFAULT 'EQUIPAMENTO';
ALTER TABLE `tamanhos_equipamentos` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL DEFAULT 'EPI';
ALTER TABLE `tipos_despesas` MODIFY `tipoInsumo` ENUM('EQUIPAMENTO', 'EPI', 'MATERIAL', 'DESPESAS_EXTRAS', 'VEICULO', 'SERVICO') NOT NULL DEFAULT 'DESPESAS_EXTRAS';

CREATE UNIQUE INDEX `fornecedores_cnpj_tipoInsumo_key` ON `fornecedores`(`cnpj`, `tipoInsumo`);
CREATE UNIQUE INDEX `tipos_despesas_nome_tipoInsumo_key` ON `tipos_despesas`(`nome`, `tipoInsumo`);
CREATE UNIQUE INDEX `unidade_medida_nome_tipoInsumo_key` ON `unidade_medida`(`nome`, `tipoInsumo`);
