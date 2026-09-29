# Data, state, API, and event contract

Status: design contract; `contracts/domain.ts` and the event JSON Schema are initial examples, not a deployed API/database. Implement schema validation and persistence in M2/M4.

## Entities and ownership

Every persistent record is scoped by workspace. Enforce membership and row/object access server-side, not by trusting request IDs.

| Entity | Essential references and data |
|---|---|
| Workspace / Membership | User, role, active/revoked state, capability grants |
| Project | Workspace, name, owner, active source/runtime references |
| SourceSnapshot | Commit or content digest, manifest, exclusions, ingested timestamp |
| RuntimeTarget | URL/sandbox/runner identity, readiness probe, deployment mapping, approved origins |
| IntentVersion | Owner description, constraints, requirements, context references, version/hash |
| ProductModelVersion | Source/intent/runtime references, detected/inferred facts, contradictions, unknowns |
| TestPlanVersion | Personas, journey IDs, handoff DAG, capability/data needs, policy/model/budget refs |
| Approval | Actor, exact approved hash/scope, timestamp, expiry/revocation |
| Run | Plan/approval/snapshot/intent/policy/model, state, coverage state, attempt IDs, usage |
| AgentExecution | Run, persona/specialist, SDK invocation/session identity, status, browser namespace |
| JourneyAttempt | Journey, execution, attempt number, start/end, outcome, assertion/evidence refs |
| EvidenceArtifact | Workspace/run/attempt, hash, kind, object key, capture/provenance/redaction metadata |
| Finding | Stable UUID + display ID, severity, failure type, evidence basis, verification, affected work |
| FindingOccurrence | Finding + run/attempt/environment, reproduction and evidence |
| ReportVersion | Immutable run snapshot, coverage, reviewed findings, narrative, artifact manifest |
| ImprovementPlanVersion | Report, selected findings, workstream DAG, tests, risks, expected final behavior |
| RemediationAuthorization/Attempt | Exact scope/base/branch, approval, writes, tests, preview, PR refs |
| Comparison | Baseline/new runs, plan comparability, fixture differences, per-finding retest result |
| CredentialReference | Encrypted material outside ordinary payload, provider/scope/fingerprint/test state |
| AuditEvent | Actor/job, allowed operation, scope, outcome; no secret payload |

Recommended initial persistence: Postgres for relations and transactional state, private object storage for artifacts, durable queue for work. Concrete migrations are intentionally deferred until the first functional slice defines the required transaction boundaries.

## State machines

Do not use one enum for the whole lifecycle. Project readiness, analysis, plan approval, audit execution, report finalization, improvement, remediation, and retest are separate records.

Audit state:

```text
draft -> queued -> preflight -> running -> finalizing -> completed
                       |          |            |
                       +----------+------------+-> failed
                                  |
                                  +-> pausing -> paused -> running
                                  +-> canceling -> canceled
```

A completed run may have `coverageState=partial`; a finalized report can document a failed run. No transition is implied just because the user navigated to a later screen.

Agent state: queued, starting, running, waiting, complete, partial, failed, canceled. A worker retry is a new attempt, not mutation of the old failure into success. Journey outcome is distinct: pass/fail/partial/code-review-only/untested. Blocker type identifies missing credential, OTP, data, dependency, runtime error, forbidden action, timeout, or budget.

Approvals are invalidated by edits to plan membership, target, source, intent, action policy, model, or budget. A new version can reuse prior inputs but requires new approval. Remediation is never a transition granted merely by viewing an improvement plan.

## Event envelope

Version `1` in `contracts/run-event.schema.json`:

```json
{
  "schemaVersion": 1,
  "eventId": "evt-unique",
  "workspaceId": "ws-unique",
  "runId": "run-unique",
  "attemptId": "attempt-unique",
  "sequence": 42,
  "occurredAt": "2026-09-28T14:00:00.000Z",
  "type": "agent.state.changed",
  "agentExecutionId": "exec-unique",
  "payload": { "state": "running", "summary": "Opening approved login page" }
}
```

The backend assigns sequence/identity. An event payload is allowlisted by event type and sanitized before it enters this stream. The initial schema validates the envelope, not all semantic fields; payload-specific discriminated schemas, authorization, references, and privacy checks remain an implementation gate. This limitation must not be mistaken for complete validation.

Required families: run admission/state/finish, agent created/state/finish, tool started/completed/failed, journey started/finished, operator challenge created/resolved/expired, evidence created, finding created/updated, report ready. Improvement/remediation/retest use the same envelope pattern with their linked job identifiers in a future version or explicit entity references.

Never include secret values, raw vendor messages, hidden reasoning, session cookies, provider headers, raw login form values, or signed artifact URLs. Provide artifact IDs; obtain restricted URLs through a separate authorized call.

`fixtures/example-run-events.json` is synthetic contract test data and is not recovered Claude Design `data.js` or an actual audit.

## Streaming and replay

Snapshot response: run, active executions, journeys, finding summaries, graph projection, `throughSequence`, schemaVersion. SSE sends later events in order; reconnection accepts the previous cursor. Same sequence must never carry different content. On gaps, refetch snapshot. Bound event buffers, send heartbeats, support expired cursor and server restarts.

Use atomic event/outbox writes with state changes so the graph cannot announce evidence that failed to persist. Workers upload artifact objects before a committed evidence record/event. Delivery may duplicate; consumers must deduplicate.

Replay applies recorded events to historical projection state. It never invokes tools. Model sessions and events have different purposes; replay does not reconstruct a live model process. Redaction/deletion may leave tombstones and make some old artifacts unavailable, which replay must disclose.

## Proposed API surface

These routes are design contracts, not live endpoints.

| Operation | Method/path | Critical enforcement |
|---|---|---|
| Project CRUD | `POST /projects`, `GET /projects/:id` | Workspace authorization and idempotency |
| Source intake | `POST /projects/:id/snapshots` | Safe manifest/clone, immutable digest |
| Runtime probe | `POST /projects/:id/runtime-probes` | Approved target, SSRF control, bounded observation |
| Intent save | `POST /projects/:id/intents` | New immutable version |
| Analyze | `POST /projects/:id/analyses` | Bounded recon policy, reserved budget |
| Plan draft/edit | `POST /projects/:id/plans`, `POST /plans/:id/versions` | Valid persona/journey/handoff references |
| Approve and run | `POST /plans/:id/approvals`, `POST /runs` | Exact hash, policy/model/readiness, idempotency |
| Snapshot/events | `GET /runs/:id`, `GET /runs/:id/events` | Workspace scope, cursor/version, sanitized output |
| Commands | `POST /runs/:id/commands` | Pause/continue/cancel; acknowledged vs requested |
| Agent intervention | `POST /executions/:id/commands` | Retry/skip distinct; new attempt where appropriate |
| Private challenge | `POST /challenges/:id/responses` | Operator role, TTL, no public payload log |
| Findings/evidence | `GET /runs/:id/findings`, `GET /evidence/:id/access` | Access policy, redacted derivative preferred |
| Report/export | `GET /reports/:id`, `POST /reports/:id/exports` | Immutable version, format sanitization |
| Improvement | `POST /reports/:id/improvement-plans` | User request, pinned report, no code writes |
| Remediation | `POST /improvements/:id/authorizations`, `POST /remediations` | Scope, branch, base SHA, write permissions, budget |
| Retest | `POST /remediations/:id/retests` | Preview ready, original plan and fixture policy |
| Provider setup | `POST /integrations`, `POST /integrations/:id/test` | Secret vault, fixed endpoints, role checks |

Use structured error codes and recoverable messages: `MODEL_UNAVAILABLE`, `CREDENTIAL_INVALID`, `PLAN_STALE`, `RUNTIME_UNREACHABLE`, `MISSING_TEST_ACCOUNT`, `BUDGET_EXHAUSTED`, `SOURCE_DRIFT`, `POLICY_DENIED`, `ARTIFACT_UNAVAILABLE`. No success-shaped mock response in production.

## Legacy conversion

- Preserve local finding IDs and `id-map.json` only as import provenance. Allocate stable hosted IDs independent of severity sorting. Re-running the old merge can renumber IDs; do not use that behavior for the live platform.
- `severity=PERMISSION FAILURE` becomes `failureType`, with `severity=unassessed` until independently triaged.
- `evidence=OBSERVED` must identify observed layer; source evidence alone cannot upgrade a journey to browser-executed.
- Existing Markdown parser is intentionally simple. Hosted parsing must validate structured records rather than treating arbitrary frontmatter or Markdown as trusted HTML.
- Store unknown counts as null. Compute unique evidence/finding counts from IDs, not number of mentions across agents/categories.
