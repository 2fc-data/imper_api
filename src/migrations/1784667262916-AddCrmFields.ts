import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCrmFields1784667262916 implements MigrationInterface {
    name = 'AddCrmFields1784667262916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`managerId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`servico\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`activities\` ADD \`opportunityId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_users_managerId\` FOREIGN KEY (\`managerId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activities\` ADD CONSTRAINT \`FK_activities_opportunityId\` FOREIGN KEY (\`opportunityId\`) REFERENCES \`opportunities\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activities\` DROP FOREIGN KEY \`FK_activities_opportunityId\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_managerId\``);
        await queryRunner.query(`ALTER TABLE \`activities\` DROP COLUMN \`opportunityId\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`servico\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`managerId\``);
    }
}