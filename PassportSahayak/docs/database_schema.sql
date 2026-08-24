-- ============================================================
-- PassportSahayak AI - Full Database Schema (all 7 services)
-- Generated from the live MySQL/MariaDB databases via mysqldump
-- Each service owns its own database (microservice DB-per-service)
-- Run each service to auto-generate these via Hibernate ddl-auto=update,
-- or run this script directly against a fresh MySQL/MariaDB instance.
-- ============================================================

-- ============================================================
-- auth-service (port 9081) - users, roles
-- Database: passportsahayak_auth
-- ============================================================
CREATE DATABASE IF NOT EXISTS passportsahayak_auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE passportsahayak_auth;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','APPLICANT','PSK_OFFICIAL','RPO_OFFICIAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK1j9d9a06i600gd43uu3km82jw` (`email`),
  UNIQUE KEY `UKexslcon9jmfy0xhclbtpf26vo` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- ============================================================
-- application-service (port 9082) - passport applications, ARN, status
-- Database: passportsahayak_application
-- ============================================================
CREATE DATABASE IF NOT EXISTS passportsahayak_application CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE passportsahayak_application;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passport_application` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `applicant_email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicant_full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicant_phone` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicant_user_id` bigint NOT NULL,
  `application_type` enum('FRESH','REISSUE_LOST_DAMAGED','REISSUE_NAME_CHANGE','REISSUE_RENEWAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `arn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booklet_type` enum('JUMBO_60','STANDARD_36') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `date_of_birth` date NOT NULL,
  `fee_amount` decimal(10,2) NOT NULL,
  `fee_paid` bit(1) NOT NULL,
  `minor` bit(1) NOT NULL,
  `pv_type` enum('POST_PV','PRE_PV','PV_EXEMPT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_scheme` enum('NORMAL','TATKAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('APPOINTMENT_BOOKED','CANCELLED','ON_HOLD','PASSPORT_DELIVERED','PASSPORT_DISPATCHED','PSK_VISIT_COMPLETED','PV_CLEARED','PV_DISPATCHED','PV_IN_PROGRESS','REJECTED','SUBMITTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tatkal_reason` enum('COURT_LEGAL_SUMMONS','DEATH_OF_RELATIVE_ABROAD','EDUCATION_VISA','EMPLOYMENT_VISA','MEDICAL_EMERGENCY','PASSPORT_EXPIRY_WITH_TRAVEL','SPORTS_CULTURAL_EVENT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKlah5nfg2114h026p8ir4i7kt` (`arn`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- ============================================================
-- appointment-service (port 9083) - PSK/POPSK centers, appointments
-- Database: passportsahayak_appointment
-- ============================================================
CREATE DATABASE IF NOT EXISTS passportsahayak_appointment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE passportsahayak_appointment;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `applicant_user_id` bigint NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time(6) NOT NULL,
  `arn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `category` enum('NORMAL','TATKAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `no_show_at` datetime(6) DEFAULT NULL,
  `reschedule_count` int NOT NULL,
  `status` enum('BOOKED','CANCELLED','COMPLETED','NO_SHOW','RESCHEDULED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `center_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqsg4m9u1agigm4qfyitghf560` (`arn`),
  KEY `FKc1gtgfy81fglytyfsl3afa178` (`center_id`),
  CONSTRAINT `FKc1gtgfy81fglytyfsl3afa178` FOREIGN KEY (`center_id`) REFERENCES `psk_center` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `psk_center` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `daily_capacity` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tatkal_capacity_percent` int NOT NULL,
  `type` enum('POPSK','PSK') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKowh0ta18q7r693gprrw3ybh18` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- ============================================================
-- police-verification-service (port 9084) - PV cases
-- Database: passportsahayak_pv
-- ============================================================
CREATE DATABASE IF NOT EXISTS passportsahayak_pv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE passportsahayak_pv;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pv_case` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `applicant_user_id` bigint NOT NULL,
  `arn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cleared_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `dispatched_at` datetime(6) NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pv_type` enum('EXPEDITED_PRE_PV','POST_PV','PRE_PV','PV_EXEMPT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sla_deadline` date NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ADVERSE','ASSIGNED','CLEARED','DISPATCHED','IN_PROGRESS','OVERDUE','REPORT_RECEIVED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKd7jiefakhxxw6mf9f16812yoq` (`arn`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- ============================================================
-- grievance-appeal-service (port 9085) - grievances, appeals
-- Database: passportsahayak_grievance
-- ============================================================
CREATE DATABASE IF NOT EXISTS passportsahayak_grievance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE passportsahayak_grievance;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appeal` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `applicant_user_id` bigint NOT NULL,
  `arn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `decided_at` datetime(6) DEFAULT NULL,
  `decision_notes` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ground_text` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` enum('LEVEL_1_DPO','LEVEL_2_PASSPORT_OFFICER','LEVEL_3_RPO_HEAD','LEVEL_4_JOINT_SECRETARY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('DECIDED','ESCALATED','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grievance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `arn` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complainant_user_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resolution_notes` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` datetime(6) DEFAULT NULL,
  `sla_working_days` int NOT NULL,
  `status` enum('ESCALATED','IN_PROGRESS','OPEN','RESOLVED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('DATA_ENTRY_ERROR','INCORRECT_REJECTION','PASSPORT_NOT_RECEIVED','POLICE_PAYMENT_DEMAND','PV_DELAY','STAFF_MISCONDUCT','STATUS_DELAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- ============================================================
-- fraud-service (port 9086) - fraud reports, escalations
-- Database: passportsahayak_fraud
-- ============================================================
CREATE DATABASE IF NOT EXISTS passportsahayak_fraud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE passportsahayak_fraud;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `escalation_case` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `arn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `details` varchar(1500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ON_HOLD','OPEN','RESOLVED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('DENIED_NOC','DISPUTED_PARENTAGE','REPEATED_LOST_PASSPORT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fraud_report` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `arn` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('AGENT_BROKER_FRAUD','DOCUMENT_FORGERY','DUPLICATE_PASSPORT','IDENTITY_IMPERSONATION','INTERNAL_MISCONDUCT','ONLINE_PHISHING','PV_CORRUPTION','SUPPRESSION_OF_INFO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(1500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referral_authority` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reported_by_user_id` bigint NOT NULL,
  `severity` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('CLOSED','REFERRED','REPORTED','UNDER_REVIEW') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- ============================================================
-- kb-ai-service (port 9087) - KB documents, chunks
-- Database: passportsahayak_kb
-- ============================================================
CREATE DATABASE IF NOT EXISTS passportsahayak_kb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE passportsahayak_kb;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kb_chunk` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chunk_index` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `embedding` longtext COLLATE utf8mb4_unicode_ci,
  `embedding_status` enum('EMBEDDED','FAILED','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqqeihiyx14jvdstxcbtmqje5s` (`document_id`),
  CONSTRAINT `FKqqeihiyx14jvdstxcbtmqje5s` FOREIGN KEY (`document_id`) REFERENCES `kb_document` (`document_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kb_document` (
  `document_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audience` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chunk_count` int NOT NULL,
  `content_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `doc_code` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `file_size_bytes` bigint NOT NULL,
  `ingestion_time_ms` bigint NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','SUPERSEDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tags` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by_role` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by_user_id` bigint DEFAULT NULL,
  `version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


