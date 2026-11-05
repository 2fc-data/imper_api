-- AlterTable obras_atividades
ALTER TABLE `obras_atividades`
  ADD COLUMN `statusWhatsapp` VARCHAR(30) NULL DEFAULT 'PENDENTE';

-- Backfill: atividades já agendadas em obras cujo disparo geral já ocorreu
UPDATE `obras_atividades` oa
  JOIN `obras_etapas` oe ON oe.`id` = oa.`obraEtapaId`
  JOIN `obras` o ON o.`id` = oe.`obraId`
SET oa.`statusWhatsapp` = 'ENVIADO'
WHERE o.`statusWhatsapp` = 'ENVIADO'
  AND oa.`dataDisparoWhatsapp` IS NOT NULL;
