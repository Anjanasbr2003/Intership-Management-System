CREATE DATABASE IF NOT EXISTS interlink_db;
USE interlink_db;

-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: interlink_db
-- ------------------------------------------------------
-- Server version	8.0.30

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
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jobId` int NOT NULL,
  `studentId` int NOT NULL,
  `employerId` int NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applications_job_id_student_id` (`jobId`,`studentId`),
  KEY `studentId` (`studentId`),
  KEY `employerId` (`employerId`),
  CONSTRAINT `applications_ibfk_79` FOREIGN KEY (`jobId`) REFERENCES `job_postings` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `applications_ibfk_80` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `applications_ibfk_81` FOREIGN KEY (`employerId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,1,6,9,'pending',NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_progress_logs`
--

DROP TABLE IF EXISTS `daily_progress_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_progress_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `universityId` int NOT NULL,
  `date` datetime NOT NULL,
  `hoursWorked` float DEFAULT '8',
  `tasksCompleted` text NOT NULL,
  `learnings` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `studentId` (`studentId`),
  KEY `universityId` (`universityId`),
  CONSTRAINT `daily_progress_logs_ibfk_53` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `daily_progress_logs_ibfk_54` FOREIGN KEY (`universityId`) REFERENCES `universities` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_progress_logs`
--

LOCK TABLES `daily_progress_logs` WRITE;
/*!40000 ALTER TABLE `daily_progress_logs` DISABLE KEYS */;
INSERT INTO `daily_progress_logs` VALUES (1,6,1,'2026-08-21 00:00:00',8,'2026.08.21 structured the design of the intern website project, wireframed role dashboards, and planned MySQL schemas.','Understood university-scoping security constraints and multi-role UX separation.','2026-09-18 12:46:27','2026-09-18 12:46:27'),(2,6,1,'2026-08-22 00:00:00',8,'Constructed the REST API endpoints for daily progress logging, supervisor join requests, and employer auto-matching.','Mastered JWT middleware chaining and role-based access control (RBAC).','2026-09-18 12:46:27','2026-09-18 12:46:27'),(3,6,1,'2026-08-23 00:00:00',7.5,'Refined employer dashboard filtering to group and display applicants divided by each specific job vacancy.','Learned compound aggregation and index query optimization in MySQL and Sequelize.','2026-09-18 12:46:27','2026-09-18 12:46:27'),(4,12,3,'2026-09-18 00:00:00',8,'Nothing','Done','2026-09-18 16:55:43','2026-09-18 16:55:43');
/*!40000 ALTER TABLE `daily_progress_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_postings`
--

DROP TABLE IF EXISTS `job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_postings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employerId` int NOT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `jobType` enum('Full-Time Internship','Part-Time Internship','Remote') DEFAULT 'Full-Time Internship',
  `availability` varchar(255) DEFAULT 'Immediate',
  `location` varchar(255) DEFAULT 'Colombo / Remote',
  `deadline` datetime DEFAULT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `employerId` (`employerId`),
  CONSTRAINT `job_postings_ibfk_1` FOREIGN KEY (`employerId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_postings`
--

LOCK TABLES `job_postings` WRITE;
/*!40000 ALTER TABLE `job_postings` DISABLE KEYS */;
INSERT INTO `job_postings` VALUES (1,9,'Virtusa Sri Lanka','Trainee Software Engineer (Full-Stack)','IT','Join our Digital Engineering unit. Develop enterprise web systems using React, Node.js, and cloud native architectures.','Full-Time Internship','Immediate','Colombo / Hybrid',NULL,'open','2026-09-18 12:46:27','2026-09-18 12:46:27'),(2,9,'Virtusa Sri Lanka','Cloud DevOps & Quality Engineering Intern','IT','Hands-on training in CI/CD pipeline automation, Docker containers, and test script engineering.','Full-Time Internship','Next Month','Colombo',NULL,'open','2026-09-18 12:46:27','2026-09-18 12:46:27'),(3,10,'Hayleys Agriculture & Biotechnology','Agricultural Biotechnology Research Intern','Science','Assist Senior Researchers in seed quality analysis, tissue culture protocols, and field sample documentation.','Full-Time Internship','Immediate','Kamburupitiya / Lab Site',NULL,'open','2026-09-18 12:46:27','2026-09-18 12:46:27');
/*!40000 ALTER TABLE `job_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `join_requests`
--

DROP TABLE IF EXISTS `join_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `join_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supervisorId` int NOT NULL,
  `universityId` int NOT NULL,
  `headUserId` int DEFAULT NULL,
  `staffRegNo` varchar(255) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `supervisorId` (`supervisorId`),
  KEY `universityId` (`universityId`),
  KEY `headUserId` (`headUserId`),
  CONSTRAINT `join_requests_ibfk_53` FOREIGN KEY (`supervisorId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `join_requests_ibfk_54` FOREIGN KEY (`universityId`) REFERENCES `universities` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `join_requests_ibfk_55` FOREIGN KEY (`headUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `join_requests`
--

LOCK TABLES `join_requests` WRITE;
/*!40000 ALTER TABLE `join_requests` DISABLE KEYS */;
INSERT INTO `join_requests` VALUES (1,4,1,2,'STAFF/RUH/FOT/042','Senior Lecturer (Grade I)','approved','2026-09-18 12:46:27','2026-09-18 12:46:27','2026-09-18 12:46:27'),(2,5,1,2,'STAFF/RUH/FOT/089','Lecturer (Probationary)','pending',NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27');
/*!40000 ALTER TABLE `join_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `universityId` int NOT NULL,
  `studentRegNo` varchar(255) NOT NULL,
  `degreeProgram` varchar(255) NOT NULL,
  `mainCategory` varchar(255) NOT NULL DEFAULT 'IT',
  `desiredField` varchar(255) DEFAULT NULL,
  `workType` enum('Remote','Onsite','Hybrid') DEFAULT 'Hybrid',
  `availability` enum('Full-Time','Part-Time') DEFAULT 'Full-Time',
  `profilePic` varchar(500) DEFAULT NULL,
  `gpa` varchar(255) DEFAULT NULL,
  `livingCity` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `universityEmail` varchar(255) DEFAULT NULL,
  `personalEmail` varchar(255) DEFAULT NULL,
  `skills` json DEFAULT NULL,
  `bio` text,
  `linkedinUrl` varchar(500) DEFAULT NULL,
  `githubUrl` varchar(500) DEFAULT NULL,
  `portfolioUrl` varchar(500) DEFAULT NULL,
  `cvUrl` varchar(500) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  KEY `universityId` (`universityId`),
  CONSTRAINT `student_profiles_ibfk_53` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_profiles_ibfk_54` FOREIGN KEY (`universityId`) REFERENCES `universities` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES (1,6,1,'TG/2023/1704','Bachelor of Information and Communication Technology (BICT)','IT','Full-Stack Software Engineering','Hybrid','Full-Time','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80','3.82','Matara','+94 76 987 6543','tharinda.g@fot.ruh.ac.lk','tharinda.gimhana@gmail.com','[\"React\", \"Node.js\", \"Express\", \"MySQL\", \"REST APIs\", \"TypeScript\", \"Git\"]','Energetic full-stack developer experienced in building scalable web architectures and responsive interfaces.','https://linkedin.com/in/tharinda-gimhana','https://github.com/tharindagimhana','https://tharinda.dev','','2026-09-18 12:46:27','2026-09-18 12:46:27'),(2,7,1,'TG/2023/1713','Bachelor of Information and Communication Technology (BICT)','IT','Backend & Cloud Infrastructure','Remote','Full-Time','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80','3.75','Galle','+94 70 876 5432','daham.s@fot.ruh.ac.lk','daham.somarathna@gmail.com','[\"Node.js\", \"Python\", \"Docker\", \"MySQL\", \"AWS\", \"Microservices\"]','Backend systems enthusiast interested in API optimization, container orchestration, and relational data modeling.','https://linkedin.com/in/daham-somarathna','https://github.com/dahamsomarathna','','','2026-09-18 12:46:27','2026-09-18 12:46:27'),(3,8,1,'TG/2023/1741','Bachelor of Information and Communication Technology (BICT)','Science','Data Analysis & Bio-Informatics','Onsite','Part-Time','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80','3.65','Colombo','+94 78 765 4321','sandun.b@fot.ruh.ac.lk','sandun.bandara@gmail.com','[\"Python\", \"Pandas\", \"R\", \"Machine Learning\", \"Data Visualization\"]','Passionate about biological informatics, scientific research computation, and predictive statistical models.','https://linkedin.com/in/sandun-bandara','https://github.com/sandunbandara','','','2026-09-18 12:46:27','2026-09-18 12:46:27'),(4,12,3,'TG/2023/1741','Bachelor of Information and Communication Technology (BICT)','IT','Software Engineering / Web Development','Hybrid','Full-Time','abc','3.32','Ambalantota','0724917666','student@skillbridge.demo','anjanasbr2003@gmail.com','[]',NULL,'https://www.linkedin.com/in/your','https://github.com/emilkowalski/skills','https://github.com/emilkowalski/skills','','2026-09-18 16:54:04','2026-09-18 16:54:04');
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `universities`
--

DROP TABLE IF EXISTS `universities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `universities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `headUserId` int DEFAULT NULL,
  `applierName` varchar(255) DEFAULT NULL,
  `applierPosition` varchar(255) DEFAULT NULL,
  `contactNum` varchar(255) DEFAULT NULL,
  `universityEmail` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `name_24` (`name`),
  UNIQUE KEY `name_25` (`name`),
  UNIQUE KEY `name_26` (`name`),
  UNIQUE KEY `name_27` (`name`),
  UNIQUE KEY `name_28` (`name`),
  KEY `headUserId` (`headUserId`),
  KEY `reviewedBy` (`reviewedBy`),
  CONSTRAINT `universities_ibfk_1` FOREIGN KEY (`headUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `universities_ibfk_2` FOREIGN KEY (`reviewedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `universities`
--

LOCK TABLES `universities` WRITE;
/*!40000 ALTER TABLE `universities` DISABLE KEYS */;
INSERT INTO `universities` VALUES (1,'University of Ruhuna','UOR','Karagoda Uyangoda, Kamburupitiya, Matara',2,'Prof. Subhash Jayasinghe','Dean, Faculty of Technology','+94 41 229 3300','head@ruhuna.ac.lk','approved',1,'2026-09-18 12:46:27','2026-09-18 12:46:27'),(2,'University of Moratuwa','UOM','Katubedda, Moratuwa',3,'Prof. Chathura De Silva','Head of Department (HOD)','+94 11 265 0301','head@mrt.ac.lk','pending',NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27'),(3,'University of Colombo','UOC','Kumaratunga Munidasa Mawatha, Colombo 03',NULL,'Prof. K. P. Hewagamage','Dean','+94 11 258 1245','dean@science.cmb.ac.lk','approved',1,'2026-09-18 12:46:27','2026-09-18 12:46:27');
/*!40000 ALTER TABLE `universities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `personalEmail` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','head','supervisor','student','employer') NOT NULL,
  `status` enum('pending','approved','rejected','active') DEFAULT 'pending',
  `phone` varchar(255) DEFAULT NULL,
  `livingCity` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `staffRegNo` varchar(255) DEFAULT NULL,
  `universityId` int DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `companyCategory` varchar(255) DEFAULT NULL,
  `recruiterName` varchar(255) DEFAULT NULL,
  `recruitmentArea` varchar(255) DEFAULT NULL,
  `recruiterDesignation` varchar(255) DEFAULT NULL,
  `recruiterLinkedin` varchar(255) DEFAULT NULL,
  `recruiterContactNumber` varchar(255) DEFAULT NULL,
  `businessRegNumber` varchar(255) DEFAULT NULL,
  `taxId` varchar(255) DEFAULT NULL,
  `companyWebsite` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `passwordChangedAt` datetime DEFAULT NULL,
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpire` datetime DEFAULT NULL,
  `failedLoginAttempts` int DEFAULT '0',
  `lockUntil` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  KEY `universityId` (`universityId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`universityId`) REFERENCES `universities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Central System Administrator','admin@interlink.lk',NULL,'$2a$10$MxWfdg21vMH4NVVzBdrom.Lwlh5fsQZ9bKbd4RmsNCTtDxN.5f.7m','admin','active','+94 77 123 4567',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(2,'Prof. Subhash Jayasinghe','head@ruhuna.ac.lk','subhash.personal@gmail.com','$2a$10$MxWfdg21vMH4NVVzBdrom.D2lEWFzsB9Z4iuVCmQij847EgopKKl6','head','approved','+94 41 229 3300',NULL,'Dean, Faculty of Technology',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(3,'Prof. Chathura De Silva','head@mrt.ac.lk','chathura.ds@gmail.com','$2a$10$MxWfdg21vMH4NVVzBdrom.D2lEWFzsB9Z4iuVCmQij847EgopKKl6','head','pending','+94 11 265 0301',NULL,'Head of Department (HOD)',NULL,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(4,'Dr. Kasun Wickramasinghe','kasun.w@fot.ruh.ac.lk','kasun.wick@gmail.com','$2a$10$MxWfdg21vMH4NVVzBdrom.yXYCSzfE7xXGv0VaUYpikKk10Q/qKhq','supervisor','approved','+94 71 888 9999',NULL,'Senior Lecturer (Grade I)','STAFF/RUH/FOT/042',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(5,'Mr. Nuwan Perera','nuwan.p@fot.ruh.ac.lk','nuwan.perera@gmail.com','$2a$10$MxWfdg21vMH4NVVzBdrom.yXYCSzfE7xXGv0VaUYpikKk10Q/qKhq','supervisor','pending','+94 77 555 4444',NULL,'Lecturer (Probationary)','STAFF/RUH/FOT/089',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(6,'E. Tharinda Gimhana','tharinda.g@fot.ruh.ac.lk','tharinda.gimhana@gmail.com','$2a$10$MxWfdg21vMH4NVVzBdrom.C9FZTOHYet/Bx1c9lvvcZcM2lK7oOEW','student','active','+94 76 987 6543','Matara',NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(7,'K. K. Daham Somarathna','daham.s@fot.ruh.ac.lk','daham.somarathna@gmail.com','$2a$10$MxWfdg21vMH4NVVzBdrom.C9FZTOHYet/Bx1c9lvvcZcM2lK7oOEW','student','active','+94 70 876 5432','Galle',NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(8,'R. A. Sandun Bandara','sandun.b@fot.ruh.ac.lk','sandun.bandara@gmail.com','$2a$10$MxWfdg21vMH4NVVzBdrom.C9FZTOHYet/Bx1c9lvvcZcM2lK7oOEW','student','active','+94 78 765 4321','Colombo',NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(9,'Kasun Wijesinghe','kasun.w@virtusa.com',NULL,'$2a$10$MxWfdg21vMH4NVVzBdrom.LNmNgUqps3AQFMhFvVN3UzFNO8ZicDe','employer','approved','+94 11 472 8000',NULL,NULL,NULL,NULL,'Virtusa Sri Lanka','IT sector','Kasun Wijesinghe','Western Province / Islandwide','Senior Talent Acquisition Lead','https://linkedin.com/in/kasun-virtusa-hr','+94 77 111 2222','PV-10492-SL','TIN-98234123','https://www.virtusa.com','2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(10,'Dr. Nilmini Alwis','nilmini@hayleysbio.lk',NULL,'$2a$10$MxWfdg21vMH4NVVzBdrom.LNmNgUqps3AQFMhFvVN3UzFNO8ZicDe','employer','approved','+94 11 269 9000',NULL,NULL,NULL,NULL,'Hayleys Agriculture & Biotechnology','Biology','Dr. Nilmini Alwis','Southern & Central Provinces','R&D Director & Intern Coordinator','https://linkedin.com/in/nilmini-alwis','+94 71 234 5678','PV-88392-AG','TIN-11223344','https://www.hayleysagriculture.com','2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(11,'Malik Jayawardena','malik@wso2.com',NULL,'$2a$10$MxWfdg21vMH4NVVzBdrom.LNmNgUqps3AQFMhFvVN3UzFNO8ZicDe','employer','pending','+94 11 214 5345',NULL,NULL,NULL,NULL,'WSO2 Sri Lanka','IT sector','Malik Jayawardena','Colombo / Remote','HR Talent Acquisition Executive',NULL,NULL,'PV-99481-WSO2',NULL,NULL,'2026-09-18 12:46:27','2026-09-18 12:46:27',NULL,NULL,NULL,0,NULL),(12,'R A S Bandara','student@skillbridge.demo','anjanasbr2003@gmail.com','$2a$10$DFpotF.kzho7klC52Hf25eJWTaSFGBNU2C.622zHGNqOnQ9FDmWWS','student','active','0724917666','Ambalantota','Senior Lecturer',NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 16:54:04','2026-09-18 17:44:15',NULL,NULL,NULL,1,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-18 23:22:12
