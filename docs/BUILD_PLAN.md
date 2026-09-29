# Build plan with exit criteria

Baseline: v2.2 foundation, 2026-09-28. No delivery dates or engineering estimates are implied. Check an item only when its evidence is recorded in `VALIDATION.md`.

## M0. Finish handoff and establish truth

- [x] Preserve the three original Claude Design exports with hashes.
- [x] Document missing `support.js` and `data.js` and all referenced data exports.
- [x] Select Claude Agent SDK + explicit Opus 5.5 coordinator/subagents.
- [x] Reconcile vocabulary, approvals, source/runtime boundary, safety, and build order.
- [x] Add a repository check/test entrypoint and a no-key runtime definition helper.
- [ ] Publish the prepared repository to the owner's GitHub account.
- [ ] Obtain complete original design dependencies, or approve a React port without claiming recovery.

**Exit:** a new developer can identify what exists, inspect all originals, and run the checks. Missing export dependencies remain visible until genuinely resolved.

## M1. Port the design into a real frontend, in Demo Mode

- [ ] Scaffold React/TypeScript with a supported, pinned dependency set and lockfile.
- [ ] Implement AppShell/routes/shared tokens; replace DCLogic/template/import syntax.
- [ ] Create explicit synthetic fixtures independent of missing original `data.js`.
- [ ] Port graph, inspector, report canvas, and reusable evidence/report components first.
- [ ] Implement intake, editable intent/personas/journeys, capability matrix, and plan confirmation.
- [ ] Implement remaining designed screens with real local interactions or disabled unavailable actions.
- [ ] Add route/deep-link, keyboard, mobile, reduced-motion, and reconnect fixture states.

**Exit:** fixture UI starts/builds/typechecks; all 16 design entries are traceable; a visible Demo badge remains; real keys/paid actions/repo writes are unavailable; no blank screens on missing data; exclusion affects every count. Screenshot and interaction tests verify the main flows.

## M2. Prove one real Claude browser audit, local trusted operator only

- [ ] Pin and install the Claude Agent SDK; document actual bundled binary version.
- [ ] Verify Anthropic credentials and exact Opus 5.5 account access with explicit paid-test approval.
- [ ] Implement trusted read-source/browser/evidence/finding/journey tools.
- [ ] Maintain one real browser context through a complete journey.
- [ ] Submit a user-approved plan; explicitly invoke a named persona subagent.
- [ ] Persist actual SDK/broker events and evidence locally using the proposed contract.
- [ ] Surface these in the graph and Findings Canvas without timer simulation.
- [ ] Generate a report and honest partial/unverified states.

**Exit:** against an authorized safe fixture app, a named Opus persona performs a complete workflow, captures real evidence, records a reproducible finding, and creates a report. Source stays unchanged. A failed runtime/key/tool does not yield a fake success. Save model/SDK versions and the exact verification commands. This is still not a public upload service.

## M3. Bounded multi-persona execution and reliable runs

- [ ] Programmatically register personas from the approved plan and reconcile starts/stops.
- [ ] Set native SDK spawn depth/concurrency/spend limits and application-owned run budgets.
- [ ] Isolate browser identity and test-data namespaces per execution.
- [ ] Schedule dependent handoffs explicitly; independent persona work can run concurrently.
- [ ] Add durable jobs/leases, retries, idempotency, cancel/pause, operator challenges, and cleanup.
- [ ] Compile stable findings and coverage; stream ordered events with dedup/reconnect.
- [ ] Implement persisted read-only replay.

**Exit:** two or more approved persona agents run without cross-login/data pollution; excluded personas never launch; an OTP blocker does not stop unrelated work; crashing one worker does not erase completed evidence; duplicated delivery does not duplicate findings or side effects; refresh/replay/cancel behave truthfully; budget exhaustion returns partial coverage.

## M4. Hosted workspace/security foundation

- [ ] Choose and configure real authentication, database, object store, queue, and secret manager.
- [ ] Enforce workspace roles and scopes at API/storage/broker boundaries.
- [ ] Implement credential validation/storage/rotation/revocation and safe provider endpoints.
- [ ] Add read-only GitHub App intake and immutable source snapshots.
- [ ] Add safe file ingestion; allow untrusted sandbox builds only after hardening tests.
- [ ] Separate control plane, Claude worker, and untrusted tested-app execution environments.
- [ ] Test SSRF, redirects/subresources, archive traversal, poisoned instructions, HTML injection, and secrets.
- [ ] Add retention/deletion, cleanup, audit logging, operational metrics, and recovery procedures.

**Exit:** two test workspaces cannot see each other's sources, jobs, secrets, browser state, artifacts, reports, or event feeds. A malicious repo cannot use platform credentials or host network/filesystem access. No raw secrets reach public telemetry. Do not invite external users before this gate.

## M5. Improvement plan and developer handoff

- [ ] Generate workstreams from pinned report/selected findings.
- [ ] Validate dependencies, acceptance criteria, file-path evidence, migration risks, and non-goals.
- [ ] Export real Markdown and JSON, with artifact IDs rather than private credentials/URLs.
- [ ] Allow user review/edit/re-versioning before authorization.

**Exit:** a separate developer can implement a scoped change from `USERFLOW_REMEDIATION_PLAN.md` without this chat, reproduce the original issue, and run its acceptance tests. Exporting a plan does not grant code-write access.

## M6. Authorized remediation and verified before/after

- [ ] Implement scoped repo write approval, base drift detection, isolated branch/worktree, and git broker.
- [ ] Restrict edits to selected workstreams; record diffs and actual commit metadata.
- [ ] Run untrusted tests/build in a limited sandbox and generate a preview.
- [ ] Rerun original plan with comparable fixtures and separately labeled added regression checks.
- [ ] Classify each baseline finding as resolved/improved/reproduced/unable-to-verify.
- [ ] Open a draft PR on explicit authorization; do not merge automatically.

**Exit:** a known fixture bug is fixed on a branch, its original reproduction and outcome test pass against the preview, before/after artifacts are real, unverified gaps remain visible, and main/production are untouched. Permission denial and repo drift block writes.

## M7. Optional expansion, after the core works

Private/local runner with explicit pairing, Jev/treg/logs adapters, native mobile automation, image repair concepts, scheduled audits, additional provider/Codex adapter, platform-billed credits, broader document ingestion, integrations marketplaces. None of these may block proving the basic audit loop.

## First practical engineering session

Read `START_HERE.md` and run the checks. Decide export recovery versus React port. Create a build branch. Implement the smallest M1 route containing the graph + canvas with a synthetic typed fixture, then sketch the M2 tool interface and record the API boundaries. Do not spend the session wiring fake provider statuses or polishing a nonexistent authentication flow.