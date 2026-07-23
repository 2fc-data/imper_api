import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIAM1700000000002 implements MigrationInterface {
  name = 'CreateIAM1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        isSystem BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        description VARCHAR(255) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id VARCHAR(36) PRIMARY KEY,
        roleId VARCHAR(36) NOT NULL,
        permissionId VARCHAR(36) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_role_permissions_role (roleId),
        INDEX idx_role_permissions_permission (permissionId),
        CONSTRAINT fk_role_permissions_role FOREIGN KEY (roleId) REFERENCES roles(id),
        CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permissionId) REFERENCES permissions(id),
        UNIQUE KEY uq_role_permission (roleId, permissionId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        roleId VARCHAR(36) NOT NULL,
        organizationId VARCHAR(36) NULL,
        departmentId VARCHAR(36) NULL,
        teamId VARCHAR(36) NULL,
        expiresAt TIMESTAMP NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_roles_user (userId),
        INDEX idx_user_roles_role (roleId),
        INDEX idx_user_roles_org (organizationId),
        INDEX idx_user_roles_dept (departmentId),
        INDEX idx_user_roles_team (teamId),
        CONSTRAINT fk_user_roles_role FOREIGN KEY (roleId) REFERENCES roles(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS delegations (
        id VARCHAR(36) PRIMARY KEY,
        delegatorId VARCHAR(36) NOT NULL,
        delegateId VARCHAR(36) NOT NULL,
        roleId VARCHAR(36) NOT NULL,
        startDate TIMESTAMP NOT NULL,
        endDate TIMESTAMP NOT NULL,
        reason TEXT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_delegations_delegator (delegatorId),
        INDEX idx_delegations_delegate (delegateId),
        INDEX idx_delegations_role (roleId),
        CONSTRAINT fk_delegations_role FOREIGN KEY (roleId) REFERENCES roles(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS delegations');
    await queryRunner.query('DROP TABLE IF EXISTS user_roles');
    await queryRunner.query('DROP TABLE IF EXISTS role_permissions');
    await queryRunner.query('DROP TABLE IF EXISTS permissions');
    await queryRunner.query('DROP TABLE IF EXISTS roles');
  }
}
