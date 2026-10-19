-- Correção da migration 20261017120000: o perfil COLABORADOR não foi criado
-- (ficou de fora da lista do passo 1), o que impediu a cópia das permissões do
-- TECNICO e a reatribuição do usuário tecnico@imper.local.
-- Idempotente: pode ser reexecutada sem duplicar registros.

-- 1. Cria o perfil COLABORADOR ─────────────────────────────────────────────
INSERT INTO `papeis` (`nome`, `descricao`, `ativo`, `createdAt`, `updatedAt`)
SELECT 'COLABORADOR', 'Perfil Colaborador', 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `papeis` WHERE `nome` = 'COLABORADOR'
);

-- 2. Permissões do antigo TECNICO (edição/início/conclusão de execução e obras)
INSERT INTO `papel_permissao` (`papelId`, `permissaoId`)
SELECT p.`id`, m.`id`
FROM `papeis` p
JOIN `permissoes` m ON m.`chave` IN (
  'editar_execucao', 'iniciar_execucao', 'concluir_execucao',
  'gerenciar_execucao', 'ver_obras'
)
WHERE p.`nome` = 'COLABORADOR'
  AND NOT EXISTS (
    SELECT 1 FROM `papel_permissao` x
    WHERE x.`papelId` = p.`id` AND x.`permissaoId` = m.`id`
  );

-- 3. Reatribui o usuário dev tecnico@imper.local (vínculo perdido na cascata) ─
INSERT IGNORE INTO `usuario_papel` (`userId`, `papelId`)
SELECT u.`id`, p.`id`
FROM `users` u
JOIN `papeis` p ON p.`nome` = 'COLABORADOR'
WHERE u.`email` = 'tecnico@imper.local'
  AND NOT EXISTS (
    SELECT 1 FROM `usuario_papel` x
    WHERE x.`userId` = u.`id` AND x.`papelId` = p.`id`
  );
