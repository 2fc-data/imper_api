-- Atualiza permissões para o domínio novo (Execução/Atividades) no lugar da
-- camada "Ordem de Serviço" que foi removida do sistema.
-- Vínculos papel_permissao são preservados (só muda a chave em permissoes);
-- permissões órfãs (sem rota/gate) são removidas de vez.

-- 1) Órfãs: remove vínculos e depois as permissões
DELETE FROM `papel_permissao`
WHERE `permissaoId` IN (
  SELECT `id` FROM `permissoes`
  WHERE `chave` IN ('cancelar_os', 'entregar_os', 'ver_os', 'ver_minha_os', 'confirmar_obra')
);

DELETE FROM `permissoes`
WHERE `chave` IN ('cancelar_os', 'entregar_os', 'ver_os', 'ver_minha_os', 'confirmar_obra');

-- 2) Chaves destino não devem existir ainda (guarda defensiva contra violação de UNIQUE)
DELETE FROM `papel_permissao`
WHERE `permissaoId` IN (
  SELECT `id` FROM `permissoes`
  WHERE `chave` IN ('criar_execucao', 'editar_execucao', 'iniciar_execucao',
                    'concluir_execucao', 'gerenciar_execucao', 'aprovar_orcamento')
);
DELETE FROM `permissoes`
WHERE `chave` IN ('criar_execucao', 'editar_execucao', 'iniciar_execucao',
                  'concluir_execucao', 'gerenciar_execucao', 'aprovar_orcamento');

-- 3) Renomes: OS → Execução
UPDATE `permissoes` SET `chave` = 'criar_execucao',      `descricao` = 'Criar execução de atividades',           `categoria` = 'execucao' WHERE `chave` = 'criar_os';
UPDATE `permissoes` SET `chave` = 'editar_execucao',     `descricao` = 'Editar execução de atividades',          `categoria` = 'execucao' WHERE `chave` = 'editar_os';
UPDATE `permissoes` SET `chave` = 'iniciar_execucao',    `descricao` = 'Iniciar execução',                       `categoria` = 'execucao' WHERE `chave` = 'iniciar_os';
UPDATE `permissoes` SET `chave` = 'concluir_execucao',   `descricao` = 'Concluir execução',                      `categoria` = 'execucao' WHERE `chave` = 'concluir_os';
UPDATE `permissoes` SET `chave` = 'gerenciar_execucao',  `descricao` = 'Gerenciar execuções (visão completa)',    `categoria` = 'execucao' WHERE `chave` = 'gerenciar_os';
-- aprovar_os era a permissão de aprovação do orçamento (removida junto com o fluxo de OS)
UPDATE `permissoes` SET `chave` = 'aprovar_orcamento',   `descricao` = 'Aprovar/recusar orçamento',              `categoria` = 'financeiro' WHERE `chave` = 'aprovar_os';

-- 4) Categoria ordens_servico → obras (permissões de obra/aditivo que permanecem)
UPDATE `permissoes` SET `categoria` = 'obras'
WHERE `chave` IN ('ver_obras', 'editar_obra', 'criar_aditivo', 'aprovar_aditivo');

-- 5) separar_item: mesma chave, descrição nova
UPDATE `permissoes` SET `descricao` = 'Separar itens para execução'
WHERE `chave` = 'separar_item';
