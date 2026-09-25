-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: impermeab
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.22.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('11ec8603-bc7b-43c8-ba24-2771a3cfa601','c5bd2aa45a7e201387372245f17211253e7b429e428d61e334dad9d2e75677de','2026-08-11 21:27:10.388','20260811212709_remove_mt',NULL,NULL,'2026-08-11 21:27:09.935',1),('6783afa2-3e98-4f25-89be-87cf41b84a69','847982fcfa3b5f2355fcb324865b5b1b986b1d6c5b56d2cd8d9e51943a75a92f','2026-08-13 19:32:56.911','20260813210000_motivo_rename_valores',NULL,NULL,'2026-08-13 19:32:56.713',1),('70096251-4c78-4acd-b6c9-833cbc024b86','98b53c8a10a5a7f47161983a2fc5e2c31434c77a538465c559ba6effbb28ef5e','2026-08-13 14:37:52.643','20260813113617_padronizar_nomes_tabelas_snake_case',NULL,NULL,'2026-08-13 14:37:44.511',1),('8da5e19a-236e-4b8e-aebc-ced741532c8c','d73801243fce1d09e5ba566bb87f6452f240f1b8a087aaaec51c63575a3e70bf','2026-08-13 19:03:08.232','20260813200000_motivo_sem_duvida_add_outros',NULL,NULL,'2026-08-13 19:03:08.078',1),('92e32f92-05e8-4d18-b0ad-1d0272472d0a','9f53ddca3cd5c903b1fd84aed474a4b744153a16c3efeac94d01182bcd055e65','2026-08-17 23:53:27.911','20260817120000_equipamentos',NULL,NULL,'2026-08-17 23:53:25.966',1),('a93395b8-a037-4d92-929d-38ae599a95c8','4e3d56233bb8cc43adc3f4936f330af34e9eaf7d72d571307643b8edee02efa3','2026-08-13 20:32:37.957','20260813220000_add_servico_atendimento',NULL,NULL,'2026-08-13 20:32:37.727',1),('fc5fdb83-bd21-4be8-a424-8a73e01db058','f39e45c8bf13294fa75c246a617a1d73025a909ffe4be988cc895ebcbc4c4994','2026-08-11 21:22:08.660','20260811212157_remove_m2',NULL,NULL,'2026-08-11 21:21:57.980',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `acessos_cliente`
--

DROP TABLE IF EXISTS `acessos_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acessos_cliente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordemServicoId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiraEm` datetime(3) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ultimoAcesso` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `acessos_cliente_token_key` (`token`),
  KEY `acessos_cliente_ordemServicoId_idx` (`ordemServicoId`),
  KEY `acessos_cliente_clienteId_fkey` (`userId`),
  CONSTRAINT `acessos_cliente_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `acessos_cliente_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acessos_cliente`
--

LOCK TABLES `acessos_cliente` WRITE;
/*!40000 ALTER TABLE `acessos_cliente` DISABLE KEYS */;
/*!40000 ALTER TABLE `acessos_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aditivo_itens`
--

DROP TABLE IF EXISTS `aditivo_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aditivo_itens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aditivoId` int NOT NULL,
  `servicoItemId` int DEFAULT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('SERVICO','MATERIAL','EQUIPAMENTO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` decimal(12,3) NOT NULL,
  `valorUnitario` decimal(12,2) NOT NULL,
  `valorTotal` decimal(12,2) NOT NULL,
  `unidadeId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `aditivo_itens_aditivoId_fkey` (`aditivoId`),
  KEY `aditivo_itens_servicoItemId_fkey` (`servicoItemId`),
  KEY `aditivo_itens_unidadeId_fkey` (`unidadeId`),
  CONSTRAINT `aditivo_itens_aditivoId_fkey` FOREIGN KEY (`aditivoId`) REFERENCES `aditivos_os` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `aditivo_itens_servicoItemId_fkey` FOREIGN KEY (`servicoItemId`) REFERENCES `servico_itens` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `aditivo_itens_unidadeId_fkey` FOREIGN KEY (`unidadeId`) REFERENCES `unidade_medida` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aditivo_itens`
--

LOCK TABLES `aditivo_itens` WRITE;
/*!40000 ALTER TABLE `aditivo_itens` DISABLE KEYS */;
/*!40000 ALTER TABLE `aditivo_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aditivos_os`
--

DROP TABLE IF EXISTS `aditivos_os`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aditivos_os` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordemServicoId` int NOT NULL,
  `orcamentoId` int DEFAULT NULL,
  `descricao` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `aditivos_os_ordemServicoId_fkey` (`ordemServicoId`),
  KEY `aditivos_os_orcamentoId_fkey` (`orcamentoId`),
  CONSTRAINT `aditivos_os_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `aditivos_os_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aditivos_os`
--

LOCK TABLES `aditivos_os` WRITE;
/*!40000 ALTER TABLE `aditivos_os` DISABLE KEYS */;
/*!40000 ALTER TABLE `aditivos_os` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agendamentos`
--

DROP TABLE IF EXISTS `agendamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `atendimentoId` int DEFAULT NULL,
  `enderecoId` int DEFAULT NULL,
  `tipo` enum('VISITA','ORCAMENTO','RETORNO','REUNIAO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VISITA',
  `status` enum('PENDENTE','CONFIRMADO','REALIZADO','CANCELADO','NAO_COMPARECEU') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `dataPrevista` datetime(3) NOT NULL,
  `dataRealizada` datetime(3) DEFAULT NULL,
  `observacoes` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criadoPorId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `agendamentos_dataPrevista_idx` (`dataPrevista`),
  KEY `agendamentos_status_idx` (`status`),
  KEY `agendamentos_atendimentoId_fkey` (`atendimentoId`),
  KEY `agendamentos_enderecoId_fkey` (`enderecoId`),
  KEY `agendamentos_criadoPorId_fkey` (`criadoPorId`),
  KEY `agendamentos_userId_idx` (`userId`),
  CONSTRAINT `agendamentos_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `agendamentos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `agendamentos_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `agendamentos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamentos`
--

LOCK TABLES `agendamentos` WRITE;
/*!40000 ALTER TABLE `agendamentos` DISABLE KEYS */;
INSERT INTO `agendamentos` VALUES (3,9,5,5,'VISITA','CONFIRMADO','2026-09-29 11:00:00.000',NULL,'O local foi visitado e cliente solicitou orçamento',1,'2026-09-23 16:56:31.890','2026-09-23 20:51:43.585'),(4,20,12,6,'VISITA','REALIZADO','2026-09-24 16:00:00.000','2026-09-24 16:42:02.775',NULL,1,'2026-09-23 21:13:13.745','2026-09-24 16:42:02.778');
/*!40000 ALTER TABLE `agendamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assinaturas`
--

DROP TABLE IF EXISTS `assinaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assinaturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordemServicoId` int NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assinadoEm` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `nomeUser` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assinaturas_ordemServicoId_key` (`ordemServicoId`),
  CONSTRAINT `assinaturas_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assinaturas`
--

LOCK TABLES `assinaturas` WRITE;
/*!40000 ALTER TABLE `assinaturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `assinaturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `atendimento_logs`
--

DROP TABLE IF EXISTS `atendimento_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atendimento_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `atendimentoId` int NOT NULL,
  `atendenteId` int DEFAULT NULL,
  `tipo` enum('TEXTO','STATUS') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TEXTO',
  `descricao` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statusDe` enum('NOVO','EM_ANDAMENTO','CONCLUIDO','INATIVO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statusPara` enum('NOVO','EM_ANDAMENTO','CONCLUIDO','INATIVO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `atendimento_logs_atendimentoId_fkey` (`atendimentoId`),
  KEY `atendimento_logs_atendenteId_fkey` (`atendenteId`),
  CONSTRAINT `atendimento_logs_atendenteId_fkey` FOREIGN KEY (`atendenteId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `atendimento_logs_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atendimento_logs`
--

LOCK TABLES `atendimento_logs` WRITE;
/*!40000 ALTER TABLE `atendimento_logs` DISABLE KEYS */;
INSERT INTO `atendimento_logs` VALUES (4,8,1,'STATUS',NULL,'NOVO','CONCLUIDO','2026-09-23 16:01:54.200'),(5,4,1,'STATUS',NULL,'NOVO','CONCLUIDO','2026-09-23 16:36:48.941'),(6,4,1,'TEXTO','Foi passado informações para infiltração em paredes',NULL,NULL,'2026-09-23 16:36:49.327'),(7,5,1,'TEXTO','Revitalização faxada',NULL,NULL,'2026-09-23 16:40:22.062'),(8,7,1,'TEXTO','Visitar para orçamento',NULL,NULL,'2026-09-23 16:42:47.899'),(9,9,1,'TEXTO','Visitar',NULL,NULL,'2026-09-23 16:46:27.814'),(10,5,1,'STATUS',NULL,'NOVO','CONCLUIDO','2026-09-23 16:56:32.522'),(11,7,1,'TEXTO','Informações esclarecidas',NULL,NULL,'2026-09-23 17:23:08.184'),(12,7,1,'STATUS',NULL,'EM_ANDAMENTO','CONCLUIDO','2026-09-23 17:23:14.067'),(13,12,1,'STATUS',NULL,'NOVO','CONCLUIDO','2026-09-23 21:13:14.161');
/*!40000 ALTER TABLE `atendimento_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `atendimentos`
--

DROP TABLE IF EXISTS `atendimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atendimentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `canal` enum('WHATSAPP','FORMULARIO','LOJA','TELEFONE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `urgencia` enum('NORMAL','URGENTE','URGENTISSIMO') COLLATE utf8mb4_unicode_ci DEFAULT 'NORMAL',
  `status` enum('NOVO','EM_ANDAMENTO','CONCLUIDO','INATIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOVO',
  `descricao` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `atendenteId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `atendimentos_atendenteId_fkey` (`atendenteId`),
  KEY `atendimentos_clienteId_fkey` (`userId`),
  CONSTRAINT `atendimentos_atendenteId_fkey` FOREIGN KEY (`atendenteId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `atendimentos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atendimentos`
--

LOCK TABLES `atendimentos` WRITE;
/*!40000 ALTER TABLE `atendimentos` DISABLE KEYS */;
INSERT INTO `atendimentos` VALUES (4,'WHATSAPP','NORMAL','CONCLUIDO',NULL,8,1,'2026-09-07 13:18:55.319','2026-09-23 16:36:48.887'),(5,'FORMULARIO','NORMAL','CONCLUIDO','Solicitação de orçamento via formulário web',9,NULL,'2026-09-15 22:14:38.963','2026-09-23 16:56:32.511'),(6,'LOJA','NORMAL','NOVO',NULL,9,NULL,'2026-09-16 16:47:38.421','2026-09-17 11:56:50.020'),(7,'LOJA','NORMAL','CONCLUIDO','Orçamento de uma pisicina vazando',8,NULL,'2026-09-18 14:35:51.124','2026-09-23 17:23:14.062'),(8,'FORMULARIO','NORMAL','CONCLUIDO','Vazamento  Piscina',8,NULL,'2026-09-18 17:49:39.505','2026-09-23 16:01:54.164'),(9,'FORMULARIO','NORMAL','NOVO','Vazamento  Piscina',8,NULL,'2026-09-18 17:53:14.917','2026-09-18 17:53:14.917'),(10,'LOJA','NORMAL','NOVO','Testando mais um cliente sem cadastrar na base',NULL,NULL,'2026-09-21 15:18:26.158','2026-09-21 15:18:26.158'),(11,'FORMULARIO','NORMAL','NOVO','teste',19,NULL,'2026-09-21 21:29:32.121','2026-09-21 21:29:32.121'),(12,'FORMULARIO','NORMAL','CONCLUIDO','verificacao final',20,NULL,'2026-09-21 21:31:58.861','2026-09-23 21:13:14.145'),(13,'FORMULARIO','NORMAL','NOVO','Solicitação de orçamento via formulário web',21,NULL,'2026-09-21 21:34:15.385','2026-09-21 21:34:15.385'),(14,'LOJA','NORMAL','NOVO','N atendim teste',NULL,NULL,'2026-09-22 16:13:06.472','2026-09-23 15:36:14.637');
/*!40000 ALTER TABLE `atendimentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `atividades_os`
--

DROP TABLE IF EXISTS `atividades_os`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atividades_os` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `osId` int NOT NULL,
  `etapaOSId` int NOT NULL,
  `catalogoAtividadeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `equipeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dataPrevisao` datetime(3) DEFAULT NULL,
  `status` enum('PENDENTE','EM_ANDAMENTO','CONCLUIDA','CANCELADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `criadoEm` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `atividades_os_osId_fkey` (`osId`),
  KEY `atividades_os_etapaOSId_fkey` (`etapaOSId`),
  KEY `atividades_os_catalogoAtividadeId_fkey` (`catalogoAtividadeId`),
  KEY `atividades_os_equipeId_fkey` (`equipeId`),
  CONSTRAINT `atividades_os_catalogoAtividadeId_fkey` FOREIGN KEY (`catalogoAtividadeId`) REFERENCES `catalogo_atividades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `atividades_os_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `atividades_os_etapaOSId_fkey` FOREIGN KEY (`etapaOSId`) REFERENCES `etapas_os` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `atividades_os_osId_fkey` FOREIGN KEY (`osId`) REFERENCES `ordens_servico` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atividades_os`
--

LOCK TABLES `atividades_os` WRITE;
/*!40000 ALTER TABLE `atividades_os` DISABLE KEYS */;
/*!40000 ALTER TABLE `atividades_os` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cargos`
--

DROP TABLE IF EXISTS `cargos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargos`
--

LOCK TABLES `cargos` WRITE;
/*!40000 ALTER TABLE `cargos` DISABLE KEYS */;
INSERT INTO `cargos` VALUES (1,'Diretor','Administração geral',1,'2026-08-12 22:00:47.573','2026-08-12 22:00:47.573'),(2,'Supervisor de Obras','Supervisão de campo',1,'2026-08-12 22:00:47.600','2026-08-12 22:00:47.600'),(3,'Técnico Sênior','Técnico em impermeabilização',1,'2026-08-12 22:00:47.610','2026-08-12 22:00:47.610'),(4,'Almoxarife','Controle de estoque',1,'2026-08-12 22:00:47.617','2026-08-12 22:00:47.617'),(5,'Analista Contábil','Financeiro e contabilidade',1,'2026-08-12 22:00:47.625','2026-08-12 22:00:47.625'),(6,'Atendente','Recepção e triagem de contatos',1,'2026-08-12 22:00:47.629','2026-08-12 22:00:47.629'),(7,'Presidente','Proprietário',1,'2026-09-06 01:25:15.633','2026-09-06 01:25:15.633');
/*!40000 ALTER TABLE `cargos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogo_atividades`
--

DROP TABLE IF EXISTS `catalogo_atividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogo_atividades` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `especialidadeNecessaria` enum('IMPERMEABILIZACAO','PINTURA','ELETRICA','HIDRAULICA','CIVIL','LIMPEZA','OUTROS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tempoEstimadoHoras` decimal(5,2) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criadoEm` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogo_atividades`
--

LOCK TABLES `catalogo_atividades` WRITE;
/*!40000 ALTER TABLE `catalogo_atividades` DISABLE KEYS */;
/*!40000 ALTER TABLE `catalogo_atividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_epis`
--

DROP TABLE IF EXISTS `categorias_epis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_epis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_epis`
--

LOCK TABLES `categorias_epis` WRITE;
/*!40000 ALTER TABLE `categorias_epis` DISABLE KEYS */;
INSERT INTO `categorias_epis` VALUES (1,'Proteção da Cabeça',NULL,1,1,'2026-09-11 19:30:17.140','2026-09-11 19:30:17.140'),(2,'Proteção do Corpo',NULL,1,2,'2026-09-11 19:30:17.153','2026-09-11 19:30:17.153'),(3,'Proteção Respiratória',NULL,1,3,'2026-09-11 19:30:17.160','2026-09-11 19:30:17.160'),(4,'Proteção das Mãos',NULL,1,4,'2026-09-11 19:30:17.168','2026-09-11 19:30:17.168'),(5,'Proteção dos Olhos',NULL,1,5,'2026-09-11 19:30:17.174','2026-09-11 19:30:17.174'),(6,'Proteção Auditiva',NULL,1,6,'2026-09-11 19:30:17.179','2026-09-11 19:30:17.179'),(7,'Proteção de Quedas',NULL,1,7,'2026-09-11 19:30:17.185','2026-09-11 19:30:17.185'),(8,'Proteção Articular',NULL,1,8,'2026-09-11 19:30:17.193','2026-09-11 19:30:17.193');
/*!40000 ALTER TABLE `categorias_epis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_equipamentos`
--

DROP TABLE IF EXISTS `categorias_equipamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_equipamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_equipamentos`
--

LOCK TABLES `categorias_equipamentos` WRITE;
/*!40000 ALTER TABLE `categorias_equipamentos` DISABLE KEYS */;
INSERT INTO `categorias_equipamentos` VALUES (9,'Equipamentos de Aplicacao',NULL,1,21,'2026-08-25 17:03:41.113','2026-08-25 17:03:41.113'),(10,'Equipamentos de Seguranca',NULL,1,22,'2026-08-25 17:03:41.123','2026-08-25 17:03:41.123'),(11,'Escadas',NULL,1,23,'2026-08-25 17:03:41.132','2026-08-25 17:03:41.132'),(12,'Ferramentas Eletricas',NULL,1,24,'2026-08-25 17:03:41.139','2026-08-25 17:03:41.139'),(13,'Ferramentas Manuais',NULL,1,25,'2026-08-25 17:03:41.147','2026-08-25 17:03:41.147'),(14,'Materiais Diversos',NULL,1,26,'2026-08-25 17:03:41.152','2026-08-25 17:03:41.152'),(15,'Outros',NULL,1,27,'2026-08-25 17:03:41.161','2026-08-25 17:03:41.161'),(16,'Construção','Areia, Cimento, Tijolos, Telhas ...',1,0,'2026-09-14 17:28:41.348','2026-09-14 17:55:51.351'),(17,'Cozinha',NULL,1,0,'2026-09-14 18:00:11.654','2026-09-14 18:00:11.654');
/*!40000 ALTER TABLE `categorias_equipamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_materiais`
--

DROP TABLE IF EXISTS `categorias_materiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_materiais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_materiais`
--

LOCK TABLES `categorias_materiais` WRITE;
/*!40000 ALTER TABLE `categorias_materiais` DISABLE KEYS */;
INSERT INTO `categorias_materiais` VALUES (1,'Tintas','Tintas, primers e preparadores de superfícies',1,1,'2026-09-05 06:44:10.743','2026-09-05 07:08:22.779'),(2,'Revestimentos','Azulejos, porcelanato e revestimentos cerâmicos',1,2,'2026-09-05 06:44:10.743','2026-09-05 07:08:22.793'),(3,'Impermeabilizantes','Impermeabilizantes líquidos, mantas e primers',1,3,'2026-09-05 06:44:10.743','2026-09-05 07:08:22.799'),(4,'Limpeza','Produtos de limpeza e higienização',1,4,'2026-09-05 06:44:10.743','2026-09-05 07:08:22.808'),(5,'Fixadores','Parafusos, pregos, buchas e fixadores em geral',1,5,'2026-09-05 06:44:10.743','2026-09-05 07:08:22.813'),(6,'Construção','Areia, Cimento, Tijolos, Telhas ...',1,0,'2026-09-14 17:56:08.618','2026-09-14 15:06:38.891');
/*!40000 ALTER TABLE `categorias_materiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checklist_execucao`
--

DROP TABLE IF EXISTS `checklist_execucao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checklist_execucao` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `atividadeOSId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subStepAtividadeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDENTE','CONCLUIDA','BLOQUEADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `concluidoEm` datetime(3) DEFAULT NULL,
  `concluidoPorId` int DEFAULT NULL,
  `observacao` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `checklist_execucao_atividadeOSId_fkey` (`atividadeOSId`),
  KEY `checklist_execucao_subStepAtividadeId_fkey` (`subStepAtividadeId`),
  KEY `checklist_execucao_concluidoPorId_fkey` (`concluidoPorId`),
  CONSTRAINT `checklist_execucao_atividadeOSId_fkey` FOREIGN KEY (`atividadeOSId`) REFERENCES `atividades_os` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `checklist_execucao_concluidoPorId_fkey` FOREIGN KEY (`concluidoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `checklist_execucao_subStepAtividadeId_fkey` FOREIGN KEY (`subStepAtividadeId`) REFERENCES `substep_atividades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checklist_execucao`
--

LOCK TABLES `checklist_execucao` WRITE;
/*!40000 ALTER TABLE `checklist_execucao` DISABLE KEYS */;
/*!40000 ALTER TABLE `checklist_execucao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cidades_atendidas`
--

DROP TABLE IF EXISTS `cidades_atendidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cidades_atendidas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uf` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` decimal(10,7) NOT NULL,
  `lng` decimal(10,7) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cidades_atendidas_nome_key` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cidades_atendidas`
--

LOCK TABLES `cidades_atendidas` WRITE;
/*!40000 ALTER TABLE `cidades_atendidas` DISABLE KEYS */;
INSERT INTO `cidades_atendidas` VALUES (1,'Poços de Caldas','MG',-21.7879000,-46.5614000,1,1,'2026-08-12 22:02:59.948','2026-08-25 17:03:39.718'),(2,'Andradas','MG',-22.0694000,-46.5696000,1,2,'2026-08-12 22:02:59.962','2026-08-25 17:03:39.745'),(3,'Campestre','MG',-21.7121000,-46.2459000,1,3,'2026-08-12 22:02:59.973','2026-08-25 17:03:39.761'),(4,'Botelhos','MG',-21.6317000,-46.3942000,1,4,'2026-08-12 22:02:59.980','2026-08-25 17:03:39.773');
/*!40000 ALTER TABLE `cidades_atendidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compra_itens`
--

DROP TABLE IF EXISTS `compra_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra_itens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compraId` int NOT NULL,
  `materialId` int NOT NULL,
  `quantidade` decimal(12,3) NOT NULL,
  `quantidadeRecebida` decimal(12,3) NOT NULL DEFAULT '0.000',
  `valorUnitario` decimal(12,2) NOT NULL,
  `valorTotal` decimal(12,2) NOT NULL,
  `status` enum('PENDENTE','RECEBIDO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `compra_itens_compraId_materialId_key` (`compraId`,`materialId`),
  KEY `compra_itens_materialId_idx` (`materialId`),
  CONSTRAINT `compra_itens_compraId_fkey` FOREIGN KEY (`compraId`) REFERENCES `compras` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `compra_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra_itens`
--

LOCK TABLES `compra_itens` WRITE;
/*!40000 ALTER TABLE `compra_itens` DISABLE KEYS */;
/*!40000 ALTER TABLE `compra_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordemServicoId` int DEFAULT NULL,
  `status` enum('PENDENTE','APROVADA','RECUSADA','RECEBIDA','CANCELADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `valorTotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `criadoPorId` int NOT NULL,
  `aprovadoPorId` int DEFAULT NULL,
  `aprovadoEm` datetime(3) DEFAULT NULL,
  `recebidoEm` datetime(3) DEFAULT NULL,
  `observacoes` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `compras_codigo_key` (`codigo`),
  KEY `compras_ordemServicoId_fkey` (`ordemServicoId`),
  KEY `compras_criadoPorId_fkey` (`criadoPorId`),
  KEY `compras_aprovadoPorId_fkey` (`aprovadoPorId`),
  CONSTRAINT `compras_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `compras_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `compras_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracoes`
--

DROP TABLE IF EXISTS `configuracoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes` (
  `chave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`chave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracoes`
--

LOCK TABLES `configuracoes` WRITE;
/*!40000 ALTER TABLE `configuracoes` DISABLE KEYS */;
INSERT INTO `configuracoes` VALUES ('acesso.linkDias','30','Validade do link de acesso do cliente','2026-08-25 17:03:39.908'),('orcamento.validadeDias','7','Validade do orçamento em dias corridos','2026-08-25 17:03:39.896'),('os.prazoExecucaoNormal','10','Dias úteis p/ executar OS (normal)','2026-08-25 17:03:39.838'),('os.prazoExecucaoUrgente','3','Dias úteis p/ executar OS (urgente)','2026-08-25 17:03:39.852'),('os.prazoExecucaoUrgentissimo','1','Dias úteis p/ executar OS (urgentíssimo)','2026-08-25 17:03:39.864'),('separacao.diasAntecedencia','3','Dias úteis antes do início p/ separação','2026-08-25 17:03:39.879'),('visita.prazoNormal','5','Dias úteis p/ visita (urgência normal)','2026-08-25 17:03:39.786'),('visita.prazoUrgente','3','Dias úteis p/ visita (urgente)','2026-08-25 17:03:39.810'),('visita.prazoUrgentissimo','1','Dias úteis p/ visita (urgentíssimo)','2026-08-25 17:03:39.821');
/*!40000 ALTER TABLE `configuracoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cores`
--

DROP TABLE IF EXISTS `cores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigoHex` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cores`
--

LOCK TABLES `cores` WRITE;
/*!40000 ALTER TABLE `cores` DISABLE KEYS */;
INSERT INTO `cores` VALUES (1,'Amarelo','#FFD700',1,1,'2026-08-25 15:34:37.530','2026-08-25 15:34:37.530'),(2,'Azul','#0000FF',1,2,'2026-08-25 15:34:37.537','2026-08-25 15:34:37.537'),(3,'Branco','#FFFFFF',1,3,'2026-08-25 15:34:37.544','2026-08-25 15:34:37.544'),(4,'Cinza','#808080',1,4,'2026-08-25 15:34:37.550','2026-08-25 15:34:37.550'),(5,'Laranja','#FFA500',1,5,'2026-08-25 15:34:37.557','2026-08-25 15:34:37.557'),(6,'Preto','#000000',1,6,'2026-08-25 15:34:37.564','2026-08-25 15:34:37.564'),(7,'Verde','#008000',1,7,'2026-08-25 15:34:37.569','2026-08-25 15:34:37.569'),(8,'Vermelho','#FF0000',1,8,'2026-08-25 15:34:37.575','2026-08-25 15:34:37.575');
/*!40000 ALTER TABLE `cores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidade_datas`
--

DROP TABLE IF EXISTS `disponibilidade_datas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidade_datas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `data` datetime(3) NOT NULL,
  `horaInicio` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horaFim` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacidade` int NOT NULL DEFAULT '1',
  `excluida` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `disponibilidade_datas_userId_idx` (`userId`),
  KEY `disponibilidade_datas_data_idx` (`data`),
  CONSTRAINT `disponibilidade_datas_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidade_datas`
--

LOCK TABLES `disponibilidade_datas` WRITE;
/*!40000 ALTER TABLE `disponibilidade_datas` DISABLE KEYS */;
INSERT INTO `disponibilidade_datas` VALUES (2,1,'2026-01-01 00:00:00.000','08:00','18:00',1,0,'2026-09-17 17:42:05.237','2026-09-17 17:42:05.237');
/*!40000 ALTER TABLE `disponibilidade_datas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidade_padroes`
--

DROP TABLE IF EXISTS `disponibilidade_padroes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidade_padroes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `diaSemana` int NOT NULL,
  `horaInicio` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horaFim` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacidade` int NOT NULL DEFAULT '1',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `disponibilidade_padroes_userId_idx` (`userId`),
  KEY `disponibilidade_padroes_diaSemana_idx` (`diaSemana`),
  CONSTRAINT `disponibilidade_padroes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidade_padroes`
--

LOCK TABLES `disponibilidade_padroes` WRITE;
/*!40000 ALTER TABLE `disponibilidade_padroes` DISABLE KEYS */;
INSERT INTO `disponibilidade_padroes` VALUES (6,1,2,'08:00','12:00',1,1,'2026-09-22 11:50:50.897','2026-09-22 11:50:50.897'),(7,1,4,'13:00','17:00',1,1,'2026-09-22 11:53:05.131','2026-09-22 11:53:05.131');
/*!40000 ALTER TABLE `disponibilidade_padroes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enderecos`
--

DROP TABLE IF EXISTS `enderecos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enderecos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `rotulo` enum('RESIDENCIAL','OBRA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RESIDENCIAL',
  `logradouro` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complemento` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bairro` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cidade` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cep` varchar(9) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `principal` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `enderecos_clienteId_fkey` (`userId`),
  CONSTRAINT `enderecos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enderecos`
--

LOCK TABLES `enderecos` WRITE;
/*!40000 ALTER TABLE `enderecos` DISABLE KEYS */;
INSERT INTO `enderecos` VALUES (1,9,'RESIDENCIAL','Rua Guaporé','78',NULL,'Jardim dos Estados','Poços de Caldas','MG','37701-057',1,'2026-09-15 22:14:38.916','2026-09-15 22:14:38.916'),(2,18,'RESIDENCIAL','Rua Marechal Deodoro','01','01','Centro','Poços de Caldas','MG','37701014',1,'2026-09-18 23:37:42.272','2026-09-18 23:37:42.272'),(4,8,'RESIDENCIAL','Rua Piracicaba','87','','Jardim dos Estados','Poços de Caldas','MG','37701-087',0,'2026-09-23 16:01:53.491','2026-09-23 16:01:53.491'),(5,9,'RESIDENCIAL','Rua Barros Cobra','','','Centro','Poços de Caldas','MG','37701-018',0,'2026-09-23 16:56:31.865','2026-09-23 16:56:31.865'),(6,20,'RESIDENCIAL','Rua Senador Nilo Coelho','10','','Jardim Vitória','Poços de Caldas','MG','37701-290',0,'2026-09-23 21:13:13.723','2026-09-23 21:13:13.723');
/*!40000 ALTER TABLE `enderecos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entregas_epi`
--

DROP TABLE IF EXISTS `entregas_epi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas_epi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `epiId` int NOT NULL,
  `colaboradorId` int NOT NULL,
  `quantidade` decimal(12,3) NOT NULL,
  `data` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `observacao` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registradoPorId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atividadeOSId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dataDevolucao` datetime(3) DEFAULT NULL,
  `osId` int DEFAULT NULL,
  `separacaoId` int DEFAULT NULL,
  `status` enum('EM_USO','DEVOLVIDO','PERDIDO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EM_USO',
  PRIMARY KEY (`id`),
  KEY `entregas_epi_epiId_idx` (`epiId`),
  KEY `entregas_epi_colaboradorId_fkey` (`colaboradorId`),
  KEY `entregas_epi_registradoPorId_fkey` (`registradoPorId`),
  KEY `entregas_epi_osId_idx` (`osId`),
  KEY `entregas_epi_atividadeOSId_idx` (`atividadeOSId`),
  KEY `entregas_epi_separacaoId_idx` (`separacaoId`),
  CONSTRAINT `entregas_epi_atividadeOSId_fkey` FOREIGN KEY (`atividadeOSId`) REFERENCES `atividades_os` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `entregas_epi_colaboradorId_fkey` FOREIGN KEY (`colaboradorId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `entregas_epi_epiId_fkey` FOREIGN KEY (`epiId`) REFERENCES `epis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `entregas_epi_osId_fkey` FOREIGN KEY (`osId`) REFERENCES `ordens_servico` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `entregas_epi_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `entregas_epi_separacaoId_fkey` FOREIGN KEY (`separacaoId`) REFERENCES `separacoes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas_epi`
--

LOCK TABLES `entregas_epi` WRITE;
/*!40000 ALTER TABLE `entregas_epi` DISABLE KEYS */;
/*!40000 ALTER TABLE `entregas_epi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `epis`
--

DROP TABLE IF EXISTS `epis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `epis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numeroCa` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dataValidade` datetime(3) DEFAULT NULL,
  `quantidade` decimal(12,3) NOT NULL DEFAULT '0.000',
  `quantidadeMinima` decimal(12,3) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `categoriaId` int DEFAULT NULL,
  `fornecedorId` int DEFAULT NULL,
  `localizacaoId` int DEFAULT NULL,
  `marcaId` int DEFAULT NULL,
  `subcategoriaId` int DEFAULT NULL,
  `corId` int DEFAULT NULL,
  `modelo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tamanhoId` int DEFAULT NULL,
  `unidadeMedidaId` int DEFAULT NULL,
  `numeroPatrimonio` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `epis_codigo_key` (`codigo`),
  KEY `epis_nome_idx` (`nome`),
  KEY `epis_categoriaId_idx` (`categoriaId`),
  KEY `epis_localizacaoId_fkey` (`localizacaoId`),
  KEY `epis_fornecedorId_fkey` (`fornecedorId`),
  KEY `epis_corId_idx` (`corId`),
  KEY `epis_tamanhoId_idx` (`tamanhoId`),
  KEY `epis_marcaId_fkey` (`marcaId`),
  KEY `epis_unidadeMedidaId_fkey` (`unidadeMedidaId`),
  KEY `epis_subcategoriaId_fkey` (`subcategoriaId`),
  CONSTRAINT `epis_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_epis` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `epis_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `cores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `epis_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `epis_localizacaoId_fkey` FOREIGN KEY (`localizacaoId`) REFERENCES `localizacoes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `epis_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `marcas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `epis_subcategoriaId_fkey` FOREIGN KEY (`subcategoriaId`) REFERENCES `subcategorias_epis` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `epis_tamanhoId_fkey` FOREIGN KEY (`tamanhoId`) REFERENCES `tamanhos_equipamentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `epis_unidadeMedidaId_fkey` FOREIGN KEY (`unidadeMedidaId`) REFERENCES `unidade_medida` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `epis`
--

LOCK TABLES `epis` WRITE;
/*!40000 ALTER TABLE `epis` DISABLE KEYS */;
INSERT INTO `epis` VALUES (36,'EPI-001','ACRÍLICO PARA PROTETOR FACIAL',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.806','2026-09-11 17:02:05.806',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(37,'EPI-002','BONÉ ARABE','39856',NULL,0.000,NULL,1,'2026-09-11 17:02:05.815','2026-09-11 17:02:05.815',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(38,'EPI-003','BOTA DE PVC',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.823','2026-09-11 17:02:05.823',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(39,'EPI-004','BOTINA DE SEGURANÇA C/ BIQUEIRA','28511',NULL,0.000,NULL,1,'2026-09-11 17:02:05.831','2026-09-11 17:02:05.831',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(40,'EPI-005','CALÇA EM PVC FORRADA',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.840','2026-09-11 17:02:05.840',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(41,'EPI-006','CALÇA JEANS',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.848','2026-09-11 17:02:05.848',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(42,'EPI-007','CAMISA',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.859','2026-09-11 17:02:05.859',NULL,2,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(43,'EPI-008','CAMISETA (DRYFIT – MANGA CURTA)',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.867','2026-09-11 17:02:05.867',NULL,8,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(44,'EPI-009','CAMISETA (DRYFIT – MANGA LONGA)',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.876','2026-09-11 17:02:05.876',NULL,8,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(45,'EPI-010','CAMISETA MALHA (MANGA CURTA)',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.886','2026-09-11 17:02:05.886',NULL,8,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(46,'EPI-011','CAMISETA MALHA (MANGA LONGA)',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.895','2026-09-11 17:02:05.895',NULL,8,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(47,'EPI-012','CAPA DE CHUVA PVC FORRADA',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.903','2026-09-11 17:02:05.903',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(48,'EPI-013','CAPACETE (PLASTICOR – MOD. ELT)','25883',NULL,0.000,NULL,1,'2026-09-11 17:02:05.914','2026-09-11 17:02:05.914',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(49,'EPI-014','CAPACETE (PLASTICOR – MOD. PLT)','31469',NULL,0.000,NULL,1,'2026-09-11 17:02:05.920','2026-09-11 17:02:05.920',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(50,'EPI-015','CARNEIRA',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.928','2026-09-11 17:02:05.928',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(51,'EPI-016','COLETE REFLETIVO',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.936','2026-09-11 17:02:05.936',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(52,'EPI-017','FILTRO PARA RESPIRADOR MIG',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.944','2026-09-11 17:02:05.944',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(53,'EPI-018','JALECO',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.952','2026-09-11 17:02:05.952',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(54,'EPI-019','JOELHEIRA DE PROTEÇÃO',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:05.959','2026-09-11 17:02:05.959',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,11,'60538'),(55,'EPI-020','LUVA NITRÍLICA','32069',NULL,0.000,NULL,1,'2026-09-11 17:02:05.967','2026-09-11 17:02:05.967',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,11,NULL),(56,'EPI-021','LUVA PRETA (MULTITÁTIL – VOLK)','30916',NULL,0.000,NULL,1,'2026-09-11 17:02:05.974','2026-09-11 17:02:05.974',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,11,NULL),(57,'EPI-022','LUVA PRETA (PU – MULTITÁTIL – IMBAT)','41761',NULL,0.000,NULL,1,'2026-09-11 17:02:05.983','2026-09-11 17:02:05.983',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,11,NULL),(58,'EPI-023','LUVA PRETA (PU – MULTITÁTIL – KALIPSO)','15272',NULL,0.000,NULL,1,'2026-09-11 17:02:05.991','2026-09-11 17:02:05.991',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,11,NULL),(59,'EPI-024','LUVA VAQUETA','17074',NULL,0.000,NULL,1,'2026-09-11 17:02:06.000','2026-09-11 17:02:06.000',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,11,NULL),(60,'EPI-025','LUVA VAQUETA LONGA','36845',NULL,0.000,NULL,1,'2026-09-11 17:02:06.007','2026-09-11 17:02:06.007',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,11,NULL),(61,'EPI-026','MÁSCARA PFFII','38503',NULL,0.000,NULL,1,'2026-09-11 17:02:06.015','2026-09-11 17:02:06.015',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(62,'EPI-027','MÁSCARA PFFIII',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:06.020','2026-09-11 17:02:06.020',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(63,'EPI-028','ÓCULOS DE PROTEÇÃO ESCURO (MEDIX)','48553',NULL,0.000,NULL,1,'2026-09-11 17:02:06.027','2026-09-11 17:02:06.027',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(64,'EPI-029','ÓCULOS DE PROTEÇÃO ESCURO (VVISION 100 - VOLK)','42716',NULL,0.000,NULL,1,'2026-09-11 17:02:06.035','2026-09-11 17:02:06.035',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(66,'EPI-031','ÓCULOS DE PROTEÇÃO TRANSPARENTE (MEDIX)','48553',NULL,0.000,NULL,1,'2026-09-11 17:02:06.050','2026-09-11 17:02:06.050',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(67,'EPI-032','ÓCULOS DE PROTEÇÃO TRANSPARENTE (VVISION 100 - VOLK)','42716',NULL,0.000,NULL,1,'2026-09-11 17:02:06.063','2026-09-11 17:02:06.063',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(69,'EPI-034','PROTETOR AUDITIVO','14470',NULL,0.000,NULL,1,'2026-09-11 17:02:06.094','2026-09-11 17:02:06.094',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(70,'EPI-035','PROTETOR AURICULAR TIPO CONCHA (ABAFADOR – KALIPSO – K40)','16050',NULL,0.000,NULL,1,'2026-09-11 17:02:06.108','2026-09-11 17:02:06.108',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(71,'EPI-036','PROTETOR FACIAL INCOLOR',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:06.119','2026-09-11 17:02:06.119',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(72,'EPI-037','PROTETOR LOMBAR',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:06.132','2026-09-11 17:02:06.132',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(73,'EPI-038','PROTETOR SOLAR',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:06.143','2026-09-11 17:02:06.143',NULL,6,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(74,'EPI-039','RESPIRADOR PURIFICADOR (MIG 11 VO – DESTRA)','37393',NULL,0.000,NULL,1,'2026-09-11 17:02:06.153','2026-09-11 17:02:06.153',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(75,'EPI-040','RESPIRADOR PURIFICADOR (MIG 12 VO – DESTRA)','27999',NULL,0.000,NULL,1,'2026-09-11 17:02:06.166','2026-09-11 17:02:06.166',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(76,'EPI-041','RESPIRADOR/PURIFICADOR (MIG – MASTT - ALLTEC)','33596',NULL,0.000,NULL,1,'2026-09-11 17:02:06.179','2026-09-11 17:02:06.179',NULL,12,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL),(77,'EPI-042','TRAVA-QUEDAS',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:06.192','2026-09-11 17:02:06.192',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,'175'),(79,'EPI-044','TRAVA-QUEDAS (PARA CABO DE AÇO)',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:06.219','2026-09-11 17:02:06.219',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,'25'),(83,'EPI-048','TRAVA-QUEDAS (PARA CORDA - BRANCO)',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:06.264','2026-09-11 17:02:06.264',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,'6'),(84,'EPI-049','TRAVA-QUEDAS (PARA CORDA - RETRÁTIL)',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:06.278','2026-09-11 17:02:06.278',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,'259'),(87,'EPI-052','TRAVA-QUEDAS (PARA CORDA)',NULL,NULL,0.000,NULL,1,'2026-09-11 17:02:06.310','2026-09-11 17:02:06.310',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,'177');
/*!40000 ALTER TABLE `epis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipamentos`
--

DROP TABLE IF EXISTS `equipamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numeroPatrimonio` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modelo` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numeroSerie` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marcaId` int DEFAULT NULL,
  `categoriaId` int DEFAULT NULL,
  `subcategoriaId` int DEFAULT NULL,
  `localizacaoId` int DEFAULT NULL,
  `fornecedorId` int DEFAULT NULL,
  `statusId` int NOT NULL,
  `estadoConservacaoId` int DEFAULT NULL,
  `responsavelId` int DEFAULT NULL,
  `dataAquisicao` datetime(3) DEFAULT NULL,
  `valorAquisicao` decimal(12,2) DEFAULT NULL,
  `dataGarantia` datetime(3) DEFAULT NULL,
  `observacoes` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `unidadeMedidaId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `equipamentos_codigo_key` (`codigo`),
  KEY `equipamentos_statusId_idx` (`statusId`),
  KEY `equipamentos_categoriaId_idx` (`categoriaId`),
  KEY `equipamentos_descricao_idx` (`descricao`),
  KEY `equipamentos_subcategoriaId_fkey` (`subcategoriaId`),
  KEY `equipamentos_localizacaoId_fkey` (`localizacaoId`),
  KEY `equipamentos_fornecedorId_fkey` (`fornecedorId`),
  KEY `equipamentos_estadoConservacaoId_fkey` (`estadoConservacaoId`),
  KEY `equipamentos_responsavelId_fkey` (`responsavelId`),
  KEY `equipamentos_marcaId_fkey` (`marcaId`),
  KEY `equipamentos_unidadeMedidaId_fkey` (`unidadeMedidaId`),
  CONSTRAINT `equipamentos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_equipamentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `equipamentos_estadoConservacaoId_fkey` FOREIGN KEY (`estadoConservacaoId`) REFERENCES `estados_conservacao` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `equipamentos_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `equipamentos_localizacaoId_fkey` FOREIGN KEY (`localizacaoId`) REFERENCES `localizacoes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `equipamentos_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `marcas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `equipamentos_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `equipamentos_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `status_equipamentos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `equipamentos_subcategoriaId_fkey` FOREIGN KEY (`subcategoriaId`) REFERENCES `subcategorias_equipamentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `equipamentos_unidadeMedidaId_fkey` FOREIGN KEY (`unidadeMedidaId`) REFERENCES `unidade_medida` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipamentos`
--

LOCK TABLES `equipamentos` WRITE;
/*!40000 ALTER TABLE `equipamentos` DISABLE KEYS */;
INSERT INTO `equipamentos` VALUES (1,'EQP-001','475.1','EXTENSÃO','Branca',NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.185','2026-08-25 21:10:15.798',NULL),(2,'EQP-002',NULL,'EXTENSÃO (BRANCA - 17METROS)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.196','2026-08-25 17:03:41.196',NULL),(3,'EQP-003',NULL,'RÉGUA DE PEDREIRO',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.202','2026-08-25 17:03:41.202',NULL),(4,'EQP-004',NULL,'ESMERILHADEIRA/LIXADEIRA','220V',NULL,26,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.208','2026-08-25 17:03:41.208',NULL),(5,'EQP-005',NULL,'SOPRADOR/ASPIRADOR MECÂNICO DE AR','600W/127V',NULL,23,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.216','2026-08-25 17:03:41.216',NULL),(7,'EQP-007',NULL,'MISTURADOR ELÉTRICO COM HASTE BATEDORA (ANTIGO)',NULL,NULL,NULL,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.237','2026-08-25 17:03:41.237',NULL),(8,'EQP-008',NULL,'EXTENSÃO (BRANCA)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.247','2026-08-25 17:03:41.247',NULL),(9,'EQP-009',NULL,'SOPRADOR TÉRMICO','127V',NULL,25,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.254','2026-08-25 17:03:41.254',NULL),(10,'EQP-010',NULL,'BOMBA D\'ÁGUA COM CONDUIT','AQUAMAK - PF1010 - 60HZ - 127V',NULL,22,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.266','2026-08-25 17:03:41.266',NULL),(11,'EQP-011',NULL,'ESPÁTULA 2 CM',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.278','2026-08-25 17:03:41.278',NULL),(12,'EQP-012',NULL,'MISTURADOR ELÉTRICO COM HASTE BATEDORA (NOVO)',NULL,NULL,NULL,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.284','2026-08-25 17:03:41.284',NULL),(13,'EQP-013',NULL,'CINTO DE SEGURANÇA','PRETO/LARANJA',NULL,18,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.293','2026-08-25 17:03:41.293',NULL),(14,'EQP-014',NULL,'CINTO DE SEGURANÇA (PRETO)',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.302','2026-08-25 17:03:41.302',NULL),(15,'EQP-015',NULL,'TALABARTE (SIMPLES)',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.309','2026-08-25 17:03:41.309',NULL),(16,'EQP-016',NULL,'CORDA',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.316','2026-08-25 17:03:41.316',NULL),(17,'EQP-017',NULL,'RÁDIO COMUNICADOR','HT - INTELBRAS - RC3002 G2',NULL,20,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.324','2026-08-25 17:03:41.324',NULL),(18,'EQP-018',NULL,'FURADEIRA',NULL,NULL,23,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.330','2026-08-25 17:03:41.330',NULL),(19,'EQP-019',NULL,'EXTENSÃO (GRANDE - CABO PP - PRETA - 12 METROS)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.341','2026-08-25 17:03:41.341',NULL),(20,'EQP-020',NULL,'EXTENSÃO (10 METROS)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.348','2026-08-25 17:03:41.348',NULL),(21,'EQP-021',NULL,'EXTENSÃO (PEQUENA)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.358','2026-08-25 17:03:41.358',NULL),(22,'EQP-022',NULL,'MARTELETE/MARTELO ROMPEDOR ROTATIVO','DSRH16 - COM CAIXA - 220V',NULL,19,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.364','2026-08-25 17:03:41.364',NULL),(23,'EQP-023',NULL,'SERRA MÁRMORE','127V',NULL,25,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.370','2026-08-25 17:03:41.370',NULL),(24,'EQP-024',NULL,'EXTENSÃO (DIVERSA)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.379','2026-08-25 17:03:41.379',NULL),(25,'EQP-025',NULL,'ESCADA (EXTENSIVA – 9 DEGRAUS)',NULL,NULL,NULL,11,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.389','2026-08-25 17:03:41.389',NULL),(26,'EQP-026',NULL,'COLHER DE PEDREIRO USADA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.396','2026-08-25 17:03:41.396',NULL),(27,'EQP-027',NULL,'RISCADOR DE FORMICA (NOVO)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.404','2026-08-25 17:03:41.404',NULL),(28,'EQP-028',NULL,'PÁ DE PEDREIRO',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.411','2026-08-25 17:03:41.411',NULL),(29,'EQP-029',NULL,'ENXADA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.422','2026-08-25 17:03:41.422',NULL),(30,'EQP-030',NULL,'CHIBANCA (HASTE DE FERRO)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.440','2026-08-25 17:03:41.440',NULL),(31,'EQP-031',NULL,'GUINCHO (VERMELHO - 220)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.449','2026-08-25 17:03:41.449',NULL),(32,'EQP-032',NULL,'CAVADEIRA (01 FACE - RETA)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.455','2026-08-25 17:03:41.455',NULL),(33,'EQP-033',NULL,'CORDA DE RAPEL (TIPO BOMBEIRO)',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.464','2026-08-25 17:03:41.464',NULL),(34,'EQP-034',NULL,'SERROTE (22\" - PRATA)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.480','2026-08-25 17:03:41.480',NULL),(35,'EQP-035',NULL,'MANGUEIRA (NÍVEL)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.491','2026-08-25 17:03:41.491',NULL),(36,'EQP-036',NULL,'DESEMPENADEIRA USADA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.505','2026-08-25 17:03:41.505',NULL),(37,'EQP-037',NULL,'CARRETILHA (SIMPLES - PEQUENA)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.511','2026-08-25 17:03:41.511',NULL),(38,'EQP-038',NULL,'ESQUADRO',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.516','2026-08-25 17:03:41.516',NULL),(39,'EQP-039',NULL,'TESOURA (ESCRITÓRIO)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.521','2026-08-25 17:03:41.521',NULL),(40,'EQP-040',NULL,'CARRINHO (PEDREIRO)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.533','2026-08-25 17:03:41.533',NULL),(41,'EQP-041',NULL,'TELA (TIPO: VÉU)',NULL,NULL,NULL,14,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.547','2026-08-25 17:03:41.547',NULL),(42,'EQP-042',NULL,'DESEMPENADEIRA 18 X 30',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.559','2026-08-25 17:03:41.559',NULL),(43,'EQP-043',NULL,'MARTELETE',NULL,NULL,NULL,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.565','2026-08-25 17:03:41.565',NULL),(44,'EQP-044',NULL,'BOMBA D\'ÁGUA','AQUAMAK PF 1010 - 127V - NOVA',NULL,22,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.575','2026-08-25 17:03:41.575',NULL),(45,'EQP-045',NULL,'EXTENSÃO (PRETA)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.581','2026-08-25 17:03:41.581',NULL),(46,'EQP-046',NULL,'TALABARTE (DUPLO \"Y\")',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.590','2026-08-25 17:03:41.590',NULL),(47,'EQP-047',NULL,'CINTO DE SEGURANÇA (CINZA)',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.596','2026-08-25 17:03:41.596',NULL),(48,'EQP-048',NULL,'TALABARTE',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.604','2026-08-25 17:03:41.604',NULL),(49,'EQP-049',NULL,'ESCADA (4 DEGRAUS)',NULL,NULL,NULL,11,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.611','2026-08-25 17:03:41.611',NULL),(50,'EQP-050',NULL,'MARTELO',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.619','2026-08-25 17:03:41.619',NULL),(51,'EQP-051',NULL,'MARTELETE/FURADEIRA (PEQUENO)',NULL,NULL,NULL,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.623','2026-08-25 17:03:41.623',NULL),(52,'EQP-052',NULL,'CHAVE DE FENDA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.630','2026-08-25 17:03:41.630',NULL),(53,'EQP-053',NULL,'ESCADA (GRANDE)',NULL,NULL,NULL,11,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.640','2026-08-25 17:03:41.640',NULL),(54,'EQP-054',NULL,'DESEMPENADEIRA DENTADA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.648','2026-08-25 17:03:41.648',NULL),(55,'EQP-055',NULL,'REFLETOR DE LED (PRETO)',NULL,NULL,NULL,14,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.658','2026-08-25 17:03:41.658',NULL),(56,'EQP-056',NULL,'SARGENTO (PARA ANCORAGEM)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.665','2026-08-25 17:03:41.665',NULL),(57,'EQP-057',NULL,'ESCADA (SANFONADA – RETRATIL – 12 DEGRAUS)',NULL,NULL,NULL,11,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.672','2026-08-25 17:03:41.672',NULL),(58,'EQP-058',NULL,'EXTENSÃO (PRETA - GRANDE - 2 X 1,5MM² - 36 METROS)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.678','2026-08-25 17:03:41.678',NULL),(59,'EQP-059',NULL,'GLP P13 (GÁS DE COZINHA)',NULL,NULL,NULL,14,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.686','2026-08-25 17:03:41.686',NULL),(60,'EQP-060',NULL,'TORQUÊS',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.700','2026-08-25 17:03:41.700',NULL),(61,'EQP-061',NULL,'CALDEIRA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.709','2026-08-25 17:03:41.709',NULL),(62,'EQP-062',NULL,'FOGAREIRO',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.716','2026-08-25 17:03:41.716',NULL),(63,'EQP-063',NULL,'ESCADA (FERRO – 12/24 DEGRAUS)',NULL,NULL,NULL,11,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.724','2026-08-25 17:03:41.724',NULL),(64,'EQP-064',NULL,'CARRINHO (CARGA)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.736','2026-08-25 17:03:41.736',NULL),(65,'EQP-065',NULL,'CINTO DE SEGURANÇA (CINZA/PRETO)',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.746','2026-08-25 17:03:41.746',NULL),(66,'EQP-066',NULL,'LAVADORA DE ALTA PRESSÃO',NULL,NULL,21,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.754','2026-08-25 17:03:41.754',NULL),(67,'EQP-067',NULL,'CORDA (09 METROS)',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.762','2026-08-25 17:03:41.762',NULL),(68,'EQP-068',NULL,'MANGUEIRA DE JARDIM',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.769','2026-08-25 17:03:41.769',NULL),(69,'EQP-069',NULL,'LIXADEIRA (ORBITAL)',NULL,NULL,NULL,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.775','2026-08-25 17:03:41.775',NULL),(70,'EQP-070',NULL,'MARTELETE/FURADEIRA','USK',NULL,24,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.780','2026-08-25 17:03:41.780',NULL),(71,'EQP-071',NULL,'MISTURADOR',NULL,NULL,NULL,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.786','2026-08-25 17:03:41.786',NULL),(72,'EQP-072',NULL,'COLHER DE PEDREIRO 8\"',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.798','2026-08-25 17:03:41.798',NULL),(73,'EQP-073',NULL,'CADEIRINHA MANUAL',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.805','2026-08-25 17:03:41.805',NULL),(74,'EQP-074',NULL,'CABO DE AÇO',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.819','2026-08-25 17:03:41.819',NULL),(75,'EQP-075',NULL,'PRESILHA/CASTANHA PARA CABO DE AÇO',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.827','2026-08-25 17:03:41.827',NULL),(76,'EQP-076',NULL,'CORDA (PEDAÇO)',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.834','2026-08-25 17:03:41.834',NULL),(77,'EQP-077',NULL,'ESCADA (ARTICULADA – ALUMÍNIO – 4X4 DEGRAUS)',NULL,NULL,NULL,11,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.840','2026-08-25 17:03:41.840',NULL),(78,'EQP-078',NULL,'APLICADOR PROFISSIONAL (FLEX PU - DUPLA - MISTURADOR)',NULL,NULL,NULL,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.851','2026-08-25 17:03:41.851',NULL),(79,'EQP-079',NULL,'ESPÁTULA LIMPADORA (RASPADOR)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.858','2026-08-25 17:03:41.858',NULL),(80,'EQP-080',NULL,'TRENA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.863','2026-08-25 17:03:41.863',NULL),(81,'EQP-081',NULL,'MARRETA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.868','2026-08-25 17:03:41.868',NULL),(82,'EQP-082',NULL,'COLHER DE PEDREIRO',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.874','2026-08-25 17:03:41.874',NULL),(83,'EQP-083',NULL,'ESPÁTULA DE ACABAMENTO (KIT)',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.880','2026-08-25 17:03:41.880',NULL),(84,'EQP-084',NULL,'APLICADOR PROFISSIONAL (FLEX PU)',NULL,NULL,NULL,9,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.885','2026-08-25 17:03:41.885',NULL),(85,'EQP-085',NULL,'ESPÁTULA 6 CM',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.894','2026-08-25 17:03:41.894',NULL),(86,'EQP-086',NULL,'TAMBOR',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.905','2026-08-25 17:03:41.905',NULL),(87,'EQP-087',NULL,'FACA Nº 8',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.911','2026-08-25 17:03:41.911',NULL),(88,'EQP-088',NULL,'PENEIRA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.929','2026-08-25 17:03:41.929',NULL),(89,'EQP-089',NULL,'JOGO DE CHAVE COMBINADA (Nº 06 À 17 - 10 PEÇAS)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.944','2026-08-25 17:03:41.944',NULL),(90,'EQP-090',NULL,'TALHADEIRA (NOVA)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.954','2026-08-25 17:03:41.954',NULL),(91,'EQP-091',NULL,'TALHADEIRA (MARTELETE)',NULL,NULL,NULL,12,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.963','2026-08-25 17:03:41.963',NULL),(92,'EQP-092',NULL,'VASSOURA',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.970','2026-08-25 17:03:41.970',NULL),(93,'EQP-093',NULL,'JOGO CHAVE ALLEN',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.978','2026-08-25 17:03:41.978',NULL),(94,'EQP-094',NULL,'EXTENSÃO PARA CADEIRINHA',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.987','2026-08-25 17:03:41.987',NULL),(95,'EQP-095',NULL,'CADEIRINHA ELÉTRICA',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:41.995','2026-08-25 17:03:41.995',NULL),(96,'EQP-096',NULL,'CENTRAL DE COMANDO',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:42.005','2026-08-25 17:03:42.005',NULL),(97,'EQP-097',NULL,'MARRETA (1 KG)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:42.016','2026-08-25 17:03:42.016',NULL),(98,'EQP-098',NULL,'MARRETA (1KG)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:42.034','2026-08-25 17:03:42.034',NULL),(99,'EQP-099',NULL,'VENTILADOR',NULL,NULL,NULL,14,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:42.046','2026-08-25 17:03:42.046',NULL),(100,'EQP-100',NULL,'ESTILETE',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:42.058','2026-08-25 17:03:42.058',NULL),(101,'EQP-101',NULL,'RÉGUA',NULL,NULL,NULL,15,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:42.071','2026-08-25 17:03:42.071',NULL),(102,'EQP-102',NULL,'BALANCIM (COMPLETO: Base/laterais/Afastadores/Cabos de aço/castanhas/parafusos/motores/Central)',NULL,NULL,NULL,10,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:42.080','2026-08-25 17:03:42.080',NULL),(103,'EQP-103',NULL,'ESCADA',NULL,NULL,NULL,11,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:42.092','2026-08-25 17:03:42.092',NULL),(104,'EQP-104',NULL,'TALHADEIRA (USADA)',NULL,NULL,NULL,13,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-08-25 17:03:42.102','2026-08-25 17:03:42.102',NULL),(105,'EQP-105',NULL,'ALICATE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(106,'EQP-106',NULL,'ARCO DE SERRA MANUAL',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(107,'EQP-107',NULL,'APLICADOR DE FLEX PU',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(108,'EQP-108',NULL,'ASPIRADOR DE PÓ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(109,'EQP-109',NULL,'BOMBA D\'ÁGUA COM CONDUIT (KARCHER)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(110,'EQP-110',NULL,'BOMBA D\'ÁGUA COM CONDUIT (SAPO - CINZA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(111,'EQP-111',NULL,'CABO DE BATERIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(112,'EQP-112',NULL,'CAIXA DE CHAVES COMBINADAS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(113,'EQP-113',NULL,'CAVALETE (04)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(114,'EQP-114',NULL,'CINTO DE SEGURANÇA (LARANJA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(115,'EQP-115',NULL,'CONE DE SINALIZAÇÃO (LARANJA E PRETO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(116,'EQP-116',NULL,'CONE DE SINALIZAÇÃO (PRETO E AMARELO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(117,'EQP-117',NULL,'CORDA (12 METROS)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(118,'EQP-118',NULL,'CORDA (16 METROS)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(119,'EQP-119',NULL,'CORDA (23 METROS)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(120,'EQP-120',NULL,'CORDA (29 METROS)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(121,'EQP-121',NULL,'CORTADOR DE PISOS E AZULEJOS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(122,'EQP-122',NULL,'ESCADA ANDAIME (12 DEGRAUS - VERMELHA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(123,'EQP-123',NULL,'ESCADA ANDAIME (16 DEGRAUS - AZUL)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(124,'EQP-124',NULL,'ESCADA DE ALUMÍNIO (06 DEGRAUS - VERMELHA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(125,'EQP-125',NULL,'ESMERILHADEIRA (115MMS 4.1/2 600W M 09012 - 127V)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(126,'EQP-126',NULL,'ESMERILHADEIRA (125MMS 1050W M 9002B 127V)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(127,'EQP-127',NULL,'ESMERILHADEIRA (110V - MOTOMIL)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(128,'EQP-128',NULL,'ESTICADOR',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(129,'EQP-129',NULL,'ESTICADOR (CABO DE AÇO - GRANDE)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(130,'EQP-130',NULL,'ESTICADOR (CABO DE AÇO - MÉDIO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(131,'EQP-131',NULL,'EXTENSÃO (AZUL/AMARELA/VERDE)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(132,'EQP-132',NULL,'EXTENSÃO (BIXO MAÇARICO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(133,'EQP-133',NULL,'EXTENSÃO (LUMINÁRIA - 30 METROS)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(134,'EQP-134',NULL,'EXTENSÃO (VERDE/AMARELO - GRANDE)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(135,'EQP-135',NULL,'FURADEIRA (127V)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(136,'EQP-136',NULL,'FURADEIRA (BOSCH)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(137,'EQP-137',NULL,'FURADEIRA (DEWALT)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(138,'EQP-138',NULL,'IOIÔ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(139,'EQP-139',NULL,'KIT GÁS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(140,'EQP-140',NULL,'LAVADORA DE ALTA PRESSÃO (AP K330 MPLUS 220V - KARCHER)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(141,'EQP-141',NULL,'LAVADORA DE ALTA PRESSÃO (CINZA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(142,'EQP-142',NULL,'LAVADORA DE ALTA PRESSÃO (COM BICOS - VAP)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(143,'EQP-143',NULL,'LAVADORA DE ALTA PRESSÃO (K3 - K3.30 - KARCHER)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(144,'EQP-144',NULL,'LAVADORA DE ALTA PRESSÃO (VONDER)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(145,'EQP-145',NULL,'LIXADEIRA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(146,'EQP-146',NULL,'LIXADEIRA (220V - GRANDE - MAKITA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(147,'EQP-147',NULL,'LIXADEIRA (220V)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(148,'EQP-148',NULL,'LIXADEIRA (9\" - DEWALT)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(149,'EQP-149',NULL,'LIXADEIRA (DONG CHANG)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(150,'EQP-150',NULL,'LIXADEIRA (GWS 700)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(151,'EQP-151',NULL,'LIXADEIRA (M0921B - MAKITA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(152,'EQP-152',NULL,'LIXADEIRA (MAKITA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(153,'EQP-153',NULL,'LIXADEIRA (PEQUENA - MAKITA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(154,'EQP-154',NULL,'LIXADEIRA (WS4740 - WESCO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(155,'EQP-155',NULL,'LIXADEIRA (POLITRIZ)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(156,'EQP-156',NULL,'MAÇARICO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(157,'EQP-157',NULL,'MAÇARICO (AMARELO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(158,'EQP-158',NULL,'MAÇARICO (AZUL)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(159,'EQP-159',NULL,'MAÇARICO (AZUL/VERDE)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(160,'EQP-160',NULL,'MAÇARICO (VERDE/AZUL/VERMELHO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(161,'EQP-161',NULL,'MAÇARICO (VERMELHO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(162,'EQP-162',NULL,'MAÇARICO (VERMELHO/VERDE)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(163,'EQP-163',NULL,'MAKITA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(164,'EQP-164',NULL,'MAKITA (DEWALT)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(165,'EQP-165',NULL,'MARRETÃO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(166,'EQP-166',NULL,'MARTELETE (220V - GRANDE - MAKITA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(167,'EQP-167',NULL,'MARTELETE (DONG CHENG)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(168,'EQP-168',NULL,'MARTELETE (ELETROP)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(169,'EQP-169',NULL,'MARTELETE (GRANDE)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(170,'EQP-170',NULL,'MARTELETE (PEQUENO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(171,'EQP-171',NULL,'MARTELETE (USK)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(172,'EQP-172',NULL,'MARTELO (DONG CHENG DZG06-6S)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(173,'EQP-173',NULL,'MARTELO ROMPEDOR ROTATIVO (50/60HZ - 220V - 2KG - USK)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(174,'EQP-174',NULL,'MISTURADOR (ELÉTRICO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(175,'EQP-175',NULL,'MISTURADOR (GRANDE)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(176,'EQP-176',NULL,'MISTURADOR (PEQUENO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(177,'EQP-177',NULL,'SERRA MÁRMORE (MAKITA - VONDER)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(178,'EQP-178',NULL,'PARAFUSADEIRA DE IMPACTO (BATERIA - SEM FIO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(179,'EQP-179',NULL,'PEDESTAL',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(180,'EQP-180',NULL,'PICARETA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(181,'EQP-181',NULL,'PULVERIZADOR',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(182,'EQP-182',NULL,'PULVERIZADOR (02 LITROS - FUZIL)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(183,'EQP-183',NULL,'SECADOR',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(184,'EQP-184',NULL,'SERRA CIRCULAR (AMARELA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(185,'EQP-185',NULL,'SERRA (PARA MADEIRA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(186,'EQP-186',NULL,'TALABARTE (TIPO \"Y\")',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(187,'EQP-187',NULL,'TRANSFORMADOR',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(188,'EQP-188',NULL,'TRANSFORMADOR (ALUGADO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(189,'EQP-189',NULL,'TRAVA-QUEDAS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(190,'EQP-190',NULL,'TRAVA-QUEDAS (CORDA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(191,'EQP-191',NULL,'TRAVA-QUEDAS (CABO DE AÇO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(192,'EQP-192',NULL,'TRAVA-QUEDAS (CORDA - SEM GANCHO)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(193,'EQP-193',NULL,'PÁ (VANGA)',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(194,'EQP-194',NULL,'REFLETOR DE LED',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(195,'EQP-195',NULL,'EXTINTOR DE INCÊNDIO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL),(196,'EQP-196',NULL,'AFASTADOR PARA BALANCIM',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-02 20:30:53.000','2026-09-02 20:30:53.000',NULL);
/*!40000 ALTER TABLE `equipamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipes`
--

DROP TABLE IF EXISTS `equipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `osId` int NOT NULL,
  `liderId` int NOT NULL,
  `status` enum('PENDENTE','EM_EXECUCAO','CONCLUIDA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `criadoEm` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `equipes_osId_fkey` (`osId`),
  KEY `equipes_liderId_fkey` (`liderId`),
  CONSTRAINT `equipes_liderId_fkey` FOREIGN KEY (`liderId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `equipes_osId_fkey` FOREIGN KEY (`osId`) REFERENCES `ordens_servico` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipes`
--

LOCK TABLES `equipes` WRITE;
/*!40000 ALTER TABLE `equipes` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_conservacao`
--

DROP TABLE IF EXISTS `estados_conservacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_conservacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_conservacao`
--

LOCK TABLES `estados_conservacao` WRITE;
/*!40000 ALTER TABLE `estados_conservacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `estados_conservacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etapa_os_materiais`
--

DROP TABLE IF EXISTS `etapa_os_materiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etapa_os_materiais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `etapaOsId` int NOT NULL,
  `materialId` int NOT NULL,
  `quantidadePlanejada` decimal(12,3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `etapa_os_materiais_etapaOsId_materialId_key` (`etapaOsId`,`materialId`),
  KEY `etapa_os_materiais_materialId_idx` (`materialId`),
  CONSTRAINT `etapa_os_materiais_etapaOsId_fkey` FOREIGN KEY (`etapaOsId`) REFERENCES `etapas_os` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `etapa_os_materiais_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etapa_os_materiais`
--

LOCK TABLES `etapa_os_materiais` WRITE;
/*!40000 ALTER TABLE `etapa_os_materiais` DISABLE KEYS */;
/*!40000 ALTER TABLE `etapa_os_materiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etapas`
--

DROP TABLE IF EXISTS `etapas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etapas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordem` int NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etapas`
--

LOCK TABLES `etapas` WRITE;
/*!40000 ALTER TABLE `etapas` DISABLE KEYS */;
INSERT INTO `etapas` VALUES (1,'Preparação da superfície',1,1,'2026-08-12 22:00:47.688','2026-08-12 22:00:47.688'),(2,'Primeira camada',2,1,'2026-08-12 22:00:47.695','2026-08-12 22:00:47.695'),(3,'Segunda camada',3,1,'2026-08-12 22:00:47.704','2026-08-12 22:00:47.704'),(4,'Acabamento e inspeção',4,1,'2026-08-12 22:00:47.708','2026-08-12 22:00:47.708');
/*!40000 ALTER TABLE `etapas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etapas_os`
--

DROP TABLE IF EXISTS `etapas_os`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etapas_os` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordemServicoId` int NOT NULL,
  `etapaId` int NOT NULL,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordem` int NOT NULL DEFAULT '0',
  `status` enum('PENDENTE','EM_ANDAMENTO','CONCLUIDA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `dataFimReal` datetime DEFAULT NULL,
  `dataInicioReal` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `etapas_os_ordemServicoId_etapaId_key` (`ordemServicoId`,`etapaId`),
  KEY `etapas_os_etapaId_fkey` (`etapaId`),
  CONSTRAINT `etapas_os_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `etapas_os_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etapas_os`
--

LOCK TABLES `etapas_os` WRITE;
/*!40000 ALTER TABLE `etapas_os` DISABLE KEYS */;
/*!40000 ALTER TABLE `etapas_os` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fornecedores`
--

DROP TABLE IF EXISTS `fornecedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fornecedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnpj` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fornecedores_cnpj_key` (`cnpj`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fornecedores`
--

LOCK TABLES `fornecedores` WRITE;
/*!40000 ALTER TABLE `fornecedores` DISABLE KEYS */;
INSERT INTO `fornecedores` VALUES (1,'Atacadão Do Jeans',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(2,'Camisaria Italiana',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(3,'Centergeo',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(4,'Denver',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(5,'Distrimac',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(6,'Feruni',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(7,'Feruni Axton',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(8,'Hoda D',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(9,'Macfex',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(10,'Maccaferry',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(11,'Mc - Balchemie',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(12,'Mercantil',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(13,'Sachi',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(14,'Sika',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(15,'Soprema',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(16,'Viapol',NULL,NULL,NULL,1,'2026-09-02 20:52:01.000','2026-09-02 20:52:01.000'),(17,'Supermercado',NULL,NULL,NULL,1,'2026-09-11 17:35:25.335','2026-09-11 17:35:25.335'),(18,'Casa Duarte',NULL,NULL,NULL,1,'2026-09-11 17:35:25.345','2026-09-11 17:35:25.345'),(19,'Casa São Julião',NULL,NULL,NULL,1,'2026-09-11 17:35:25.354','2026-09-11 17:35:25.354'),(20,'Papelaria Real',NULL,NULL,NULL,1,'2026-09-11 17:35:25.368','2026-09-11 17:35:25.368'),(21,'União Agropecuária',NULL,NULL,NULL,1,'2026-09-11 17:35:25.377','2026-09-11 17:35:25.377'),(22,'Centergel',NULL,NULL,NULL,1,'2026-09-11 17:35:25.386','2026-09-11 17:35:25.386'),(23,'Irmão Almeida',NULL,NULL,NULL,1,'2026-09-11 17:35:25.397','2026-09-11 17:35:25.397'),(24,'Casa das Embalagens',NULL,NULL,NULL,1,'2026-09-11 17:35:25.407','2026-09-11 17:35:25.407'),(25,'Ernetex',NULL,NULL,NULL,1,'2026-09-11 17:35:25.415','2026-09-11 17:35:25.415');
/*!40000 ALTER TABLE `fornecedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fotos_visitas`
--

DROP TABLE IF EXISTS `fotos_visitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fotos_visitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visitaId` int NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `fotos_visitas_visitaId_fkey` (`visitaId`),
  CONSTRAINT `fotos_visitas_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `visitas_tecnicas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fotos_visitas`
--

LOCK TABLES `fotos_visitas` WRITE;
/*!40000 ALTER TABLE `fotos_visitas` DISABLE KEYS */;
/*!40000 ALTER TABLE `fotos_visitas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historicos_posicao`
--

DROP TABLE IF EXISTS `historicos_posicao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historicos_posicao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordemServicoId` int NOT NULL,
  `lat` decimal(10,7) NOT NULL,
  `lng` decimal(10,7) NOT NULL,
  `registradoEm` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `historicos_posicao_ordemServicoId_idx` (`ordemServicoId`),
  CONSTRAINT `historicos_posicao_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historicos_posicao`
--

LOCK TABLES `historicos_posicao` WRITE;
/*!40000 ALTER TABLE `historicos_posicao` DISABLE KEYS */;
/*!40000 ALTER TABLE `historicos_posicao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lancamentos_financeiros`
--

DROP TABLE IF EXISTS `lancamentos_financeiros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lancamentos_financeiros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('ENTRADA','SAIDA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `data` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `categoria` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formaPagamento` enum('DINHEIRO','PIX','CARTAO_CREDITO','CARTAO_DEBITO','BOLETO','TRANSFERENCIA') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `origem` enum('PAGAMENTO','COMPRA','ADITIVO','AJUSTE','OUTRO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AJUSTE',
  `origemId` int DEFAULT NULL,
  `criadoPorId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `lancamentos_financeiros_data_idx` (`data`),
  KEY `lancamentos_financeiros_criadoPorId_fkey` (`criadoPorId`),
  CONSTRAINT `lancamentos_financeiros_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lancamentos_financeiros`
--

LOCK TABLES `lancamentos_financeiros` WRITE;
/*!40000 ALTER TABLE `lancamentos_financeiros` DISABLE KEYS */;
/*!40000 ALTER TABLE `lancamentos_financeiros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `localizacoes`
--

DROP TABLE IF EXISTS `localizacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `localizacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `localizacoes`
--

LOCK TABLES `localizacoes` WRITE;
/*!40000 ALTER TABLE `localizacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `localizacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manutencoes`
--

DROP TABLE IF EXISTS `manutencoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manutencoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipamentoId` int NOT NULL,
  `tipoId` int NOT NULL,
  `data` datetime(3) NOT NULL,
  `descricao` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `custo` decimal(12,2) DEFAULT NULL,
  `status` enum('PENDENTE','EM_ANDAMENTO','CONCLUIDA','CANCELADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `responsavelManutencaoId` int DEFAULT NULL,
  `proximaManutencao` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `manutencoes_equipamentoId_idx` (`equipamentoId`),
  KEY `manutencoes_status_idx` (`status`),
  KEY `manutencoes_tipoId_fkey` (`tipoId`),
  KEY `manutencoes_responsavelManutencaoId_fkey` (`responsavelManutencaoId`),
  CONSTRAINT `manutencoes_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `manutencoes_responsavelManutencaoId_fkey` FOREIGN KEY (`responsavelManutencaoId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `manutencoes_tipoId_fkey` FOREIGN KEY (`tipoId`) REFERENCES `tipos_manutencao` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manutencoes`
--

LOCK TABLES `manutencoes` WRITE;
/*!40000 ALTER TABLE `manutencoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `manutencoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas`
--

DROP TABLE IF EXISTS `marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marcas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas`
--

LOCK TABLES `marcas` WRITE;
/*!40000 ALTER TABLE `marcas` DISABLE KEYS */;
INSERT INTO `marcas` VALUES (1,'DENVER',1,10,'2026-08-25 15:34:36.702','2026-08-25 15:34:36.702'),(2,'DOW',1,11,'2026-08-25 15:34:36.708','2026-08-25 15:34:36.708'),(3,'TRAMONTINA',1,12,'2026-08-25 15:34:36.714','2026-08-25 15:34:36.714'),(4,'TIGRE',1,13,'2026-08-25 15:34:36.724','2026-08-25 15:34:36.724'),(5,'MACFLEX',1,14,'2026-08-25 15:34:36.732','2026-08-25 15:34:36.732'),(6,'PROXPUR',1,15,'2026-08-25 15:34:36.740','2026-08-25 15:34:36.740'),(7,'RECUBRIPLAST',1,16,'2026-08-25 15:34:36.747','2026-08-25 15:34:36.747'),(8,'COMPEL',1,17,'2026-08-25 15:34:36.755','2026-08-25 15:34:36.755'),(9,'KALIPSO',1,1,'2026-08-25 15:34:37.463','2026-08-25 15:34:37.463'),(10,'MIG',1,2,'2026-08-25 15:34:37.472','2026-08-25 15:34:37.472'),(11,'PLASTICOR',1,3,'2026-08-25 15:34:37.478','2026-08-25 15:34:37.478'),(12,'MULTITÁTIL',1,4,'2026-08-25 15:34:37.484','2026-08-25 15:34:37.484'),(13,'VOLK',1,5,'2026-08-25 15:34:37.492','2026-08-25 15:34:37.492'),(14,'IMBAT',1,6,'2026-08-25 15:34:37.499','2026-08-25 15:34:37.499'),(15,'VAQUETA',1,7,'2026-08-25 15:34:37.506','2026-08-25 15:34:37.506'),(16,'VISION',1,8,'2026-08-25 15:34:37.513','2026-08-25 15:34:37.513'),(17,'DESTRA',1,9,'2026-08-25 15:34:37.520','2026-08-25 15:34:37.520'),(18,'BOLDRIÊ',1,21,'2026-08-25 17:03:41.056','2026-08-25 17:03:41.056'),(19,'DESOON',1,22,'2026-08-25 17:03:41.064','2026-08-25 17:03:41.064'),(20,'INTELBRAS',1,23,'2026-08-25 17:03:41.073','2026-08-25 17:03:41.073'),(21,'KARCHER',1,24,'2026-08-25 17:03:41.081','2026-08-25 17:03:41.081'),(22,'MAKITA',1,25,'2026-08-25 17:03:41.090','2026-08-25 17:03:41.090'),(23,'STANLEY',1,26,'2026-08-25 17:03:41.095','2026-08-25 17:03:41.095'),(24,'USK',1,27,'2026-08-25 17:03:41.100','2026-08-25 17:03:41.100'),(25,'VONDER',1,28,'2026-08-25 17:03:41.104','2026-08-25 17:03:41.104'),(26,'WESCO',1,29,'2026-08-25 17:03:41.108','2026-08-25 17:03:41.108');
/*!40000 ALTER TABLE `marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materiais`
--

DROP TABLE IF EXISTS `materiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materiais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('MATERIAL','EQUIPAMENTO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MATERIAL',
  `quantidadeMinima` decimal(12,3) DEFAULT NULL,
  `custoUnitario` decimal(12,2) DEFAULT NULL,
  `status` enum('ATIVO','INATIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ATIVO',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `corId` int DEFAULT NULL,
  `marcaId` int DEFAULT NULL,
  `modelo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unidadeId` int NOT NULL,
  `categoriaId` int DEFAULT NULL,
  `fornecedorId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `materiais_nome_idx` (`nome`),
  KEY `materiais_marcaId_idx` (`marcaId`),
  KEY `materiais_corId_idx` (`corId`),
  KEY `materiais_unidadeId_fkey` (`unidadeId`),
  KEY `materiais_categoriaId_idx` (`categoriaId`),
  KEY `materiais_fornecedorId_idx` (`fornecedorId`),
  CONSTRAINT `materiais_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_materiais` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `materiais_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `cores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `materiais_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `materiais_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `marcas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `materiais_unidadeId_fkey` FOREIGN KEY (`unidadeId`) REFERENCES `unidade_medida` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=599 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materiais`
--

LOCK TABLES `materiais` WRITE;
/*!40000 ALTER TABLE `materiais` DISABLE KEYS */;
INSERT INTO `materiais` VALUES (1,'Manta asfáltica','MATERIAL',100.000,18.50,'ATIVO','2026-08-12 22:02:59.702','2026-08-12 22:02:59.702',NULL,NULL,NULL,4,NULL,NULL),(2,'Primer asfáltico','MATERIAL',20.000,32.00,'ATIVO','2026-08-12 22:02:59.717','2026-08-12 22:02:59.717',NULL,NULL,NULL,27,NULL,NULL),(3,'Massa asfáltica','MATERIAL',50.000,12.90,'ATIVO','2026-08-12 22:02:59.727','2026-08-12 22:02:59.727',NULL,NULL,NULL,2,NULL,NULL),(4,'Geotêxtil','MATERIAL',100.000,9.80,'ATIVO','2026-08-12 22:02:59.737','2026-08-12 22:02:59.737',NULL,NULL,NULL,4,NULL,NULL),(5,'Tela de poliéster','MATERIAL',100.000,7.50,'ATIVO','2026-08-12 22:02:59.758','2026-08-12 22:02:59.758',NULL,NULL,NULL,4,NULL,NULL),(6,'Impermeabilizante acrílico','MATERIAL',20.000,220.00,'ATIVO','2026-08-12 22:02:59.792','2026-08-12 22:02:59.792',NULL,NULL,NULL,18,NULL,NULL),(7,'Selante PU','MATERIAL',24.000,45.00,'ATIVO','2026-08-12 22:02:59.818','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(10,'ALSAN','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.494','2026-08-25 16:01:28.243',NULL,NULL,NULL,2,NULL,NULL),(11,'APLICADOR DE MASSA','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.510','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(12,'AREIA (GROSSA)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.524','2026-08-25 15:30:35.524',NULL,NULL,NULL,2,NULL,NULL),(13,'ARGAMASSA','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.538','2026-08-25 15:30:35.538',NULL,NULL,NULL,2,NULL,NULL),(14,'BALDE','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.551','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(16,'BROCA 6\"','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.573','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(17,'BROCHA RETANGULAR','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.586','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(20,'CIMENTO','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.618','2026-08-25 15:30:35.618',NULL,NULL,NULL,2,NULL,NULL),(21,'CONE DE PLÁSTICO','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.629','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(27,'DENVER MANTA PRIMER ACQUA 18L','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.712','2026-08-25 17:03:40.882',NULL,1,'MANTA PRIMER ACQUA',27,NULL,NULL),(29,'DENVER TEC','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.740','2026-08-25 17:03:40.916',NULL,1,'TEC',2,NULL,NULL),(35,'DESENGRIPANTE','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:35.816','2026-08-25 15:30:35.816',NULL,NULL,NULL,27,NULL,NULL),(55,'HP ELASTIC','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.084','2026-08-25 15:30:36.084',NULL,NULL,'ELASTIC',2,NULL,NULL),(56,'IMPER MANTA COR 3 MM','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.095','2026-08-25 15:30:36.095',NULL,NULL,'COR 3MM',4,NULL,NULL),(57,'IMPER MANTA LAJE PP 3MM','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.106','2026-08-25 15:30:36.106',NULL,NULL,'LAJE PP 3MM',4,NULL,NULL),(59,'IMPER MANTA TELHADO AL','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.128','2026-08-25 15:30:36.128',NULL,NULL,'TELHADO AL',4,NULL,NULL),(64,'MANGUEIRA 5\"','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.188','2026-08-25 15:30:36.188',NULL,NULL,NULL,16,NULL,NULL),(65,'MANTA (FITA 10 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.199','2026-08-25 15:30:36.199',NULL,NULL,NULL,16,NULL,NULL),(66,'MANTA (FITA 90 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.210','2026-08-25 15:30:36.210',NULL,NULL,NULL,16,NULL,NULL),(69,'MASSA ACRÍLICA','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.255','2026-08-25 15:30:36.255',NULL,NULL,NULL,2,NULL,NULL),(70,'MASSA ASFÁLTICA (GRANDE - BETUME)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.266','2026-08-25 15:30:36.266',NULL,NULL,NULL,2,NULL,NULL),(71,'MASSA CORRIDA (BALDE)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.279','2026-08-25 15:30:36.279',NULL,NULL,NULL,2,NULL,NULL),(79,'PU 40','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.368','2026-08-25 15:30:36.368',NULL,NULL,NULL,2,NULL,NULL),(80,'PU200','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.376','2026-08-25 15:30:36.376',NULL,NULL,NULL,2,NULL,NULL),(81,'TINTA','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.390','2026-08-25 15:30:36.390',NULL,NULL,NULL,18,NULL,NULL),(82,'ROLO DE ESPUMA (TAM: 5 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.404','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(85,'ROLO DE ESPUMA (TAM: 9 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.437','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(87,'ROLO DE LÃ (TAM: 05 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.459','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(88,'ROLO DE LÃ (TAM: 09 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.471','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(89,'ROLO DE LÃ (TAM: 15 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.482','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(90,'ROLO DE LÃ (TAM: 23 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.500','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(91,'ROLO DE LÃ (TAM: 9 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.510','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(93,'SELANTE MS 426 (BRANCO)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.539','2026-09-11 17:48:18.140',NULL,NULL,'MS 426',10,NULL,NULL),(94,'SELANTE MS 426 (CINZA)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.548','2026-09-11 17:48:18.140',NULL,NULL,'MS 426',10,NULL,NULL),(95,'SELANTE MS 426 (PRETO)','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.557','2026-09-11 17:48:18.140',NULL,NULL,'MS 426',10,NULL,NULL),(98,'TÁBUA','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.596','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(99,'TEC100','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.608','2026-08-25 15:30:36.608',NULL,NULL,'TEC 100',2,NULL,NULL),(100,'TEC540','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.618','2026-08-25 15:30:36.618',NULL,NULL,'TEC 540',2,NULL,NULL),(101,'TELA POLIÉSTER 1X1 – ROLO: 50 M','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.643','2026-08-25 15:30:36.643',NULL,NULL,NULL,16,NULL,NULL),(102,'THINNER','MATERIAL',NULL,NULL,'ATIVO','2026-08-25 15:30:36.655','2026-08-25 15:30:36.655',NULL,NULL,NULL,27,NULL,NULL),(103,'ABRE TRINCAS','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-14 21:38:30.574',NULL,NULL,NULL,10,NULL,NULL),(104,'Aplicador Doméstico','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(105,'Aplicador Stafer Profissional','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(106,'Axton Manta Aliquida','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(107,'Brocha Ret. Madeira Max','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(108,'Brocha Ret. Tigre','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(109,'Camisa Drenante','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(110,'Contra Umidade (Similar Imper1)','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(111,'Df 9 Cinza 12Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(112,'Denver Antimoho 12K','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(113,'Denver Antimoho 4K','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(114,'Denver Cal 1L','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(115,'Denver Cal 3,6','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(116,'Denver Cal 18 Lts','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(117,'Denver Cal 200 Lts','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(118,'Denver Camada Separadora','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(119,'Denver Cril Parede 18 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(120,'Denver Cril Parede 3,6 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(121,'Denver Cril Super Branco 4 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(122,'Denver Cril Super Cinza 12 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(123,'Denver Cril Super Cinza 4 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(124,'Denver Desforma','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(125,'Denver Desforma 18L','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(126,'Denver Desforma 3,6L','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(127,'Denver Desmoldante 18 Lt','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(128,'Denver Desmoldante 3,6 L','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(129,'Denver Fix Chapisco','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(130,'Denver Fix Chapisco Bd','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(131,'Denver Fix Chapisco Gl 3,60','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(132,'Denver Fix Chapisco Tbr','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(133,'Denver Imper 1 Bd','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(134,'Denver Imper 1 Gl 3,6','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(135,'Denver Imper 1 Tbr','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(136,'Denver Imper Black 3,6 Lt','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(137,'Denver Imperblack Tbr','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(138,'Denver Laje Preto 3,6 Lt','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(139,'Denver Laje Preto Bd','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(140,'Denver Niz Acqua 18 Lts','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(141,'Denver Reparo 12K','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(142,'Denver Repele Acqua 18L','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(143,'Denver Tinta Mas Antraiz','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(144,'Denver Term E Os 25mm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,4,NULL,NULL),(145,'Denverfix Acrilico 18Lt','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(146,'Denverfita 05cm X 10m','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(147,'Denverfita 10cm X 10m','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(148,'Denverfita 10cm X 1m','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(149,'Denverfita 15cmx10m','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(150,'Denverfita 20cm X 10m','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(151,'Denverfita 30cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(152,'Denverfita 45cm X 10m','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(153,'Denverfita 90cm X 10m','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(154,'Denverfrio Asfalto','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(155,'Denverhidrorrepelente Acqua','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(156,'Denvermanta Laje 30Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(157,'Denverniz Antipichação','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(158,'Denverniz Sb','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(159,'Denverpoxi','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(160,'Denverpren 16 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(161,'Denverpren Pu','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(162,'Denverprimer Max Lt18L','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(163,'Denversol Top Reflective','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(164,'Denversolvente 300','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(165,'Denvertec 700 18 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(166,'Denvertec Elastic Fibras','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(167,'Emcekrete 50 - 25Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(168,'Espátula 10cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(169,'Espátula 4cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(170,'Espátula 6cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(171,'Espuma Espansiva Solufix','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(172,'Garfo Para Rolo Atlas','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(173,'Hydro 500 18,2 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(174,'Hydro 100 18 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(175,'Impermanta 3mm Max Anreraiz','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,4,NULL,NULL),(176,'Impermanta Cor 4mm Pp','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,4,NULL,NULL),(177,'Mc - Dur1300 1Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(178,'Mc - Dur Tx 1300 1Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(179,'Mc - Emcekrete 25 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(180,'Mc - Fast Block 13Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(181,'Mc - Flex 450 Ve 6,6L','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(182,'Mc - Flex Pu 40 Cinza 800g','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(183,'Mc - Proof 900 El','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(184,'Mc - Proof Mult 18Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(185,'Mc - Xypex Concebtrado 25 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(186,'Mc - Xypex Modificado','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(187,'Mc - Xypex Patchn Plug','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(188,'Manta Aluminio 4mm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,4,NULL,NULL),(189,'Manta De Dreno Centergel Tipo 2l 1L','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,4,NULL,NULL),(190,'Manta De Dreno Mcdrain Fp','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,4,NULL,NULL),(191,'Manta Dreno Geocomposto Lgt','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,4,NULL,NULL),(192,'Manta Liquida 15k Axton','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(193,'Poliasfato','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(194,'Pó 2','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(195,'Poxpur Maxx Const Mem Poliuretano','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(196,'Poxpur Pu 250 Bo-Componente','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(197,'Pu 40 Macflex (Bege)','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(198,'Pu 40 Macflex (Branco)','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(199,'Pu 40 Macflex (Cinza)','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(200,'Pu 40 Macflex (Preto)','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(201,'Rolo De Espuma 9cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(202,'Rolo De Espuma Compel 15cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(203,'Rolo De Espuma Compel 5cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(204,'Rolo De La Sint. Compel 0,9cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(205,'Rolo De La Sint. Compel 23cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(206,'Rolo De Lã Compel 5cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(207,'Rolo De Lã Respingo Zero 23cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(208,'Rolo De Lã Tigre 23cm','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(209,'Rolo La S/Resp 23cm Standadro 1374 Tigre','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(210,'S-Flex Pu 35 Branco','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(211,'S-Flex Pu 35 Cinza','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(212,'S-Flex Pu 35 Preto','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(213,'Sikafill Rapido Manta Liq Cinza','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(214,'Solufix 800g Cinza','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(215,'Tela Poliester 2x2','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,4,NULL,NULL),(216,'Top 700 Fibras 18k Axton','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(217,'Trincha Atlas 300 1\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(218,'Trincha Atlas 300 2\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(219,'Trincha Atlas 300 3\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-11 17:48:18.140',NULL,NULL,NULL,10,NULL,NULL),(220,'Tubo Geodreno 2,5 Polegadas','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(221,'Tubo Geodreno 4\" Polegadas','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,16,NULL,NULL),(222,'Vedalage Plus Manta Branco 4Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(223,'Vedalage Plus Manta Liq Concreto 12Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(224,'Viabilit Lt 18 (Similar Imperbleck)','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(225,'Viabilit Lt 3,6 (Similar Imperbleck)','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(226,'Viabilit Lt 900 (Similar Imperbleck)','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,27,NULL,NULL),(227,'Viafix Bd 18Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(228,'Viapol Sela Trinca 400g','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(229,'Viaplus 1000 Cx18 Kg','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(230,'Xypex Admix C-500','MATERIAL',NULL,NULL,'ATIVO','2026-09-02 20:59:07.000','2026-09-02 20:59:07.000',NULL,NULL,NULL,2,NULL,NULL),(232,'AÇÚCAR','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.431','2026-09-11 17:35:25.431',NULL,NULL,NULL,12,NULL,17),(233,'ÁGUA SANITÁRIA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.439','2026-09-14 20:45:54.817',NULL,NULL,NULL,12,4,17),(234,'ÁLCOOL','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.447','2026-09-11 17:35:25.447',NULL,NULL,NULL,12,NULL,17),(236,'APLICADOR DE MASSA (CELULOIDE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.465','2026-09-11 17:35:25.465',NULL,NULL,NULL,12,NULL,12),(237,'ARAME RECOZIDO Nº 12 KG','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.474','2026-09-11 17:35:25.474',NULL,NULL,NULL,2,NULL,18),(238,'ARAME RECOZIDO Nº 14 KG','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.482','2026-09-11 17:35:25.482',NULL,NULL,NULL,12,NULL,12),(239,'ARAME RECOZIDO Nº 18 KG','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.491','2026-09-11 17:35:25.491',NULL,NULL,NULL,12,NULL,18),(240,'AREIA (FINA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.498','2026-09-11 17:35:25.498',NULL,NULL,NULL,14,NULL,NULL),(242,'ARGAMASSA ACIII','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.512','2026-09-11 17:35:25.512',NULL,NULL,NULL,15,NULL,NULL),(243,'AXTON MANTA LIQUIDA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.519','2026-09-11 17:35:25.519',NULL,NULL,NULL,31,NULL,7),(244,'AZULLIM TIRA LIMO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.525','2026-09-11 17:35:25.525',NULL,NULL,NULL,12,NULL,12),(245,'BALDE (REUSO - RECIPIENTE DE PRODUTOS)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.531','2026-09-11 17:35:25.531',NULL,NULL,NULL,10,NULL,NULL),(246,'BANDEJA PARA PINTURA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.543','2026-09-11 17:35:25.543',NULL,NULL,NULL,10,NULL,NULL),(247,'BIANCO VEDACIT (ADESIVO DE ALTO DESEMPENHO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.550','2026-09-11 17:35:25.550',NULL,NULL,NULL,31,NULL,NULL),(248,'BLOCO DE ESPUMA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.559','2026-09-11 17:35:25.559',NULL,NULL,NULL,12,NULL,19),(249,'BROCA 10\" (MADEIRA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.565','2026-09-11 17:35:25.565',NULL,NULL,NULL,10,NULL,NULL),(250,'BROCA 10\" (METAL)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.571','2026-09-11 17:35:25.571',NULL,NULL,NULL,10,NULL,NULL),(251,'BROCA 10\" (VÍDIA/CONCRETO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.579','2026-09-11 17:35:25.579',NULL,NULL,NULL,10,NULL,NULL),(252,'BROCA 12\" (MADEIRA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.585','2026-09-11 17:35:25.585',NULL,NULL,NULL,10,NULL,NULL),(253,'BROCA 12\" (METAL)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.591','2026-09-11 17:35:25.591',NULL,NULL,NULL,10,NULL,NULL),(254,'BROCA 12\" (VÍDIA/CONCRETO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.597','2026-09-11 17:35:25.597',NULL,NULL,NULL,10,NULL,NULL),(255,'BROCA 6\" (MADEIRA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.604','2026-09-11 17:35:25.604',NULL,NULL,NULL,10,NULL,NULL),(256,'BROCA 6\" (METAL)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.611','2026-09-11 17:35:25.611',NULL,NULL,NULL,10,NULL,NULL),(257,'BROCA 6\" (VÍDIA/CONCRETO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.619','2026-09-11 17:35:25.619',NULL,NULL,NULL,10,NULL,NULL),(258,'BROCA 8\" (MADEIRA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.626','2026-09-11 17:35:25.626',NULL,NULL,NULL,10,NULL,NULL),(259,'BROCA 8\" (METAL)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.635','2026-09-11 17:35:25.635',NULL,NULL,NULL,10,NULL,NULL),(260,'BROCA 8\" (VÍDIA/CONCRETO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.645','2026-09-11 17:35:25.645',NULL,NULL,NULL,10,NULL,NULL),(261,'ESCOVA RETANGULAR (TIGRE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.669','2026-09-11 17:35:25.669',NULL,NULL,NULL,10,NULL,12),(262,'BROCHA RETANGULAR MADEIRA (MAX)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.679','2026-09-11 17:35:25.679',NULL,NULL,NULL,10,NULL,12),(263,'CABO DE VASSOURA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.687','2026-09-11 17:35:25.687',NULL,NULL,NULL,10,NULL,NULL),(264,'CABO PARA MARRETA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.694','2026-09-11 17:35:25.694',NULL,NULL,NULL,12,NULL,12),(265,'CABO PARA ROLO 23\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.703','2026-09-11 17:35:25.703',NULL,NULL,NULL,12,NULL,12),(266,'CADEADO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.709','2026-09-11 17:35:25.709',NULL,NULL,NULL,2,NULL,12),(267,'CAFÉ','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.718','2026-09-11 17:35:25.718',NULL,NULL,NULL,12,NULL,17),(268,'CAIXA DE BOMBOM','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.723','2026-09-11 17:35:25.723',NULL,NULL,NULL,12,NULL,17),(270,'CARTUCHO DE GÁS','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.738','2026-09-11 17:35:25.738',NULL,NULL,NULL,2,NULL,12),(272,'COLA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.752','2026-09-11 17:35:25.752',NULL,NULL,NULL,10,NULL,NULL),(273,'COLHERZINHA DE CAFÉ','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.759','2026-09-11 17:35:25.759',NULL,NULL,NULL,12,NULL,17),(275,'CONE DE PLÁSTICO (TIPO POSTE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.771','2026-09-11 17:35:25.771',NULL,NULL,NULL,12,NULL,NULL),(277,'COPO DESCARTÁVEL (ÁGUA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.784','2026-09-11 17:35:25.784',NULL,NULL,NULL,12,NULL,17),(278,'COPO DESCARTÁVEL (CAFÉ)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.790','2026-09-11 17:35:25.790',NULL,NULL,NULL,12,NULL,17),(279,'CORRENTE DE AÇO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.797','2026-09-11 17:35:25.797',NULL,NULL,NULL,12,NULL,12),(280,'CORRENTE DE PLÁSTICO (SEGURANÇA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.803','2026-09-11 17:35:25.803',NULL,NULL,NULL,17,NULL,NULL),(281,'DENVER ANTIMOFO (12K)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.810','2026-09-11 17:35:25.810',NULL,NULL,NULL,31,NULL,4),(282,'DENVER ANTIMOFO (4K)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.818','2026-09-11 17:35:25.818',NULL,NULL,NULL,18,NULL,4),(283,'DENVER BLITZ (18 KG)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.825','2026-09-11 17:35:25.825',NULL,NULL,NULL,31,NULL,4),(286,'DENVER CAL (ADESIVO PLASTIF. P/ ARGAMASSA - 18 LTS)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.850','2026-09-11 17:35:25.850',NULL,NULL,NULL,31,NULL,4),(287,'DENVER CAL (ADESIVO PLASTIF. P/ ARGAMASSA - 200 LTS)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.856','2026-09-11 17:35:25.856',NULL,NULL,NULL,20,NULL,4),(288,'DENVER CAL (ADESIVO PLASTIF. P/ ARGAMASSA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.866','2026-09-11 17:35:25.866',NULL,NULL,NULL,31,NULL,NULL),(292,'DENVER CRIL SUPER BRANCO (12 KG)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.893','2026-09-11 17:35:25.893',NULL,NULL,NULL,31,NULL,4),(305,'DENVER GROUT','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.983','2026-09-11 17:35:25.983',NULL,NULL,NULL,17,NULL,4),(306,'DENVER GROUT (GRAUTE À BASE DE CIMENTO P/ USO GERAL)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:25.995','2026-09-11 17:35:25.995',NULL,NULL,NULL,31,NULL,NULL),(307,'DENVER IMPER 1 (ADITIVO IMPERM. P/ ARGAMASSA E CONCRETO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.009','2026-09-11 17:35:26.009',NULL,NULL,NULL,31,NULL,NULL),(311,'DENVER IMPER BLACK 18L','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.050','2026-09-11 17:35:26.050',NULL,NULL,NULL,14,NULL,4),(313,'DENVER IMPER BLACK 900 ML','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.068','2026-09-11 17:35:26.068',NULL,NULL,NULL,14,NULL,4),(314,'DENVER IMPERBLACK (PINT. ASFÁLT. PROT. E IMPERM.)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.078','2026-09-11 17:35:26.078',NULL,NULL,NULL,31,NULL,NULL),(318,'DENVER MANTA PRIMER ACQUA (PRIMER BASE ÁGUA P/ MANTA ASFÁLT. 18L)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.137','2026-09-11 17:35:26.137',NULL,NULL,NULL,31,NULL,NULL),(319,'DENVER MANTA PRIMER ACQUA (PRIMER BASE ÁGUA P/ MANTA ASFÁLT. 3,6L)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.147','2026-09-11 17:35:26.147',NULL,NULL,NULL,31,NULL,NULL),(320,'DENVER NIZ ACQUA 18LTS','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.158','2026-09-11 17:35:26.158',NULL,NULL,NULL,31,NULL,4),(321,'DENVER POLIASFALTO 5K','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.172','2026-09-11 17:35:26.172',NULL,NULL,NULL,21,NULL,4),(322,'DENVER POXI MAX (ADESIVO ESTRUTURAL BASE EPÓXI DE CONSIST. PASTOSA - CONJ. A+B)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.183','2026-09-11 17:35:26.183',NULL,NULL,NULL,31,NULL,NULL),(323,'DENVER PREN PU (COMPONENTE A)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.191','2026-09-11 17:35:26.191',NULL,NULL,NULL,31,NULL,NULL),(325,'DENVER REPELE ACQUA (SILICONE INCOLOR REPELENTE DE ÁGUA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.220','2026-09-11 17:35:26.220',NULL,NULL,NULL,31,NULL,NULL),(327,'DENVER SOPREMA (MAX ANTIRRAIZ)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.239','2026-09-11 17:35:26.239',NULL,NULL,NULL,31,NULL,NULL),(329,'DENVER TEC 100 18 KG','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.254','2026-09-11 17:35:26.254',NULL,NULL,NULL,6,NULL,4),(330,'DENVER TEC 540 18 KG','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.265','2026-09-11 17:35:26.265',NULL,NULL,NULL,6,NULL,4),(333,'DENVERBLITZ','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.303','2026-09-11 17:35:26.303',NULL,NULL,NULL,31,NULL,NULL),(334,'DENVERCRIL PAREDE','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.317','2026-09-11 17:35:26.317',NULL,NULL,NULL,31,NULL,NULL),(336,'DENVERFITA 10 CM X 10 M','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.340','2026-09-11 17:35:26.340',NULL,NULL,NULL,24,NULL,4),(340,'DENVERFITA 30 CM','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.409','2026-09-11 17:35:26.409',NULL,NULL,NULL,16,NULL,4),(343,'DENVERFITA 98CM X 10M','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.445','2026-09-11 17:35:26.445',NULL,NULL,NULL,16,NULL,4),(345,'DENVERFIX CHAPISCO (ADESIVO PARA CHAPISCOS E ARGAMASSAS)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.470','2026-09-11 17:35:26.470',NULL,NULL,NULL,31,NULL,NULL),(347,'DENVERGROUT EPOXI','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.493','2026-09-11 17:35:26.493',NULL,NULL,NULL,25,NULL,4),(353,'DENVERPOXI MAX','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.577','2026-09-11 17:35:26.577',NULL,NULL,NULL,25,NULL,4),(359,'DENVERTEC 700','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.641','2026-09-11 17:35:26.641',NULL,NULL,NULL,6,NULL,NULL),(362,'DENVERTEC ELASTIC HP','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.671','2026-09-11 17:35:26.671',NULL,NULL,NULL,6,NULL,4),(363,'DESINFETANTE','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.681','2026-09-11 17:35:26.681',NULL,NULL,NULL,18,NULL,12),(364,'DESINGRIPANTE','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.694','2026-09-11 17:35:26.694',NULL,NULL,NULL,12,NULL,12),(365,'DETERGENTE','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.705','2026-09-11 17:35:26.705',NULL,NULL,NULL,12,NULL,17),(366,'DF 8 BRANCO 12KG','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.718','2026-09-11 17:35:26.718',NULL,NULL,NULL,31,NULL,11),(367,'DILUENTE PREMIUM','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.730','2026-09-11 17:35:26.730',NULL,NULL,NULL,14,NULL,NULL),(368,'DISCO DE CORTE INOX 4\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.741','2026-09-11 17:35:26.741',NULL,NULL,NULL,12,NULL,12),(369,'DISCO DE CORTE INOX 7\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.752','2026-09-11 17:35:26.752',NULL,NULL,NULL,12,NULL,12),(370,'DISCO DE DESBASTE 4\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.759','2026-09-11 17:35:26.759',NULL,NULL,NULL,12,NULL,12),(371,'DISCO DE DESBASTE 7\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.771','2026-09-11 17:35:26.771',NULL,NULL,NULL,12,NULL,12),(372,'DISCO DE POLIMENTO 4\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.784','2026-09-11 17:35:26.784',NULL,NULL,NULL,12,NULL,12),(373,'DISCO DE POLIMENTO 4\" LIXA 24','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.792','2026-09-11 17:35:26.792',NULL,NULL,NULL,12,NULL,12),(374,'DISCO DE SERRA (MADEIRA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.804','2026-09-11 17:35:26.804',NULL,NULL,NULL,12,NULL,12),(375,'DISCO DIAMANTADO SEGMENTADO 4\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.816','2026-09-11 17:35:26.816',NULL,NULL,NULL,12,NULL,12),(376,'DISCO DIAMANTADO SEGMENTADO 7\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.826','2026-09-11 17:35:26.826',NULL,NULL,NULL,12,NULL,12),(377,'DISCO DIAMANTADO TURBO 4\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.839','2026-09-11 17:35:26.839',NULL,NULL,NULL,12,NULL,12),(378,'DISCO REBOLO DIAMANTADO SEGMENTADO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.850','2026-09-11 17:35:26.850',NULL,NULL,NULL,12,NULL,12),(380,'ENFORCA GATO 3,5 X 150 (PC C/ 100)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.871','2026-09-11 17:35:26.871',NULL,NULL,NULL,12,NULL,12),(381,'ENFORCA GATO 3,6 X 200 (PC C/ 100)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.887','2026-09-11 17:35:26.887',NULL,NULL,NULL,12,NULL,12),(382,'ENFORCA GATO AMARELO 2,5 X 100 (50 UNI)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.900','2026-09-11 17:35:26.900',NULL,NULL,NULL,12,NULL,12),(383,'ENFORCA GATO AZUL 2,5 X 100 (50 UNI)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.912','2026-09-11 17:35:26.912',NULL,NULL,NULL,12,NULL,12),(384,'ENFORCA GATO VERDE 2,5 X 100 (50 UNI)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.925','2026-09-11 17:35:26.925',NULL,NULL,NULL,12,NULL,12),(385,'ENFORCA GATO VERMELHO 2,5 X 100 (50 UNI)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.935','2026-09-11 17:35:26.935',NULL,NULL,NULL,12,NULL,12),(386,'ENGATE RÁPIDO COM EMENDA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.945','2026-09-11 17:35:26.945',NULL,NULL,NULL,12,NULL,18),(387,'EPÓXI BASE ÁGUA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.957','2026-09-11 17:35:26.957',NULL,NULL,NULL,31,NULL,NULL),(388,'ESCOVA DE AÇO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.968','2026-09-11 17:35:26.968',NULL,NULL,NULL,12,NULL,12),(389,'ESCOVA DE AÇO - MAKITA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.980','2026-09-11 17:35:26.980',NULL,NULL,NULL,12,NULL,12),(390,'ESCOVA DE AÇO TRAMONTINA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:26.991','2026-09-11 17:35:26.991',NULL,NULL,NULL,10,NULL,12),(391,'ESMALTE (TINTA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.001','2026-09-11 17:35:27.001',NULL,NULL,NULL,14,NULL,NULL),(392,'ESMALTE PU PISCINAS (KIT PARA PINTURA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.013','2026-09-11 17:35:27.013',NULL,NULL,NULL,31,NULL,NULL),(393,'ESPONJA/BUCHA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.025','2026-09-11 17:35:27.025',NULL,NULL,NULL,12,NULL,17),(395,'ESPUMA EXPANSIVA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.048','2026-09-11 17:35:27.048',NULL,NULL,NULL,2,NULL,12),(396,'ESTOPA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.060','2026-09-11 17:35:27.060',NULL,NULL,NULL,12,NULL,17),(397,'EXTENSOR PARA ROLO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.072','2026-09-11 17:35:27.072',NULL,NULL,NULL,12,NULL,NULL),(398,'FERTILIZANTE (FORTH JARDIM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.087','2026-09-11 17:35:27.087',NULL,NULL,NULL,31,NULL,NULL),(399,'FILTRO DE CAFÉ 103','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.098','2026-09-11 17:35:27.098',NULL,NULL,NULL,12,NULL,17),(400,'FITA CREPE 18MM','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.117','2026-09-11 17:35:27.117',NULL,NULL,NULL,12,NULL,12),(401,'FITA CREPE 24MM','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.132','2026-09-11 17:35:27.132',NULL,NULL,NULL,12,NULL,12),(402,'FITA CREPE 48MM','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.142','2026-09-11 17:35:27.142',NULL,NULL,NULL,12,NULL,12),(403,'FITA ISOLANTE','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.156','2026-09-11 17:35:27.156',NULL,NULL,NULL,12,NULL,12),(404,'FITA VEDA ROSCA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.171','2026-09-11 17:35:27.171',NULL,NULL,NULL,12,NULL,12),(405,'FITA ZEBRADA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.182','2026-09-11 17:35:27.182',NULL,NULL,NULL,12,NULL,12),(406,'FOLHA DE LIXA D\'ÁGUA FINA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.194','2026-09-11 17:35:27.194',NULL,NULL,NULL,12,NULL,12),(407,'FOLHA DE LIXA DE D\'AGUA GROSSA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.206','2026-09-11 17:35:27.206',NULL,NULL,NULL,12,NULL,12),(408,'FOLHA DE LIXA DE D\'ÁGUA MÉDIA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.217','2026-09-11 17:35:27.217',NULL,NULL,NULL,12,NULL,12),(409,'FOLHA DE LIXA DE FERRO FINA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.232','2026-09-11 17:35:27.232',NULL,NULL,NULL,12,NULL,12),(410,'FOLHA DE LIXA DE FERRO GROSSA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.243','2026-09-11 17:35:27.243',NULL,NULL,NULL,12,NULL,12),(411,'FOLHA DE LIXA DE FERRO MÉDIA (80)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.251','2026-09-11 17:35:27.251',NULL,NULL,NULL,12,NULL,12),(412,'FOLHA DE LIXA DE PAREDE FINA (100/120)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.262','2026-09-11 17:35:27.262',NULL,NULL,NULL,12,NULL,12),(413,'FOLHA DE LIXA DE PAREDE GROSSA (50/50/60)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.279','2026-09-11 17:35:27.279',NULL,NULL,NULL,12,NULL,12),(414,'FOLHA DE LIXA DE PAREDE MÉDIA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.295','2026-09-11 17:35:27.295',NULL,NULL,NULL,12,NULL,12),(415,'FOSFATOL (CONVERTOR DE FERRUGEM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.303','2026-09-11 17:35:27.303',NULL,NULL,NULL,31,NULL,NULL),(416,'FUNDO PREPARADOR PARA PAREDES (BASE ÁGUA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.316','2026-09-11 17:35:27.316',NULL,NULL,NULL,31,NULL,NULL),(418,'GARRAFA DE CAFÉ','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.339','2026-09-11 17:35:27.339',NULL,NULL,NULL,12,NULL,17),(419,'GRAMPO 26/6 C/5000','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.354','2026-09-11 17:35:27.354',NULL,NULL,NULL,12,NULL,20),(420,'GUARDANAPO ROLO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.364','2026-09-11 17:35:27.364',NULL,NULL,NULL,12,NULL,17),(424,'IMPER MANTA 3MM MAX ANTIRRAIZ (MANTA ANTIRRAIZ)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.425','2026-09-11 17:35:27.425',NULL,NULL,NULL,16,NULL,4),(425,'IMPER MANTA COR 3 MM (MANTA COR 3)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.437','2026-09-11 17:35:27.437',NULL,NULL,NULL,4,NULL,4),(426,'IMPER MANTA COR 4MM PP (MANTA COR 4)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.451','2026-09-11 17:35:27.451',NULL,NULL,NULL,4,NULL,4),(427,'IMPER MANTA LAJE PP 3MM (MANTA ASFÁLTICA 3)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.464','2026-09-11 17:35:27.464',NULL,NULL,NULL,4,NULL,4),(428,'IMPER MANTA LAJE PP 4MM (MANTA ASFÁLTICA 4)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.474','2026-09-11 17:35:27.474',NULL,NULL,NULL,4,NULL,4),(429,'IMPER MANTA PRIMER (3,6 L)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.485','2026-09-11 17:35:27.485',NULL,NULL,NULL,18,NULL,4),(430,'IMPER MANTA TELHADO AL 3MM (MANTA ALUMÍNIO 3)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.498','2026-09-11 17:35:27.498',NULL,NULL,NULL,4,NULL,4),(431,'IMPER MANTA TELHADO AL 3MM (MANTA ALUMÍNIO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.512','2026-09-11 17:35:27.512',NULL,NULL,NULL,4,NULL,4),(432,'IMPER MANTA TELHADO AL 4MM (MANTA ALUMÍNIO 4)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.523','2026-09-11 17:35:27.523',NULL,NULL,NULL,4,NULL,4),(433,'JUNTA DE PISO 1,5 MM (100UNI)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.534','2026-09-11 17:35:27.534',NULL,NULL,NULL,12,NULL,12),(434,'LÂMINAS DE ESTILETE','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.543','2026-09-11 17:35:27.543',NULL,NULL,NULL,12,NULL,12),(435,'LAMPADA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.560','2026-09-11 17:35:27.560',NULL,NULL,NULL,12,NULL,12),(436,'LÁPIS DE PEDREIRO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.575','2026-09-11 17:35:27.575',NULL,NULL,NULL,12,NULL,18),(437,'LIMPA PEDRAS','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.587','2026-09-11 17:35:27.587',NULL,NULL,NULL,18,NULL,NULL),(438,'LINHA DE PEDREIRO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.599','2026-09-11 17:35:27.599',NULL,NULL,NULL,12,NULL,12),(439,'LINHA DE PESCA 0,5','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.609','2026-09-11 17:35:27.609',NULL,NULL,NULL,12,NULL,12),(440,'LIXA 4\" FINA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.621','2026-09-11 17:35:27.621',NULL,NULL,NULL,12,NULL,12),(441,'LIXA 4\" GROSSA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.634','2026-09-11 17:35:27.634',NULL,NULL,NULL,12,NULL,12),(442,'LIXA 7\" FINA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.645','2026-09-11 17:35:27.645',NULL,NULL,NULL,12,NULL,12),(443,'LIXA 7\" GROSSA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.658','2026-09-11 17:35:27.658',NULL,NULL,NULL,12,NULL,12),(444,'LIXA 7\" MÉDIA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.667','2026-09-11 17:35:27.667',NULL,NULL,NULL,12,NULL,12),(445,'LIXA DE METRO GROSSA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.679','2026-09-11 17:35:27.679',NULL,NULL,NULL,12,NULL,19),(446,'LONA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.690','2026-09-11 17:35:27.690',NULL,NULL,NULL,16,NULL,21),(447,'LONA AZUL','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.700','2026-09-11 17:35:27.700',NULL,NULL,NULL,10,NULL,12),(448,'LONA PRETA 4 X 100','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.712','2026-09-11 17:35:27.712',NULL,NULL,NULL,16,NULL,12),(449,'MANGUEIRA (CORRUGADA PARA BOMBA D\'ÁGUA - 5\")','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.723','2026-09-11 17:35:27.723',NULL,NULL,NULL,16,NULL,NULL),(451,'MANTA (FITA 15 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.745','2026-09-11 17:35:27.745',NULL,NULL,NULL,16,NULL,NULL),(452,'MANTA (FITA 20 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.758','2026-09-11 17:35:27.758',NULL,NULL,NULL,16,NULL,NULL),(453,'MANTA (FITA 30 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.767','2026-09-11 17:35:27.767',NULL,NULL,NULL,16,NULL,NULL),(454,'MANTA (FITA 45 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.777','2026-09-11 17:35:27.777',NULL,NULL,NULL,16,NULL,NULL),(455,'MANTA (FITA 5 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.793','2026-09-11 17:35:27.793',NULL,NULL,NULL,16,NULL,NULL),(456,'MANTA (FITA 60 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.807','2026-09-11 17:35:27.807',NULL,NULL,NULL,16,NULL,NULL),(458,'MANTA (FITA 98 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.836','2026-09-11 17:35:27.836',NULL,NULL,NULL,16,NULL,NULL),(462,'MANTA GEOTEXTIL (200GR/2,30M)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.878','2026-09-11 17:35:27.878',NULL,NULL,NULL,16,NULL,3),(464,'MANTA LÍQUIDA ACRÍLICA PREMIUM (VEDALAGE PLUS)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.895','2026-09-11 17:35:27.895',NULL,NULL,NULL,31,NULL,NULL),(465,'MANTA LIQUIDA ALSAN ACRIL (12K)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.903','2026-09-11 17:35:27.903',NULL,NULL,NULL,31,NULL,15),(466,'MANTEIGA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.921','2026-09-11 17:35:27.921',NULL,NULL,NULL,12,NULL,23),(467,'MARGARINA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.941','2026-09-11 17:35:27.941',NULL,NULL,NULL,12,NULL,17),(470,'MASSA ASFÁLTICA (GRANDE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.986','2026-09-11 17:35:27.986',NULL,NULL,NULL,21,NULL,NULL),(471,'MASSA ASFÁLTICA (PEQUENA - BETUME)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:27.997','2026-09-11 17:35:27.997',NULL,NULL,NULL,21,NULL,NULL),(472,'MASSA ASFÁLTICA (PEQUENA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.009','2026-09-11 17:35:28.009',NULL,NULL,NULL,21,NULL,NULL),(474,'MASSA CORRIDA (LATA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.031','2026-09-11 17:35:28.031',NULL,NULL,NULL,14,NULL,NULL),(477,'MC PROFT 900 EL (MEMB. ELÁST. IMPERM. C/ FIBRA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.061','2026-09-11 17:35:28.061',NULL,NULL,NULL,6,NULL,NULL),(480,'MC-DUR 1300 (1KG)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.099','2026-09-11 17:35:28.099',NULL,NULL,NULL,25,NULL,11),(481,'MC-DUR TX 1300 (1KG)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.113','2026-09-11 17:35:28.113',NULL,NULL,NULL,25,NULL,11),(482,'MC-FLEX 450 VE (6,6L)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.126','2026-09-11 17:35:28.126',NULL,NULL,NULL,27,NULL,11),(483,'MC-FLEX PU 40 CINZA (800G)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.140','2026-09-11 17:35:28.140',NULL,NULL,NULL,28,NULL,11),(484,'MC-XYPEX CONCEBTRADO (25 KG)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.151','2026-09-11 17:35:28.151',NULL,NULL,NULL,17,NULL,11),(485,'MC-XYPEX MODIFICADO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.166','2026-09-11 17:35:28.166',NULL,NULL,NULL,17,NULL,11),(486,'MC-XYPEX PATCHN PLUG','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.178','2026-09-11 17:35:28.178',NULL,NULL,NULL,17,NULL,11),(487,'MEMBRANA DE POLIURETANO (POXPUR - IMPERMEABILIZANTE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.194','2026-09-11 17:35:28.194',NULL,NULL,NULL,31,NULL,NULL),(488,'NAFTALINA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.206','2026-09-11 17:35:28.206',NULL,NULL,NULL,12,NULL,17),(489,'PALHA DE AÇO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.218','2026-09-11 17:35:28.218',NULL,NULL,NULL,12,NULL,17),(490,'PANO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.233','2026-09-11 17:35:28.233',NULL,NULL,NULL,12,NULL,17),(491,'PAPEL HIGIÊNICO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.246','2026-09-11 17:35:28.246',NULL,NULL,NULL,12,NULL,17),(492,'PELÍCULA ESMA (TINTA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.260','2026-09-11 17:35:28.260',NULL,NULL,NULL,14,NULL,NULL),(493,'PERFEX','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.275','2026-09-11 17:35:28.275',NULL,NULL,NULL,12,NULL,17),(494,'PINCEL 1\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.289','2026-09-11 17:35:28.289',NULL,NULL,NULL,12,NULL,12),(495,'PINCEL 2\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.305','2026-09-11 17:35:28.305',NULL,NULL,NULL,12,NULL,12),(496,'PINCEL 3\"','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.319','2026-09-11 17:35:28.319',NULL,NULL,NULL,12,NULL,12),(497,'PLUGUE - TIPO \"T\" PARA TOMADAS','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.332','2026-09-11 17:35:28.332',NULL,NULL,NULL,10,NULL,NULL),(498,'PLUGUE/PINO - TIPO \"T\" PARA TOMADAS','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.347','2026-09-11 17:35:28.347',NULL,NULL,NULL,10,NULL,NULL),(499,'PLUGUE/PINO (FÊMEA 20A)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.362','2026-09-11 17:35:28.362',NULL,NULL,NULL,12,NULL,12),(500,'PLUGUE/PINO (MACHO 10A)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.375','2026-09-11 17:35:28.375',NULL,NULL,NULL,12,NULL,12),(503,'POX PUR (PU250 - 1,76 KG)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.412','2026-09-11 17:35:28.412',NULL,NULL,NULL,31,NULL,NULL),(505,'POXPUR MAXX CONST MEM POLIURETANO (12)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.453','2026-09-11 17:35:28.453',NULL,NULL,NULL,31,NULL,9),(506,'POXPUR MAXX CONST MEM POLIURETANO (4,5)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.464','2026-09-11 17:35:28.464',NULL,NULL,NULL,31,NULL,5),(507,'POXPUR PU 200 BO-COMPONENTE (3,5)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.479','2026-09-11 17:35:28.479',NULL,NULL,NULL,25,NULL,5),(508,'POXPUR PU 250 BO-COMPONENTE (3,6)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.497','2026-09-11 17:35:28.497',NULL,NULL,NULL,25,NULL,5),(509,'PREGO (17X21)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.511','2026-09-11 17:35:28.511',NULL,NULL,NULL,2,NULL,18),(510,'PREGO (18X30)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.525','2026-09-11 17:35:28.525',NULL,NULL,NULL,2,NULL,18),(511,'PROOF 500','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.540','2026-09-11 17:35:28.540',NULL,NULL,NULL,6,NULL,NULL),(512,'PU 40 - (COR: BEGE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.558','2026-09-11 17:35:28.558',NULL,NULL,NULL,29,NULL,NULL),(513,'PU 40 - (COR: BRANCA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.572','2026-09-11 17:35:28.572',NULL,NULL,NULL,29,NULL,NULL),(514,'PU 40 - (COR: CINZA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.592','2026-09-11 17:35:28.592',NULL,NULL,NULL,29,NULL,NULL),(515,'PU 40 - (COR: PRETA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.605','2026-09-11 17:35:28.605',NULL,NULL,NULL,29,NULL,NULL),(516,'PU 40 - (MACFLEX – COR: BEGE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.617','2026-09-11 17:35:28.617',NULL,NULL,NULL,29,NULL,5),(517,'PU 40 - (MACFLEX – COR: BRANCO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.632','2026-09-11 17:35:28.632',NULL,NULL,NULL,29,NULL,5),(518,'PU 40 - (MACFLEX – COR: CINZA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.645','2026-09-11 17:35:28.645',NULL,NULL,NULL,29,NULL,5),(519,'PU 40 - (MACFLEX – COR: PRETO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.658','2026-09-11 17:35:28.658',NULL,NULL,NULL,29,NULL,5),(520,'PU200 (PROXPUR - IMPERMEABILIZANTE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.673','2026-09-11 17:35:28.673',NULL,NULL,NULL,31,NULL,NULL),(521,'RECUBRIPLAST PISCINA (TINTA ACRÍLICA IMPERMEÁVEL)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.690','2026-09-11 17:35:28.690',NULL,NULL,NULL,31,NULL,NULL),(522,'REJUNTE ESPECIAL ACRÍLICO (PORTO KOLL PREMIUM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.706','2026-09-11 17:35:28.706',NULL,NULL,NULL,31,NULL,NULL),(523,'REMOVEDOR PASTOSO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.718','2026-09-11 17:35:28.718',NULL,NULL,NULL,14,NULL,NULL),(524,'REQUISIÇÃO C/CÓPIA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.731','2026-09-11 17:35:28.731',NULL,NULL,NULL,12,NULL,20),(525,'RESINA ACRÍLICA (TINTA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.747','2026-09-11 17:35:28.747',NULL,NULL,NULL,14,NULL,NULL),(526,'RODO (NOVO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.759','2026-09-11 17:35:28.759',NULL,NULL,NULL,12,NULL,NULL),(527,'RODO (USADO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.768','2026-09-11 17:35:28.768',NULL,NULL,NULL,12,NULL,NULL),(528,'ROLO DE ESPUMA (COMPEL - TAM: 15 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.777','2026-09-11 17:35:28.777',NULL,NULL,NULL,10,NULL,12),(529,'ROLO DE ESPUMA (COMPEL - TAM: 5 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.790','2026-09-11 17:35:28.790',NULL,NULL,NULL,10,NULL,12),(530,'ROLO DE ESPUMA (TAM: 05CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.800','2026-09-11 17:35:28.800',NULL,NULL,NULL,12,NULL,12),(531,'ROLO DE ESPUMA (TAM: 15CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.811','2026-09-11 17:35:28.811',NULL,NULL,NULL,12,NULL,12),(532,'ROLO DE ESPUMA (TAM: 23 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.822','2026-09-11 17:35:28.822',NULL,NULL,NULL,10,NULL,12),(533,'ROLO DE ESPUMA (TAM: 9CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.833','2026-09-11 17:35:28.833',NULL,NULL,NULL,10,NULL,12),(534,'ROLO DE LÃ (COMPEL - TAM: 5 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.845','2026-09-11 17:35:28.845',NULL,NULL,NULL,10,NULL,12),(535,'ROLO DE LÃ (TAM: 15CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.858','2026-09-11 17:35:28.858',NULL,NULL,NULL,24,NULL,12),(536,'ROLO DE LÃ (TIGRE – TAM: 23 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.870','2026-09-11 17:35:28.870',NULL,NULL,NULL,10,NULL,12),(537,'ROLO DE LÃ (TIGRE – TAM: 23CM - FELPUDO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.880','2026-09-11 17:35:28.880',NULL,NULL,NULL,12,NULL,19),(538,'ROLO DE LÃ RESPINGO ZERO (TAM: 05CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.890','2026-09-11 17:35:28.890',NULL,NULL,NULL,12,NULL,12),(539,'ROLO DE LÃ RESPINGO ZERO (TAM: 09CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.902','2026-09-11 17:35:28.902',NULL,NULL,NULL,12,NULL,12),(540,'ROLO DE LÃ RESPINGO ZERO (TAM: 15CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.913','2026-09-11 17:35:28.913',NULL,NULL,NULL,12,NULL,12),(541,'ROLO DE LÃ RESPINGO ZERO (TAM: 23 CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.927','2026-09-11 17:35:28.927',NULL,NULL,NULL,10,NULL,12),(542,'ROLO DE LÃ SINT. (COMPEL – TAM: 23CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.940','2026-09-11 17:35:28.940',NULL,NULL,NULL,10,NULL,12),(543,'ROLO DE LÃ SINT. (COMPEL – TAM: 9CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.950','2026-09-11 17:35:28.950',NULL,NULL,NULL,10,NULL,12),(544,'ROLO DE LÃ SINTÉTICA (TAM: 05CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.964','2026-09-11 17:35:28.964',NULL,NULL,NULL,12,NULL,12),(545,'ROLO DE LÃ SINTÉTICA (TAM: 09CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.977','2026-09-11 17:35:28.977',NULL,NULL,NULL,12,NULL,12),(546,'ROLO DE LÃ SINTÉTICA (TAM: 15CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:28.991','2026-09-11 17:35:28.991',NULL,NULL,NULL,12,NULL,12),(547,'ROLO DE LÃ SINTÉTICA (TAM: 23CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.001','2026-09-11 17:35:29.001',NULL,NULL,NULL,12,NULL,12),(548,'ROLO EPOXI (TAM: 23CM)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.015','2026-09-11 17:35:29.015',NULL,NULL,NULL,12,NULL,12),(549,'ROLO LÃ S/ RESP. (TAM: 23 CM - STANADRO 1374 – TIGRE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.033','2026-09-11 17:35:29.033',NULL,NULL,NULL,24,NULL,12),(550,'SABONETE LÍQUIDO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.045','2026-09-11 17:35:29.045',NULL,NULL,NULL,12,NULL,17),(551,'SACO DE LIXO (CAPAC: 100 LITROS)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.054','2026-09-11 17:35:29.054',NULL,NULL,NULL,12,NULL,17),(552,'SACO DE LIXO (CAPAC: 200 LITROS - REFORÇADO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.062','2026-09-11 17:35:29.062',NULL,NULL,NULL,12,NULL,24),(553,'SACO DE LIXO (CAPAC: 50 LITROS)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.073','2026-09-11 17:35:29.073',NULL,NULL,NULL,12,NULL,17),(554,'SACO REFORÇADO DE RAÇÃO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.086','2026-09-11 17:35:29.086',NULL,NULL,NULL,12,NULL,21),(555,'SAPÓLIO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.094','2026-09-11 17:35:29.094',NULL,NULL,NULL,12,NULL,23),(556,'SERRINHA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.104','2026-09-11 17:35:29.104',NULL,NULL,NULL,12,NULL,12),(557,'S-FLEX PU 35 (COR: BRANCO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.112','2026-09-11 17:35:29.112',NULL,NULL,NULL,10,NULL,13),(558,'S-FLEX PU 35 (COR: CINZA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.124','2026-09-11 17:35:29.124',NULL,NULL,NULL,10,NULL,13),(559,'S-FLEX PU 35 (COR: PRETO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.135','2026-09-11 17:35:29.135',NULL,NULL,NULL,10,NULL,13),(560,'SHERWIN WILLIAMS','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.144','2026-09-11 17:35:29.144',NULL,NULL,NULL,31,NULL,NULL),(561,'SIKAFILL RÁPIDO MANTA LIQ (CINZA – 15L)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.158','2026-09-11 17:35:29.158',NULL,NULL,NULL,31,NULL,14),(562,'SIKAFILL RÁPIDO MANTA LIQ (CINZA – 3,6L)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.169','2026-09-11 17:35:29.169',NULL,NULL,NULL,18,NULL,14),(563,'SOLUFIX (CINZA - 800G)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.180','2026-09-11 17:35:29.180',NULL,NULL,NULL,28,NULL,13),(564,'STAIN PROTETOR MADEIRA (SPARLACK CETOL)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.191','2026-09-11 17:35:29.191',NULL,NULL,NULL,14,NULL,NULL),(567,'TELA (PROTEÇÃO PREDIAL)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.236','2026-09-11 17:35:29.236',NULL,NULL,NULL,16,NULL,12),(568,'TELA POLIÉSTER (PROPORÇ: 1X1 – ROLO: 50 M)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.253','2026-09-11 17:35:29.253',NULL,NULL,NULL,4,NULL,25),(569,'TELA POLIÉSTER (PROPORÇ: 2X2)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.266','2026-09-11 17:35:29.266',NULL,NULL,NULL,4,NULL,25),(570,'TEXTURA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.277','2026-09-11 17:35:29.277',NULL,NULL,NULL,17,NULL,NULL),(572,'TINGIDOR','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.299','2026-09-11 17:35:29.299',NULL,NULL,NULL,14,NULL,NULL),(573,'TOMADA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.313','2026-09-11 17:35:29.313',NULL,NULL,NULL,12,NULL,NULL),(575,'TOQUE FOSCO','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.342','2026-09-11 17:35:29.342',NULL,NULL,NULL,14,NULL,NULL),(576,'TRINCHA (ATLAS - 300 – TAM: 1\")','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.351','2026-09-11 17:35:29.351',NULL,NULL,NULL,10,NULL,12),(577,'TRINCHA (ATLAS - 300 – TAM: 2\")','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.359','2026-09-11 17:35:29.359',NULL,NULL,NULL,10,NULL,12),(578,'TRINCHA (ATLAS – 300 – TAM: 3\")','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.372','2026-09-11 17:35:29.372',NULL,NULL,NULL,10,NULL,12),(579,'TUBO (CONDUIT/CORRUGADO PARA BOMBA D\'ÁGUA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.383','2026-09-11 17:35:29.383',NULL,NULL,NULL,16,NULL,NULL),(580,'TUBO (GEODRENO - 2,5”)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.394','2026-09-11 17:35:29.394',NULL,NULL,NULL,16,NULL,3),(581,'TUBO (GEODRENO - 4\")','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.406','2026-09-11 17:35:29.406',NULL,NULL,NULL,16,NULL,3),(582,'TUBO CONDUIT PARA BOMBA D\'ÁGUA','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.416','2026-09-11 17:35:29.416',NULL,NULL,NULL,16,NULL,NULL),(583,'SILICONE (FLEX - DOWSIL 791 - BEGE - DOW)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.423','2026-09-11 17:35:29.423',NULL,NULL,NULL,29,NULL,12),(584,'SILICONE (FLEX - DOWSIL 791 - BRANCO - DOW)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.434','2026-09-11 17:35:29.434',NULL,NULL,NULL,29,NULL,12),(585,'SILICONE (FLEX - DOWSIL 791 - CINZA - DOW)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.449','2026-09-11 17:35:29.449',NULL,NULL,NULL,29,NULL,12),(586,'SILICONE (FLEX - DOWSIL 791 - PRETO - DOW)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.459','2026-09-11 17:35:29.459',NULL,NULL,NULL,29,NULL,12),(587,'SELANTE MS 426 (HARD - PISCINA - BEGE)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.472','2026-09-11 17:35:29.472',NULL,NULL,NULL,29,NULL,NULL),(588,'SELANTE MS 426 (HARD - PISCINA - BRANCO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.485','2026-09-11 17:35:29.485',NULL,NULL,NULL,29,NULL,NULL),(589,'SELANTE MS 426 (HARD - PISCINA - CINZA)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.497','2026-09-11 17:35:29.497',NULL,NULL,NULL,29,NULL,NULL),(590,'SELANTE MS 426 (HARD - PISCINA - PRETO)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.511','2026-09-11 17:35:29.511',NULL,NULL,NULL,29,NULL,NULL),(594,'MC PROOF DF 8 (MANTA ACRÍLICA IMPERMEÁVEL ALTAMENTE FLEXÍVEL - 12 KG)','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:35:29.564','2026-09-11 17:35:29.564',NULL,NULL,NULL,31,NULL,11),(596,'FITA ALUMÍNIO 25MM X 30M','MATERIAL',NULL,NULL,'ATIVO','2026-09-11 17:36:38.103','2026-09-11 17:36:38.103',NULL,NULL,NULL,10,NULL,12),(597,'Arame Recozido Número 14','MATERIAL',NULL,NULL,'ATIVO','2026-09-14 18:02:54.818','2026-09-14 18:04:42.441',NULL,NULL,NULL,2,6,NULL),(598,'Arame Recozido Número14','MATERIAL',NULL,NULL,'ATIVO','2026-09-14 18:04:31.495','2026-09-14 18:04:31.495',NULL,NULL,NULL,2,6,NULL);
/*!40000 ALTER TABLE `materiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membros_equipe`
--

DROP TABLE IF EXISTS `membros_equipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membros_equipe` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `equipeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuarioId` int NOT NULL,
  `funcao` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `membros_equipe_equipeId_usuarioId_key` (`equipeId`,`usuarioId`),
  KEY `membros_equipe_usuarioId_fkey` (`usuarioId`),
  CONSTRAINT `membros_equipe_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `membros_equipe_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membros_equipe`
--

LOCK TABLES `membros_equipe` WRITE;
/*!40000 ALTER TABLE `membros_equipe` DISABLE KEYS */;
/*!40000 ALTER TABLE `membros_equipe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimentos_estoque`
--

DROP TABLE IF EXISTS `movimentos_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimentos_estoque` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialId` int NOT NULL,
  `tipo` enum('ENTRADA','SAIDA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` decimal(12,3) NOT NULL,
  `saldoApos` decimal(14,3) NOT NULL,
  `ordemServicoId` int DEFAULT NULL,
  `compraItemId` int DEFAULT NULL,
  `separacaoItemId` int DEFAULT NULL,
  `registradoPorId` int DEFAULT NULL,
  `observacao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `movimentos_estoque_materialId_idx` (`materialId`),
  KEY `movimentos_estoque_ordemServicoId_idx` (`ordemServicoId`),
  KEY `movimentos_estoque_compraItemId_fkey` (`compraItemId`),
  KEY `movimentos_estoque_separacaoItemId_fkey` (`separacaoItemId`),
  KEY `movimentos_estoque_registradoPorId_fkey` (`registradoPorId`),
  CONSTRAINT `movimentos_estoque_compraItemId_fkey` FOREIGN KEY (`compraItemId`) REFERENCES `compra_itens` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `movimentos_estoque_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `movimentos_estoque_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `movimentos_estoque_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `movimentos_estoque_separacaoItemId_fkey` FOREIGN KEY (`separacaoItemId`) REFERENCES `separacao_itens` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimentos_estoque`
--

LOCK TABLES `movimentos_estoque` WRITE;
/*!40000 ALTER TABLE `movimentos_estoque` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimentos_estoque` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacoes`
--

DROP TABLE IF EXISTS `notificacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensagem` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NAO_LIDA','LIDA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NAO_LIDA',
  `ordemServicoId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notificacoes_userId_status_idx` (`userId`,`status`),
  KEY `notificacoes_ordemServicoId_fkey` (`ordemServicoId`),
  CONSTRAINT `notificacoes_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notificacoes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacoes`
--

LOCK TABLES `notificacoes` WRITE;
/*!40000 ALTER TABLE `notificacoes` DISABLE KEYS */;
INSERT INTO `notificacoes` VALUES (1,6,'Bem-vindo!','Bem-vindo ao sistema, Teste Orçamentos!','/login','NAO_LIDA',NULL,'2026-09-07 15:41:24.305'),(2,9,'Bem-vindo!','Bem-vindo ao sistema, Teste Orçamentos!','/login','NAO_LIDA',NULL,'2026-09-07 15:41:24.305'),(3,6,'Bem-vindo!','Bem-vindo ao sistema, Fernando Teste!','/login','NAO_LIDA',NULL,'2026-09-15 16:59:58.869'),(4,9,'Bem-vindo!','Bem-vindo ao sistema, Fernando Teste!','/login','NAO_LIDA',NULL,'2026-09-15 16:59:58.869'),(5,17,'Bem-vindo!','Bem-vindo ao sistema, Fernando Teste!','/login','NAO_LIDA',NULL,'2026-09-15 16:59:58.869');
/*!40000 ALTER TABLE `notificacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orcamento_itens`
--

DROP TABLE IF EXISTS `orcamento_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orcamento_itens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orcamentoId` int NOT NULL,
  `servicoItemId` int DEFAULT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('SERVICO','MATERIAL','EQUIPAMENTO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` decimal(12,3) NOT NULL,
  `valorUnitario` decimal(12,2) NOT NULL,
  `valorTotal` decimal(12,2) NOT NULL,
  `unidadeId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orcamento_itens_orcamentoId_idx` (`orcamentoId`),
  KEY `orcamento_itens_servicoItemId_fkey` (`servicoItemId`),
  KEY `orcamento_itens_unidadeId_fkey` (`unidadeId`),
  CONSTRAINT `orcamento_itens_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orcamento_itens_servicoItemId_fkey` FOREIGN KEY (`servicoItemId`) REFERENCES `servico_itens` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orcamento_itens_unidadeId_fkey` FOREIGN KEY (`unidadeId`) REFERENCES `unidade_medida` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orcamento_itens`
--

LOCK TABLES `orcamento_itens` WRITE;
/*!40000 ALTER TABLE `orcamento_itens` DISABLE KEYS */;
INSERT INTO `orcamento_itens` VALUES (1,3,NULL,'Tijolo','MATERIAL',100.000,0.50,50.00,10);
/*!40000 ALTER TABLE `orcamento_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orcamentos`
--

DROP TABLE IF EXISTS `orcamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orcamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `atendimentoId` int NOT NULL,
  `visitaId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `enderecoId` int DEFAULT NULL,
  `urgencia` enum('NORMAL','URGENTE','URGENTISSIMO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('RASCUNHO','ENVIADO','APROVADO','RECUSADO','EXPIRADO','CANCELADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RASCUNHO',
  `versao` int NOT NULL DEFAULT '1',
  `valorTotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `validade` datetime(3) NOT NULL,
  `observacoes` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criadoPorId` int NOT NULL,
  `aprovadoPorId` int DEFAULT NULL,
  `aprovadoEm` datetime(3) DEFAULT NULL,
  `confirmadoPorUser` tinyint(1) NOT NULL DEFAULT '0',
  `dataConfirmacao` datetime(3) DEFAULT NULL,
  `formaPagamento` enum('DINHEIRO','PIX','CARTAO_CREDITO','CARTAO_DEBITO','BOLETO','TRANSFERENCIA') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokenConfirmacao` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orcamentos_codigo_key` (`codigo`),
  UNIQUE KEY `orcamentos_tokenConfirmacao_key` (`tokenConfirmacao`),
  KEY `orcamentos_atendimentoId_idx` (`atendimentoId`),
  KEY `orcamentos_visitaId_fkey` (`visitaId`),
  KEY `orcamentos_enderecoId_fkey` (`enderecoId`),
  KEY `orcamentos_criadoPorId_fkey` (`criadoPorId`),
  KEY `orcamentos_aprovadoPorId_fkey` (`aprovadoPorId`),
  KEY `orcamentos_clienteId_fkey` (`userId`),
  CONSTRAINT `orcamentos_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orcamentos_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orcamentos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orcamentos_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orcamentos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orcamentos_visitaId_fkey` FOREIGN KEY (`visitaId`) REFERENCES `visitas_tecnicas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orcamentos`
--

LOCK TABLES `orcamentos` WRITE;
/*!40000 ALTER TABLE `orcamentos` DISABLE KEYS */;
INSERT INTO `orcamentos` VALUES (3,'ORM-NaN',4,NULL,8,NULL,'NORMAL','ENVIADO',1,50.00,'2026-10-07 15:44:02.737',NULL,9,NULL,NULL,0,NULL,NULL,NULL,'2026-09-07 15:44:02.743','2026-09-07 15:44:02.808');
/*!40000 ALTER TABLE `orcamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordens_servico`
--

DROP TABLE IF EXISTS `ordens_servico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordens_servico` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orcamentoId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `atendimentoId` int DEFAULT NULL,
  `urgencia` enum('NORMAL','URGENTE','URGENTISSIMO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('AGUARDANDO_APROVACAO','AGENDADO','EM_ANDAMENTO','CONCLUIDO','CONFIRMADO','EM_SEPARACAO','SEPARADO','ENTREGUE','CANCELADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AGUARDANDO_APROVACAO',
  `valorTotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `enderecoId` int DEFAULT NULL,
  `dataInicioPrevista` datetime(3) DEFAULT NULL,
  `dataInicioReal` datetime(3) DEFAULT NULL,
  `dataFimReal` datetime(3) DEFAULT NULL,
  `tecnicoResponsavelId` int DEFAULT NULL,
  `aprovadoPorId` int DEFAULT NULL,
  `aprovadoEm` datetime(3) DEFAULT NULL,
  `rejeitadoEm` datetime(3) DEFAULT NULL,
  `motivoRejeicao` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observacoes` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmadoPorUser` tinyint(1) NOT NULL DEFAULT '0',
  `confirmadoEm` datetime(3) DEFAULT NULL,
  `avaliacao` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `dataFimExecucao` datetime DEFAULT NULL,
  `dataInicioExecucao` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ordens_servico_codigo_key` (`codigo`),
  UNIQUE KEY `ordens_servico_orcamentoId_key` (`orcamentoId`),
  KEY `ordens_servico_status_idx` (`status`),
  KEY `ordens_servico_urgencia_idx` (`urgencia`),
  KEY `ordens_servico_atendimentoId_fkey` (`atendimentoId`),
  KEY `ordens_servico_enderecoId_fkey` (`enderecoId`),
  KEY `ordens_servico_tecnicoResponsavelId_fkey` (`tecnicoResponsavelId`),
  KEY `ordens_servico_aprovadoPorId_fkey` (`aprovadoPorId`),
  KEY `ordens_servico_clienteId_fkey` (`userId`),
  CONSTRAINT `ordens_servico_aprovadoPorId_fkey` FOREIGN KEY (`aprovadoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordens_servico_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordens_servico_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordens_servico_orcamentoId_fkey` FOREIGN KEY (`orcamentoId`) REFERENCES `orcamentos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ordens_servico_tecnicoResponsavelId_fkey` FOREIGN KEY (`tecnicoResponsavelId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordens_servico_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordens_servico`
--

LOCK TABLES `ordens_servico` WRITE;
/*!40000 ALTER TABLE `ordens_servico` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordens_servico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamentos_os`
--

DROP TABLE IF EXISTS `pagamentos_os`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos_os` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordemServicoId` int NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `formaPagamento` enum('DINHEIRO','PIX','CARTAO_CREDITO','CARTAO_DEBITO','BOLETO','TRANSFERENCIA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `observacoes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registradoPorId` int DEFAULT NULL,
  `lancamentoId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `pagamentos_os_ordemServicoId_idx` (`ordemServicoId`),
  KEY `pagamentos_os_registradoPorId_fkey` (`registradoPorId`),
  KEY `pagamentos_os_lancamentoId_fkey` (`lancamentoId`),
  CONSTRAINT `pagamentos_os_lancamentoId_fkey` FOREIGN KEY (`lancamentoId`) REFERENCES `lancamentos_financeiros` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `pagamentos_os_ordemServicoId_fkey` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pagamentos_os_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentos_os`
--

LOCK TABLES `pagamentos_os` WRITE;
/*!40000 ALTER TABLE `pagamentos_os` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagamentos_os` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `papeis`
--

DROP TABLE IF EXISTS `papeis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `papeis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `papeis_nome_key` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `papeis`
--

LOCK TABLES `papeis` WRITE;
/*!40000 ALTER TABLE `papeis` DISABLE KEYS */;
INSERT INTO `papeis` VALUES (1,'ADMIN','Acesso total ao sistema',1,'2026-08-24 13:45:02.372','2026-08-25 17:03:39.918'),(2,'SUPERVISOR','Supervisão de equipes e operações',1,'2026-08-24 13:45:02.391','2026-08-25 17:03:39.936'),(3,'TECNICO','Execução de serviços técnicos',1,'2026-08-24 13:45:02.400','2026-08-25 17:03:39.953'),(4,'ALMOXARIFE','Controle de estoque e materiais',1,'2026-08-24 13:45:02.407','2026-08-25 17:03:39.974'),(5,'CONTABILIDADE','Gestão financeira',1,'2026-08-24 13:45:02.415','2026-08-25 17:03:39.986'),(6,'ATENDENTE','Atendimento ao cliente e triagem',1,'2026-08-24 13:45:02.420','2026-08-25 17:03:40.000'),(7,'CLIENTE','Acesso restrito ao próprio acompanhamento',1,'2026-08-24 13:45:02.426','2026-08-25 17:03:40.010'),(8,'COLABORADOR','Especialistas e técnicos de serviços',1,'2026-09-07 13:53:15.004','2026-09-07 15:05:04.181');
/*!40000 ALTER TABLE `papeis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `papel_permissao`
--

DROP TABLE IF EXISTS `papel_permissao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `papel_permissao` (
  `papelId` int NOT NULL,
  `permissaoId` int NOT NULL,
  PRIMARY KEY (`papelId`,`permissaoId`),
  KEY `papel_permissao_permissaoId_fkey` (`permissaoId`),
  CONSTRAINT `papel_permissao_papelId_fkey` FOREIGN KEY (`papelId`) REFERENCES `papeis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `papel_permissao_permissaoId_fkey` FOREIGN KEY (`permissaoId`) REFERENCES `permissoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `papel_permissao`
--

LOCK TABLES `papel_permissao` WRITE;
/*!40000 ALTER TABLE `papel_permissao` DISABLE KEYS */;
INSERT INTO `papel_permissao` VALUES (1,1),(2,1),(1,2),(2,2),(1,3),(2,3),(1,4),(2,4),(1,5),(2,5),(6,5),(1,6),(2,6),(6,6),(1,7),(2,7),(6,7),(1,8),(2,8),(3,8),(1,9),(2,9),(1,10),(2,10),(3,10),(1,11),(2,11),(3,11),(1,12),(2,12),(1,13),(2,13),(6,13),(1,14),(2,14),(6,14),(1,15),(2,15),(5,15),(1,16),(2,16),(5,16),(1,17),(2,17),(1,18),(2,18),(1,19),(2,19),(4,19),(1,20),(2,20),(4,20),(1,21),(2,21),(4,21),(1,22),(2,22),(1,23),(2,23),(4,23),(1,24),(2,24),(4,24),(1,25),(2,25),(4,25),(1,26),(2,26),(4,26),(1,27),(2,27),(3,27),(4,27),(6,27),(1,28),(2,28),(1,29),(2,29),(1,30),(2,30),(1,31),(2,31),(3,31),(1,32),(2,32),(3,32),(1,33),(2,33),(4,33),(1,34),(2,34),(1,35),(2,35),(1,36),(2,36),(3,36),(5,36),(6,36),(1,37),(2,37),(5,37),(6,37),(1,38),(2,38),(4,38),(5,38),(1,39),(1,40),(1,41),(2,41),(1,42),(2,42),(6,42),(1,43),(2,43),(6,43),(1,44),(2,44),(3,44),(1,45),(2,45),(3,45),(1,46),(2,46),(7,46),(1,47),(2,47);
/*!40000 ALTER TABLE `papel_permissao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiraEm` datetime(3) NOT NULL,
  `usadoEm` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_tokens_token_key` (`token`),
  KEY `password_reset_tokens_userId_idx` (`userId`),
  CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissoes`
--

DROP TABLE IF EXISTS `permissoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chave` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissoes_chave_key` (`chave`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissoes`
--

LOCK TABLES `permissoes` WRITE;
/*!40000 ALTER TABLE `permissoes` DISABLE KEYS */;
INSERT INTO `permissoes` VALUES (1,'criar_usuario','Criar novos usuários','usuarios','2026-08-24 13:45:02.432'),(2,'editar_usuario','Editar dados de usuários','usuarios','2026-08-24 13:45:02.445'),(3,'excluir_usuario','Excluir usuários do sistema','usuarios','2026-08-24 13:45:02.449'),(4,'definir_perfil','Definir perfil de acesso de usuários','usuarios','2026-08-24 13:45:02.455'),(5,'criar_atendimento','Criar novos atendimentos','atendimentos','2026-08-24 13:45:02.462'),(6,'editar_atendimento','Editar atendimentos existentes','atendimentos','2026-08-24 13:45:02.467'),(7,'criar_os','Criar ordens de serviço','ordens_servico','2026-08-24 13:45:02.472'),(8,'editar_os','Editar ordens de serviço','ordens_servico','2026-08-24 13:45:02.485'),(9,'aprovar_os','Aprovar ordens de serviço','ordens_servico','2026-08-24 13:45:02.492'),(10,'iniciar_os','Iniciar execução de OS','ordens_servico','2026-08-24 13:45:02.499'),(11,'concluir_os','Concluir ordens de serviço','ordens_servico','2026-08-24 13:45:02.504'),(12,'cancelar_os','Cancelar ordens de serviço','ordens_servico','2026-08-24 13:45:02.509'),(13,'confirmar_obra','Confirmar conclusão da obra','ordens_servico','2026-08-24 13:45:02.517'),(14,'entregar_os','Entregar OS ao cliente','ordens_servico','2026-08-24 13:45:02.522'),(15,'ver_financeiro','Acessar dados financeiros','financeiro','2026-08-24 13:45:02.527'),(16,'criar_pagamento','Registrar pagamentos','financeiro','2026-08-24 13:45:02.532'),(17,'aprovar_compra','Aprovar compras','financeiro','2026-08-24 13:45:02.538'),(18,'recusar_compra','Recusar compras','financeiro','2026-08-24 13:45:02.544'),(19,'receber_compra','Receber compras','financeiro','2026-08-24 13:45:02.549'),(20,'gerenciar_estoque','Gerenciar estoque de materiais','estoque','2026-08-24 13:45:02.554'),(21,'criar_material','Cadastrar novos materiais','estoque','2026-08-24 13:45:02.562'),(22,'editar_material','Editar materiais existentes','estoque','2026-08-24 13:45:02.573'),(23,'entrada_estoque','Registrar entradas no estoque','estoque','2026-08-24 13:45:02.580'),(24,'saida_estoque','Registrar saídas do estoque','estoque','2026-08-24 13:45:02.588'),(25,'criar_separacao','Criar separações de materiais','estoque','2026-08-24 13:45:02.596'),(26,'separar_item','Separar itens para OS','estoque','2026-08-24 13:45:02.603'),(27,'gerenciar_equipamentos','Gerenciar equipamentos','equipamentos','2026-08-24 13:45:02.609'),(28,'criar_equipamento','Cadastrar equipamentos','equipamentos','2026-08-24 13:45:02.617'),(29,'editar_equipamento','Editar equipamentos','equipamentos','2026-08-24 13:45:02.623'),(30,'excluir_equipamento','Excluir equipamentos','equipamentos','2026-08-24 13:45:02.631'),(31,'retirar_equipamento','Retirar equipamentos para uso','equipamentos','2026-08-24 13:45:02.639'),(32,'registrar_manutencao','Registrar manutenções','equipamentos','2026-08-24 13:45:02.646'),(33,'entregar_epi','Entregar EPIs a colaboradores','epis','2026-08-24 13:45:02.652'),(34,'ver_analises','Acessar análises e relatórios','relatorios','2026-08-24 13:45:02.659'),(35,'gerar_relatorios','Gerar relatórios','relatorios','2026-08-24 13:45:02.663'),(36,'ver_os','Visualizar ordens de serviço','relatorios','2026-08-24 13:45:02.669'),(37,'ver_orcamentos','Visualizar orçamentos','relatorios','2026-08-24 13:45:02.677'),(38,'ver_compras','Visualizar compras','relatorios','2026-08-24 13:45:02.683'),(39,'editar_configuracoes','Editar configurações do sistema','configuracoes','2026-08-24 13:45:02.691'),(40,'gerenciar_cargos','Gerenciar cargos','configuracoes','2026-08-24 13:45:02.698'),(41,'gerenciar_servicos','Gerenciar catálogo de serviços','configuracoes','2026-08-24 13:45:02.705'),(42,'gerenciar_agendamentos','Gerenciar agendamentos','configuracoes','2026-08-24 13:45:02.713'),(43,'gerenciar_visitas','Gerenciar visitas técnicas','configuracoes','2026-08-24 13:45:02.718'),(44,'ver_visitas','Visualizar visitas técnicas','relatorios','2026-08-24 13:45:02.728'),(45,'realizar_visita','Registrar realização de visita','atendimentos','2026-08-24 13:45:02.734'),(46,'ver_minha_os','Visualizar própria OS','relatorios','2026-08-24 13:45:02.741'),(47,'gerenciar_papeis','Gerenciar papéis e permissões do RBAC','configuracoes','2026-08-24 14:41:56.294');
/*!40000 ALTER TABLE `permissoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recurso_atividades`
--

DROP TABLE IF EXISTS `recurso_atividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recurso_atividades` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catalogoAtividadeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('EQUIPAMENTO','EPI','MATERIAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `itemCatalogoId` int NOT NULL,
  `quantidade` decimal(10,2) NOT NULL DEFAULT '1.00',
  PRIMARY KEY (`id`),
  KEY `recurso_atividades_catalogoAtividadeId_fkey` (`catalogoAtividadeId`),
  CONSTRAINT `recurso_atividades_catalogoAtividadeId_fkey` FOREIGN KEY (`catalogoAtividadeId`) REFERENCES `catalogo_atividades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recurso_atividades`
--

LOCK TABLES `recurso_atividades` WRITE;
/*!40000 ALTER TABLE `recurso_atividades` DISABLE KEYS */;
/*!40000 ALTER TABLE `recurso_atividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `retiradas_equipamentos`
--

DROP TABLE IF EXISTS `retiradas_equipamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retiradas_equipamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipamentoId` int NOT NULL,
  `colaboradorId` int NOT NULL,
  `dataRetirada` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `dataDevolucao` datetime(3) DEFAULT NULL,
  `observacao` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registradoPorId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atividadeOSId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dataPrevisaoDevolucao` datetime(3) DEFAULT NULL,
  `osId` int DEFAULT NULL,
  `status` enum('EM_USO','DEVOLVIDO','EM_MANUTENCAO','PERDIDO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EM_USO',
  PRIMARY KEY (`id`),
  KEY `retiradas_equipamentos_equipamentoId_dataRetirada_idx` (`equipamentoId`,`dataRetirada`),
  KEY `retiradas_equipamentos_colaboradorId_fkey` (`colaboradorId`),
  KEY `retiradas_equipamentos_registradoPorId_fkey` (`registradoPorId`),
  KEY `retiradas_equipamentos_atividadeOSId_idx` (`atividadeOSId`),
  KEY `retiradas_equipamentos_osId_idx` (`osId`),
  CONSTRAINT `retiradas_equipamentos_atividadeOSId_fkey` FOREIGN KEY (`atividadeOSId`) REFERENCES `atividades_os` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `retiradas_equipamentos_colaboradorId_fkey` FOREIGN KEY (`colaboradorId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `retiradas_equipamentos_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `retiradas_equipamentos_osId_fkey` FOREIGN KEY (`osId`) REFERENCES `ordens_servico` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `retiradas_equipamentos_registradoPorId_fkey` FOREIGN KEY (`registradoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `retiradas_equipamentos`
--

LOCK TABLES `retiradas_equipamentos` WRITE;
/*!40000 ALTER TABLE `retiradas_equipamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `retiradas_equipamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saldos_estoque`
--

DROP TABLE IF EXISTS `saldos_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saldos_estoque` (
  `materialId` int NOT NULL,
  `saldo` decimal(14,3) NOT NULL DEFAULT '0.000',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`materialId`),
  CONSTRAINT `saldos_estoque_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saldos_estoque`
--

LOCK TABLES `saldos_estoque` WRITE;
/*!40000 ALTER TABLE `saldos_estoque` DISABLE KEYS */;
INSERT INTO `saldos_estoque` VALUES (1,0.000,'2026-08-12 22:02:59.708'),(2,0.000,'2026-08-12 22:02:59.722'),(3,0.000,'2026-08-12 22:02:59.731'),(4,0.000,'2026-08-12 22:02:59.746'),(5,0.000,'2026-08-12 22:02:59.775'),(6,0.000,'2026-08-12 22:02:59.805'),(7,0.000,'2026-08-12 22:02:59.826'),(10,0.000,'2026-08-25 15:30:35.500'),(11,0.000,'2026-08-25 15:30:35.518'),(12,0.000,'2026-08-25 15:30:35.532'),(13,0.000,'2026-08-25 15:30:35.544'),(14,0.000,'2026-08-25 15:30:35.555'),(16,0.000,'2026-08-25 15:30:35.580'),(17,0.000,'2026-08-25 15:30:35.590'),(20,0.000,'2026-08-25 15:30:35.623'),(21,0.000,'2026-08-25 15:30:35.635'),(27,0.000,'2026-08-25 15:30:35.718'),(29,0.000,'2026-08-25 15:30:35.751'),(35,0.000,'2026-08-25 15:30:35.821'),(55,0.000,'2026-08-25 15:30:36.088'),(56,0.000,'2026-08-25 15:30:36.101'),(57,0.000,'2026-08-25 15:30:36.110'),(59,0.000,'2026-08-25 15:30:36.133'),(64,0.000,'2026-08-25 15:30:36.193'),(65,0.000,'2026-08-25 15:30:36.203'),(66,0.000,'2026-08-25 15:30:36.219'),(69,0.000,'2026-08-25 15:30:36.260'),(70,0.000,'2026-08-25 15:30:36.272'),(71,0.000,'2026-08-25 15:30:36.283'),(79,0.000,'2026-08-25 15:30:36.372'),(80,0.000,'2026-08-25 15:30:36.382'),(81,0.000,'2026-08-25 15:30:36.399'),(82,0.000,'2026-08-25 15:30:36.407'),(85,0.000,'2026-08-25 15:30:36.442'),(87,0.000,'2026-08-25 15:30:36.463'),(88,0.000,'2026-08-25 15:30:36.478'),(89,0.000,'2026-08-25 15:30:36.486'),(90,0.000,'2026-08-25 15:30:36.505'),(91,0.000,'2026-08-25 15:30:36.515'),(93,0.000,'2026-08-25 15:30:36.543'),(94,0.000,'2026-08-25 15:30:36.552'),(95,0.000,'2026-08-25 15:30:36.562'),(98,0.000,'2026-08-25 15:30:36.601'),(99,0.000,'2026-08-25 15:30:36.613'),(100,0.000,'2026-08-25 15:30:36.624'),(101,0.000,'2026-08-25 15:30:36.648'),(102,0.000,'2026-08-25 15:30:36.659'),(597,0.000,'2026-09-14 18:02:54.818'),(598,0.000,'2026-09-14 18:04:31.495');
/*!40000 ALTER TABLE `saldos_estoque` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `separacao_itens`
--

DROP TABLE IF EXISTS `separacao_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `separacao_itens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `separacaoId` int NOT NULL,
  `materialId` int DEFAULT NULL,
  `quantidadeNecessaria` decimal(12,3) NOT NULL,
  `quantidadeSeparada` decimal(12,3) NOT NULL DEFAULT '0.000',
  `status` enum('PENDENTE','SEPARADO','EM_FALTA','RETIRADO','CONFERIDO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `retiradoPorId` int DEFAULT NULL,
  `retiradoEm` datetime(3) DEFAULT NULL,
  `conferidoPorId` int DEFAULT NULL,
  `conferidoEm` datetime(3) DEFAULT NULL,
  `observacao` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `epiId` int DEFAULT NULL,
  `equipamentoId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `separacao_itens_materialId_idx` (`materialId`),
  KEY `separacao_itens_retiradoPorId_fkey` (`retiradoPorId`),
  KEY `separacao_itens_conferidoPorId_fkey` (`conferidoPorId`),
  KEY `separacao_itens_separacaoId_materialId_idx` (`separacaoId`,`materialId`),
  KEY `separacao_itens_epiId_idx` (`epiId`),
  KEY `separacao_itens_equipamentoId_idx` (`equipamentoId`),
  CONSTRAINT `separacao_itens_conferidoPorId_fkey` FOREIGN KEY (`conferidoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `separacao_itens_epiId_fkey` FOREIGN KEY (`epiId`) REFERENCES `epis` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `separacao_itens_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `separacao_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `separacao_itens_retiradoPorId_fkey` FOREIGN KEY (`retiradoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `separacao_itens_separacaoId_fkey` FOREIGN KEY (`separacaoId`) REFERENCES `separacoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `separacao_itens`
--

LOCK TABLES `separacao_itens` WRITE;
/*!40000 ALTER TABLE `separacao_itens` DISABLE KEYS */;
/*!40000 ALTER TABLE `separacao_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `separacoes`
--

DROP TABLE IF EXISTS `separacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `separacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etapaOsId` int NOT NULL,
  `dataNecessidade` datetime(3) NOT NULL,
  `status` enum('PENDENTE','PARCIAL','CONCLUIDA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `criadoPorId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `confirmadoPorId` int DEFAULT NULL,
  `dataConfirmacao` datetime(3) DEFAULT NULL,
  `dataPrevista` datetime(3) DEFAULT NULL,
  `equipeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `osId` int DEFAULT NULL,
  `statusNovo` enum('SEPARACAO_PENDENTE','SEPARACAO_CONCLUIDA','EQUIPE_NOTIFICADA','RETIRADA_PENDENTE','RETIRADA_CONCLUIDA','DEVOLUCAO_PENDENTE','DEVOLUCAO_CONCLUIDA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SEPARACAO_PENDENTE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `separacoes_codigo_key` (`codigo`),
  KEY `separacoes_etapaOsId_fkey` (`etapaOsId`),
  KEY `separacoes_criadoPorId_fkey` (`criadoPorId`),
  KEY `separacoes_osId_idx` (`osId`),
  KEY `separacoes_equipeId_idx` (`equipeId`),
  KEY `separacoes_confirmadoPorId_fkey` (`confirmadoPorId`),
  CONSTRAINT `separacoes_confirmadoPorId_fkey` FOREIGN KEY (`confirmadoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `separacoes_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `separacoes_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `separacoes_etapaOsId_fkey` FOREIGN KEY (`etapaOsId`) REFERENCES `etapas_os` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `separacoes_osId_fkey` FOREIGN KEY (`osId`) REFERENCES `ordens_servico` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `separacoes`
--

LOCK TABLES `separacoes` WRITE;
/*!40000 ALTER TABLE `separacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `separacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servico_itens`
--

DROP TABLE IF EXISTS `servico_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servico_itens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('SERVICO','MATERIAL','EQUIPAMENTO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `etapaId` int DEFAULT NULL,
  `materialId` int DEFAULT NULL,
  `precoSugerido` decimal(12,2) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `unidadeId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `servico_itens_etapaId_fkey` (`etapaId`),
  KEY `servico_itens_materialId_fkey` (`materialId`),
  KEY `servico_itens_unidadeId_fkey` (`unidadeId`),
  CONSTRAINT `servico_itens_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `servico_itens_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `servico_itens_unidadeId_fkey` FOREIGN KEY (`unidadeId`) REFERENCES `unidade_medida` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servico_itens`
--

LOCK TABLES `servico_itens` WRITE;
/*!40000 ALTER TABLE `servico_itens` DISABLE KEYS */;
INSERT INTO `servico_itens` VALUES (1,'Limpeza e preparo da base','SERVICO',1,NULL,6.00,1,'2026-08-12 22:02:59.836','2026-08-12 22:02:59.836',4),(2,'Aplicação de primer','SERVICO',1,NULL,8.00,1,'2026-08-12 22:02:59.850','2026-08-12 22:02:59.850',4),(3,'Manta asfáltica aplicada','MATERIAL',2,1,45.00,1,'2026-08-12 22:02:59.860','2026-08-12 22:02:59.860',4),(4,'Aplicação de massa asfáltica','MATERIAL',3,3,35.00,1,'2026-08-12 22:02:59.869','2026-08-12 22:02:59.869',2),(5,'Acabamento com acrílico','MATERIAL',4,6,260.00,1,'2026-08-12 22:02:59.878','2026-08-12 22:02:59.878',18),(6,'Teste de estanqueidade','SERVICO',4,NULL,150.00,1,'2026-08-12 22:02:59.891','2026-08-12 22:02:59.891',10);
/*!40000 ALTER TABLE `servico_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicos_marketing`
--

DROP TABLE IF EXISTS `servicos_marketing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicos_marketing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icone` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `servicos_marketing_titulo_key` (`titulo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicos_marketing`
--

LOCK TABLES `servicos_marketing` WRITE;
/*!40000 ALTER TABLE `servicos_marketing` DISABLE KEYS */;
INSERT INTO `servicos_marketing` VALUES (1,'Impermeabilização de piscinas','Reforma, manutenção e impermeabilização completa de piscinas, com tratamento anti-infiltração e acabamento durável.','M19 9l-7 12-7-12a7 7 0 1114 0z',1,1,'2026-08-12 22:02:59.908','2026-08-25 17:03:39.643'),(2,'Manta asfáltica','Aplicação de manta asfáltica em lajes, telhados e áreas expostas, protegendo contra intempéries e trincas.','M4 18l2-8h12l2 8M7 10l1-5h8l1 5M8 10a2 2 0 100 4M16 10a2 2 0 100 4',1,2,'2026-08-12 22:02:59.921','2026-08-25 17:03:39.672'),(3,'Lajes e paredes','Tratamento de umidade e infiltração em lajes, paredes, reservatórios e áreas molhadas de qualquer edificação.','M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',1,3,'2026-08-12 22:02:59.937','2026-08-25 17:03:39.690'),(4,'Civil','Atuamos em todas as atividades da Construção Civil.','M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',1,0,'2026-08-20 16:57:28.195','2026-08-20 16:57:28.195'),(5,'Telhado','Telhados, Calhas, Caixas D\'agua','M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z',1,0,'2026-08-24 12:32:43.537','2026-08-24 12:32:43.537');
/*!40000 ALTER TABLE `servicos_marketing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status_equipamentos`
--

DROP TABLE IF EXISTS `status_equipamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_equipamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_equipamentos`
--

LOCK TABLES `status_equipamentos` WRITE;
/*!40000 ALTER TABLE `status_equipamentos` DISABLE KEYS */;
INSERT INTO `status_equipamentos` VALUES (1,'Disponivel',1,1,'2026-08-25 17:03:41.027','2026-08-25 17:03:41.027'),(2,'Em uso',1,2,'2026-08-25 17:03:41.039','2026-08-25 17:03:41.039'),(3,'Em manutencao',1,3,'2026-08-25 17:03:41.046','2026-08-25 17:03:41.046');
/*!40000 ALTER TABLE `status_equipamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategorias_epis`
--

DROP TABLE IF EXISTS `subcategorias_epis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategorias_epis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoriaId` int NOT NULL,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `subcategorias_epis_categoriaId_idx` (`categoriaId`),
  CONSTRAINT `subcategorias_epis_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_epis` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategorias_epis`
--

LOCK TABLES `subcategorias_epis` WRITE;
/*!40000 ALTER TABLE `subcategorias_epis` DISABLE KEYS */;
INSERT INTO `subcategorias_epis` VALUES (1,1,'Capacete de Segurança',NULL,1,1,'2026-09-11 19:30:17.210','2026-09-11 19:30:17.210'),(2,1,'Capacete com Abafador',NULL,1,2,'2026-09-11 19:30:17.222','2026-09-11 19:30:17.222'),(3,1,'Boné de Segurança',NULL,1,3,'2026-09-11 19:30:17.227','2026-09-11 19:30:17.227'),(4,2,'Macacão',NULL,1,1,'2026-09-11 19:30:17.235','2026-09-11 19:30:17.235'),(5,2,'Aventil',NULL,1,2,'2026-09-11 19:30:17.242','2026-09-11 19:30:17.242'),(6,2,'Colete Refletivo',NULL,1,3,'2026-09-11 19:30:17.250','2026-09-11 19:30:17.250'),(7,2,'Calça',NULL,1,4,'2026-09-11 19:30:17.259','2026-09-11 19:30:17.259'),(8,3,'Máscara PFF2',NULL,1,1,'2026-09-11 19:30:17.264','2026-09-11 19:30:17.264'),(9,3,'Máscara com Filtro',NULL,1,2,'2026-09-11 19:30:17.271','2026-09-11 19:30:17.271'),(10,3,'Respirador Sem Filtro',NULL,1,3,'2026-09-11 19:30:17.278','2026-09-11 19:30:17.278'),(11,3,'Filtro Separado',NULL,1,4,'2026-09-11 19:30:17.284','2026-09-11 19:30:17.284'),(12,4,'Luva de Vaqueta',NULL,1,1,'2026-09-11 19:30:17.291','2026-09-11 19:30:17.291'),(13,4,'Luva Nitrílica',NULL,1,2,'2026-09-11 19:30:17.297','2026-09-11 19:30:17.297'),(14,4,'Luva de Borracha',NULL,1,3,'2026-09-11 19:30:17.304','2026-09-11 19:30:17.304'),(15,4,'Luva Térmica',NULL,1,4,'2026-09-11 19:30:17.313','2026-09-11 19:30:17.313'),(16,5,'Óculos de Segurança',NULL,1,1,'2026-09-11 19:30:17.318','2026-09-11 19:30:17.318'),(17,5,'Óculos Ampla Visão',NULL,1,2,'2026-09-11 19:30:17.323','2026-09-11 19:30:17.323'),(18,5,'Máscara Facial',NULL,1,3,'2026-09-11 19:30:17.328','2026-09-11 19:30:17.328'),(19,6,'Abafador de Ruído',NULL,1,1,'2026-09-11 19:30:17.337','2026-09-11 19:30:17.337'),(20,6,'Protetor Auricular',NULL,1,2,'2026-09-11 19:30:17.342','2026-09-11 19:30:17.342'),(21,6,'Canaleta',NULL,1,3,'2026-09-11 19:30:17.347','2026-09-11 19:30:17.347'),(22,7,'Cinturão Paraquedista',NULL,1,1,'2026-09-11 19:30:17.352','2026-09-11 19:30:17.352'),(23,7,'Talabarte',NULL,1,2,'2026-09-11 19:30:17.360','2026-09-11 19:30:17.360'),(24,7,'Trava-Queda',NULL,1,3,'2026-09-11 19:30:17.365','2026-09-11 19:30:17.365'),(25,7,'Linha de Vida',NULL,1,4,'2026-09-11 19:30:17.369','2026-09-11 19:30:17.369'),(26,8,'Joelheira',NULL,1,1,'2026-09-11 19:30:17.374','2026-09-11 19:30:17.374'),(27,8,'Cotoveleira',NULL,1,2,'2026-09-11 19:30:17.380','2026-09-11 19:30:17.380'),(28,8,'Munhequeira',NULL,1,3,'2026-09-11 19:30:17.389','2026-09-11 19:30:17.389');
/*!40000 ALTER TABLE `subcategorias_epis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategorias_equipamentos`
--

DROP TABLE IF EXISTS `subcategorias_equipamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategorias_equipamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoriaId` int NOT NULL,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `subcategorias_equipamentos_categoriaId_idx` (`categoriaId`),
  CONSTRAINT `subcategorias_equipamentos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_equipamentos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategorias_equipamentos`
--

LOCK TABLES `subcategorias_equipamentos` WRITE;
/*!40000 ALTER TABLE `subcategorias_equipamentos` DISABLE KEYS */;
INSERT INTO `subcategorias_equipamentos` VALUES (1,9,'Airless',NULL,1,1,'2026-09-11 18:14:39.892','2026-09-11 18:14:39.892'),(2,9,'Truque',NULL,1,2,'2026-09-11 18:14:39.903','2026-09-11 18:14:39.903'),(3,9,'Rolo',NULL,1,3,'2026-09-11 18:14:39.909','2026-09-11 18:14:39.909'),(4,9,'Espátula',NULL,1,4,'2026-09-11 18:14:39.916','2026-09-11 18:14:39.916'),(5,9,'Desempenadeira',NULL,1,5,'2026-09-11 18:14:39.922','2026-09-11 18:14:39.922'),(6,10,'Cinturão Tipo Paraquedista',NULL,1,1,'2026-09-11 18:14:39.928','2026-09-11 18:14:39.928'),(7,10,'Talabarte',NULL,1,2,'2026-09-11 18:14:39.937','2026-09-11 18:14:39.937'),(8,10,'Mosquetão',NULL,1,3,'2026-09-11 18:14:39.943','2026-09-11 18:14:39.943'),(9,10,'Trava-Queda',NULL,1,4,'2026-09-11 18:14:39.949','2026-09-11 18:14:39.949'),(10,10,'Linha de Vida',NULL,1,5,'2026-09-11 18:14:39.954','2026-09-11 18:14:39.954'),(11,11,'Escada Extensível',NULL,1,1,'2026-09-11 18:14:39.960','2026-09-11 18:14:39.960'),(12,11,'Escada Convolúvel',NULL,1,2,'2026-09-11 18:14:39.968','2026-09-11 18:14:39.968'),(13,11,'Escada Triangular',NULL,1,3,'2026-09-11 18:14:39.975','2026-09-11 18:14:39.975'),(14,11,'Escada Plataforma',NULL,1,4,'2026-09-11 18:14:39.980','2026-09-11 18:14:39.980'),(15,12,'Furadeira',NULL,1,1,'2026-09-11 18:14:39.988','2026-09-11 18:14:39.988'),(16,12,'Serra',NULL,1,2,'2026-09-11 18:14:39.997','2026-09-11 18:14:39.997'),(17,12,'Esmerilhadeira',NULL,1,3,'2026-09-11 18:14:40.008','2026-09-11 18:14:40.008'),(18,12,'Lixadeira',NULL,1,4,'2026-09-11 18:14:40.022','2026-09-11 18:14:40.022'),(19,12,'Misturador Elétrico',NULL,1,5,'2026-09-11 18:14:40.030','2026-09-11 18:14:40.030'),(20,13,'Tesoura',NULL,1,1,'2026-09-11 18:14:40.041','2026-09-11 18:14:40.041'),(21,13,'Facão',NULL,1,2,'2026-09-11 18:14:40.054','2026-09-11 18:14:40.054'),(22,13,'Chave de Fenda',NULL,1,3,'2026-09-11 18:14:40.065','2026-09-11 18:14:40.065'),(23,13,'Martelo',NULL,1,4,'2026-09-11 18:14:40.080','2026-09-11 18:14:40.080'),(24,13,'Nível',NULL,1,5,'2026-09-11 18:14:40.092','2026-09-11 18:14:40.092'),(25,14,'Fita Adesiva',NULL,1,1,'2026-09-11 18:14:40.103','2026-09-11 18:14:40.103'),(26,14,'Lona',NULL,1,2,'2026-09-11 18:14:40.116','2026-09-11 18:14:40.116'),(27,14,'Plástico',NULL,1,3,'2026-09-11 18:14:40.127','2026-09-11 18:14:40.127'),(28,14,'Isqueiro',NULL,1,4,'2026-09-11 18:14:40.139','2026-09-11 18:14:40.139'),(29,14,'Barbante',NULL,1,5,'2026-09-11 18:14:40.152','2026-09-11 18:14:40.152'),(30,15,'Caixa de Ferramenta',NULL,1,1,'2026-09-11 18:14:40.161','2026-09-11 18:14:40.161'),(31,15,'Carrinho de Mão',NULL,1,2,'2026-09-11 18:14:40.173','2026-09-11 18:14:40.173'),(32,15,'Compressor',NULL,1,3,'2026-09-11 18:14:40.187','2026-09-11 18:14:40.187'),(33,15,'Gerador',NULL,1,4,'2026-09-11 18:14:40.202','2026-09-11 18:14:40.202'),(34,15,'Outros',NULL,1,5,'2026-09-11 18:14:40.215','2026-09-11 18:14:40.215');
/*!40000 ALTER TABLE `subcategorias_equipamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategorias_materiais`
--

DROP TABLE IF EXISTS `subcategorias_materiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategorias_materiais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoriaId` int NOT NULL,
  `nome` varchar(120) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `subcategorias_materiais_categoriaId_idx` (`categoriaId`),
  CONSTRAINT `subcategorias_materiais_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_materiais` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategorias_materiais`
--

LOCK TABLES `subcategorias_materiais` WRITE;
/*!40000 ALTER TABLE `subcategorias_materiais` DISABLE KEYS */;
INSERT INTO `subcategorias_materiais` VALUES (1,1,'Tinta Acrílica','Tintas acrílicas para uso interno e externo',1,1,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(2,1,'Tinta Esmalte','Esmaltes sintéticos e acrílicos',1,2,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(3,1,'Tinta Latex','Látex PVA e acrílico',1,3,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(4,1,'Primer','Preparadores e seladores',1,4,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(5,2,'Porcelanato','Revestimentos cerâmicos tipo porcelanato',1,1,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(6,2,'Cerâmica','Azulejos e pastilhas cerâmicas',1,2,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(7,2,'Revestimento Acústico','Painéis e placas acústicas',1,3,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(8,3,'Manta Asfáltica','Mantas para impermeabilização',1,1,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(9,3,'Líquido Impermeabilizante','Impermeabilizantes líquidos e membranas',1,2,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(10,3,'Primer Asfáltico','Preparadores para impermeabilização',1,3,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(11,4,'Detergente','Produtos de limpeza geral',1,1,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(12,4,'Desinfetante','Desinfetantes e sanitizantes',1,2,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(13,4,'Multiuso','Produtos multiuso e universais',1,3,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(14,5,'Parafuso','Parafusos de diversos tipos e tamanhos',1,1,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(15,5,'Prego','Pregos para construção e marcenaria',1,2,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(16,5,'Bucha','Buchas de fixação',1,3,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(17,5,'Arruela','Arruelas de pressão e lava',1,4,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000'),(18,5,'Porca','Porcas de diversos tipos',1,5,'2026-09-05 07:08:14.000','2026-09-05 07:08:14.000');
/*!40000 ALTER TABLE `subcategorias_materiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `substep_atividades`
--

DROP TABLE IF EXISTS `substep_atividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `substep_atividades` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catalogoAtividadeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordem` int NOT NULL,
  `descricao` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `observacao` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `substep_atividades_catalogoAtividadeId_ordem_key` (`catalogoAtividadeId`,`ordem`),
  CONSTRAINT `substep_atividades_catalogoAtividadeId_fkey` FOREIGN KEY (`catalogoAtividadeId`) REFERENCES `catalogo_atividades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `substep_atividades`
--

LOCK TABLES `substep_atividades` WRITE;
/*!40000 ALTER TABLE `substep_atividades` DISABLE KEYS */;
/*!40000 ALTER TABLE `substep_atividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tamanhos_equipamentos`
--

DROP TABLE IF EXISTS `tamanhos_equipamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tamanhos_equipamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordem` int NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tamanhos_equipamentos`
--

LOCK TABLES `tamanhos_equipamentos` WRITE;
/*!40000 ALTER TABLE `tamanhos_equipamentos` DISABLE KEYS */;
INSERT INTO `tamanhos_equipamentos` VALUES (1,'P',1,1,'2026-08-25 14:33:11.161','2026-08-25 14:33:11.161'),(2,'M',2,1,'2026-08-25 14:33:11.168','2026-08-25 14:33:11.168'),(3,'G',3,1,'2026-08-25 14:33:11.174','2026-08-25 14:33:11.174'),(4,'GG',4,1,'2026-08-25 14:33:11.180','2026-08-25 14:33:11.180'),(5,'UN',5,1,'2026-08-25 14:33:11.187','2026-08-25 14:33:11.187');
/*!40000 ALTER TABLE `tamanhos_equipamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_manutencao`
--

DROP TABLE IF EXISTS `tipos_manutencao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_manutencao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_manutencao`
--

LOCK TABLES `tipos_manutencao` WRITE;
/*!40000 ALTER TABLE `tipos_manutencao` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipos_manutencao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unidade_medida`
--

DROP TABLE IF EXISTS `unidade_medida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidade_medida` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `ordem` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unidade_medida_nome_key` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidade_medida`
--

LOCK TABLES `unidade_medida` WRITE;
/*!40000 ALTER TABLE `unidade_medida` DISABLE KEYS */;
INSERT INTO `unidade_medida` VALUES (2,'KILOGRAMAS',1,2,'2026-09-02 21:36:50.163','2026-09-11 17:50:49.944'),(4,'METRO QUADRADO',1,4,'2026-09-02 21:36:50.163','2026-09-11 17:50:49.954'),(5,'MILILITRO',1,5,'2026-09-02 21:36:50.163','2026-09-11 17:50:49.965'),(6,'CAIXA',1,6,'2026-09-02 21:36:50.163','2026-09-11 17:50:49.976'),(10,'UNIDADE',1,0,'2026-09-11 17:02:05.735','2026-09-11 17:02:05.735'),(11,'PAR',1,0,'2026-09-11 17:02:05.762','2026-09-11 17:02:05.762'),(12,'PEÇA',1,0,'2026-09-11 17:35:25.156','2026-09-11 17:35:25.156'),(14,'LATA',1,0,'2026-09-11 17:35:25.181','2026-09-11 17:35:25.181'),(15,'PACOTE',1,0,'2026-09-11 17:35:25.188','2026-09-11 17:35:25.188'),(16,'METRO',1,0,'2026-09-11 17:35:25.197','2026-09-11 17:35:25.197'),(17,'SACO',1,0,'2026-09-11 17:35:25.207','2026-09-11 17:35:25.207'),(18,'GALÃO',1,0,'2026-09-11 17:35:25.216','2026-09-11 17:35:25.216'),(19,'FRASCO',1,0,'2026-09-11 17:35:25.223','2026-09-11 17:35:25.223'),(20,'TAMBOR',1,0,'2026-09-11 17:35:25.231','2026-09-11 17:35:25.231'),(21,'BARRA',1,0,'2026-09-11 17:35:25.244','2026-09-11 17:35:25.244'),(22,'PLACA',1,0,'2026-09-11 17:35:25.253','2026-09-11 17:35:25.253'),(24,'ROLO',1,0,'2026-09-11 17:35:25.269','2026-09-11 17:35:25.269'),(25,'CONJUNTO',1,0,'2026-09-11 17:35:25.278','2026-09-11 17:35:25.278'),(27,'LITRO',1,0,'2026-09-11 17:35:25.295','2026-09-11 17:35:25.295'),(28,'SACHE',1,0,'2026-09-11 17:35:25.301','2026-09-11 17:35:25.301'),(29,'BISNAGA',1,0,'2026-09-11 17:35:25.309','2026-09-11 17:35:25.309'),(31,'BALDE 18 LITROS',1,0,'2026-09-11 17:50:08.988','2026-09-11 17:50:08.988'),(32,'BALDE 5 LITROS',1,0,'2026-09-11 17:50:49.988','2026-09-11 17:50:49.988'),(33,'BALDE 10 LITROS',1,0,'2026-09-11 17:50:49.996','2026-09-11 17:50:49.996'),(34,'BALDE 20 LITROS',1,0,'2026-09-11 17:50:50.002','2026-09-11 17:50:50.002'),(35,'SACO 10 LITROS',1,0,'2026-09-11 17:50:50.009','2026-09-11 17:50:50.009'),(36,'SACO 12 LITROS',1,0,'2026-09-11 17:50:50.015','2026-09-11 17:50:50.015'),(37,'SACO 15 LITROS',1,0,'2026-09-11 17:50:50.022','2026-09-11 17:50:50.022'),(38,'SACO 20 LITROS',1,0,'2026-09-11 17:50:50.030','2026-09-11 17:50:50.030'),(39,'SACO 30 LITROS',1,0,'2026-09-11 17:50:50.039','2026-09-11 17:50:50.039'),(40,'SACO 40 LITROS',1,0,'2026-09-11 17:50:50.046','2026-09-11 17:50:50.046'),(41,'SACO 50 LITROS',1,0,'2026-09-11 17:50:50.053','2026-09-11 17:50:50.053'),(42,'SACO 100 LITROS',1,0,'2026-09-11 17:50:50.060','2026-09-11 17:50:50.060'),(43,'BALDE 3,6 LITROS',1,0,'2026-09-14 16:25:02.374','2026-09-14 17:17:15.235');
/*!40000 ALTER TABLE `unidade_medida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uploads`
--

DROP TABLE IF EXISTS `uploads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaderId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `uploads_uploaderId_fkey` (`uploaderId`),
  CONSTRAINT `uploads_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploads`
--

LOCK TABLES `uploads` WRITE;
/*!40000 ALTER TABLE `uploads` DISABLE KEYS */;
/*!40000 ALTER TABLE `uploads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `senhaHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `cargoId` int DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `cpfCnpj` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_cpfCnpj_key` (`cpfCnpj`),
  KEY `users_cargoId_fkey` (`cargoId`),
  CONSTRAINT `users_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `cargos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin Sistema','admin@imper.local','$2a$10$Hp/lYHftU0BNXq4Sp5JcqudF.rZ3mEcGtvJBBjUcvGesKoOE0WdOi',1,1,NULL,'2026-08-12 22:00:47.633','2026-08-25 17:03:38.788',NULL),(2,'Supervisor A','supervisor@imper.local','$2a$10$Hp/lYHftU0BNXq4Sp5JcqudF.rZ3mEcGtvJBBjUcvGesKoOE0WdOi',1,2,NULL,'2026-08-12 22:00:47.645','2026-08-25 17:03:38.933',NULL),(3,'Técnico 1','tecnico@imper.local','$2a$10$Hp/lYHftU0BNXq4Sp5JcqudF.rZ3mEcGtvJBBjUcvGesKoOE0WdOi',1,3,NULL,'2026-08-12 22:00:47.655','2026-08-25 17:03:38.950',NULL),(4,'Almoxarife A','almoxarife@imper.local','$2a$10$Hp/lYHftU0BNXq4Sp5JcqudF.rZ3mEcGtvJBBjUcvGesKoOE0WdOi',1,4,NULL,'2026-08-12 22:00:47.660','2026-08-25 17:03:38.979',NULL),(5,'Contabilidade','contabilidade@imper.local','$2a$10$Hp/lYHftU0BNXq4Sp5JcqudF.rZ3mEcGtvJBBjUcvGesKoOE0WdOi',1,5,NULL,'2026-08-12 22:00:47.671','2026-08-25 17:03:39.010',NULL),(6,'Atendente A','atendente@imper.local','$2a$10$Hp/lYHftU0BNXq4Sp5JcqudF.rZ3mEcGtvJBBjUcvGesKoOE0WdOi',1,6,NULL,'2026-08-12 22:00:47.677','2026-08-25 17:03:39.042',NULL),(7,'Rodrigo Carvalho','rodrigo@imperpocos.com.br','$2a$10$/Pdtp1Eei0fCdFrYS1XEGOVKqfPsQRgqgjTsM/eXaOumWXJWxiPf.',1,7,'3591290044','2026-09-05 23:36:37.587','2026-09-06 01:53:31.495',NULL),(8,'Fernando C Filho','camargo.fernando@gmail.com','$2a$10$r0WaEocp8gq8DWNbAFy8S.aRHHjG.hno7jQIpdcmRpMMbR9MaakZO',1,4,'3599515354','2026-09-06 18:11:25.081','2026-09-06 18:11:25.081',NULL),(9,'Teste Orçamentos','orcamentos@test.local','$2a$10$0r.o17Z9MyfKZTCD1nOMsupIJhGqqxl9sVXsTEGF7BWwIPwUDS/EG',1,NULL,NULL,'2026-09-07 15:41:24.268','2026-09-07 15:41:24.268',NULL),(10,'Adriana Granato',NULL,'$2a$10$cldNOw0m6KLKE3nUft0FAu7HP/9P4Ab/83e25azMGi2czgvU7jTF.',1,NULL,NULL,'2026-09-14 15:49:34.280','2026-09-14 15:49:34.280',NULL),(11,'Amanda',NULL,'$2a$10$6dDF/.Kjvh7xzH5edxp3TuXuq17LJg/3NoJ8SLEpkoU1DPpt7i8ba',1,NULL,NULL,'2026-09-14 15:52:08.371','2026-09-14 15:52:08.371',NULL),(12,'C&B Construtora',NULL,'$2a$10$s2HZy0evrKBth1NCVi1mGOKixlT1vTXOjzKhtHcjqkbhDK6jz.QiO',1,NULL,NULL,'2026-09-14 16:16:54.315','2026-09-14 16:16:54.315',NULL),(13,'Caio Melo',NULL,'$2a$10$OCT1wak9SJWI3eNfhsDs5.Di.rOXbPVBLOJ5UbB0wD51GOERFWjzy',1,NULL,NULL,'2026-09-14 16:17:52.525','2026-09-14 16:17:52.525',NULL),(14,'Cícero',NULL,'$2a$10$iRvJf5nMdWXt7BjVJ6Qh.uka0tS65RHDrA1xA0igT2HotwWI9xR5S',1,NULL,NULL,'2026-09-14 16:18:18.768','2026-09-14 16:18:18.768',NULL),(15,'Construtora Merli',NULL,'$2a$10$02HO7fsUuJIYGOPrFFeXDedpIutF5BzltBa20jiJoc6gaA8JAvNjW',1,NULL,NULL,'2026-09-14 16:20:38.402','2026-09-14 16:20:38.402',NULL),(16,'Cratos',NULL,'$2a$10$kjKOEoapmNJjvxOU9XLD8OYV6LQWN6d9nPWJSPKNVbvcmu.atrT4G',1,NULL,NULL,'2026-09-14 16:20:59.173','2026-09-14 16:20:59.173',NULL),(17,'Fernando Teste','teste@fernando.com','$2a$10$ZQcmEt2S5Xr7z/KoZGUlZ.PA5LOG8H/gHc5uxqMSMryHhlZ8meZM6',1,NULL,'(35) 98888-7777','2026-09-15 16:59:58.835','2026-09-15 19:08:08.079',NULL),(18,'João Um','ju@email.com','$2a$10$l269CKZ8B7gv6ja7Ae8ZCuMaxbVgQ3aPJtNhSktSJkT1CCm6LQGs.',1,NULL,'(35) 98888-7777','2026-09-18 23:37:42.222','2026-09-18 23:37:42.222','62418024024'),(19,'Teste',NULL,'$2a$10$7BY3tDal3v3BUUexJk8AMe/OWstNVgihT0hEtIkSjhLm3cEfJTMRe',1,NULL,'11999999999','2026-09-21 21:29:32.068','2026-09-21 21:29:32.068',NULL),(20,'Final Test',NULL,'$2a$10$k30x5b6wmPe.Od2rM/Gox.YBPZhWe80UoclzCrL54uDO2Dq3nFAHe',1,NULL,'11988887777','2026-09-21 21:31:58.843','2026-09-21 21:31:58.843',NULL),(21,'Adilson Um','ad@emal.com','$2a$10$gLxHmXwFnCgeZ.vzk2M6YuQwExv0fXNBlzfQaFAS3gc06I1ksawcO',1,NULL,'(35) 12222-3333','2026-09-21 21:34:15.364','2026-09-21 21:34:15.364',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_papel`
--

DROP TABLE IF EXISTS `usuario_papel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_papel` (
  `userId` int NOT NULL,
  `papelId` int NOT NULL,
  PRIMARY KEY (`userId`,`papelId`),
  KEY `usuario_papel_papelId_fkey` (`papelId`),
  CONSTRAINT `usuario_papel_papelId_fkey` FOREIGN KEY (`papelId`) REFERENCES `papeis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuario_papel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_papel`
--

LOCK TABLES `usuario_papel` WRITE;
/*!40000 ALTER TABLE `usuario_papel` DISABLE KEYS */;
INSERT INTO `usuario_papel` VALUES (1,1),(7,1),(2,2),(3,3),(17,3),(4,4),(8,4),(5,5),(6,6),(9,6),(10,7),(11,7),(12,7),(13,7),(14,7),(15,7),(16,7),(18,7),(19,7),(20,7),(21,7);
/*!40000 ALTER TABLE `usuario_papel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitas_tecnicas`
--

DROP TABLE IF EXISTS `visitas_tecnicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitas_tecnicas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `atendimentoId` int NOT NULL,
  `tecnicoId` int DEFAULT NULL,
  `dataPrevista` datetime(3) NOT NULL,
  `dataRealizada` datetime(3) DEFAULT NULL,
  `status` enum('AGENDADA','REALIZADA','CANCELADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AGENDADA',
  `urgencia` enum('NORMAL','URGENTE','URGENTISSIMO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enderecoId` int DEFAULT NULL,
  `relatorio` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resultado` enum('SEM_ACAO','ORCAMENTO_NECESSARIO','OBRA_NECESSARIA','CLIENTE_AUSENTE') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `constatacao` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `necessitaOrcamento` tinyint(1) NOT NULL DEFAULT '0',
  `necessitaObra` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `visitas_tecnicas_atendimentoId_fkey` (`atendimentoId`),
  KEY `visitas_tecnicas_tecnicoId_fkey` (`tecnicoId`),
  KEY `visitas_tecnicas_enderecoId_fkey` (`enderecoId`),
  CONSTRAINT `visitas_tecnicas_atendimentoId_fkey` FOREIGN KEY (`atendimentoId`) REFERENCES `atendimentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visitas_tecnicas_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `enderecos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visitas_tecnicas_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitas_tecnicas`
--

LOCK TABLES `visitas_tecnicas` WRITE;
/*!40000 ALTER TABLE `visitas_tecnicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `visitas_tecnicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'impermeab'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-24 19:45:57
