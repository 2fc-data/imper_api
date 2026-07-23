import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganization1700000000001 implements MigrationInterface {
  name = 'CreateOrganization1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cnpj VARCHAR(20) NULL,
        address JSON NULL,
        phone VARCHAR(20) NULL,
        email VARCHAR(255) NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(36) PRIMARY KEY,
        organizationId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        managerId VARCHAR(36) NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_departments_organization (organizationId),
        INDEX idx_departments_manager (managerId),
        CONSTRAINT fk_departments_organization FOREIGN KEY (organizationId) REFERENCES organizations(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(36) PRIMARY KEY,
        departmentId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        leaderId VARCHAR(36) NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_teams_department (departmentId),
        INDEX idx_teams_leader (leaderId),
        CONSTRAINT fk_teams_department FOREIGN KEY (departmentId) REFERENCES departments(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cost_centers (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        departmentId VARCHAR(36) NULL,
        teamId VARCHAR(36) NULL,
        budget DECIMAL(12,2) NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cost_centers_department (departmentId),
        INDEX idx_cost_centers_team (teamId),
        CONSTRAINT fk_cost_centers_department FOREIGN KEY (departmentId) REFERENCES departments(id),
        CONSTRAINT fk_cost_centers_team FOREIGN KEY (teamId) REFERENCES teams(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS cost_centers');
    await queryRunner.query('DROP TABLE IF EXISTS teams');
    await queryRunner.query('DROP TABLE IF EXISTS departments');
    await queryRunner.query('DROP TABLE IF EXISTS organizations');
  }
}
