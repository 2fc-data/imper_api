import { MigrationInterface, QueryRunner } from "typeorm";

export class MapOpportunityStatusValues1784667262917 implements MigrationInterface {
    name = 'MapOpportunityStatusValues1784667262917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Temporarily alter column to VARCHAR to allow new string values
        await queryRunner.query("ALTER TABLE `opportunities` MODIFY COLUMN `status` VARCHAR(50) NOT NULL");

        // Map old enum values to new ones
        // Old: NOVO, QUALIFICADO, VISITA_AGENDADA, PROPOSTA_GERADA, PROPOSTA_ENVIADA, APROVADA, RECUSADA
        // New: ABERTA, EM_ANDAMENTO, GANHA, PERDIDA
        await queryRunner.query(`UPDATE \`opportunities\` SET \`status\` = 'aberta' WHERE \`status\` IN ('novo', 'qualificado')`);
        await queryRunner.query(`UPDATE \`opportunities\` SET \`status\` = 'em_andamento' WHERE \`status\` IN ('visita_agendada', 'proposta_gerada', 'proposta_enviada')`);
        await queryRunner.query(`UPDATE \`opportunities\` SET \`status\` = 'ganha' WHERE \`status\` = 'aprovada'`);
        await queryRunner.query(`UPDATE \`opportunities\` SET \`status\` = 'perdida' WHERE \`status\` = 'recusada'`);

        // Modify the column back to ENUM with new values
        await queryRunner.query("ALTER TABLE `opportunities` MODIFY COLUMN `status` ENUM('aberta','em_andamento','ganha','perdida') NOT NULL DEFAULT 'aberta'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Temporarily alter column to VARCHAR
        await queryRunner.query("ALTER TABLE `opportunities` MODIFY COLUMN `status` VARCHAR(50) NOT NULL");

        // Reverse mapping (approximate)
        await queryRunner.query(`UPDATE \`opportunities\` SET \`status\` = 'novo' WHERE \`status\` = 'aberta'`);
        await queryRunner.query(`UPDATE \`opportunities\` SET \`status\` = 'visita_agendada' WHERE \`status\` = 'em_andamento'`);
        await queryRunner.query(`UPDATE \`opportunities\` SET \`status\` = 'aprovada' WHERE \`status\` = 'ganha'`);
        await queryRunner.query(`UPDATE \`opportunities\` SET \`status\` = 'recusada' WHERE \`status\` = 'perdida'`);

        // Modify column back to old ENUM values
        await queryRunner.query("ALTER TABLE `opportunities` MODIFY COLUMN `status` ENUM('novo','qualificado','visita_agendada','proposta_gerada','proposta_enviada','aprovada','recusada') NOT NULL DEFAULT 'novo'");
    }
}