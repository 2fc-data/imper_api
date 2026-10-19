-- Normaliza as descrições dos 8 perfis de acesso para o padrão "Perfil X"
-- (as linhas antigas ficaram como "Papel ALMOXARIFE" / "Papel CLIENTE").
-- Idempotente: pode ser reexecutada sem efeito colateral.

UPDATE `papeis`
SET `descricao` = CASE `nome`
  WHEN 'ADMINISTRATIVO' THEN 'Perfil Administrativo'
  WHEN 'FINANCEIRO'     THEN 'Perfil Financeiro'
  WHEN 'CONTABIL'       THEN 'Perfil Contábil'
  WHEN 'VENDAS'         THEN 'Perfil Vendas'
  WHEN 'ATENDIMENTO'    THEN 'Perfil Atendimento'
  WHEN 'ALMOXARIFE'     THEN 'Perfil Almoxarife'
  WHEN 'COLABORADOR'    THEN 'Perfil Colaborador'
  WHEN 'CLIENTE'        THEN 'Perfil Cliente'
  ELSE `descricao`
END
WHERE `nome` IN (
  'ADMINISTRATIVO', 'FINANCEIRO', 'CONTABIL', 'VENDAS',
  'ATENDIMENTO', 'ALMOXARIFE', 'COLABORADOR', 'CLIENTE'
);
