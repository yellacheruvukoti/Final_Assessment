-- =======================================================================
-- INFY LEARNX PLATFORM — Postman Test-Data Reset Script
-- Purpose: wipe every table that manual/Newman Postman runs can mutate
--          (creates, publishes, enrollments, revokes, ...) and restore
--          the exact seed rows from ../database/schema.sql.
-- Run this BEFORE a fresh manual Postman pass whenever you want a clean,
-- repeatable starting state. Safe to re-run any number of times.
-- =======================================================================


-- =======================================================================
-- 1. infy_learnx_users  (user-service  port 8081)
-- =======================================================================
USE infy_learnx_users;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE students;
TRUNCATE TABLE instructors;
TRUNCATE TABLE administrators;
TRUNCATE TABLE batches;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users VALUES
  ('aaaa0001-0001-0001-0001-aaaaaaaaaaaa','USR-0001','Alice Johnson','alice@infy.com','STUDENT','ACTIVE',NOW(),NOW()),
  ('aaaa0002-0002-0002-0002-aaaaaaaaaaaa','USR-0002','Bob Smith','bob@infy.com','INSTRUCTOR','ACTIVE',NOW(),NOW()),
  ('aaaa0003-0003-0003-0003-aaaaaaaaaaaa','USR-0003','Carol Admin','carol@infy.com','ADMINISTRATOR','ACTIVE',NOW(),NOW()),
  ('aaaa0004-0004-0004-0004-aaaaaaaaaaaa','USR-0004','Dave Inactive','dave@infy.com','STUDENT','INACTIVE',NOW(),NOW());

INSERT INTO batches VALUES
  ('cccc0001-0001-0001-0001-cccccccccccc','BATCH-2024-A','Java Full Stack 2024 Batch A',
   'aaaa0002-0002-0002-0002-aaaaaaaaaaaa','2024-01-15','2024-06-30','ACTIVE',NOW(),NOW()),
  ('cccc0002-0002-0002-0002-cccccccccccc','BATCH-2024-B','Java Full Stack 2024 Batch B',
   'aaaa0002-0002-0002-0002-aaaaaaaaaaaa','2024-07-01',NULL,'ACTIVE',NOW(),NOW());

INSERT INTO students VALUES
  ('5dbd0001-0001-0001-0001-5dbd00000001','aaaa0001-0001-0001-0001-aaaaaaaaaaaa',
   'STU-0001','cccc0001-0001-0001-0001-cccccccccccc',NOW(),NOW()),
  ('5dbd0002-0002-0002-0002-5dbd00000002','aaaa0004-0004-0004-0004-aaaaaaaaaaaa',
   'STU-0002','cccc0001-0001-0001-0001-cccccccccccc',NOW(),NOW());

INSERT INTO instructors VALUES
  ('1e5d0001-0001-0001-0001-1e5d00000001','aaaa0002-0002-0002-0002-aaaaaaaaaaaa',
   'INS-0001','Java and Spring Boot','ACTIVE',NOW(),NOW());

INSERT INTO administrators VALUES
  ('adce0001-0001-0001-0001-adce00000001','aaaa0003-0003-0003-0003-aaaaaaaaaaaa',
   'ADM-0001','ACTIVE',NOW(),NOW());


-- =======================================================================
-- 2. infy_learnx_assessment  (assessment-service  port 8083)
-- =======================================================================
USE infy_learnx_assessment;

TRUNCATE TABLE assessments;

INSERT INTO assessments VALUES
  ('bbbb0001-0001-0001-0001-bbbbbbbbbbbb','ASM-0001','Java Fundamentals Assessment',
   'Covers Java basics, OOP, and collections','PUBLISHED',
   DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 2 HOUR,
   90,'BATCH','cccc0001-0001-0001-0001-cccccccccccc',NOW(),NOW()),

  ('bbbb0002-0002-0002-0002-bbbbbbbbbbbb','ASM-0002','Spring Boot Intermediate Test',
   NULL,'PUBLISHED',
   DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_ADD(NOW(), INTERVAL 2 HOUR),
   60,'COURSE','ca500001-0001-0001-0001-ca5000000001',NOW(),NOW()),

  ('bbbb0003-0003-0003-0003-bbbbbbbbbbbb','ASM-0003','Microservices Architecture Exam',
   NULL,'CLOSED',
   DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY),
   120,'BATCH','cccc0001-0001-0001-0001-cccccccccccc',NOW(),NOW()),

  ('bbbb0004-0004-0004-0004-bbbbbbbbbbbb','ASM-0004','Advanced JVM Internals (Draft)',
   NULL,'DRAFT',
   DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY) + INTERVAL 2 HOUR,
   90,'COURSE','ca500001-0001-0001-0001-ca5000000001',NOW(),NOW());


-- =======================================================================
-- 3. infy_learnx_registration  (registration-service  port 8084)
-- =======================================================================
USE infy_learnx_registration;

TRUNCATE TABLE registrations;

INSERT INTO registrations VALUES
  ('ae600001-0001-0001-0001-ae6000000001',
   '5dbd0001-0001-0001-0001-5dbd00000001',
   'bbbb0001-0001-0001-0001-bbbbbbbbbbbb',
   'REGISTERED',NOW(),NULL,NULL,'WEB',NOW(),NOW()),

  ('ae600002-0002-0002-0002-ae6000000002',
   '5dbd0001-0001-0001-0001-5dbd00000001',
   'bbbb0003-0003-0003-0003-bbbbbbbbbbbb',
   'CANCELLED',DATE_SUB(NOW(),INTERVAL 5 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY),NULL,'MOBILE',NOW(),NOW()),

  ('ae600003-0003-0003-0003-ae6000000003',
   '5dbd0002-0002-0002-0002-5dbd00000002',
   'bbbb0001-0001-0001-0001-bbbbbbbbbbbb',
   'REGISTERED',DATE_SUB(NOW(),INTERVAL 1 DAY),NULL,NOW(),'ADMIN',NOW(),NOW());


-- =======================================================================
-- 4. infy_learnx_summary  (summary-service  port 8085)
-- =======================================================================
USE infy_learnx_summary;

TRUNCATE TABLE registration_summary_views;

INSERT INTO registration_summary_views VALUES
  ('cccc0001-0001-0001-0001-cccccccccccc_ALL',
   'cccc0001-0001-0001-0001-cccccccccccc',NULL,8,2,NOW(),NULL,NULL,NOW(),NOW()),

  ('cccc0001-0001-0001-0001-cccccccccccc_bbbb0001-0001-0001-0001-bbbbbbbbbbbb',
   'cccc0001-0001-0001-0001-cccccccccccc',
   'bbbb0001-0001-0001-0001-bbbbbbbbbbbb',5,1,NOW(),NULL,NULL,NOW(),NOW()),

  ('cccc0002-0002-0002-0002-cccccccccccc_ALL',
   'cccc0002-0002-0002-0002-cccccccccccc',NULL,3,0,NOW(),NULL,NULL,NOW(),NOW());


-- =======================================================================
-- 5. infy_learnx_learning  (learning-service  port 8082)
-- =======================================================================
USE infy_learnx_learning;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE learner_progress;
TRUNCATE TABLE course_enrollments;
TRUNCATE TABLE quiz_questions;
TRUNCATE TABLE quizzes;
TRUNCATE TABLE learning_materials;
TRUNCATE TABLE course_modules;
TRUNCATE TABLE courses;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO courses VALUES
  ('ca500001-0001-0001-0001-ca5000000001','CRS-0001',
   'Java Spring Boot Fundamentals',
   'Comprehensive Java and Spring Boot course covering REST APIs and microservices.',
   'PUBLISHED','1e5d0001-0001-0001-0001-1e5d00000001',
   DATE_SUB(NOW(), INTERVAL 10 DAY),NOW(),NOW()),

  ('ca500002-0002-0002-0002-ca5000000002','CRS-0002',
   'Advanced JVM Internals (Draft)',NULL,'DRAFT',
   '1e5d0001-0001-0001-0001-1e5d00000001',NULL,NOW(),NOW());

INSERT INTO course_modules VALUES
  ('c0d00001-0001-0001-0001-c0d000000001',
   'ca500001-0001-0001-0001-ca5000000001','Introduction to Java',1,'ACTIVE',NOW(),NOW()),
  ('c0d00002-0002-0002-0002-c0d000000002',
   'ca500001-0001-0001-0001-ca5000000001','Spring Boot Basics',2,'ACTIVE',NOW(),NOW());

INSERT INTO learning_materials VALUES
  ('cad00001-0001-0001-0001-cad000000001',
   'c0d00001-0001-0001-0001-c0d000000001','Java OOP Notes',
   'PDF','/content/java-oop-notes.pdf','ENROLLED_ONLY','ACTIVE',NOW(),NOW()),
  ('cad00002-0002-0002-0002-cad000000002',
   'c0d00001-0001-0001-0001-c0d000000001','Java Basics Lecture',
   'VIDEO','https://cdn.infy.com/java-basics.mp4','PUBLIC_READ','ACTIVE',NOW(),NOW()),
  ('cad00003-0003-0003-0003-cad000000003',
   'c0d00002-0002-0002-0002-c0d000000002','Spring Boot Docs',
   'LINK','https://spring.io/projects/spring-boot','PUBLIC_READ','ACTIVE',NOW(),NOW()),
  ('cad00004-0004-0004-0004-cad000000004',
   'c0d00002-0002-0002-0002-c0d000000002','Spring Boot Cheat Sheet',
   'DOC','/content/spring-cheatsheet.docx','ENROLLED_ONLY','ACTIVE',NOW(),NOW());

INSERT INTO quizzes VALUES
  ('eb200001-0001-0001-0001-eb2000000001',
   'ca500001-0001-0001-0001-ca5000000001','Module 1 Quiz',
   'PUBLISHED',DATE_ADD(NOW(), INTERVAL 3 DAY),30,10,
   '1e5d0001-0001-0001-0001-1e5d00000001',NOW(),NOW());

INSERT INTO quiz_questions VALUES
  ('ebe00001-0001-0001-0001-ebe000000001',
   'eb200001-0001-0001-0001-eb2000000001',
   'Which keyword is used for inheritance in Java?','MCQ','EASY',2,
   'A:extends,B:implements,C:super,D:abstract','A',NOW(),NOW()),
  ('ebe00002-0002-0002-0002-ebe000000002',
   'eb200001-0001-0001-0001-eb2000000001',
   'Spring Boot auto-configures based on classpath dependencies.','TRUE_FALSE','EASY',1,
   'A:True,B:False','A',NOW(),NOW()),
  ('ebe00003-0003-0003-0003-ebe000000003',
   'eb200001-0001-0001-0001-eb2000000001',
   'Which annotation marks a class as a REST controller?','MCQ','MEDIUM',2,
   'A:@Controller,B:@RestController,C:@Service,D:@Component','B',NOW(),NOW());

INSERT INTO course_enrollments VALUES
  ('eea00001-0001-0001-0001-eea000000001',
   'ca500001-0001-0001-0001-ca5000000001',
   '5dbd0001-0001-0001-0001-5dbd00000001',
   'ACTIVE',NOW(),NOW(),NOW());

INSERT INTO learner_progress VALUES
  ('ba600001-0001-0001-0001-ba6000000001',
   '5dbd0001-0001-0001-0001-5dbd00000001',
   'ca500001-0001-0001-0001-ca5000000001',NULL,50.0,'IN_PROGRESS',NOW(),NOW()),
  ('ba600002-0002-0002-0002-ba6000000002',
   '5dbd0001-0001-0001-0001-5dbd00000001',
   'ca500001-0001-0001-0001-ca5000000001',
   'c0d00001-0001-0001-0001-c0d000000001',100.0,'COMPLETED',NOW(),NOW()),
  ('ba600003-0003-0003-0003-ba6000000003',
   '5dbd0001-0001-0001-0001-5dbd00000001',
   'ca500001-0001-0001-0001-ca5000000001',
   'c0d00002-0002-0002-0002-c0d000000002',0.0,'NOT_STARTED',NOW(),NOW());


-- =======================================================================
-- 6. infy_learnx_certification  (certification-service  port 8086)
-- =======================================================================
USE infy_learnx_certification;

TRUNCATE TABLE certificates;

INSERT INTO certificates VALUES
  ('cead0001-0001-0001-0001-cead00000001',
   '5dbd0001-0001-0001-0001-5dbd00000001',
   'bbbb0003-0003-0003-0003-bbbbbbbbbbbb',
   'ca500001-0001-0001-0001-ca5000000001',
   85.0,'ISSUED',NOW(),
   CONCAT('dlt-',UUID()),NOW(),NOW());

INSERT INTO certificates VALUES
  ('cead0002-0002-0002-0002-cead00000002',
   '5dbd0002-0002-0002-0002-5dbd00000002',
   'bbbb0004-0004-0004-0004-bbbbbbbbbbbb',
   NULL,
   60.0,'ISSUED',NOW(),
   CONCAT('dlt-',UUID()),NOW(),NOW());

INSERT INTO certificates VALUES
  ('cead0003-0003-0003-0003-cead00000003',
   '5dbd0003-0003-0003-0003-5dbd00000003',
   'bbbb0005-0005-0005-0005-bbbbbbbbbbbb',
   NULL,
   72.5,'REVOKED',NOW(),
   CONCAT('dlt-',UUID()),NOW(),NOW());

-- =======================================================================
-- Done. All 6 databases now match the original seed state from
-- database/schema.sql. Re-import postman/InfyLearnX.postman_collection.json
-- and run it, or follow postman/MANUAL_TESTING_GUIDE.md, for a clean pass.
-- =======================================================================
