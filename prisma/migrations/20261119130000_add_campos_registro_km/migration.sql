-- Campos adicionais do registro de KM: numero do cupon e numero de serie.

ALTER TABLE `registros_km_veiculo`
    ADD COLUMN `numeroCupon` VARCHAR(60) NULL,
    ADD COLUMN `numeroSerie` VARCHAR(120) NULL;
