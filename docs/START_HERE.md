# Start here: resume UserFlow Red Team

Last consolidated: 2026-09-28. Bundle 2.2.0. **No hosted application or paid agent run has been verified.**

## The decision in one paragraph

Build a web product that takes an app plus the owner's description, creates editable personas and a test plan, runs the approved plan with Claude Agent SDK subagents on Opus 5.5, streams real events into an Agent Run Graph, exposes evidence in a half-screen Findings Canvas, and creates an implementation handoff. Automatic branch-based remediation and same-plan retesting follow only after the audit loop works.

## Read in this order

1. `../README.md` for current truth and setup.
2. `DESIGN_INTEGRATION.md` for what Claude Design actually supplied and omitted.
3. `BACKEND_RUNTIME.md` for the mandatory Claude runtime/model choice.
4. `PRODUCT_SPEC.md`, `DATA_AND_EVENTS.md`, and `HARNESS_ARCHITECTURE.md` for behavior and boundaries.
5. `BUILD_PLAN.md` for the first unfinished milestone and acceptance criteria.
6. `../AGENTS.md`, `../SKILL.md`, `LOCAL_TOOLKIT.md`, and `../SECURITY.md` before executing code.

## Canonical versus historical material

Current `docs/*.md`, `contracts/*`, and the runtime profile define the product. Original `.dc.html` files define visual intent, not production truth. `SKILL.md` and `references/` retain the local testing methodology, with hosted behavior constrained by current security and runtime documents. `docs/archive/v2.1/` is historical only. The earlier generic "any provider" proposal is superseded by Claude Agent SDK + Opus 5.5.

Do not interpret dates, identities, domains, repo SHAs, screenshots, provider statuses, or metrics inside the design demo as observations about a real customer app.

## Current inventory

- Original local preflight/browser/merge helpers and reusable testing instructions are present.
- Three Claude Design exports are present and hashed in `design/claude-design/manifest.json`.
- `support.js` and `data.js` were not supplied. 28 exported symbols are referenced from the missing `data.js`.
- No React application manifest, real login, API server, persistence layer, vault, job queue, or deployed app exists.
- A pure configuration helper generates persona agent definitions with explicit Opus 5.5 models and tool names. It does not call Anthropic.
- Repository validation commands and regression tests exist. See `VALIDATION.md` for execution results.
- The canonical GitHub repository is `mattrob333/userflow-red-team` and is published on `main`.

## Next implementation session

Finish M0 in `BUILD_PLAN.md`: recover the missing original dependencies or explicitly choose a React port without them. Then implement M1's fixture-driven UI, keeping an obvious Demo label. In parallel, design M2's trusted browser tool boundary. Do not run user-uploaded code or accept real credentials until the relevant boundaries are implemented.

## Decisions still open

| Decision | Recommendation | Evidence needed before adoption |
|---|---|---|
| Web framework | React + TypeScript, Tailwind, shadcn; choose a supported Next.js version during scaffolding | Installed dependency lock and passing build |
| Hosting | Web/API separately from long-running agent workers | Worker lifecycle, secret isolation, browser support, stop/cleanup tests |
| Database/object store | Postgres + private object storage | Workspace isolation and deletion tests |
| Authentication | Managed auth or audited implementation | Sign-in, membership, server-side authorization tests |
| Sandbox provider | Hardened container/microVM or equivalent | Ingestion, egress, process, filesystem, and credential isolation tests |
| Billing | BYOK first, with explicit run limits | Aggregate usage accounting; provider charges still apply |
| License/public sharing | Owner decision | Third-party component licensing review |

The Claude runtime and Opus 5.5 choice are **not open decisions** unless Matt changes them.