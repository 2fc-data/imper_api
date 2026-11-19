-- Data de saida da oficina nas manutencoes de veiculos e equipamentos.
-- Os dias parados sao calculados no frontend a partir desta data.

ALTER TABLE `manutencoes`
    ADD COLUMN `dataSaida` DATE NULL;

ALTER TABLE `manutencoes_veiculo`
    ADD COLUMN `dataSaida` DATE NULL;
