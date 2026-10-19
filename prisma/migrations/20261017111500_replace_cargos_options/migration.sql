-- Ajusta a lista oficial de cargos para:
-- Gestão, Engenharia, Financeiro, Administrativo, Compras e estoque,
-- Encarregado Obras, Segurança, Transporte, Comercial e Colaboradores.

-- Remove cargos que não pertencem à lista oficial.
DELETE FROM `cargos`
WHERE `nome` NOT IN (
  'Gestão',
  'Engenharia',
  'Financeiro',
  'Administrativo',
  'Compras e estoque',
  'Encarregado Obras',
  'Segurança',
  'Transporte',
  'Comercial',
  'Colaboradores'
);

-- Insere os cargos oficiais que ainda não existem (idempotente).
INSERT INTO `cargos` (`nome`, `descricao`, `ativo`, `createdAt`, `updatedAt`)
SELECT t.`nome`, t.`descricao`, 1, NOW(), NOW()
FROM (
  SELECT 'Gestão' AS `nome`, 'Gestão e administração da empresa' AS `descricao`
  UNION ALL SELECT 'Engenharia', 'Engenharia e projetos técnicos'
  UNION ALL SELECT 'Financeiro', 'Financeiro e contabilidade'
  UNION ALL SELECT 'Administrativo', 'Rotina administrativa'
  UNION ALL SELECT 'Compras e estoque', 'Compras, suprimentos e controle de estoque'
  UNION ALL SELECT 'Encarregado Obras', 'Coordenação de equipes em obras'
  UNION ALL SELECT 'Segurança', 'Segurança do trabalho (SESMT/CIPA)'
  UNION ALL SELECT 'Transporte', 'Logística e transporte'
  UNION ALL SELECT 'Comercial', 'Comercial e relacionamento com clientes'
  UNION ALL SELECT 'Colaboradores', 'Demais operações de campo'
) AS t
WHERE NOT EXISTS (
  SELECT 1 FROM `cargos` c WHERE c.`nome` = t.`nome`
);
