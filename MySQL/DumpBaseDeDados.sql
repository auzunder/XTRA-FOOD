-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: xtra_food
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `idCliente` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `morada` varchar(45) DEFAULT NULL,
  `codigo_postal` varchar(45) DEFAULT NULL,
  `distrito` varchar(45) DEFAULT NULL,
  `num_tel` int DEFAULT NULL,
  PRIMARY KEY (`idCliente`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Edgar Tavares','edgartavares@gmail.com','f7c3bc1d808e04732adf679965ccc34ca7ae3441','Coimbra','3000-015','Aveiro',910357824),(2,'Catarina Ferreira','catarinaferreira@gmail.com','bfe54caa6d483cc3887dce9d1b8eb91408f1ea7a','São Bartlolomeu','3000-004','Coimbra',961377169),(3,'Matilde Soares','tilde25soares@gmail.com','dc35ce0cd2ce1c42f00e5b8df653ac46ae985610','Penouços','3740-075','Aveiro',930545974),(4,'Valentina Almeida','valentina_al@gmail.com','4f52274cb5b59be6eb3133e7652019ccc4cd7583','Vila Cova de Alva','3305-285','Coimbra',963672651),(5,'Sabrina da Conceição','sabrinanina@gmail.com','3db9b843e4a5144997ab972b66a86859b09e83bd','Estrada Regional Nº1-1ª','9630-103','Açores',934038673),(6,'Juan Gonçalves','juan@msn.com','e9d84a42287c221e620cc7a89e9ccfcc018dfca5','Rua Cândido Capilé','2800-043','Setúbal',911210397),(7,'Juliana Faria','faria_julili@gmail.com','328d074cab56dfa05135483507856b9e110b92b9','São Bartlolomeu','3000-004','Coimbra',912040580),(8,'Mariana Costa','costa_mari@sapo.pt','d0e7815cce1da0216a85e96f686af0611f554f0a','Rua 1 de Maio','7940-120','Beja',930126698);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente_voluntarios`
--

DROP TABLE IF EXISTS `cliente_voluntarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente_voluntarios` (
  `idCliente` int NOT NULL AUTO_INCREMENT,
  `idVoluntarios` int NOT NULL,
  PRIMARY KEY (`idCliente`,`idVoluntarios`),
  KEY `fk_Cliente_has_Voluntários_Voluntários1_idx` (`idVoluntarios`),
  KEY `fk_Cliente_has_Voluntários_Cliente1_idx` (`idCliente`),
  CONSTRAINT `fk_Cliente_has_Voluntários_Cliente1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`),
  CONSTRAINT `fk_Cliente_has_Voluntários_Voluntários1` FOREIGN KEY (`idVoluntarios`) REFERENCES `voluntarios` (`idVoluntarios`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente_voluntarios`
--

LOCK TABLES `cliente_voluntarios` WRITE;
/*!40000 ALTER TABLE `cliente_voluntarios` DISABLE KEYS */;
INSERT INTO `cliente_voluntarios` VALUES (8,3),(3,6);
/*!40000 ALTER TABLE `cliente_voluntarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cores`
--

DROP TABLE IF EXISTS `cores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cores` (
  `idCores` int NOT NULL AUTO_INCREMENT,
  `Cor` varchar(45) NOT NULL,
  PRIMARY KEY (`idCores`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cores`
--

LOCK TABLES `cores` WRITE;
/*!40000 ALTER TABLE `cores` DISABLE KEYS */;
INSERT INTO `cores` VALUES (1,'Vermelho'),(2,'Amarelo'),(3,'Branco'),(4,'Sem Cor');
/*!40000 ALTER TABLE `cores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doacao`
--

DROP TABLE IF EXISTS `doacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doacao` (
  `idDoacao` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `apelido` varchar(45) DEFAULT NULL,
  `num_tel` int NOT NULL,
  `email` varchar(45) NOT NULL,
  `quantidade` varchar(45) NOT NULL,
  `metodo` varchar(10) NOT NULL,
  `data` datetime NOT NULL,
  PRIMARY KEY (`idDoacao`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doacao`
--

LOCK TABLES `doacao` WRITE;
/*!40000 ALTER TABLE `doacao` DISABLE KEYS */;
INSERT INTO `doacao` VALUES (1,'João','Pedro',915749283,'pedrojoao@sapo.pt','10','Paypal','2021-12-05 21:43:56'),(2,'Edgar','Tavares',910357824,'edgartavares@gmail.com','50','Multibanco','2022-01-03 12:11:06'),(3,'Juliana','Faria',912040580,'faria_julili@gmail.com','5','Paypal','2022-01-23 15:57:10'),(4,'Luis','Vieira',936244112,'vieiraLuis@gmail.com','10','MBWay','2022-03-01 05:30:07');
/*!40000 ALTER TABLE `doacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doacao_cliente`
--

DROP TABLE IF EXISTS `doacao_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doacao_cliente` (
  `idDoacao` int NOT NULL,
  `idCliente` int NOT NULL,
  PRIMARY KEY (`idDoacao`,`idCliente`),
  KEY `fk_doacao_has_cliente_cliente1_idx` (`idCliente`),
  KEY `fk_doacao_has_cliente_doacao1_idx` (`idDoacao`),
  CONSTRAINT `fk_doacao_has_cliente_cliente1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`),
  CONSTRAINT `fk_doacao_has_cliente_doacao1` FOREIGN KEY (`idDoacao`) REFERENCES `doacao` (`idDoacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doacao_cliente`
--

LOCK TABLES `doacao_cliente` WRITE;
/*!40000 ALTER TABLE `doacao_cliente` DISABLE KEYS */;
INSERT INTO `doacao_cliente` VALUES (2,1),(3,7);
/*!40000 ALTER TABLE `doacao_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encomenda`
--

DROP TABLE IF EXISTS `encomenda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encomenda` (
  `idEncomenda` int NOT NULL AUTO_INCREMENT,
  `data` datetime NOT NULL,
  `morada` varchar(150) NOT NULL,
  `codigo_postal` varchar(45) NOT NULL,
  `cidade` varchar(45) NOT NULL,
  `num_tel` int NOT NULL,
  `idCliente` int DEFAULT NULL,
  PRIMARY KEY (`idEncomenda`),
  KEY `fk_Encomenda_Cliente1_idx` (`idCliente`),
  CONSTRAINT `fk_Encomenda_Cliente1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encomenda`
--

LOCK TABLES `encomenda` WRITE;
/*!40000 ALTER TABLE `encomenda` DISABLE KEYS */;
INSERT INTO `encomenda` VALUES (1,'2022-05-05 22:43:56','Sever do Vouga','3740-321','Aveiro',910357824,1),(2,'2022-06-12 20:45:35','São Bartlolomeu','3000-004','Coimbra',912040580,7),(3,'2022-07-01 23:32:16','Penouços','3740-075','Aveiro',930545974,3),(4,'2022-07-21 10:12:12','Rua 1 de Maio','7940-120','Beja',930126698,8),(5,'2022-07-22 08:09:43','Apartado 10, Lagos','8601-901','Faro',938238175,NULL),(6,'2022-10-23 10:43:12','Sever do Vouga','3740-321','Aveiro',910357824,1);
/*!40000 ALTER TABLE `encomenda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encomenda_produto`
--

DROP TABLE IF EXISTS `encomenda_produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encomenda_produto` (
  `idEncomenda` int NOT NULL,
  `idProduto_final` int NOT NULL,
  `quantidade` int NOT NULL,
  PRIMARY KEY (`idEncomenda`,`idProduto_final`),
  KEY `fk_Encomenda_has_Produto_Encomenda_idx` (`idEncomenda`),
  KEY `fk_encomenda_produto_produto_tamanhoEcor1_idx` (`idProduto_final`),
  CONSTRAINT `fk_Encomenda_has_Produto_Encomenda` FOREIGN KEY (`idEncomenda`) REFERENCES `encomenda` (`idEncomenda`),
  CONSTRAINT `fk_encomenda_produto_produto_tamanhoEcor1` FOREIGN KEY (`idProduto_final`) REFERENCES `produto_tamanhoecor` (`idProduto_final`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encomenda_produto`
--

LOCK TABLES `encomenda_produto` WRITE;
/*!40000 ALTER TABLE `encomenda_produto` DISABLE KEYS */;
INSERT INTO `encomenda_produto` VALUES (1,2,1),(1,4,1),(1,10,1),(1,11,1),(1,18,1),(2,1,1),(2,2,1),(2,3,1),(2,5,1),(2,6,1),(2,7,1),(2,8,1),(2,10,1),(2,12,1),(2,13,1),(2,14,1),(2,15,1),(2,17,1),(2,18,1),(2,21,1),(2,22,1),(2,23,1),(3,1,1),(3,2,1),(3,5,1),(3,7,1),(3,8,1),(3,10,1),(3,19,1),(3,20,1),(3,23,1),(4,1,1),(4,2,1),(4,4,1),(4,7,1),(4,8,1),(4,9,1),(4,14,1),(4,16,1),(4,20,1),(4,21,1),(5,1,1),(5,2,1),(5,12,1),(5,13,1),(5,15,1),(5,18,1),(5,21,1),(6,4,1);
/*!40000 ALTER TABLE `encomenda_produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evento`
--

DROP TABLE IF EXISTS `evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento` (
  `idEvento` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `descricao` longtext NOT NULL,
  `localizacao` varchar(45) NOT NULL,
  `voluntariar` tinyint NOT NULL,
  `data` datetime NOT NULL,
  `cartaz_img` varchar(45) NOT NULL,
  PRIMARY KEY (`idEvento`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evento`
--

LOCK TABLES `evento` WRITE;
/*!40000 ALTER TABLE `evento` DISABLE KEYS */;
INSERT INTO `evento` VALUES (1,'Ação de voluntariado','Diz não ao desperdício e vem ajudar na ação de voluntariado.','Praça da canção',1,'2022-10-12 00:00:00','1.jpg'),(2,'Ação de voluntariado','É preciso dizer não ao desperdício. Vamos comer, ajudar e conservar.','Praça da canção',1,'2023-01-28 00:00:00','2.jpg'),(3,'Ação de voluntariado','Diz não ao desperdício e vem ajudar na ação de voluntariado.','Praça da canção',1,'2023-02-12 00:00:00','3.jpg'),(4,'Ação de voluntariado','É preciso dizer não ao desperdício. Vamos comer, ajudar e conservar.','Praça da canção',1,'2023-08-19 00:00:00','4.jpg');
/*!40000 ALTER TABLE `evento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evento_voluntarios`
--

DROP TABLE IF EXISTS `evento_voluntarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento_voluntarios` (
  `idEvento` int NOT NULL AUTO_INCREMENT,
  `idVoluntarios` int NOT NULL,
  PRIMARY KEY (`idEvento`,`idVoluntarios`),
  KEY `fk_Evento_has_Voluntários_Voluntários1_idx` (`idVoluntarios`),
  KEY `fk_Evento_has_Voluntários_Evento1_idx` (`idEvento`),
  CONSTRAINT `fk_Evento_has_Voluntários_Evento1` FOREIGN KEY (`idEvento`) REFERENCES `evento` (`idEvento`),
  CONSTRAINT `fk_Evento_has_Voluntários_Voluntários1` FOREIGN KEY (`idVoluntarios`) REFERENCES `voluntarios` (`idVoluntarios`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evento_voluntarios`
--

LOCK TABLES `evento_voluntarios` WRITE;
/*!40000 ALTER TABLE `evento_voluntarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `evento_voluntarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter`
--

DROP TABLE IF EXISTS `newsletter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter` (
  `idNewsletter` int NOT NULL AUTO_INCREMENT,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`idNewsletter`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter`
--

LOCK TABLES `newsletter` WRITE;
/*!40000 ALTER TABLE `newsletter` DISABLE KEYS */;
INSERT INTO `newsletter` VALUES (1,'bulheracos@gmail.com'),(2,'bihec64232@gmail.com'),(3,'paviocurto@gmail.com'),(4,'tilde25soares@gmail.com'),(5,'valentina_al@gmail.com'),(6,'faria_julili@gmail.com'),(7,'rui_marmanjo@gmail.com'),(8,'almondegapunk@gmail.com'),(9,'el_flango@gmail.com'),(10,'homer_j_simpson@gmail.com'),(11,'cabeca_gorda@gmail.com');
/*!40000 ALTER TABLE `newsletter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos_servicos`
--

DROP TABLE IF EXISTS `pedidos_servicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos_servicos` (
  `idpedidos_servicos` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `apelido` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `num_tel` int NOT NULL,
  `nome_empresa` varchar(45) NOT NULL,
  `num_tel_empresa` int DEFAULT NULL,
  `pag_web_empresa` varchar(45) DEFAULT NULL,
  `email_empresa` varchar(45) NOT NULL,
  `parceiro_afiliado` enum('parceiro','afiliado') NOT NULL,
  `decricao_empresa` longtext,
  PRIMARY KEY (`idpedidos_servicos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos_servicos`
--

LOCK TABLES `pedidos_servicos` WRITE;
/*!40000 ALTER TABLE `pedidos_servicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidos_servicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto`
--

DROP TABLE IF EXISTS `produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto` (
  `idProduto` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `descricao` varchar(300) DEFAULT NULL,
  `detalhes` json NOT NULL,
  `categoria` varchar(25) NOT NULL,
  `preco` int DEFAULT NULL,
  PRIMARY KEY (`idProduto`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto`
--

LOCK TABLES `produto` WRITE;
/*!40000 ALTER TABLE `produto` DISABLE KEYS */;
INSERT INTO `produto` VALUES (1,'Ultrafood','A Ultrafood é a marmita ideal para transportar comida para qualquer lado. <br><br> Com tamanho varíavel de acordo com as necessidades de cada um e várias opções de cores.','{\"1\": \"Corpo de plástico bastante resistente\", \"2\": \"Suporta temperaturas entre -10 até 120 graus\", \"3\": \"Borracha selante\", \"4\": \"Indicado para comida sólida e líquida\", \"5\": \"Não recomendado para o uso no micro-ondas\", \"6\": \"Todos os fundos serão revertidos para as associações\"}','Armazenar Comida',5),(2,'Minifood','A Minifood é a lancheira ideal para qualquer tipo de lanche. <br><br> Com a sua contrução em metal, é mais resistente a forças externas.','{\"1\": \"Corpo de alumínio resistente\", \"2\": \"Lancheira com dois (2) compartimentos para separação de alimentos\", \"3\": \"Disponível em tamanhos variados\", \"4\": \"Não recomendado para o uso no micro-ondas\", \"5\": \"Todos os fundos serão revertidos para as associações\"}','Armazenar Comida',4),(3,'Tote bag','A Tote bag substitui todos os sacos de plástico usados, por exemplo, no transporte das compras do supermercado. <br><br> É o companheiro ideal para as suas visitas ao mercado.','{\"1\": \"LAVAR À MÁQUINA MÁXIMO 40ºC CENTRIFUGAÇÃO CURTA\", \"2\": \"NÃO UTILIZAR LIXÍVIA / ALVEJANTE\", \"3\": \"PASSAR A FERRO MÁXIMO 110 ºC\", \"4\": \"NÃO LIMPAR A SECO\", \"5\": \"PODE-SE UTILIZAR A MÁQUINA DE SECAR TEMPERATURA REDUZIDA\", \"6\": \"NÃO ENGOMAR ADORNOS\"}','Armazenar Objetos',5),(4,'T-shirt','T-shirt XTRA FOOD 100% algodão. Super confortável','{\"1\": \"LAVAR À MÁQUINA MÁXIMO 30ºC CENTRIFUGAÇÃO CURTA\", \"2\": \"NÃO UTILIZAR LIXÍVIA / ALVEJANTE\", \"3\": \"PASSAR A FERRO MÁXIMO 110 ºC\", \"4\": \"NÃO LIMPAR A SECO\", \"5\": \"NÃO UTILIZAR MÁQUINA DE SECAR\", \"6\": \"100% Algodão\"}','Vestuário',10),(5,'Takeaway kit','O Kit takeaway está disponível apenas durante eventos.','{\"1\": \"Corpo de plástico bastante resistente\", \"2\": \"Suporta temperaturas entre -10 até 120 graus\", \"3\": \"Borracha selante\", \"4\": \"Indicado para comida sólida e líquida\", \"5\": \"Não recomendado para o uso no micro-ondas\", \"6\": \"Todos os fundos serão revertidos para as associações\"}','Armazenar Comida',NULL);
/*!40000 ALTER TABLE `produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto_tamanhoecor`
--

DROP TABLE IF EXISTS `produto_tamanhoecor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto_tamanhoecor` (
  `idProduto_final` int NOT NULL AUTO_INCREMENT,
  `idProduto` int NOT NULL,
  `idCores` int NOT NULL,
  `idTamanhos` int NOT NULL,
  `stock` int NOT NULL,
  PRIMARY KEY (`idProduto_final`),
  KEY `fk_produto_has_tamanho_cor_produto1_idx` (`idProduto`),
  KEY `fk_produto_tamanhoEcor_cores1_idx` (`idCores`),
  KEY `fk_produto_tamanhoEcor_tamanhos1_idx` (`idTamanhos`),
  CONSTRAINT `fk_produto_has_tamanho_cor_produto1` FOREIGN KEY (`idProduto`) REFERENCES `produto` (`idProduto`),
  CONSTRAINT `fk_produto_tamanhoEcor_cores1` FOREIGN KEY (`idCores`) REFERENCES `cores` (`idCores`),
  CONSTRAINT `fk_produto_tamanhoEcor_tamanhos1` FOREIGN KEY (`idTamanhos`) REFERENCES `tamanhos` (`idTamanhos`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto_tamanhoecor`
--

LOCK TABLES `produto_tamanhoecor` WRITE;
/*!40000 ALTER TABLE `produto_tamanhoecor` DISABLE KEYS */;
INSERT INTO `produto_tamanhoecor` VALUES (1,1,1,1,43),(2,1,1,2,14),(3,1,1,3,16),(4,1,1,4,7),(5,1,2,1,46),(6,1,2,2,34),(7,1,2,3,12),(8,1,2,4,52),(9,2,2,1,23),(10,2,2,2,42),(11,3,3,11,23),(12,4,2,5,1),(13,4,2,6,2),(14,4,2,7,31),(15,4,2,8,57),(16,4,2,9,7),(17,4,2,10,3),(18,4,3,5,1),(19,4,3,6,2),(20,4,3,7,31),(21,4,3,8,57),(22,4,3,9,7),(23,4,3,10,3),(24,5,4,11,0);
/*!40000 ALTER TABLE `produto_tamanhoecor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tamanhos`
--

DROP TABLE IF EXISTS `tamanhos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tamanhos` (
  `idTamanhos` int NOT NULL AUTO_INCREMENT,
  `tamanho` varchar(45) NOT NULL,
  PRIMARY KEY (`idTamanhos`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tamanhos`
--

LOCK TABLES `tamanhos` WRITE;
/*!40000 ALTER TABLE `tamanhos` DISABLE KEYS */;
INSERT INTO `tamanhos` VALUES (1,'0.55L'),(2,'1L'),(3,'2L'),(4,'2.5L'),(5,'XS'),(6,'S'),(7,'M'),(8,'L'),(9,'XL'),(10,'XXL'),(11,'Único');
/*!40000 ALTER TABLE `tamanhos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voluntarios`
--

DROP TABLE IF EXISTS `voluntarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voluntarios` (
  `idVoluntarios` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `num_tel` varchar(45) NOT NULL,
  PRIMARY KEY (`idVoluntarios`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voluntarios`
--

LOCK TABLES `voluntarios` WRITE;
/*!40000 ALTER TABLE `voluntarios` DISABLE KEYS */;
INSERT INTO `voluntarios` VALUES (1,'Josefa Crostácio','crosta_Jos@gmail.com','929637816'),(2,'Daniel Almeida','futDani@gmail.com','913542306'),(3,'Mariana Costa','costa_mari@sapo.pt','930126698'),(4,'Ana Ferreira','aninha431@gmail.com','968640318'),(5,'Paulo Martins','paulo1998@gmail.com','912703038'),(6,'Matilde Soares','tilde25soares@gmail.com','930545974'),(7,'João Gonçalves','joaoGrandalhao@gmail.com','920404917');
/*!40000 ALTER TABLE `voluntarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-01-04 18:57:43
