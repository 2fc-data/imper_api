-- Campos de cupom fiscal e numero de serie do abastecimento.

ALTER TABLE `abastecimentos_veiculo`
    ADD COLUMN `numeroCupon` VARCHAR(60) NULL,
    ADD COLUMN `numeroSerie` VARCHAR(120) NULL;
