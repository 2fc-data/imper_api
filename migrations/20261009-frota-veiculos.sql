-- Frota: veículos, km diário, abastecimentos, manutenções
-- Referência (db push é a fonte de verdade no fluxo atual do projeto)
-- 2026-10-09

CREATE TABLE status_veiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_status_veiculo_nome (nome)
);

CREATE TABLE tipo_veiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tipo_veiculo_nome (nome)
);

CREATE TABLE veiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  placa VARCHAR(10) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  modelo VARCHAR(120),
  ano INT,
  combustivel ENUM('GASOLINA','ALCOOL','DIESEL','FLEX','ELETRICO','OUTRO') NOT NULL DEFAULT 'GASOLINA',
  odometroAtual DECIMAL(7,1) NOT NULL DEFAULT 0,
  observacoes VARCHAR(1000),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  marcaId INT,
  corId INT,
  tipoId INT NOT NULL,
  statusId INT NOT NULL,
  responsavelId INT,
  UNIQUE KEY uq_veiculos_codigo (codigo),
  UNIQUE KEY uq_veiculos_placa (placa),
  KEY idx_veiculos_status (statusId),
  KEY idx_veiculos_tipo (tipoId),
  KEY idx_veiculos_marca (marcaId),
  KEY idx_veiculos_responsavel (responsavelId),
  KEY idx_veiculos_descricao (descricao),
  FOREIGN KEY (marcaId) REFERENCES marcas(id),
  FOREIGN KEY (corId) REFERENCES cores(id),
  FOREIGN KEY (tipoId) REFERENCES tipo_veiculo(id),
  FOREIGN KEY (statusId) REFERENCES status_veiculo(id),
  FOREIGN KEY (responsavelId) REFERENCES users(id)
);

CREATE TABLE registros_km_veiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data DATE NOT NULL,
  odometro DECIMAL(7,1) NOT NULL,
  kmPercorrido DECIMAL(9,2) NOT NULL,
  observacao VARCHAR(500),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  veiculoId INT NOT NULL,
  registradoPorId INT,
  UNIQUE KEY uq_registros_km (veiculoId, data),
  KEY idx_registros_km_veiculo_data (veiculoId, data),
  FOREIGN KEY (veiculoId) REFERENCES veiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (registradoPorId) REFERENCES users(id)
);

CREATE TABLE abastecimentos_veiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data DATE NOT NULL,
  odometro DECIMAL(7,1) NOT NULL,
  litros DECIMAL(12,3) NOT NULL,
  valorTotal DECIMAL(12,2) NOT NULL,
  precoLitro DECIMAL(12,4) NOT NULL,
  kmDesdeUltimo DECIMAL(9,2),
  kmPorLitro DECIMAL(12,4),
  observacao VARCHAR(500),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  veiculoId INT NOT NULL,
  fornecedorId INT,
  registradoPorId INT,
  KEY idx_abastecimentos_veiculo (veiculoId),
  KEY idx_abastecimentos_veiculo_data (data),
  FOREIGN KEY (veiculoId) REFERENCES veiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (fornecedorId) REFERENCES fornecedores(id),
  FOREIGN KEY (registradoPorId) REFERENCES users(id)
);

CREATE TABLE manutencoes_veiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data DATE NOT NULL,
  descricao VARCHAR(500) NOT NULL,
  custoPecas DECIMAL(12,2) NOT NULL DEFAULT 0,
  custoMaoDeObra DECIMAL(12,2) NOT NULL DEFAULT 0,
  custoTotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('PENDENTE','EM_ANDAMENTO','CONCLUIDA','CANCELADA') NOT NULL DEFAULT 'PENDENTE',
  proximaManutencao DATE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  veiculoId INT NOT NULL,
  tipoId INT NOT NULL,
  responsavelManutencaoId INT,
  KEY idx_manutencoes_veiculo (veiculoId),
  KEY idx_manutencoes_veiculo_status (status),
  FOREIGN KEY (veiculoId) REFERENCES veiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (tipoId) REFERENCES tipos_manutencao(id),
  FOREIGN KEY (responsavelManutencaoId) REFERENCES users(id)
);

-- Seeds de lookups (idempotente — T12)
INSERT IGNORE INTO status_veiculo (nome, ativo) VALUES
  ('ATIVO', TRUE), ('INATIVO', FALSE), ('EM_MANUTENCAO', TRUE), ('DESATIVADO', FALSE);

INSERT IGNORE INTO tipo_veiculo (nome, ativo) VALUES
  ('CARRO', TRUE), ('MOTO', TRUE), ('VAN', TRUE), ('CAMINHAO', TRUE), ('UTILITARIO', TRUE), ('OUTRO', TRUE);
