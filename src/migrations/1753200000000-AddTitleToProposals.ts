import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTitleToProposals1753200000000 implements MigrationInterface {
  name = 'AddTitleToProposals1753200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE proposals 
      ADD COLUMN title VARCHAR(255) NULL AFTER number
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE proposals 
      DROP COLUMN title
    `);
  }
}
