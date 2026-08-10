-- =======================================================================
-- INFY LEARNX PLATFORM — MySQL Table Scripts
-- Database driver : com.mysql.cj.jdbc.Driver (MySQL Connector/J 8.x)
-- Hibernate dialect : org.hibernate.dialect.MySQLDialect
-- Charset : utf8mb4
-- Run this file against a running MySQL 5.7+ / 8.x instance.
-- Each section is independent — you can run one section at a time.
-- =======================================================================


-- =======================================================================
-- 1. DATABASE: infy_learnx_users  (user-service  port 8081)
-- =======================================================================
CREATE DATABASE IF NOT EXISTS infy_learnx_users
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE infy_learnx_users;

CREATE TABLE IF NOT EXISTS users (
    user_id     CHAR(36)     NOT NULL,
    user_code   VARCHAR(30)  NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL COMMENT 'STUDENT | INSTRUCTOR | ADMINISTRATOR',
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE | INACTIVE',
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME     NOT NULL,
    PRIMARY KEY (user_id),
    CONSTRAINT uk_user_code UNIQUE (user_code),
    CONSTRAINT uk_email     UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
    student_id   CHAR(36)    NOT NULL,
    user_id      CHAR(36)    NOT NULL,
    student_code VARCHAR(30) NOT NULL,
    batch_id     CHAR(36)    NULL     COMMENT 'Logical ref — no FK across service DBs',
    created_at   DATETIME    NOT NULL,
    updated_at   DATETIME    NOT NULL,
    PRIMARY KEY (student_id),
    CONSTRAINT uk_student_code UNIQUE (student_code),
    CONSTRAINT uk_student_user UNIQUE (user_id),
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS instructors (
    instructor_id   CHAR(36)    NOT NULL,
    user_id         CHAR(36)    NOT NULL,
    instructor_code VARCHAR(30) NOT NULL,
    specialization  VARCHAR(255) NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE | INACTIVE',
    created_at      DATETIME    NOT NULL,
    updated_at      DATETIME    NOT NULL,
    PRIMARY KEY (instructor_id),
    CONSTRAINT uk_instructor_code UNIQUE (instructor_code),
    CONSTRAINT uk_instructor_user UNIQUE (user_id),
    CONSTRAINT fk_instructor_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS administrators (
    administrator_id CHAR(36)    NOT NULL,
    user_id          CHAR(36)    NOT NULL,
    admin_code       VARCHAR(30) NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE | INACTIVE',
    created_at       DATETIME    NOT NULL,
    updated_at       DATETIME    NOT NULL,
    PRIMARY KEY (administrator_id),
    CONSTRAINT uk_admin_code UNIQUE (admin_code),
    CONSTRAINT uk_admin_user UNIQUE (user_id),
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS batches (
    batch_id   CHAR(36)    NOT NULL,
    batch_code VARCHAR(30) NOT NULL,
    batch_name VARCHAR(100) NOT NULL,
    owner_id   CHAR(36)    NOT NULL COMMENT 'Logical ref to instructors.instructor_id',
    start_date DATE        NOT NULL,
    end_date   DATE        NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME    NOT NULL,
    updated_at DATETIME    NOT NULL,
    PRIMARY KEY (batch_id),
    CONSTRAINT uk_batch_code UNIQUE (batch_code)
) ENGINE=InnoDB;

-- Sample data — user-service
INSERT IGNORE INTO users VALUES
  ('aaaa0001-0001-0001-0001-aaaaaaaaaaaa','USR-0001','Alice Johnson','alice@infy.com','STUDENT','ACTIVE',NOW(),NOW()),
  ('aaaa0002-0002-0002-0002-aaaaaaaaaaaa','USR-0002','Bob Smith','bob@infy.com','INSTRUCTOR','ACTIVE',NOW(),NOW()),
  ('aaaa0003-0003-0003-0003-aaaaaaaaaaaa','USR-0003','Carol Admin','carol@infy.com','ADMINISTRATOR','ACTIVE',NOW(),NOW()),
  ('aaaa0004-0004-0004-0004-aaaaaaaaaaaa','USR-0004','Dave Inactive','dave@infy.com','STUDENT','INACTIVE',NOW(),NOW());

-- Default batches (requirement: Java, BigData, AI as real DB records, not
-- frontend-hardcoded dropdown values). Admin can add more later via
-- POST /api/batches — they appear in every batch dropdown automatically.
INSERT IGNORE INTO batches VALUES
  ('cccc0001-0001-0001-0001-cccccccccccc','BATCH-JAVA','Java',
   'aaaa0002-0002-0002-0002-aaaaaaaaaaaa','2024-01-15','2024-06-30','ACTIVE',NOW(),NOW()),
  ('cccc0002-0002-0002-0002-cccccccccccc','BATCH-BIGDATA','BigData',
   'aaaa0002-0002-0002-0002-aaaaaaaaaaaa','2024-07-01',NULL,'ACTIVE',NOW(),NOW()),
  ('cccc0003-0003-0003-0003-cccccccccccc','BATCH-AI','AI',
   'aaaa0002-0002-0002-0002-aaaaaaaaaaaa','2024-07-01',NULL,'ACTIVE',NOW(),NOW());

INSERT IGNORE INTO students VALUES
  ('5dbd0001-0001-0001-0001-5dbd00000001','aaaa0001-0001-0001-0001-aaaaaaaaaaaa',
   'STU-0001','cccc0001-0001-0001-0001-cccccccccccc',NOW(),NOW()),
  ('5dbd0002-0002-0002-0002-5dbd00000002','aaaa0004-0004-0004-0004-aaaaaaaaaaaa',
   'STU-0002','cccc0001-0001-0001-0001-cccccccccccc',NOW(),NOW());

INSERT IGNORE INTO instructors VALUES
  ('1e5d0001-0001-0001-0001-1e5d00000001','aaaa0002-0002-0002-0002-aaaaaaaaaaaa',
   'INS-0001','Java and Spring Boot','ACTIVE',NOW(),NOW());

INSERT IGNORE INTO administrators VALUES
  ('adce0001-0001-0001-0001-adce00000001','aaaa0003-0003-0003-0003-aaaaaaaaaaaa',
   'ADM-0001','ACTIVE',NOW(),NOW());


-- =======================================================================
-- 2. DATABASE: infy_learnx_assessment  (assessment-service  port 8083)
-- =======================================================================
CREATE DATABASE IF NOT EXISTS infy_learnx_assessment
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE infy_learnx_assessment;

CREATE TABLE IF NOT EXISTS assessments (
    assessment_id    CHAR(36)     NOT NULL,
    assessment_code  VARCHAR(40)  NOT NULL,
    title            VARCHAR(150) NOT NULL,
    description      VARCHAR(1000) NULL,
    status           VARCHAR(20)  NOT NULL COMMENT 'DRAFT | PUBLISHED | CLOSED',
    start_time       DATETIME     NOT NULL,
    end_time         DATETIME     NOT NULL,
    duration_minutes INT          NOT NULL,
    scope_type       VARCHAR(20)  NOT NULL COMMENT 'COURSE | BATCH',
    scope_id         CHAR(36)     NOT NULL COMMENT 'Logical ref to Course or Batch id',
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME     NOT NULL,
    PRIMARY KEY (assessment_id),
    CONSTRAINT uk_assessment_code UNIQUE (assessment_code)
) ENGINE=InnoDB;

-- Sample data — assessment-service
INSERT IGNORE INTO assessments VALUES
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
-- 3. DATABASE: infy_learnx_registration  (registration-service  port 8084)
-- =======================================================================
CREATE DATABASE IF NOT EXISTS infy_learnx_registration
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE infy_learnx_registration;

CREATE TABLE IF NOT EXISTS registrations (
    registration_id     CHAR(36)    NOT NULL,
    student_id          CHAR(36)    NOT NULL COMMENT 'Logical ref — user-service',
    assessment_id       CHAR(36)    NOT NULL COMMENT 'Logical ref — assessment-service',
    status              VARCHAR(20) NOT NULL COMMENT 'REGISTERED | CANCELLED',
    registered_at       DATETIME    NOT NULL,
    cancelled_at        DATETIME    NULL,
    last_reactivated_at DATETIME    NULL,
    source_channel      VARCHAR(20) NULL COMMENT 'WEB | MOBILE | ADMIN',
    created_at          DATETIME    NOT NULL,
    updated_at          DATETIME    NOT NULL,
    PRIMARY KEY (registration_id),
    CONSTRAINT uk_student_assessment_active
        UNIQUE (student_id, assessment_id)
) ENGINE=InnoDB;

-- Sample data — registration-service
INSERT IGNORE INTO registrations VALUES
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
-- 4. DATABASE: infy_learnx_summary  (summary-service  port 8085)
-- =======================================================================
CREATE DATABASE IF NOT EXISTS infy_learnx_summary
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE infy_learnx_summary;

CREATE TABLE IF NOT EXISTS registration_summary_views (
    summary_id        VARCHAR(100) NOT NULL,
    batch_id          CHAR(36)     NOT NULL COMMENT 'Logical ref — user-service',
    assessment_id     CHAR(36)     NULL     COMMENT 'NULL means batch-level rollup',
    total_registered  INT          NOT NULL DEFAULT 0,
    total_cancelled   INT          NOT NULL DEFAULT 0,
    generated_at      DATETIME     NOT NULL,
    window_start      DATETIME     NULL,
    window_end        DATETIME     NULL,
    created_at        DATETIME     NOT NULL,
    updated_at        DATETIME     NOT NULL,
    PRIMARY KEY (summary_id)
) ENGINE=InnoDB;

-- Sample data — summary-service
INSERT IGNORE INTO registration_summary_views VALUES
  ('cccc0001-0001-0001-0001-cccccccccccc_ALL',
   'cccc0001-0001-0001-0001-cccccccccccc',NULL,8,2,NOW(),NULL,NULL,NOW(),NOW()),

  ('cccc0001-0001-0001-0001-cccccccccccc_bbbb0001-0001-0001-0001-bbbbbbbbbbbb',
   'cccc0001-0001-0001-0001-cccccccccccc',
   'bbbb0001-0001-0001-0001-bbbbbbbbbbbb',5,1,NOW(),NULL,NULL,NOW(),NOW()),

  ('cccc0002-0002-0002-0002-cccccccccccc_ALL',
   'cccc0002-0002-0002-0002-cccccccccccc',NULL,3,0,NOW(),NULL,NULL,NOW(),NOW());


-- =======================================================================
-- 5. DATABASE: infy_learnx_learning  (learning-service  port 8082)
-- =======================================================================
CREATE DATABASE IF NOT EXISTS infy_learnx_learning
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE infy_learnx_learning;

CREATE TABLE IF NOT EXISTS courses (
    course_id     CHAR(36)     NOT NULL,
    course_code   VARCHAR(30)  NOT NULL,
    title         VARCHAR(150) NOT NULL,
    description   TEXT         NULL,
    status        VARCHAR(20)  NOT NULL COMMENT 'DRAFT | PUBLISHED | ARCHIVED',
    instructor_id CHAR(36)     NOT NULL COMMENT 'Logical ref — user-service',
    published_at  DATETIME     NULL,
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME     NOT NULL,
    PRIMARY KEY (course_id),
    CONSTRAINT uk_course_code UNIQUE (course_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_modules (
    module_id    CHAR(36)     NOT NULL,
    course_id    CHAR(36)     NOT NULL,
    title        VARCHAR(150) NOT NULL,
    module_order INT          NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at   DATETIME     NOT NULL,
    updated_at   DATETIME     NOT NULL,
    PRIMARY KEY (module_id),
    CONSTRAINT uk_course_module_order UNIQUE (course_id, module_order),
    CONSTRAINT fk_module_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS learning_materials (
    material_id   CHAR(36)     NOT NULL,
    module_id     CHAR(36)     NOT NULL,
    title         VARCHAR(200) NOT NULL,
    material_type VARCHAR(20)  NOT NULL COMMENT 'PDF | VIDEO | LINK | DOC',
    resource_path VARCHAR(500) NOT NULL,
    access_level  VARCHAR(20)  NOT NULL DEFAULT 'ENROLLED_ONLY' COMMENT 'ENROLLED_ONLY | PUBLIC_READ',
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME     NOT NULL,
    PRIMARY KEY (material_id),
    CONSTRAINT uk_module_material_title UNIQUE (module_id, title),
    CONSTRAINT fk_material_module FOREIGN KEY (module_id) REFERENCES course_modules(module_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id              CHAR(36)     NOT NULL,
    course_id            CHAR(36)     NOT NULL,
    title                VARCHAR(150) NOT NULL,
    status               VARCHAR(20)  NOT NULL COMMENT 'DRAFT | PUBLISHED | LIVE | CLOSED | EVALUATED',
    scheduled_at         DATETIME     NULL,
    duration_minutes     INT          NOT NULL,
    total_marks          INT          NOT NULL,
    owner_instructor_id  CHAR(36)     NOT NULL COMMENT 'Logical ref — user-service',
    created_at           DATETIME     NOT NULL,
    updated_at           DATETIME     NOT NULL,
    PRIMARY KEY (quiz_id),
    CONSTRAINT uk_course_quiz_title UNIQUE (course_id, title),
    CONSTRAINT fk_quiz_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_questions (
    question_id        CHAR(36)     NOT NULL,
    quiz_id            CHAR(36)     NOT NULL,
    question_text      VARCHAR(2000) NOT NULL,
    question_type      VARCHAR(20)  NOT NULL COMMENT 'MCQ | TRUE_FALSE',
    difficulty_level   VARCHAR(20)  NULL COMMENT 'EASY | MEDIUM | HARD',
    marks              INT          NOT NULL,
    option_set         VARCHAR(1000) NOT NULL,
    correct_answer_key VARCHAR(100) NOT NULL,
    created_at         DATETIME     NOT NULL,
    updated_at         DATETIME     NOT NULL,
    PRIMARY KEY (question_id),
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS learner_progress (
    progress_id           CHAR(36)     NOT NULL,
    student_id            CHAR(36)     NOT NULL COMMENT 'Logical ref — user-service',
    course_id             CHAR(36)     NOT NULL,
    module_id             CHAR(36)     NULL,
    completion_percentage DOUBLE       NOT NULL,
    progress_status       VARCHAR(20)  NOT NULL COMMENT 'NOT_STARTED | IN_PROGRESS | COMPLETED',
    last_accessed_at      DATETIME     NULL,
    updated_at            DATETIME     NOT NULL,
    PRIMARY KEY (progress_id),
    CONSTRAINT uk_student_course_module_progress
        UNIQUE (student_id, course_id, module_id),
    CONSTRAINT fk_progress_course FOREIGN KEY (course_id) REFERENCES courses(course_id),
    CONSTRAINT fk_progress_module FOREIGN KEY (module_id) REFERENCES course_modules(module_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_enrollments (
    enrollment_id     CHAR(36)    NOT NULL,
    course_id         CHAR(36)    NOT NULL,
    student_id        CHAR(36)    NOT NULL COMMENT 'Logical ref — user-service',
    enrollment_status VARCHAR(20) NOT NULL COMMENT 'ACTIVE | INACTIVE',
    enrolled_at       DATETIME    NOT NULL,
    created_at        DATETIME    NOT NULL,
    updated_at        DATETIME    NOT NULL,
    PRIMARY KEY (enrollment_id),
    CONSTRAINT uk_student_course_enrollment UNIQUE (student_id, course_id),
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
) ENGINE=InnoDB;

-- Sample data — learning-service
INSERT IGNORE INTO courses VALUES
  ('ca500001-0001-0001-0001-ca5000000001','CRS-0001',
   'Java Spring Boot Fundamentals',
   'Comprehensive Java and Spring Boot course covering REST APIs and microservices.',
   'PUBLISHED','1e5d0001-0001-0001-0001-1e5d00000001',
   DATE_SUB(NOW(), INTERVAL 10 DAY),NOW(),NOW()),

  ('ca500002-0002-0002-0002-ca5000000002','CRS-0002',
   'Advanced JVM Internals (Draft)',NULL,'DRAFT',
   '1e5d0001-0001-0001-0001-1e5d00000001',NULL,NOW(),NOW());

INSERT IGNORE INTO course_modules VALUES
  ('c0d00001-0001-0001-0001-c0d000000001',
   'ca500001-0001-0001-0001-ca5000000001','Introduction to Java',1,'ACTIVE',NOW(),NOW()),
  ('c0d00002-0002-0002-0002-c0d000000002',
   'ca500001-0001-0001-0001-ca5000000001','Spring Boot Basics',2,'ACTIVE',NOW(),NOW());

INSERT IGNORE INTO learning_materials VALUES
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

INSERT IGNORE INTO quizzes VALUES
  ('eb200001-0001-0001-0001-eb2000000001',
   'ca500001-0001-0001-0001-ca5000000001','Module 1 Quiz',
   'PUBLISHED',DATE_ADD(NOW(), INTERVAL 3 DAY),30,10,
   '1e5d0001-0001-0001-0001-1e5d00000001',NOW(),NOW());

INSERT IGNORE INTO quiz_questions VALUES
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

INSERT IGNORE INTO course_enrollments VALUES
  ('eea00001-0001-0001-0001-eea000000001',
   'ca500001-0001-0001-0001-ca5000000001',
   '5dbd0001-0001-0001-0001-5dbd00000001',
   'ACTIVE',NOW(),NOW(),NOW());

INSERT IGNORE INTO learner_progress VALUES
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
-- 6. DATABASE: infy_learnx_certification  (certification-service  port 8086)
-- =======================================================================
CREATE DATABASE IF NOT EXISTS infy_learnx_certification
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE infy_learnx_certification;

CREATE TABLE IF NOT EXISTS certificates (
    certificate_id CHAR(36)     NOT NULL,
    student_id     CHAR(36)     NOT NULL COMMENT 'Logical ref — user-service',
    assessment_id  CHAR(36)     NOT NULL COMMENT 'Logical ref — assessment-service',
    course_id      CHAR(36)     NULL     COMMENT 'Optional logical ref — learning-service',
    score          DOUBLE       NOT NULL COMMENT 'Must be >= 60.0 to issue',
    status         VARCHAR(20)  NOT NULL COMMENT 'ISSUED | REVOKED',
    issued_at      DATETIME     NOT NULL,
    download_token VARCHAR(200) NOT NULL,
    created_at     DATETIME     NOT NULL,
    updated_at     DATETIME     NOT NULL,
    PRIMARY KEY (certificate_id),
    CONSTRAINT uk_student_assessment_certificate
        UNIQUE (student_id, assessment_id),
    CONSTRAINT uk_download_token UNIQUE (download_token)
) ENGINE=InnoDB;

-- Sample data — certification-service
-- Positive: score 85% — well above 60% threshold
INSERT IGNORE INTO certificates VALUES
  ('cead0001-0001-0001-0001-cead00000001',
   '5dbd0001-0001-0001-0001-5dbd00000001',
   'bbbb0003-0003-0003-0003-bbbbbbbbbbbb',
   'ca500001-0001-0001-0001-ca5000000001',
   85.0,'ISSUED',NOW(),
   CONCAT('dlt-',UUID()),NOW(),NOW());

-- Boundary: score exactly 60.0 — minimum threshold
INSERT IGNORE INTO certificates VALUES
  ('cead0002-0002-0002-0002-cead00000002',
   '5dbd0002-0002-0002-0002-5dbd00000002',
   'bbbb0004-0004-0004-0004-bbbbbbbbbbbb',
   NULL,
   60.0,'ISSUED',NOW(),
   CONCAT('dlt-',UUID()),NOW(),NOW());

-- Negative: revoked certificate
INSERT IGNORE INTO certificates VALUES
  ('cead0003-0003-0003-0003-cead00000003',
   '5dbd0003-0003-0003-0003-5dbd00000003',
   'bbbb0005-0005-0005-0005-bbbbbbbbbbbb',
   NULL,
   72.5,'REVOKED',NOW(),
   CONCAT('dlt-',UUID()),NOW(),NOW());


-- =======================================================================
-- QUICK VERIFICATION QUERIES
-- Run these after inserting to confirm all tables have data.
-- =======================================================================
/*
USE infy_learnx_users;
SELECT 'users' AS tbl, COUNT(*) FROM users
UNION ALL SELECT 'students', COUNT(*) FROM students
UNION ALL SELECT 'instructors', COUNT(*) FROM instructors
UNION ALL SELECT 'administrators', COUNT(*) FROM administrators
UNION ALL SELECT 'batches', COUNT(*) FROM batches;

USE infy_learnx_assessment;
SELECT 'assessments' AS tbl, COUNT(*) FROM assessments;

USE infy_learnx_registration;
SELECT 'registrations' AS tbl, COUNT(*) FROM registrations;

USE infy_learnx_summary;
SELECT 'registration_summary_views' AS tbl, COUNT(*) FROM registration_summary_views;

USE infy_learnx_learning;
SELECT 'courses' AS tbl, COUNT(*) FROM courses
UNION ALL SELECT 'course_modules', COUNT(*) FROM course_modules
UNION ALL SELECT 'learning_materials', COUNT(*) FROM learning_materials
UNION ALL SELECT 'quizzes', COUNT(*) FROM quizzes
UNION ALL SELECT 'quiz_questions', COUNT(*) FROM quiz_questions
UNION ALL SELECT 'course_enrollments', COUNT(*) FROM course_enrollments
UNION ALL SELECT 'learner_progress', COUNT(*) FROM learner_progress;

USE infy_learnx_certification;
SELECT 'certificates' AS tbl, COUNT(*) FROM certificates;
*/
