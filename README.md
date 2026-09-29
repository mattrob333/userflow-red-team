# UserFlow Red Team

**Watch AI agents test your application as real users, inspect the evidence, and turn the findings into an executable improvement plan.**

UserFlow Red Team is a planned user-flow testing and remediation product built around a simple question:

> Can each kind of user understand the application, complete their job, recover from interruptions, and reach the correct business outcome?

It combines product intent, source inspection, realistic personas, browser testing, evidence, cross-user handoffs, root-cause analysis, and verification after changes. Its signature interface is a live **Agent Run Graph** alongside a right-hand **Findings Canvas**.

## Read this first: what exists today

**This is a build foundation, not a finished hosted application.** Bundle `2.2.0` consolidates the original skill/toolkit, the supplied Claude Design exports, and a reconciled implementation plan.

| Layer | Current state | What that means |
|---|---|---|
| Testing method | Included | `SKILL.md`, persona briefs, question banks, and report templates guide a capable coding agent. |
| Local browser helpers | Included | Four Node scripts prepare evidence folders, drive Playwright, and merge findings. They do not call an AI provider or autonomously create agents. |
| Claude Design source | Preserved unchanged | Three `.dc.html` files describe 16 screen states and two reusable components. |
| Standalone design preview | Blocked | `support.js` and `data.js` are referenced but were not supplied. Opening these files in an ordinary browser is not a supported standalone preview. |
| Backend decision | Specified | Claude Agent SDK, with `claude-opus-5-5` for the coordinator and each persona subagent. |
| Backend configuration helper | Included | Generates bounded programmatic agent definitions; does not launch the SDK or enforce a hosted security boundary. |
| Auth, API, database, queue, sandbox, vault, live event transport | Not implemented | These are engineering work, not functionality hidden inside the design exports. |
| Automatic code repair, PR creation, replay, hosted report export | Designed, not integrated | Must be built and verified through the milestones below. |

**Do not paste real API keys into the design prototype.** Its credential test is simulated; its encryption copy is a product requirement, not an implemented vault.

Start with [START HERE](docs/START_HERE.md), then [Build plan](docs/BUILD_PLAN.md). The [Design integration audit](docs/DESIGN_INTEGRATION.md) distinguishes working source, visual intent, missing files, and placeholder behavior.

## The product, from beginning to end

1. **Connect a project.** Select a GitHub repository, upload a ZIP or source folder, supply individual files, or provide a running application URL. Source and runtime are separate inputs.
2. **Describe the product.** Explain in your own words what it does, who uses it, the important jobs, and what success looks like. Preserve this as a versioned intent baseline.
3. **Analyze.** Inspect the allowed source and approved runtime reconnaissance. Build a product model with detected facts, inferences, contradictions, and unanswered questions.
4. **Review the Red Team Plan.** Edit personas, journeys, test accounts, viewports, dependencies, safety restrictions, and spending limits. Approve an immutable plan version.
5. **Run Plan.** The backend schedules the approved work and delegates persona-specific testing to Claude agents. Each persona gets its own browser session and test-data namespace.
6. **Watch execution.** The Agent Run Graph shows observed actions, agent status, tool use, browser location, evidence, blockers, and findings. It does not expose hidden chain-of-thought.
7. **Inspect findings.** Open a structured report canvas from the right, roughly half the desktop screen, while agents continue working. Inspect expected versus observed behavior, reproduction, screenshots, source references, and gaps.
8. **Generate an improvement plan.** Turn reviewed findings into dependency-ordered changes, acceptance tests, risks, and explicit before/after behavior.
9. **Export instructions or authorize remediation.** Download `USERFLOW_REMEDIATION_PLAN.md` and its JSON companion for a developer/coding agent. Code-writing is a separate authorized job on a new branch.
10. **Retest and compare.** Reuse the original plan and comparable fixtures against the changed source/preview. A diff is not proof that a problem is fixed. Preserve unresolved and unverified findings.

This is primarily product QA and adversarial user-flow testing. It is not a blanket penetration-testing authorization or a security certification.

## Which AI runs under the hood?

**Default: Claude Agent SDK in a TypeScript worker, powered by Claude Opus 5.5.** The SDK embeds Claude Code's agent loop and tools; it is different from making a single request through the ordinary model Client SDK. Anthropic documents programmatically defined subagents through `query({ options: { agents } })` and the `Agent` tool. See [SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) and [subagents](https://code.claude.com/docs/en/agent-sdk/subagents).

| Responsibility | Selected implementation |
|---|---|
| Plan generation and coordination | Claude Agent SDK + `claude-opus-5-5` |
| Persona subagents | Explicitly configured `claude-opus-5-5`, not an unspecified default |
| Synthesis and improvement planning | Claude Agent SDK + the same model |
| Authorized remediation | Separate SDK job, restricted write worktree, same model |
| Browser actions and screenshots | Playwright/Chromium through harness-owned tools |
| State transitions, permissions, quotas, counts | Deterministic application services, not model judgments |
| Optional structured judgments | TypeSafe/Jev adapter, not the orchestrator |
| Optional external verification | treg adapter, not a substitute for the app's workflow |
| Alternative agent backend | Codex adapter later; not required for the initial build |

Anthropic currently documents the API identifier `claude-opus-5-5`. Account access still needs a real credential-backed preflight. Do not silently substitute another model when it is unavailable. [Model reference](https://platform.claude.com/docs/en/models/opus-5-5/overview).

For the hosted product, use Anthropic API credentials or an approved cloud-provider route. Do not build a service on customers' Claude Pro/Max login sessions or subscription allowances. Anthropic's [SDK authentication guidance](https://code.claude.com/docs/en/agent-sdk/quickstart) explicitly distinguishes these.

The detailed decision, limits, tool mapping, and remaining implementation are in [Backend runtime](docs/BACKEND_RUNTIME.md).

## What inputs can it take?

The matrix below describes the target product and operator-assisted local workflow, not completed upload adapters.

| Input | Intended capability | What cannot be claimed |
|---|---|---|
| Complete source + reachable test URL | Browser journeys plus source-based root-cause analysis | Source and deployment correspondence still needs verification. |
| GitHub repository alone | Source analysis; browser testing only after an authorized build succeeds | A clone is not a running app. |
| ZIP/folder | Source snapshot; optional isolated build | File upload is not installed software. Never execute on the API server. |
| Deployed URL alone | Outside-in browser audit | No verified file-level diagnosis or automatic repo PR without source access. |
| Partial code/docs/screenshots | Targeted review and a draft plan | Not a complete executable audit; screenshot review is not runtime evidence. |
| Local/VPN app | Future private runner, or today's operator-run local helper | A cloud worker cannot automatically reach a laptop's localhost. |

Planned source formats: common web source files, package manifests, lockfiles, configuration, tests, SQL/schema/migration files, API specifications, Markdown/text requirements, and PNG/JPEG/WebP design context. PDF requirements are a later document-ingestion capability, not currently parsed by the local helpers. Web/PWA browser testing is the initial scope; native mobile, desktop GUI, compiled binaries, and arbitrary archives are not automatically supported.

ZIP/folder ingestion must reject traversal, symlinks, archive bombs, excessive sizes/counts, and secrets. Exclude `.git`, `.env*`, credential files, caches, dependency directories, build artifacts, and previous evidence by default. Inspect [Security](SECURITY.md) before implementing ingestion.

## Repository map

```text
README.md                         Product overview, current truth, setup
AGENTS.md                         Rules and re-entry instructions for coding agents
SKILL.md                          Original testing method, with current boundary notice
package.json                      Dependency-free repository validation commands
.env.example                      Placeholder configuration; no real credentials
runtime/
  claude-runtime-profile.json     Selected backend/model and proposed limits
  build-agent-definitions.mjs     Testable programmatic persona definition builder
  README.md                      SDK integration contract; not a running backend
contracts/
  domain.ts                      Core object and state vocabulary
  run-event.schema.json          Draft versioned event-envelope contract
fixtures/
  example-run-events.json         Synthetic examples, explicitly not audit evidence
design/claude-design/
  UserFlow Red Team.dc.html       Original application design export
  AgentRunGraph.dc.html           Original graph component export
  ScreenshotPreview.dc.html       Original placeholder screenshot component
  manifest.json                  SHA-256 provenance and missing dependencies
  README.md                      How to use, not misinterpret, these exports
design-reference/                Earlier React pipeline concept + screenshot
docs/
  START_HERE.md                   Resume the project later
  PRODUCT_SPEC.md                 Canonical lifecycle and scope
  DESIGN_INTEGRATION.md           Screen mapping, prototype gaps, porting rules
  BACKEND_RUNTIME.md              Claude Agent SDK/Opus decision
  HARNESS_ARCHITECTURE.md         Control plane, workers, sandbox, secrets, artifacts
  DATA_AND_EVENTS.md              Entities, state, progress, replay, endpoint contract
  BUILD_PLAN.md                   Ordered milestones and acceptance gates
  INTEGRATIONS.md                 Required vs optional services/credentials
  LOCAL_TOOLKIT.md                Existing scripts and their actual limitations
  TEST_STRATEGY.md                Tests needed before calling this a working product
  VALIDATION.md                   What was checked during consolidation
  GITHUB_PUBLISHING.md            Create/push from an authenticated local machine
  RESUME_BUILD_PROMPT.md          Paste-ready handoff for Claude Code or Codex
  CLAUDE_DESIGN_FRONTEND_SPEC.md   Updated frontend contract
  LIVE_AGENT_RUN_GRAPH.md         Graph/Findings Canvas interaction contract
  archive/v2.1/                  Superseded documents, retained for history
references/                      Browser, orchestration, Jev, treg guidance
scripts/                         Original helpers + repository checks + publisher
templates/                       Persona, finding, report, and repair templates
tests/                           Local, no-key validation and helper regression tests
```

## What you can run now

### A. Validate this repository, without any API key

Use Node 22+ for the repository validation tooling. From this repository's root:

```bash
npm test
npm run check
npm run inspect:design
```

These commands use Node built-ins. No `npm install` is necessary for them. `check` must report the missing original `support.js` and `data.js` as known design-export blockers, not pretend the prototype is complete. Use `npm run check:strict` to fail until those original export dependencies are supplied; porting the design into React is the other build path, not a reason to fabricate originals.

There is deliberately no `npm run dev` for a hosted app yet. A future `apps/web` scaffold belongs to milestone M1.

### B. Use the existing local browser toolkit with a coding agent

This is a trusted-operator workflow, not a safe multi-tenant service.

1. Make Playwright and a compatible Chromium available in the application under test. Review that project's dependencies and installation scripts first.
2. Start the app using its own documented development command.
3. From the target project's root, run the helper with an absolute path to this toolkit:

```bash
node /absolute/path/to/userflow-red-team/scripts/preflight.mjs \
  --root . --url http://localhost:5173 --agents A1,A2
```

On a development machine that needs Playwright, the explicit installation commands are:

```bash
npm install --save-dev playwright
npx playwright install chromium
```

These install into the **target project's tool environment**, not a nonexistent hosted application in this repo. Pre-provision the matching browser in future worker images; do not let uploaded projects choose worker dependencies at runtime. See [Playwright installation](https://playwright.dev/docs/intro).

Copy the absolute `RUN_DIR` that preflight prints. Then ask your coding agent:

```text
Read /absolute/path/to/userflow-red-team/SKILL.md and the trusted project instructions.
Audit my authorized local app at http://localhost:5173.
First propose the product model, personas and journeys; wait for my approval.
Use the existing absolute RUN_DIR and separate persona sessions/test data.
Capture real evidence, preserve untested journeys, and generate the report.
Do not change source code or trigger real email, billing, or production changes.
```

`browser.mjs` launches a fresh browser process per action batch, restoring its profile and cookies. Live tab history, in-memory state, and unsubmitted form fields do not survive separate calls. Put a sequence that depends on those in **one** `--steps` batch. A production long-lived browser service is a separate milestone.

The original scripts also lack production-grade redaction, strict target controls, and a hosted authorization boundary. Read [Local toolkit notes](docs/LOCAL_TOOLKIT.md) before reuse. **A successful script run is not validation of the entire future platform.**

### C. Inspect the design and prepare the real build

Read the preserved HTML as design source. The supplied files depend on a missing Claude Design runtime and a missing fixture module. Do not install a similarly named random npm package to fill either gap. Recover a complete export from the original designer or port the visual specification into ordinary React/TypeScript components.

The port should preserve the design, not its simulated authentication, timers, made-up model choices, or hardcoded metrics. [Design integration audit](docs/DESIGN_INTEGRATION.md).

## Tools and credentials

| Item | Needed now? | Needed for hosted MVP? | Credential boundary |
|---|---|---|---|
| Node/Git | Local tooling | Yes | No API key |
| Playwright/Chromium | Local browser testing | Yes | No API key; separate test accounts as needed |
| Claude Agent SDK | Not for repo checks | Yes | Server-side dependency; version to be pinned during M2 |
| Anthropic API key | Only for actual Claude API execution | Yes for direct Anthropic route | Workspace secret reference; not a browser variable |
| App authentication provider | No | Yes | Server-side OAuth/client secrets; separate from repo authorization |
| GitHub App | No for local/URL-only audit | Yes for private repo intake | Read audit token; separately authorized contents/PR writes |
| Postgres, object storage, job runner | No | Yes | Control-plane/worker credentials, never sent to tested apps |
| Secret manager/KMS | No | Required before hosted BYOK | Envelope encryption, scoped access, rotation/deletion |
| Test identities/inbox | App dependent | App dependent | Test-only scoped credentials; OTP input is not public activity |
| TypeSafe/Jev, treg, logs/DB, image provider | Optional | Optional | Explicit adapters, scopes, consent, costs, and redaction |

An Anthropic key alone does not create a working platform. The SDK, approved plan, tools, browser, worker, event storage, and evidence validation must be connected. [Integration details](docs/INTEGRATIONS.md).

## Build order

**M0: reconcile inputs → M1: React fixture UI → M2: one real Claude browser audit → M3: bounded multi-persona execution → M4: hosted accounts and persistence → M5: improvement export → M6: branch remediation and verified retest.**

The first real success target is intentionally small: an operator supplies one safe app and two test personas; the user approves the plan; real Claude subagents drive isolated browsers; a real screenshot-backed finding arrives in the graph/canvas; the report survives refresh; source stays unchanged. No automated code repair is needed to prove that loop.

[Build plan and acceptance gates](docs/BUILD_PLAN.md) includes failure paths, dependencies, security requirements, and a first-session checklist. Do not build all 16 screens against fake endpoints and call that the MVP.

## Repository and sharing

The canonical repository is:

**https://github.com/mattrob333/userflow-red-team**

The repository has been published and the current foundation is on `main`. Before a real hosted build begins, clone this repository and start with `docs/START_HERE.md` and `docs/BUILD_PLAN.md`.

No open-source license has been selected for the assembled product. The original pipeline component's redistribution license is not supplied. If the repository will remain private, no additional sharing setup is required. If it will be shared publicly later, first choose a license and review third-party asset/component provenance. No font binaries are bundled.

The included `scripts/publish-github.mjs` is now primarily a recovery/republishing helper for another repository; it should not be used to overwrite this existing canonical repo.

## Returning later

Give a coding agent [RESUME_BUILD_PROMPT.md](docs/RESUME_BUILD_PROMPT.md), not this conversation history. It points to the canonical documents, the preserved design, actual existing code, and the next unfinished milestone. Update `docs/START_HERE.md` and `docs/VALIDATION.md` after every implementation milestone so the next session starts with evidence instead of assumptions.