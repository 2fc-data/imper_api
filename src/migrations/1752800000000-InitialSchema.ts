import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1752800000000 implements MigrationInterface {
  name = 'InitialSchema1752800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','diretor_comercial','gerente_comercial','executivo_contas','sdr','pos_vendas') NOT NULL,
        phone VARCHAR(20) NULL,
        isActive TINYINT(1) NOT NULL DEFAULT 1,
        lastLoginAt TIMESTAMP NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        companyName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(20) NULL,
        whatsapp VARCHAR(20) NULL,
        status ENUM('novo','qualificado','visita_tecnica','orcamento','negociacao','ganho','perdido') NOT NULL DEFAULT 'novo',
        source ENUM('whatsapp','instagram','google_ads','indicacao','formulario','ligacao','site','outro') NOT NULL,
        estimatedValue DECIMAL(12,2) NULL,
        notes TEXT NULL,
        tags JSON NULL,
        assignedUserId VARCHAR(36) NULL,
        opportunityId VARCHAR(36) NULL,
        lastContactAt TIMESTAMP NULL,
        contactAttempts INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_leads_assigned_user (assignedUserId),
        INDEX idx_leads_last_contact (lastContactAt)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('aberta','em_andamento','ganha','perdida') NOT NULL DEFAULT 'aberta',
        value DECIMAL(12,2) NOT NULL DEFAULT 0,
        discountPercent DECIMAL(5,2) NOT NULL DEFAULT 0,
        finalValue DECIMAL(12,2) NOT NULL DEFAULT 0,
        closedAt TIMESTAMP NULL,
        lossReason TEXT NULL,
        assignedUserId VARCHAR(36) NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        type ENUM('ligacao','reuniao','email','whatsapp','visita_tecnica','proposta','tarefa','nota') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('pendente','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'pendente',
        scheduledAt TIMESTAMP NOT NULL,
        completedAt TIMESTAMP NULL,
        leadId VARCHAR(36) NULL,
        userId VARCHAR(36) NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        number VARCHAR(30) NOT NULL UNIQUE,
        publicToken VARCHAR(64) NULL,
        status ENUM('rascunho','enviada','aprovada','rejeitada','expirada') NOT NULL DEFAULT 'rascunho',
        totalValue DECIMAL(12,2) NOT NULL DEFAULT 0,
        discountPercent DECIMAL(5,2) NOT NULL DEFAULT 0,
        finalValue DECIMAL(12,2) NOT NULL DEFAULT 0,
        scope TEXT NULL,
        terms TEXT NULL,
        validUntil TIMESTAMP NULL,
        sentAt TIMESTAMP NULL,
        signedAt TIMESTAMP NULL,
        signedBy VARCHAR(255) NULL,
        signedDocument VARCHAR(20) NULL,
        signedIp VARCHAR(45) NULL,
        pdfUrl VARCHAR(255) NULL,
        opportunityId VARCHAR(36) NULL,
        createdById VARCHAR(36) NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS proposal_items (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unitPrice DECIMAL(12,2) NOT NULL,
        total DECIMAL(12,2) NOT NULL,
        proposalId VARCHAR(36) NULL,
        INDEX idx_proposal_items_proposal (proposalId)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS integration_logs (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        source VARCHAR(50) NOT NULL,
        rawPayload TEXT NULL,
        processed TINYINT(1) NOT NULL DEFAULT 0,
        leadId VARCHAR(36) NULL,
        errorMessage TEXT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        type ENUM('lead_atribuido','lead_movido','atividade_agendada','atividade_atrasada','proposta_enviada','proposta_assinada','proposta_expirada','lead_sem_interacao','meta_atingida','sistema') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read TINYINT(1) NOT NULL DEFAULT 0,
        userId VARCHAR(36) NULL,
        relatedId VARCHAR(36) NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(20) NULL,
        whatsapp VARCHAR(20) NULL,
        companyName VARCHAR(255) NULL,
        role VARCHAR(255) NULL,
        notes TEXT NULL,
        tags JSON NULL,
        leadId VARCHAR(36) NULL,
        opportunityId VARCHAR(36) NULL,
        assignedUserId VARCHAR(36) NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_contacts_lead (leadId),
        INDEX idx_contacts_opportunity (opportunityId),
        INDEX idx_contacts_assigned_user (assignedUserId)
      )
    `);

    // Foreign keys
    await queryRunner.query(`
      ALTER TABLE leads ADD CONSTRAINT fk_leads_assigned_user
        FOREIGN KEY (assignedUserId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE leads ADD CONSTRAINT fk_leads_opportunity
        FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE opportunities ADD CONSTRAINT fk_opportunities_assigned_user
        FOREIGN KEY (assignedUserId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE activities ADD CONSTRAINT fk_activities_lead
        FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE activities ADD CONSTRAINT fk_activities_user
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE proposals ADD CONSTRAINT fk_proposals_opportunity
        FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE proposals ADD CONSTRAINT fk_proposals_created_by
        FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE proposal_items ADD CONSTRAINT fk_proposal_items_proposal
        FOREIGN KEY (proposalId) REFERENCES proposals(id) ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE integration_logs ADD CONSTRAINT fk_integration_logs_lead
        FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE contacts ADD CONSTRAINT fk_contacts_lead
        FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE contacts ADD CONSTRAINT fk_contacts_opportunity
        FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE contacts ADD CONSTRAINT fk_contacts_assigned_user
        FOREIGN KEY (assignedUserId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS contacts`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
    await queryRunner.query(`DROP TABLE IF EXISTS integration_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS proposal_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS proposals`);
    await queryRunner.query(`DROP TABLE IF EXISTS activities`);
    await queryRunner.query(`DROP TABLE IF EXISTS opportunities`);
    await queryRunner.query(`DROP TABLE IF EXISTS leads`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
