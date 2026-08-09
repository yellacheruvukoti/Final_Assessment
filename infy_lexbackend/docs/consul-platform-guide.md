# Spring Cloud Consul Platform Guide - Infy_LearnX

Source references: constitution.md (Section 4), plan.md (Section 10, 11), spec.md (FR-015, FR-016)

## 1. Purpose
Defines the service naming convention, config key hierarchy, and bootstrap/fallback
behavior used by every service for Spring Cloud Consul discovery and centralized
configuration. This artifact is the binding reference for TASK-002 and is reused for
verification in TASK-022.

## 2. Local Runtime
Consul runs as a single local dev-mode agent for this MVP/demo environment:

```
consul agent -dev -client=0.0.0.0 -ui
```

- HTTP API / UI: http://localhost:8500
- Datacenter: dc1 (default dev mode)
- Binary location (this workspace): `tools/consul/consul.exe` (Consul 1.22.7, Windows amd64)

Dev mode is single-node and non-persistent, which is acceptable per clarification.md
Section 9 (all runtime services register with Consul in local/demo environments; no
manual static endpoint fallback in normal flow).

## 3. Service Naming Convention
Service names registered in Consul equal `spring.application.name`, which equals the
Maven module/folder name. Names are stable, lowercase, kebab-case, and environment-safe.

| Logical Service Name | Module Folder | Port |
| --- | --- | --- |
| api-gateway | api-gateway | 8080 |
| user-service | user-service | 8081 |
| learning-service | learning-service | 8082 |
| assessment-service | assessment-service | 8083 |
| registration-service | registration-service | 8084 |
| summary-service | summary-service | 8085 |
| certification-service | certification-service | 8086 |

Rule: all inter-service and gateway route targets use these logical names
(e.g. `lb://user-service`) — never a hardcoded host:port, per constitution.md Section 4.5
and Section 6.1.

## 4. Config Key Hierarchy
Spring Cloud Consul Config is configured identically in every service:

```yaml
spring:
  cloud:
    consul:
      config:
        enabled: true
        format: yaml
        prefix: config
        default-context: application
```

This produces two scopes in the Consul KV tree, both read at startup (service-specific
values win over shared values on key conflict):

| Scope | KV Path | Purpose |
| --- | --- | --- |
| Shared | `config/application/data` | Cross-service settings common to the whole platform |
| Service-specific | `config/{spring.application.name}/data` | Settings owned by one service only (DB, timeouts, feature flags, resilience) |

`format: yaml` means the value stored under the `data` key is itself parsed as a YAML
document. Example shared entry seeded for this platform:

```
config/application/data:
  platform:
    name: Infy_LearnX
    environment: local
  info:
    platform: Infy_LearnX Online Learning Platform
    managed-by: spring-cloud-consul-config
```

Service-specific keys (e.g. `config/registration-service/data` for timeout/resilience
policy) are populated when the owning task (TASK-005 configuration classes, TASK-018
resilience) introduces those settings.

## 5. Bootstrap and Fallback Behavior
Every service and the gateway declare:

```yaml
spring:
  config:
    import: "optional:consul:"
```

The `optional:` prefix means Consul-backed configuration is imported when reachable,
but service startup does not fail if Consul is unavailable — the service falls back to
its local `application.yml` values only. This satisfies clarification.md Section 9/10
(Consul is the default source; no manual static endpoint fallback is required in normal
flow, but the platform must not hard-fail when Consul is briefly unreachable).

Discovery registration settings (identical across all services):

```yaml
spring:
  cloud:
    consul:
      host: localhost
      port: 8500
      discovery:
        enabled: true
        register: true
        service-name: ${spring.application.name}
        health-check-path: /actuator/health
        health-check-interval: 15s
        prefer-ip-address: true
```

## 6. Verification Performed for TASK-002
- Started local Consul dev agent; confirmed leader election (`GET /v1/status/leader`)
  and agent self-info (`GET /v1/agent/self`) both returned successfully.
- Seeded `config/application/data` via `PUT /v1/kv/config/application/data` and
  confirmed byte-identical read-back via `GET /v1/kv/config/application/data?raw`.
- Confirmed all 7 services (api-gateway + 6 business services) already declare
  identical `spring.cloud.consul.discovery` and `spring.cloud.consul.config` blocks
  with unique, consistent `spring.application.name` values matching their module
  folder names (no drift).
- Full live discovery registration for the business services is re-verified at
  TASK-022 once each service can start (services with a JPA datasource require MySQL
  connectivity, wired at TASK-008).
