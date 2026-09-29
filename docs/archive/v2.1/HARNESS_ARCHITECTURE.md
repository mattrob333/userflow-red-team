# UserFlow Red Team Hosted Harness Architecture

This document describes the application harness required to turn the current UserFlow Red Team skill into a multi-user product with authentication, project intake, connected repositories, API-key management, isolated execution, live agent progress, reports, and optional remediation.

It is intentionally implementation-oriented but vendor-neutral. The frontend experience is specified separately in `CLAUDE_DESIGN_FRONTEND_SPEC.md`.

## 1. Product boundary

The current repository already contains the testing method and local browser/evidence scripts.

The hosted harness adds six missing product capabilities:

1. User accounts and workspaces
2. Project/source ingestion
3. Secure credential and integration management
4. Isolated build/runtime execution
5. Multi-agent orchestration with realtime progress
6. Persistent reports and remediation workflows

## 2. Core objects

### Workspace

Owns users, projects, credentials, runs, billing/usage, and access policies.

### Project

Represents one application being tested.

Recommended fields:

- id
- workspace_id
- name
- user_description
- source_type
- source_locator
- runtime_type
- runtime_url
- default_branch
- framework
- package_manager
- build_command
- start_command
- healthcheck_url
- created_at
- updated_at

### Source snapshot

Immutable input for a specific run.

Examples:

- Git commit SHA
- uploaded ZIP checksum
- uploaded folder snapshot checksum
- individual-file bundle checksum

Never let a report silently point at a moving source state.

### Runtime target

The actual application the browser agents can reach.

Possible modes:

- deployed URL
- preview deployment
- harness sandbox build
- local runner/tunnel
- unavailable, which forces code-review-only mode

### Run

One complete red-team execution.

Suggested states:

```text
draft
intake_validating
source_ingesting
analyzing
plan_ready
preflight
queued
running
merging
handoff_testing
adversarial_testing
reporting
report_ready
improvement_planning
improvement_ready
remediating
retesting
completed
failed
canceled
```

### Persona

Generated or user-edited target user type.

Fields:

- persona_id
- name
- context
- knowledge_level
- permissions
- primary_jobs
- secondary_jobs
- entry_point
- test_account_reference
- likely_failure_risks
- selected_for_run

### Agent execution

Represents one persona sub-agent.

States:

```text
queued
booting
reading_context
starting_browser
running
waiting_on_dependency
handoff_ready
blocked
done
failed
canceled
```

### Evidence artifact

Examples:

- screenshot
- accessibility snapshot
- console event
- request failure
- HTTP error
- agent note
- source file reference
- log excerpt
- database-state evidence
- Jev result
- treg validation

### Finding

Persistent structured record normalized from the current Markdown format.

Store both structured fields and rendered Markdown/HTML.

### Report

Immutable report version tied to a source snapshot and run.

### Improvement plan

Generated only after a report exists.

### Remediation attempt

A separately authorized write workflow that may create a branch, commit changes, open a PR, deploy a preview, and retest.

## 3. Source intake adapters

The UI should present these as separate choices, but the backend should normalize them into one source snapshot abstraction.

### GitHub repository

Recommended production path:

- GitHub App or OAuth
- user selects repository and branch
- resolve exact commit SHA
- clone into an isolated workspace
- default read-only permissions

Write permissions are requested only when remediation is enabled.

### ZIP upload

Requirements:

- virus/malware scan
- compressed-size limit
- uncompressed-size limit
- file-count limit
- path traversal protection
- checksum
- extract into an isolated sandbox

### Folder upload

Browser directory upload is acceptable for the UI, but the frontend should package it as a deterministic archive or manifest before ingestion.

Ignore obvious local-only directories by default:

- `.git/`
- `node_modules/`
- build caches
- test artifacts
- `.env*`
- local database files unless explicitly included

Always show the exclusions before upload starts.

### Individual files

Useful for partial reviews, design docs, architecture docs, screenshots, schemas, or reproduction bundles.

Do not present an individual-file bundle as a full end-to-end executable audit unless it actually contains enough project context and a runtime target.

### Deployed URL

A URL alone provides runtime execution but not source-level root-cause tracing.

The UI should make that tradeoff visible.

## 4. Runtime adapters

### Existing deployed/staging URL

Fastest and lowest-risk path.

The harness verifies:

- scheme
- DNS/reachability
- response
- authentication requirements
- whether the user has authorized testing of the target

### Harness sandbox build

Use an isolated ephemeral compute environment.

The sandbox needs:

- source snapshot
- Node/package manager/toolchain
- install command
- build command
- start command
- injected test secrets
- network policy
- CPU/memory/time limits
- log capture
- ephemeral filesystem
- browser reachability

Never run untrusted uploaded project code on the main application server.

### Local runner

A future local runner solves the `localhost` problem.

Recommended model:

1. User installs a small signed runner/CLI.
2. Runner authenticates to the user's workspace.
3. Runner creates an outbound encrypted connection.
4. The cloud orchestrator sends a scoped test job.
5. Browser/runtime execution remains on the user's machine or private network.
6. Only required evidence and structured events return to the cloud.

This can support apps that cannot be deployed publicly or need private-network dependencies.

## 5. Orchestrator

The orchestrator owns the current SKILL.md phases.

Responsibilities:

1. validate source/runtime
2. inspect project instructions
3. generate product model
4. generate personas
5. generate flows/test cases
6. request user approval of the plan
7. allocate agents
8. allocate independent test data
9. start preflight
10. execute persona runs
11. stream agent events
12. merge findings
13. drive cross-user handoffs
14. run adversarial tests
15. compile report
16. generate improvement plan only when requested
17. start remediation only after explicit write authorization

The UI should never need to infer run state from prose. The orchestrator must publish structured state events.

## 6. Agent runner

Each persona agent should receive:

- immutable run context
- absolute run/evidence path
- persona definition
- assigned flows
- assigned test account/data boundary
- source snapshot identifier
- runtime URL
- browser-session identifier
- allowed tools
- write boundary

Maintain the current v2 invariant:

**one writer per agent-owned file/evidence namespace.**

Do not use one shared mutable notes document for all agents.

## 7. Browser service

The existing `scripts/browser.mjs` establishes the behavior to preserve:

- per-agent/per-persona persistent browser profiles
- headless Chromium
- desktop/tablet/mobile viewports
- screenshot after each action batch
- accessibility snapshot
- console warning/error capture
- page error capture
- request-failure capture
- HTTP 4xx/5xx capture
- persistent login cookies
- action log
- concurrency lock per profile

For the hosted harness, wrap these capabilities in a job service rather than exposing raw shell commands to the frontend.

## 8. Realtime event model

Every important execution change should publish an event.

Suggested event types:

```text
run.state.changed
plan.analysis.started
plan.persona.created
plan.flow.created
plan.ready
preflight.started
preflight.browser.ok
preflight.browser.failed
agent.created
agent.state.changed
agent.action.started
agent.action.completed
agent.tool.started
agent.tool.completed
agent.route.changed
agent.source.opened
agent.evidence.created
agent.screenshot.created
agent.finding.created
agent.finding.updated
agent.blocked
handoff.created
handoff.completed
merge.started
merge.completed
report.section.ready
report.ready
improvement.started
improvement.ready
remediation.branch.created
remediation.commit.created
remediation.pr.created
retest.started
retest.completed
run.failed
```

Transport options:

- Server-Sent Events for simple one-way live updates
- WebSockets if interactive commands need low-latency two-way messaging

Persist the event stream so a page refresh can reconstruct run progress.

### Agent Run Graph projection

The live frontend graph should be a projection of persisted run events, not a separately maintained animation state.

Recommended projection rules:

- `run.state.changed` and phase events update top-level pipeline nodes.
- `agent.created` creates a persona branch under the orchestrator.
- `agent.state.changed` updates that node's status.
- `agent.tool.started/completed` activates or completes tool edges.
- `agent.route.changed` updates agent route metadata.
- `agent.evidence.created` increments evidence counts and can create temporary artifact indicators.
- `agent.finding.created/updated` updates finding output nodes and the live report canvas.
- merge/handoff/adversarial/report events advance synthesis nodes.
- persisted events must be sufficient to replay a completed run later.

The API should provide both:

1. a current graph snapshot for fast page load, and
2. an ordered event stream for live updates and historical replay.

Do not publish private model chain-of-thought. Publish observable actions, state transitions, tool usage, evidence, and concise user-facing execution summaries.

## 9. Report service

The report compiler should preserve the current evidence rules.

Each finding should contain:

- global ID
- title
- severity
- evidence type: OBSERVED / INFERRED / UNKNOWN
- persona
- job/flow
- screen/route
- expected behavior
- observed behavior
- user impact
- reproducible steps
- screenshots
- browser/log/network evidence
- source references
- root-cause layer
- root-cause group
- recommended change
- acceptance test
- verification status

The report renderer should generate:

- interactive HTML in the product
- Markdown export
- JSON export for automation
- optional PDF later

## 10. Improvement-plan service

The user explicitly starts this after reviewing the findings.

Output should be dependency-aware, not just severity-sorted.

Recommended sections:

1. Executive summary
2. Current-state diagnosis
3. Systemic root causes
4. Changes by layer
5. Changes by screen/route
6. Data/state/schema changes
7. Permission changes
8. UX/information-architecture changes
9. Error/recovery changes
10. Test additions
11. Migration risks
12. Sequenced implementation plan
13. Acceptance criteria
14. Retest plan
15. Expected finished-state behavior

Generate two files:

```text
USERFLOW-IMPROVEMENT-PLAN.md
userflow-improvement-plan.json
```

The Markdown file is human/agent-readable. The JSON file is machine-readable.

## 11. Remediation engine

Never make code changes as an automatic side effect of running an audit.

When the user clicks the remediation action:

1. show proposed scope
2. show connected repository and base branch
3. require write authorization
4. create a new branch
5. implement changes in dependency order
6. run project tests
7. run relevant UserFlow Red Team retests
8. generate before/after evidence
9. present a diff summary
10. open a pull request

Default branch naming example:

```text
userflow-redteam/remediation-<run-id>
```

The product should prefer a PR over direct default-branch writes.

## 12. Authentication and authorization

Minimum roles:

- Workspace Owner
- Admin
- Member
- Viewer

Permissions should separately control:

- view project
- create run
- connect credentials
- view credential metadata
- authorize external writes
- authorize repository writes
- start remediation
- delete project/run

## 13. Credential vault

Store credentials as encrypted secrets, not ordinary database columns.

Requirements:

- envelope encryption or managed secret vault
- per-workspace scoping
- key versioning/rotation
- last-four/metadata display only
- audit trail for create/update/delete/use
- redaction in logs
- no secret in browser events
- no secret in reports
- no secret in screenshots if avoidable
- explicit environment injection into only the sandbox/job that needs it

## 14. Integration model

### AI provider

The hosted product needs at least one reasoning/coding model provider unless the platform itself supplies the model runtime.

Support a provider abstraction so the project is not hardwired to one model.

Possible modes:

- platform-supplied model credits
- user-supplied Anthropic key
- user-supplied OpenAI key
- user-supplied other supported provider

The UI should show which provider is active for orchestration and which provider is optional for image generation.

### TypeSafe Jev

Optional structured-judgment provider.

Use current model discovery at runtime rather than a hardcoded model ID.

### treg

Optional external-validation layer.

The harness should expose connected capabilities, expected cost when available, and whether a call is read-only or write-capable.

### GitHub

Use OAuth/App installation.

Keep audit/read authorization separate from remediation/write authorization.

## 15. Storage

Use separate storage classes:

### Relational database

For:

- users/workspaces
- projects
- runs
- personas
- agents
- findings
- permissions
- integration metadata
- event indexes

### Object storage

For:

- ZIP/source snapshots
- screenshots
- accessibility snapshots
- large logs
- report exports
- visual-remediation artifacts

### Ephemeral sandbox filesystem

For:

- cloned repositories
- node_modules/build output
- browser profiles
- temporary test state

Do not make the sandbox filesystem the system of record.

## 16. Security boundaries

The harness executes untrusted code and therefore must assume uploaded repositories can be malicious.

Minimum controls:

- isolated sandbox per run
- no access to host filesystem
- no cloud metadata endpoint access
- restricted outbound network policy where possible
- CPU/memory/process/time limits
- ephemeral credentials
- secret redaction
- malware scanning for uploads
- archive path traversal protection
- artifact-size limits
- audit logs
- explicit production-target authorization

## 17. Usage and cost controls

Track per run:

- model input/output usage
- browser time
- sandbox compute
- external API calls
- treg call cost when exposed
- image-generation calls
- storage

The UI should show actual usage accumulated so far. Do not invent future cost precision if the provider cannot supply it.

## 18. Failure/recovery behavior

The system must be resumable.

A page refresh or orchestration-worker restart should not destroy the run.

Persist:

- current run phase
- agent state
- last completed action
- evidence artifact pointers
- event stream
- plan version
- source snapshot
- runtime target

If one persona fails, allow:

- retry that persona
- continue the remaining personas
- complete report with explicit `UNTESTED` or `PARTIAL` coverage

Do not silently mark the entire run successful.

## 19. MVP implementation order

### Milestone 1: single-user harness

- source upload/GitHub read
- user description
- sandbox build or deployed URL
- persona plan
- one orchestrator
- one persona at a time
- live events
- HTML report

### Milestone 2: parallel personas

- per-agent sandboxes/browser profiles
- realtime multi-agent dashboard
- merge service
- cross-user handoffs

### Milestone 3: integrations

- Jev
- treg
- logs/database connectors
- image concepts

### Milestone 4: remediation

- write authorization
- branch/PR generation
- retest
- before/after report

### Milestone 5: teams/enterprise

- workspaces/roles
- SSO
- audit log
- policy controls
- private runner
- retention controls

## 20. Definition of done for the hosted harness

A user can connect a project, understand what the system will test, approve a persona plan, watch the run in real time, inspect evidence-backed findings, generate an actionable improvement plan, and optionally authorize a branch/PR remediation without ever confusing inferred analysis with executed browser evidence.