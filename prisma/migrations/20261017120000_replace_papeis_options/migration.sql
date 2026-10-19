-- Atualiza os perfis de acesso (tabela `papeis`) para a lista oficial:
-- Administrativo, Financeiro, Contábil, Vendas, Atendimento, Almoxarife, Colaborador, Cliente.
-- Estratégia: códigos em CAIXA ALTA (ADMINISTRATIVO, FINANCEIRO, CONTABIL, VENDAS,
-- ATENDIMENTO, ALMOXARIFE, COLABORADOR, CLIENTE) — os rótulos de exibição ficam no frontend.
-- Idempotente: pode ser reexecutada sem duplicar registros.

-- 1. Insere os papéis novos que ainda não existem ─────────────────────────
INSERT INTO `papeis` (`nome`, `descricao`, `ativo`, `createdAt`, `updatedAt`)
SELECT t.`nome`, t.`descricao`, 1, NOW(), NOW()
FROM (
  SELECT 'ADMINISTRATIVO' AS `nome`, 'Perfil Administrativo' AS `descricao`
  UNION ALL SELECT 'FINANCEIRO', 'Perfil Financeiro'
  UNION ALL SELECT 'CONTABIL', 'Perfil Contábil'
  UNION ALL SELECT 'VENDAS', 'Perfil Vendas'
  UNION ALL SELECT 'ATENDIMENTO', 'Perfil Atendimento'
) AS t
WHERE NOT EXISTS (
  SELECT 1 FROM `papeis` p WHERE p.`nome` = t.`nome`
);

-- 2. Copia permissões dos papéis antigos para os equivalentes novos ───────
-- ADMINISTRATIVO ← ADMIN (todas as permissões)
INSERT INTO `papel_permissao` (`papelId`, `permissaoId`)
SELECT np.`id`, pp.`permissaoId`
FROM `papel_permissao` pp
JOIN `papeis` op ON op.`id` = pp.`papelId` AND op.`nome` = 'ADMIN'
JOIN `papeis` np ON np.`nome` = 'ADMINISTRATIVO'
WHERE NOT EXISTS (
  SELECT 1 FROM `papel_permissao` x
  WHERE x.`papelId` = np.`id` AND x.`permissaoId` = pp.`permissaoId`
);

-- ATENDIMENTO ← ATENDENTE
INSERT INTO `papel_permissao` (`papelId`, `permissaoId`)
SELECT np.`id`, pp.`permissaoId`
FROM `papel_permissao` pp
JOIN `papeis` op ON op.`id` = pp.`papelId` AND op.`nome` = 'ATENDENTE'
JOIN `papeis` np ON np.`nome` = 'ATENDIMENTO'
WHERE NOT EXISTS (
  SELECT 1 FROM `papel_permissao` x
  WHERE x.`papelId` = np.`id` AND x.`permissaoId` = pp.`permissaoId`
);

-- COLABORADOR ← TECNICO
INSERT INTO `papel_permissao` (`papelId`, `permissaoId`)
SELECT np.`id`, pp.`permissaoId`
FROM `papel_permissao` pp
JOIN `papeis` op ON op.`id` = pp.`papelId` AND op.`nome` = 'TECNICO'
JOIN `papeis` np ON np.`nome` = 'COLABORADOR'
WHERE NOT EXISTS (
  SELECT 1 FROM `papel_permissao` x
  WHERE x.`papelId` = np.`id` AND x.`permissaoId` = pp.`permissaoId`
);

-- 3. Permissões dos papéis totalmente novos ───────────────────────────────
-- FINANCEIRO: ver_financeiro, aprovar_compra, aprovar_orcamento
INSERT INTO `papel_permissao` (`papelId`, `permissaoId`)
SELECT p.`id`, m.`id`
FROM `papeis` p
JOIN `permissoes` m ON m.`chave` IN ('ver_financeiro', 'aprovar_compra', 'aprovar_orcamento')
WHERE p.`nome` = 'FINANCEIRO'
  AND NOT EXISTS (
    SELECT 1 FROM `papel_permissao` x
    WHERE x.`papelId` = p.`id` AND x.`permissaoId` = m.`id`
  );

-- CONTABIL: ver_financeiro
INSERT INTO `papel_permissao` (`papelId`, `permissaoId`)
SELECT p.`id`, m.`id`
FROM `papeis` p
JOIN `permissoes` m ON m.`chave` = 'ver_financeiro'
WHERE p.`nome` = 'CONTABIL'
  AND NOT EXISTS (
    SELECT 1 FROM `papel_permissao` x
    WHERE x.`papelId` = p.`id` AND x.`permissaoId` = m.`id`
  );

-- VENDAS: criar_atendimento, editar_atendimento, ver_obras
INSERT INTO `papel_permissao` (`papelId`, `permissaoId`)
SELECT p.`id`, m.`id`
FROM `papeis` p
JOIN `permissoes` m ON m.`chave` IN ('criar_atendimento', 'editar_atendimento', 'ver_obras')
WHERE p.`nome` = 'VENDAS'
  AND NOT EXISTS (
    SELECT 1 FROM `papel_permissao` x
    WHERE x.`papelId` = p.`id` AND x.`permissaoId` = m.`id`
  );

-- 4. Reatribui usuários dos papéis renomeados (antes de removê-los) ───────
-- ADMIN → ADMINISTRATIVO
INSERT IGNORE INTO `usuario_papel` (`userId`, `papelId`)
SELECT up.`userId`, np.`id`
FROM `usuario_papel` up
JOIN `papeis` op ON op.`id` = up.`papelId` AND op.`nome` = 'ADMIN'
JOIN `papeis` np ON np.`nome` = 'ADMINISTRATIVO';

-- SUPERVISOR → VENDAS
INSERT IGNORE INTO `usuario_papel` (`userId`, `papelId`)
SELECT up.`userId`, np.`id`
FROM `usuario_papel` up
JOIN `papeis` op ON op.`id` = up.`papelId` AND op.`nome` = 'SUPERVISOR'
JOIN `papeis` np ON np.`nome` = 'VENDAS';

-- TECNICO → COLABORADOR
INSERT IGNORE INTO `usuario_papel` (`userId`, `papelId`)
SELECT up.`userId`, np.`id`
FROM `usuario_papel` up
JOIN `papeis` op ON op.`id` = up.`papelId` AND op.`nome` = 'TECNICO'
JOIN `papeis` np ON np.`nome` = 'COLABORADOR';

-- ATENDENTE → ATENDIMENTO
INSERT IGNORE INTO `usuario_papel` (`userId`, `papelId`)
SELECT up.`userId`, np.`id`
FROM `usuario_papel` up
JOIN `papeis` op ON op.`id` = up.`papelId` AND op.`nome` = 'ATENDENTE'
JOIN `papeis` np ON np.`nome` = 'ATENDIMENTO';

-- 5. Remove papéis fora da lista oficial (cascata limpa papel_permissao e
--    usuario_papel; os vínculos novos do passo 4 já estão gravados) ───────
DELETE FROM `papeis`
WHERE `nome` NOT IN (
  'ADMINISTRATIVO', 'FINANCEIRO', 'CONTABIL', 'VENDAS',
  'ATENDIMENTO', 'ALMOXARIFE', 'COLABORADOR', 'CLIENTE'
);
