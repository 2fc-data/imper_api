-- Cadastros sem `ativo` explícito nascem inativos (anti-robôs): ativação é manual
-- pelo administrador. Apenas o DEFAULT muda; linhas existentes não são alteradas.
-- Idempotente: pode ser reexecutada sem efeito colateral.
ALTER TABLE `users` ALTER COLUMN `ativo` SET DEFAULT false;
