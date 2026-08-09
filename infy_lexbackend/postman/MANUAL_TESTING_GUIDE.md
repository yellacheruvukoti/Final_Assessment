# Infy LearnX — Manual Postman Testing Guide

Per-endpoint request data for every one of the 75 requests in
`InfyLearnX.postman_collection.json`, for testers who want to fire requests
by hand in Postman instead of running the collection/Newman.

## Before you start

1. All 7 services must be running (gateway on `8080`, business services on
   `8081`–`8086`) and registered in Consul.
2. Load fresh seed data: run [`db-reset.sql`](db-reset.sql) against MySQL.
   It truncates every table the endpoints below can mutate and reloads the
   exact seed rows from [`../database/schema.sql`](../database/schema.sql).
   Re-run it any time you want to start over.
3. Base URL for almost everything is the gateway: `http://localhost:8080`.
   The one exception is called out explicitly in section 2.

### Seeded IDs used throughout this guide

| Name | Value | What it is |
|---|---|---|
| `userId_student1` | `aaaa0001-0001-0001-0001-aaaaaaaaaaaa` | Alice, STUDENT, ACTIVE |
| `userId_instructor1` | `aaaa0002-0002-0002-0002-aaaaaaaaaaaa` | Bob, INSTRUCTOR, ACTIVE |
| `userId_admin1` | `aaaa0003-0003-0003-0003-aaaaaaaaaaaa` | Carol, ADMINISTRATOR, ACTIVE |
| `userId_student2_inactive` | `aaaa0004-0004-0004-0004-aaaaaaaaaaaa` | Dave, STUDENT, INACTIVE |
| `studentId_1` | `5dbd0001-0001-0001-0001-5dbd00000001` | Alice's student record |
| `studentId_2_inactive` | `5dbd0002-0002-0002-0002-5dbd00000002` | Dave's student record |
| `instructorId_1` | `1e5d0001-0001-0001-0001-1e5d00000001` | Bob's instructor record |
| `administratorId_1` | `adce0001-0001-0001-0001-adce00000001` | Carol's administrator record |
| `batchId_1` | `cccc0001-0001-0001-0001-cccccccccccc` | BATCH-2024-A |
| `assessmentId_upcoming` | `bbbb0001-0001-0001-0001-bbbbbbbbbbbb` | PUBLISHED, starts in 7 days |
| `assessmentId_closed` | `bbbb0003-0003-0003-0003-bbbbbbbbbbbb` | CLOSED, 30 days ago |
| `courseId_1` | `ca500001-0001-0001-0001-ca5000000001` | PUBLISHED course |

Any ID not in this table (a new course/quiz/registration/certificate id,
etc.) is **returned by an earlier response** — copy it from that response's
`data.id`-style field into the later request as instructed inline.

Where a service reads authorization from headers, set:
`X-Role: STUDENT|INSTRUCTOR|ADMINISTRATOR` and `X-User-Id: <a userId above>`.

---

## 1. Platform (Gateway)

| # | Method | URL |
|---|---|---|
| 1 | GET | `http://localhost:8080/api/health` |
| 2 | GET | `http://localhost:8080/api/version` |

No body, no headers. Expect `200 OK` on both.

---

## 2. User Service

Base: gateway `http://localhost:8080`, **except** request 15 which bypasses
the gateway on purpose (`/api/batches` has no gateway route by design).

| # | Method | URL | Expect |
|---|---|---|---|
| 3 | GET | `/api/users/aaaa0001-0001-0001-0001-aaaaaaaaaaaa` | 200, Alice |
| 4 | GET | `/api/users/aaaa0001-0001-0001-0001-aaaaaaaaaaaa/role` | 200, `STUDENT` |
| 5 | GET | `/api/users/aaaa0001-0001-0001-0001-aaaaaaaaaaaa/status` | 200, `ACTIVE` |
| 6 | GET | `/api/users/00000000-0000-0000-0000-000000000000` | 404, `USER_NOT_FOUND` |
| 7 | GET | `/api/students/5dbd0001-0001-0001-0001-5dbd00000001` | 200, Alice's student record |
| 8 | GET | `/api/students/5dbd0001-0001-0001-0001-5dbd00000001/batch` | 200, batch info |
| 9 | GET | `/api/students/5dbd0001-0001-0001-0001-5dbd00000001/status` | 200, `ACTIVE` |
| 10 | GET | `/api/students/5dbd0002-0002-0002-0002-5dbd00000002/status` | 200, `INACTIVE` (Dave) |
| 11 | GET | `/api/students?batchId=cccc0001-0001-0001-0001-cccccccccccc` | 200, array with 2 students |
| 12 | GET | `/api/students/by-user/aaaa0001-0001-0001-0001-aaaaaaaaaaaa` | 200 |
| 13 | GET | `/api/instructors/1e5d0001-0001-0001-0001-1e5d00000001` | 200, Bob |
| 14 | GET | `/api/instructors/by-user/aaaa0002-0002-0002-0002-aaaaaaaaaaaa` | 200 |
| 15 | GET | `http://localhost:8081/api/batches/cccc0001-0001-0001-0001-cccccccccccc` **(direct to 8081, not 8080)** | 200, BATCH-2024-A |

Also: `GET /api/administrators/adce0001-0001-0001-0001-adce00000001` → 200, Carol.

No request bodies in this service (read-only endpoints).

---

## 3. Assessment Service

| # | Method | URL | Body |
|---|---|---|---|
| 16 | GET | `/api/assessments` | — |
| 17 | GET | `/api/assessments/upcoming` | — |
| 18 | GET | `/api/assessments/bbbb0001-0001-0001-0001-bbbbbbbbbbbb` | — |
| 19 | GET | `/api/assessments/00000000-0000-0000-0000-000000000000` | — expect 404 |
| 20 | GET | `/api/assessments/not-a-valid-uuid` | — expect 400 `VALIDATION_ERROR` |
| 21 | **POST** | `/api/assessments` | see below |
| 22 | **POST** | `/api/assessments` (validation error) | `{}` → expect 400 |
| 23 | **PUT** | `/api/assessments/{id from #21}` | see below |

**Request 21 body** (`Content-Type: application/json`):
```json
{
  "assessmentCode": "ASM-MANUAL-001",
  "title": "Manual Verification Assessment",
  "description": "Created via manual Postman testing",
  "status": "PUBLISHED",
  "startTime": "2030-01-01T09:00:00",
  "endTime": "2030-01-01T11:00:00",
  "durationMinutes": 60,
  "scopeType": "BATCH",
  "scopeId": "cccc0001-0001-0001-0001-cccccccccccc"
}
```
Note the `assessmentCode` must be unique — change the suffix if you re-run
without resetting the DB. Copy `data.assessmentId` from the response; call
it **`{newAssessmentId}`** — you'll reuse it in sections 4 and 7.

**Request 23 body** (PUT `/api/assessments/{newAssessmentId}`):
```json
{
  "title": "Manual Verification Assessment (Updated)",
  "description": "Updated via manual Postman testing",
  "status": "PUBLISHED",
  "startTime": "2030-01-01T09:00:00",
  "endTime": "2030-01-01T11:00:00",
  "durationMinutes": 90
}
```
Expect 200.

---

## 4. Registration Service

Requires `{newAssessmentId}` from section 3, request 21.

| # | Method | URL | Body |
|---|---|---|---|
| 24 | **POST** | `/api/registrations` | `{"studentId":"5dbd0001-0001-0001-0001-5dbd00000001","assessmentId":"{newAssessmentId}","sourceChannel":"WEB"}` → 201; copy `data.registrationId` as `{newRegistrationId}` |
| 25 | **POST** | `/api/registrations` (validation) | `{}` → 400 |
| 26 | **POST** | `/api/registrations` (duplicate) | same body as #24 again → 409 `DUPLICATE_REGISTRATION` |
| 27 | **POST** | `/api/registrations` (inactive student) | `{"studentId":"5dbd0002-0002-0002-0002-5dbd00000002","assessmentId":"bbbb0001-0001-0001-0001-bbbbbbbbbbbb","sourceChannel":"WEB"}` → 403/422 inactive-student error |
| 28 | **POST** | `/api/registrations` (not published) | `{"studentId":"5dbd0001-0001-0001-0001-5dbd00000001","assessmentId":"bbbb0003-0003-0003-0003-bbbbbbbbbbbb","sourceChannel":"WEB"}` → error, assessment is CLOSED |
| 29 | **POST** | `/api/assessments` (setup for "already started") | see below — creates a PUBLISHED assessment whose `startTime` is 5 minutes in the past (computed from your machine's current time, not a seeded value, to avoid MySQL/JVM clock-skew) |
| 30 | **POST** | `/api/registrations` (already started) | `{"studentId":"5dbd0001-0001-0001-0001-5dbd00000001","assessmentId":"{id from #29}","sourceChannel":"WEB"}` → error, assessment already started |
| 31 | GET | `/api/registrations/{newRegistrationId}` | — 200 |
| 32 | GET | `/api/registrations/00000000-0000-0000-0000-000000000000` | — 404 |
| 33 | GET | `/api/registrations?studentIds=5dbd0001-0001-0001-0001-5dbd00000001` | — 200 |
| 34 | GET | `/api/students/5dbd0001-0001-0001-0001-5dbd00000001/registrations` | — 200 |
| 35 | **PATCH** | `/api/registrations/{newRegistrationId}/cancel` | no body → 200, status CANCELLED |
| 36 | **PATCH** | `/api/registrations/{newRegistrationId}/cancel` (again) | no body → error, already cancelled |
| 37 | **PATCH** | `/api/registrations/{newRegistrationId}/reregister` | no body → 200, status REGISTERED |
| 38 | **PATCH** | `/api/registrations/{newRegistrationId}/reregister` (again) | no body → error, already active |

**Request 29 body** — compute `startTime` as "now minus 5 minutes" in your
own timezone (e.g. `2026-08-09T09:55:00` if it's currently `09:00`), so it's
guaranteed to be in the past from the server's point of view too:
```json
{
  "assessmentCode": "ASM-MANUAL-STARTED-001",
  "title": "Manual Already-Started Assessment",
  "description": "Used to exercise the already-started rejection path",
  "status": "PUBLISHED",
  "startTime": "<now minus 5 minutes, e.g. 2026-08-09T09:55:00>",
  "endTime": "2030-01-01T00:00:00",
  "durationMinutes": 60,
  "scopeType": "BATCH",
  "scopeId": "cccc0001-0001-0001-0001-cccccccccccc"
}
```

---

## 5. Summary Service

All 5 requests hit the same two URLs with different `X-Role`/`X-User-Id`
headers to exercise authorization branches. No bodies.

| # | Method | URL | Headers | Expect |
|---|---|---|---|---|
| 39 | GET | `/api/summaries/batches/cccc0001-0001-0001-0001-cccccccccccc` | `X-Role: ADMINISTRATOR`, `X-User-Id: aaaa0003-0003-0003-0003-aaaaaaaaaaaa` | 200 |
| 40 | GET | `/api/summaries/batches/cccc0001-0001-0001-0001-cccccccccccc/assessments` | same admin headers | 200 |
| 41 | GET | `/api/summaries/batches/cccc0001-0001-0001-0001-cccccccccccc/status` | same admin headers | 200 |
| 42 | GET | `/api/summaries/batches/cccc0001-0001-0001-0001-cccccccccccc` | `X-Role: INSTRUCTOR`, `X-User-Id: aaaa0002-0002-0002-0002-aaaaaaaaaaaa` | 200 (owner instructor) |
| 43 | GET | `/api/summaries/batches/cccc0001-0001-0001-0001-cccccccccccc` | `X-Role: STUDENT`, `X-User-Id: aaaa0001-0001-0001-0001-aaaaaaaaaaaa` | 403 (student not authorized) |

---

## 6. Learning Service

Requires `X-Role`/`X-User-Id` headers on write endpoints. Many requests
chain off a course you create in request #46.

| # | Method | URL | Headers | Body |
|---|---|---|---|---|
| 44 | GET | `/api/courses` | — | — |
| 45 | GET | `/api/courses/ca500001-0001-0001-0001-ca5000000001` | — | — |
| 46 | **POST** | `/api/courses` | `X-Role: ADMINISTRATOR`, `X-User-Id: aaaa0003-...` | see below → copy `data.courseId` as `{newCourseId}` |
| 47 | **POST** | `/api/courses` (validation) | same admin headers | `{}` → 400 |
| 48 | **PUT** | `/api/courses/{newCourseId}` (publish) | same admin headers | `{"title":"Manual Verification Course (Published)","description":"Now published","status":"PUBLISHED"}` → 200 |
| 49 | **POST** | `/api/courses/{newCourseId}/modules` | same admin headers | `{"title":"Manual Module 1","moduleOrder":1}` → 201, copy `data.moduleId` as `{newModuleId}` |
| 50 | **POST** | `/api/courses/{newCourseId}/modules` (unauthorized) | `X-Role: INSTRUCTOR`, `X-User-Id: aaaa0001-...` (Alice, a student, impersonating instructor role) | `{"title":"Should Be Rejected","moduleOrder":2}` → 403 `COURSE_ACCESS_DENIED` |
| 51 | **POST** | `/api/courses/{newCourseId}/materials` | same admin headers | `{"moduleId":"{newModuleId}","title":"Manual Material 1","materialType":"PDF","resourcePath":"/content/manual-test.pdf","accessLevel":"ENROLLED_ONLY"}` → 201 |
| 52 | GET | `/api/courses/ca500001-0001-0001-0001-ca5000000001/materials` | `X-Role: ADMINISTRATOR`, `X-User-Id: aaaa0003-...` | — 200 |
| 53 | GET | `/api/courses/{newCourseId}/materials` (not enrolled) | `X-Role: STUDENT`, `X-User-Id: aaaa0001-...` | — 403 `COURSE_NOT_ENROLLED` |
| 54 | **POST** | `/api/courses/{newCourseId}/enrollments` | — | `{"studentId":"5dbd0001-0001-0001-0001-5dbd00000001"}` → 201, status ACTIVE |
| 55 | GET | `/api/courses/{newCourseId}/materials` (now enrolled) | `X-Role: STUDENT`, `X-User-Id: aaaa0001-...` | — 200 |
| 56 | GET | `/api/courses/ca500001-0001-0001-0001-ca5000000001/quizzes` | — | — 200 |
| 57 | GET | `/api/courses/ca500001-0001-0001-0001-ca5000000001/progress/5dbd0001-0001-0001-0001-5dbd00000001` | `X-Role: ADMINISTRATOR`, `X-User-Id: aaaa0003-...` | — 200 |
| 58 | **POST** | `/api/quizzes` | same admin headers | `{"courseId":"{newCourseId}","title":"Manual Quiz 1","durationMinutes":30,"totalMarks":10,"ownerInstructorId":"1e5d0001-0001-0001-0001-1e5d00000001"}` → 201, copy `data.quizId` as `{newQuizId}` |
| 59 | **PUT** | `/api/quizzes/{newQuizId}` | same admin headers | `{"title":"Manual Quiz 1 (Updated)","status":"PUBLISHED","durationMinutes":45,"totalMarks":15}` → 200 |
| 60 | GET | `/api/quizzes/{newQuizId}` | — | — 200 |
| 61 | **POST** | `/api/quizzes/{newQuizId}/questions` | same admin headers | `{"questionText":"What does JVM stand for?","questionType":"MCQ","difficultyLevel":"EASY","marks":2,"optionSet":"A:Java Virtual Machine,B:Java Verified Method,C:Just Virtual Memory,D:None","correctAnswerKey":"A"}` → 201 |
| 62 | GET | `/api/quizzes/{newQuizId}/questions` | — | — 200, at least 1 question |
| 63 | GET | `/api/instructors/1e5d0001-0001-0001-0001-1e5d00000001/performance` | `X-Role: ADMINISTRATOR`, `X-User-Id: aaaa0003-...` | — 200 |

**Request 46 body**:
```json
{
  "courseCode": "CRS-MANUAL-001",
  "title": "Manual Verification Course",
  "description": "Created via manual Postman testing",
  "instructorId": "1e5d0001-0001-0001-0001-1e5d00000001"
}
```
`courseCode` must be unique — bump the suffix on repeat runs without a
DB reset.

---

## 7. Certification Service

Requires `{newAssessmentId}` from section 3 (student Alice hasn't got a
certificate for it yet — the seeded certificates use different assessment
ids on purpose so this section starts clean).

| # | Method | URL | Body |
|---|---|---|---|
| 64 | **POST** | `/api/certificates` | `{"studentId":"5dbd0001-0001-0001-0001-5dbd00000001","assessmentId":"{newAssessmentId}","score":88.0}` → 201, status ISSUED; copy `data.certificateId` as `{newCertificateId}` |
| 65 | **POST** | `/api/certificates` (already issued) | same body, `score":90.0` → 409 `CERTIFICATE_ALREADY_ISSUED` |
| 66 | **POST** | `/api/certificates` (below threshold) | `{"studentId":"5dbd0001-0001-0001-0001-5dbd00000001","assessmentId":"bbbb0003-0003-0003-0003-bbbbbbbbbbbb","score":35.0}` → 422 `SCORE_BELOW_THRESHOLD` |
| 67 | **POST** | `/api/certificates` (validation) | `{"studentId":"5dbd0001-0001-0001-0001-5dbd00000001"}` → 400 |
| 68 | GET | `/api/certificates/{newCertificateId}` | — 200 |
| 69 | GET | `/api/certificates/00000000-0000-0000-0000-000000000000` | — 404 |
| 70 | GET | `/api/certificates/{newCertificateId}/download` | — 200, `downloadToken` present |
| 71 | GET | `/api/students/5dbd0001-0001-0001-0001-5dbd00000001/certificates` | — 200, at least 1 certificate |
| 72 | **PATCH** | `/api/certificates/{newCertificateId}/revoke` | no body → 200, status REVOKED |
| 73 | GET | `/api/certificates/{newCertificateId}/download` (after revoke) | — 403, `CERTIFICATE_NOT_FOUND` (revoked certs are not downloadable) |

All bodies use `Content-Type: application/json`.

---

## Automated alternative

Everything above is already encoded as a runnable, self-verifying Postman
collection with test assertions: [`InfyLearnX.postman_collection.json`](InfyLearnX.postman_collection.json).
Import it plus its variables into Postman and hit **Run**, or from the CLI:

```bash
npx newman run postman/InfyLearnX.postman_collection.json \
  --reporters cli,json --reporter-json-export postman/newman-report.json
```

Last verified run: **75/75 requests, 133/133 assertions passed, 0 failures.**
