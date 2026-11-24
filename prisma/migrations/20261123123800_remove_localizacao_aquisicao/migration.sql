-- DropForeignKey
ALTER TABLE `equipamentos` DROP FOREIGN KEY `equipamentos_localizacaoId_fkey`;

-- DropForeignKey
ALTER TABLE `epis` DROP FOREIGN KEY `epis_localizacaoId_fkey`;

-- AlterTable
ALTER TABLE `equipamentos` DROP COLUMN `localizacaoId`,
    DROP COLUMN `dataAquisicao`,
    DROP COLUMN `valorAquisicao`;

-- AlterTable
ALTER TABLE `epis` DROP COLUMN `localizacaoId`;

-- DropTable
DROP TABLE `localizacoes`;
