# 2.2.0 - Consolidated design and Claude backend foundation

Consolidated on 2026-09-28. This is a project-foundation version, not a released hosted app.

- Preserved all three supplied Claude Design exports and recorded original SHA-256 hashes.
- Identified missing support.js/data.js and 28 referenced fixture/projection exports; no replacements invented.
- Rewrote current README and canonical product, architecture, data/event, frontend, security, integration, local-toolkit, and build documents. Preserved superseded v2.1 documents under docs/archive/v2.1/.
- Selected Claude Agent SDK and explicit claude-opus-5-5 for coordinator and every persona subagent. Added configuration factory, finite policy defaults, and official documentation references. No live SDK run is claimed.
- Reconciled legacy failure classification, impact severity, evidence basis, verification, stable finding IDs, approval gates, and retest outcomes.
- Added a source-to-production gap inventory, 16-screen route map, dependency-aware build milestones, and a paste-ready engineering restart prompt.
- Added Node-only tests, syntax/hash/dependency/link checks, event-envelope schema, TypeScript domain contract, and synthetic examples.
- Added a private-by-default GitHub CLI publisher that refuses to overwrite existing repositories. Remote creation remains unverified.
- Documented trusted-local browser helper limitations rather than misrepresenting them as hosted security controls.

---

# Changelog

## 2.0

Rewritten after field use showed that sub-agents could not share notes and the browser could not be used reliably.

- Added a run folder (`.userflow-redteam/runs/<id>/`) with one writer per file: agents write only their own `agents/<ID>/` folder, the orchestrator writes `shared/` and `report/`, and handoff notes are new files rather than edits.
- Added `scripts/preflight.mjs`: proves the run folder is writable and that headless Chromium launches, loads the app and saves a screenshot before any agent is dispatched. Finds installed Playwright and browsers; never runs `npx playwright install`.
- Added `scripts/browser.mjs`: a per-agent, per-persona persistent browser driver for any agent with a shell. Logins survive between calls (session cookies are saved and restored), the same login works across viewports, concurrent use of one profile is refused, and every call saves a screenshot, accessibility snapshot, console errors, failed requests and HTTP errors into the agent's folder.
- Added `scripts/merge.mjs`: merges every agent's findings into one ledger, assigns global `UFR-###` IDs by severity (agents use local IDs such as `A2-003`), groups by `root_cause`, and lists merge problems such as unfinished agents or missing screenshots.
- Added `templates/AGENT-BRIEF.md` (absolute paths, a write test as the first action, and a reply-block fallback when an agent cannot write) and `templates/FINDING.md`.
- Added `references/ORCHESTRATION.md` and `references/BROWSER.md`.
- `SKILL.md`: rewritten around the orchestrator and persona-agent structure. Requires opening screenshots for visual judgment, notes written during testing rather than at the end, handoff chains driven end to end under one driver, and `CODE-REVIEW ONLY` when the browser cannot run.
- `browser.mjs` marks console and network errors already seen by that persona as `(repeat)`, so new errors stand out.
- Moved the Jev question bank and treg playbook to `references/`.

## 1.1

- Added treg as an optional external validation and capability layer.
- Added `templates/TREG-EXTERNAL-VALIDATION.md`.

## 1.0

- Initial UserFlow Red Team skill package.

## 2.1.0 - Frontend execution-graph design update

- Rewrote the hosted frontend specification around the full connect → describe → analyze → plan → run → report → improve → remediate → retest lifecycle.
- Added the live Agent Run Graph as the signature operations-center experience.
- Added explicit guidance to expose observable execution traces, tool calls, evidence, and status rather than hidden model reasoning.
- Added source-vs-runtime intake rules and capability summaries.
- Added detailed Findings Canvas, Improvement Plan, Remediation, Retest, Integrations/API Keys, and Run Replay specifications.
- Preserved the supplied animated React pipeline component as a design reference.
- Added a dedicated live-graph specification and a paste-ready Claude Design handoff prompt.