-- RG opcional no cadastro de usuários (varchar livre, sem validação de dígito)
ALTER TABLE `users` ADD COLUMN `rg` VARCHAR(20) NULL;
