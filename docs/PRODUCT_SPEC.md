# Canonical product specification

Status: implementation contract for the future hosted product. The original design sources are retained unchanged.

## Product goal and first boundary

Make application quality observable by testing what different users are trying to accomplish. Produce evidence and an actionable improvement handoff, then optionally verify authorized changes. First support browser-accessible web apps and PWAs, not every possible application or file format.

The MVP is not a generic agent chat, a penetration-testing product, an unrestricted code executor, or an automatic default-branch editor.

## Lifecycle with explicit authority

| Step | Input | Persisted output | Gate / recovery |
|---|---|---|---|
| Create project | Name, workspace, owner | Project | Server checks membership; duplicate submission is idempotent |
| Connect source | GitHub selection or upload manifest | Immutable source snapshot | Invalid archive/access denied -> actionable error; source optional for URL audit |
| Configure runtime | URL, sandbox recipe, or no runtime | RuntimeTarget + readiness result | Failed build/unreachable target -> retry/change target/code-review-only |
| Describe | Owner's own words, constraints, test data notes | IntentVersion | Required text; later edits create a new version |
| Analyze | Allowed snapshot and scoped recon permission | ProductModelVersion | Detected/inferred/unknown facts; conflicts retained |
| Review plan | Personas, journeys, roles, tools, dependencies, risks | TestPlanVersion | Editable; capability gaps visible; invalid dependency graph rejected |
| Approve Run Plan | Exact plan/source/intent/policy/model/budget | Approval + Run | Approval hash immutable; changes invalidate approval |
| Execute | Approved plan + verified environment | Agent executions, outcomes, artifacts | Pause/retry/skip/cancel are distinct commands, permission checked |
| Report | Actual outcomes and vetted evidence | Immutable ReportVersion | Partial reports allowed; unknown/untested work stays visible |
| Improve | Selected report version and scope | ImprovementPlanVersion | Explicit user action; no code writes |
| Export instructions | Reviewed improvement plan | Markdown + JSON export | No credentials, signed evidence URLs, or fabricated file paths |
| Remediate | Separate write authorization | Branch + commits + preview + job record | No default-branch write/merge; drift requires review |
| Retest | Baseline plan + changed preview + comparable fixtures | New Run + comparison | Same IDs and scope for comparisons; changed coverage disclosed |

### Reconnaissance is not the test run

Connecting a URL can perform a user-approved bounded reachability check and screenshot. Analyzing may read the snapshot and inspect an approved login/landing page. It must not create accounts, submit forms, modify application records, or run full persona journeys before Run Plan. The prototype sometimes says "nothing runs" while showing runtime recon: production copy must explain this limited preflight rather than imply zero network access.

### Audit is not globally read-only

Audit leaves source code unchanged. Authorized browser journeys may create or change **test** records. The UI must say "No repository writes; approved test-runtime interactions only," not imply that clicking submit cannot have a side effect. Billing, messages, deletes, production data, and third-party writes remain prohibited unless explicitly authorized and safely configured.

## Persona and test plan

Personas are generated from material differences in goals, knowledge, permissions, entry points, accessibility needs, device context, and business responsibility. They are not demographic stereotypes or decorative avatars. Proposed personas must be editable, removable, and addable before approval.

Each journey needs a stable ID, persona ID, starting state, preconditions, allowed identity, data namespace, steps/intent, outcome assertions, viewport, variations, dependencies, and required tools. A source-derived hypothesis is not a verified user expectation; preserve whether expected behavior comes from the owner's description, documentation, or inference.

Excluding a persona recomputes journeys, dependencies, test accounts, coverage, expected cost, and graph nodes. Handoffs that need an excluded participant become unresolved; they must not silently run anyway.

## Execution and user controls

A job is queued until admitted under capacity and budget. A launched agent is not a completed agent. Persist route/action/evidence updates and individual journey outcomes. The graph and the table are views of the same records.

Pause requests stop launching new actions and wait for active tool calls to reach a checkpoint. Show PAUSING until acknowledged. Stop/cancel terminates pending work, requests bounded shutdown, records partial outcomes, and runs cleanup. Retry creates a new attempt and preserves the failed attempt. Skip creates an explicit skipped/untested outcome and reason. OTP input is an expiring challenge; it is not the same handler as retry.

Optional adapters not connected are simply unavailable. If an approved assertion requires one, that assertion is blocked or unverified; the absence cannot count as a pass.

## Findings and trustworthy metrics

Four concepts must be separate:

- **Impact severity:** critical, high, medium, low, or unassessed pending triage.
- **Failure type:** blocker, permission failure, logic failure, state failure, dead end, recovery failure, missing step, ambiguity, poor feedback, edge case, redundant step, UX friction, polish.
- **Evidence basis:** observed, inferred, or unknown; record the observed layer, such as browser, source, database, or logs.
- **Verification:** unverified, reproduced, independently verified. Resolution after a new run is yet another field.

The old helper uses failure-type labels in `severity`; migrate these to `failureType` while retaining `legacySeverity`. Do not map every permission failure automatically to "critical." Severity depends on real impact and evidence. Source observation is not browser execution. UNTESTED belongs to journey outcomes, not evidence strength.

Every planned journey has one current status. Final outcomes are pass, fail, partial, code-review-only, or untested. A queued/running journey is not yet a final outcome. Report denominators: planned, attempted, browser-executed, pass, fail, partial, code-review-only, untested. Show the formula for percentages and use a null/not-available value when no denominator exists.

A report can be complete as a document while the audit coverage is partial. Present both states. Zero findings does not mean all journeys passed. Unknown evidence count is not zero.

## Evidence and report

Each finding links to affected personas/journeys, expected and observed behavior, impact, reproducible steps, environment/source IDs, original screenshot or other evidence, provenance, source references with verified paths, root-cause hypothesis, recommended change, and acceptance test.

Store original sensitive evidence privately. Produce redacted derivatives for model/UI use under policy. Inferred root causes remain hypotheses until traced. Candidate duplicates are linked or merged with provenance, not deleted because titles look similar. Global finding IDs are stable; sorting by severity must not renumber findings during a live run.

The live report is a draft projection. Final reports are immutable snapshots. A later triage update creates another version. Share/export the report separately from raw logs/screenshots; access can be narrower.

## Improvement and remediation

The improvement plan groups related findings into workstreams with scope, dependency order, intended changed behavior, verified or suspected file paths, risks, migrations/rollback, regression tests, and acceptance criteria. Requirements must link back to finding IDs and evidence. Constraints and non-goals survive the rewrite.

`USERFLOW_REMEDIATION_PLAN.md` is the canonical instruction filename; export `userflow-remediation-plan.json` alongside it. The older `USERFLOW-IMPROVEMENT-PLAN.md` naming is historical, not a second contract.

Automated remediation checks current base SHA and permissions. If the repository has drifted since the audit, require an explicit rebase/re-audit choice; no hidden reset. Write only an authorized branch/worktree. Untrusted tests/build scripts run in a restricted sandbox, not with a broad GitHub/provider key. Opening a PR and merging are separate operations; automatic merge is out of scope.

Retest results: resolved, improved, reproduced, unable-to-verify, plus newly discovered regressions. "Unable to verify" stays neutral/amber, never green. Keep original plan/fixtures comparable; changed coverage must not produce a misleading before/after percentage.
