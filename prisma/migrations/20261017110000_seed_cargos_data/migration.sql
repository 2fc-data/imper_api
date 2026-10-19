-- Popula a tabela `cargos` com os cargos padrão usados pelo sistema.
-- Idempotente: só insere os que ainda não existem (pelo nome).

INSERT INTO `cargos` (`nome`, `descricao`, `ativo`, `createdAt`, `updatedAt`)
SELECT t.`nome`, t.`descricao`, 1, NOW(), NOW()
FROM (
  SELECT 'Administrador' AS `nome`, 'Acesso total ao sistema' AS `descricao`
  UNION ALL SELECT 'Supervisor', 'Supervisão de equipes e operações'
  UNION ALL SELECT 'Técnico', 'Execução técnica de serviços em campo'
  UNION ALL SELECT 'Almoxarife', 'Gestão de estoque e materiais'
  UNION ALL SELECT 'Atendente', 'Atendimento a clientes e abertura de OS'
) AS t
WHERE NOT EXISTS (
  SELECT 1 FROM `cargos` c WHERE c.`nome` = t.`nome`
);
