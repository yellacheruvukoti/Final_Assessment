# Business Service Package Structure Standard - Infy_LearnX

Source references: plan.md (Section 6, Layer Design Per Service), constitution.md
(Sections 8-13, 16)

## 1. Purpose
Defines the mandatory package layout every business service scaffold (TASK-004) must
follow, so subsequent tasks (TASK-005 through TASK-016) populate a consistent,
predictable structure across all six services. This is the binding scaffold reference
for TASK-004.

## 2. Base Package
`com.infy.<service-short-name>` where `<service-short-name>` matches the artifact id
without the `-service` suffix (e.g. `com.infy.user`, `com.infy.registration`).

## 3. Standard Layers
| Package | Populated By | Responsibility (constitution.md) |
| --- | --- | --- |
| `config` | TASK-005 | Service properties, DB/client timeouts, feature flags (Section 16) |
| `enums` | TASK-006 | Domain lifecycle enumerations owned by the service |
| `entity` | TASK-007 | JPA persistence entities owned exclusively by this service (Section 2.5) |
| `repository` | TASK-009 | Persistence interaction with this service's own database only (Section 10) |
| `dto` | TASK-010 | External request/response contracts only; entities never exposed directly (Section 11) |
| `mapper` | TASK-010/011 | Conversion between persistence entities and DTO contracts |
| `exception` | TASK-011 | Centralized exception handling and stable error code mapping (Section 13) |
| `client` | TASK-012 | Approved inter-service REST clients via service-name discovery (Section 16) — only for services with an approved outbound dependency |
| `service` | TASK-013/014 | Business rules and orchestration logic (Section 9) |
| `controller` | TASK-015 | Request mapping and response formatting only; no business logic (Section 8) |

## 4. Per-Service Layer Applicability
Not every service uses every layer — `client` is only scaffolded where plan.md's
Service Responsibility Matrix (Section 4) names an approved outbound dependency:

| Service | config | enums | entity | repository | dto | mapper | exception | client | service | controller |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| user-service | Y | Y | Y | Y | Y | Y | Y | - | Y | Y |
| assessment-service | Y | Y | Y | Y | Y | Y | Y | - | Y | Y |
| registration-service | Y | Y | Y | Y | Y | Y | Y | Y (user, assessment) | Y | Y |
| summary-service | Y | - | Y | Y | Y | Y | Y | Y (registration) | Y | Y |
| learning-service | Y | Y | Y | Y | Y | Y | Y | - | Y | Y |
| certification-service | Y | Y | Y | Y | Y | Y | Y | Y (assessment, user) | Y | Y |

Rationale for omissions:
- `user-service`, `assessment-service`, `learning-service` have no mandatory outbound
  dependency per plan.md Section 4 ("None mandatory for core operations" /
  "user-service optional validation" — optional calls are not implemented per
  AS-002/plan.md Section 15: "No eligibility validation is part of this plan").
- `summary-service` has no `enums` package — `RegistrationSummaryView`
  (data-model.md 3.7) has no enum-typed fields.

## 5. Existing Baseline (already scaffolded, verified TASK-001/TASK-003)
Every one of the 7 modules (api-gateway + 6 business services) already has:
- `pom.xml` inheriting the root `infy-learnx-platform` parent (TASK-001)
- `src/main/java/com/infy/<service>/<Service>Application.java` (`@SpringBootApplication`)
- `src/main/resources/application.yml` with server port, Consul discovery/config
  bootstrap, and (for the 6 business services) a MySQL datasource block

Packages listed in Section 3/4 above are created implicitly as their first real class
is added in the owning task (TASK-005 onward) — Java has no notion of an empty package
directory that Maven needs pre-declared.

## 6. Verification Performed for TASK-004
- Confirmed all 7 `pom.xml` files inherit the root parent and each declares a unique
  `artifactId` matching its Consul `spring.application.name` (docs/consul-platform-guide.md
  Section 3).
- Confirmed all 7 `*Application.java` classes compile as part of the reactor build
  (`mvn compile` from workspace root — see Section 7).
- api-gateway was already built and run as a live process in TASK-003, proving the
  scaffold boots correctly end-to-end. The 6 business services carry a JPA datasource
  and cannot be started until DB connectivity is wired (TASK-008); their scaffold is
  verified at the compile level here and at the runtime level once TASK-008 completes.

## 7. Assumptions
- Package names use the service's short name (e.g. `certification`, not
  `certification-service`) for readability, consistent with the existing
  `*Application.java` classes already in place.
