import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConfiguration1700000000003 implements MigrationInterface {
  name = 'CreateConfiguration1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS config_categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS config_keys (
        id VARCHAR(36) PRIMARY KEY,
        categoryId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        defaultValue TEXT NULL,
        description TEXT NULL,
        isEncrypted BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_config_keys_category (categoryId),
        CONSTRAINT fk_config_keys_category FOREIGN KEY (categoryId) REFERENCES config_categories(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS config_values (
        id VARCHAR(36) PRIMARY KEY,
        configKeyId VARCHAR(36) NOT NULL,
        organizationId VARCHAR(36) NULL,
        departmentId VARCHAR(36) NULL,
        userId VARCHAR(36) NULL,
        value TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_config_values_key (configKeyId),
        INDEX idx_config_values_org (organizationId),
        INDEX idx_config_values_dept (departmentId),
        INDEX idx_config_values_user (userId),
        CONSTRAINT fk_config_values_key FOREIGN KEY (configKeyId) REFERENCES config_keys(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS config_values');
    await queryRunner.query('DROP TABLE IF EXISTS config_keys');
    await queryRunner.query('DROP TABLE IF EXISTS config_categories');
  }
}
