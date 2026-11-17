-- Campos de fornecedor, valor unitario e data da compra no item da lista.
-- O valor total e calculado na aplicacao (valorUnitario * quantidade).

ALTER TABLE `listas_compras_itens`
    ADD COLUMN `valorUnitario` DECIMAL(12, 2) NULL,
    ADD COLUMN `fornecedorId` INTEGER NULL,
    ADD COLUMN `dataCompra` DATETIME(3) NULL;

CREATE INDEX `listas_compras_itens_fornecedorId_idx` ON `listas_compras_itens`(`fornecedorId`);

ALTER TABLE `listas_compras_itens`
    ADD CONSTRAINT `listas_compras_itens_fornecedorId_fkey`
    FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
