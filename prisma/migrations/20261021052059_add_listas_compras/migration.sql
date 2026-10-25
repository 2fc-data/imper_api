-- CreateTable
CREATE TABLE `listas_compras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('SUPERMERCADO', 'MATERIAL', 'EPI', 'EQUIPAMENTO') NOT NULL,
    `setor` ENUM('LOJA', 'ALMOXARIFADO') NOT NULL,
    `mes` INTEGER NOT NULL,
    `ano` INTEGER NOT NULL,
    `status` ENUM('ABERTA', 'ENVIADA', 'APROVADA', 'RECUSADA', 'COMPRADA') NOT NULL DEFAULT 'ABERTA',
    `motivoRecusa` VARCHAR(255) NULL,
    `enviadoPorId` INTEGER NULL,
    `enviadoEm` DATETIME(3) NULL,
    `aprovadoPorId` INTEGER NULL,
    `aprovadoEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `listas_compras_ano_mes_idx`(`ano`, `mes`),
    UNIQUE INDEX `listas_compras_tipo_setor_mes_ano_key`(`tipo`, `setor`, `mes`, `ano`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listas_compras_itens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `listaId` INTEGER NOT NULL,
    `materialId` INTEGER NULL,
    `epiId` INTEGER NULL,
    `equipamentoId` INTEGER NULL,
    `quantidade` DECIMAL(12, 3) NOT NULL,
    `custoReal` DECIMAL(12, 2) NULL,
    `status` ENUM('PENDENTE', 'RECUSADO', 'COMPRADO') NOT NULL DEFAULT 'PENDENTE',
    `adicionadoPorId` INTEGER NOT NULL,
    `compradoPorId` INTEGER NULL,
    `compradoEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `listas_compras_itens_materialId_idx`(`materialId`),
    INDEX `listas_compras_itens_epiId_idx`(`epiId`),
    INDEX `listas_compras_itens_equipamentoId_idx`(`equipamentoId`),
    UNIQUE INDEX `listas_compras_itens_listaId_materialId_key`(`listaId`, `materialId`),
    UNIQUE INDEX `listas_compras_itens_listaId_epiId_key`(`listaId`, `epiId`),
    UNIQUE INDEX `listas_compras_itens_listaId_equipamentoId_key`(`listaId`, `equipamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `listas_compras` ADD CONSTRAINT `listas_compras_enviadoPorId_fkey` FOREIGN KEY (`enviadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listas_compras` ADD CONSTRAINT `listas_compras_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listas_compras_itens` ADD CONSTRAINT `listas_compras_itens_listaId_fkey` FOREIGN KEY (`listaId`) REFERENCES `listas_compras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listas_compras_itens` ADD CONSTRAINT `listas_compras_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listas_compras_itens` ADD CONSTRAINT `listas_compras_itens_epiId_fkey` FOREIGN KEY (`epiId`) REFERENCES `epis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listas_compras_itens` ADD CONSTRAINT `listas_compras_itens_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listas_compras_itens` ADD CONSTRAINT `listas_compras_itens_adicionadoPorId_fkey` FOREIGN KEY (`adicionadoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listas_compras_itens` ADD CONSTRAINT `listas_compras_itens_compradoPorId_fkey` FOREIGN KEY (`compradoPorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
