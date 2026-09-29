# Existing local toolkit: capabilities and limitations

The four original scripts remain present. They are operator-run helpers, not an autonomous AI engine and not a hosted sandbox. No provider key is required to execute their filesystem/browser functions.

| File | What it actually does |
|---|---|
| `scripts/lib.mjs` | Argument handling, JSON writes, Playwright lookup, browser executable lookup, viewport constants, name helper |
| `scripts/preflight.mjs` | Creates a run/evidence tree, records agent folders, attempts browser navigation and screenshot |
| `scripts/browser.mjs` | Launches persistent profile per call, restores state/cookies, performs a batch, captures evidence/action log |
| `scripts/merge.mjs` | Parses simple Markdown findings, gathers agent status/flows, sorts legacy classifications, writes ledger/ID map |

## Correct use

Run them only against an application you are authorized to test, with trusted paths/arguments and safe test accounts. The calling coding agent performs planning, interpretation, finding authoring, and report writing. `merge.mjs` produces a ledger, not a completed executive report by itself.

Use explicit absolute `RUN_DIR`. Keep `.userflow-redteam/` out of Git. Pass related navigation, fill, submit, and back/forward steps in one action batch. Persistent browser storage survives calls; an open page's in-memory state and live history do not.

A preflight browser "ok" confirms successful launch/navigation/capture, not application readiness, successful login, correct business behavior, or even necessarily a 2xx response. Check the recorded HTTP status/title and inspect the screenshot separately.

## Known issues before exposing these helpers to users

- `preflight.mjs` accepts run/agent identifiers without a hosted path-authorization policy. Its trusted-local input assumptions cannot be exposed directly through an API.
- Both browser launch paths use `--no-sandbox`. That is not production isolation; the worker environment must provide reviewed protections and should retain browser sandboxing where supported.
- `browser.mjs` supports arbitrary eval and unrestricted navigation. It has no target-origin/SSRF/egress broker.
- Action logs record steps and outputs, including potential fill values, URLs, and console text. There is no robust centralized secret/PII redaction. Treat outputs as sensitive and use only fake data until hardening.
- The profile lock uses a check-then-write pattern, not an atomic cross-process lock. Concurrent sessions under one agent can also race action-log sequence-derived filenames.
- Browser lifetime is one batch; long-running foreground UX, multiple tabs, websockets, and in-memory forms need a new managed context service.
- State/evidence writes do not implement a durable transactional event/outbox system.
- Merge IDs are assigned by sorted order and can change after later findings. Do not reuse this for live stable IDs.
- Merge can report problems while returning success; callers must inspect the problems array. It checks limited fields/file existence, not full evidence validity or statistical confidence.
- Frontmatter parsing is simple line matching, not a general schema/YAML parser. Uploaded Markdown is not trusted report HTML.

These issues are documented rather than silently presenting the old helpers as production-ready. M2/M3 should wrap or replace them behind tested tools. Do not make unreviewed changes that break today's operator workflow while porting the UI.

## Verification tiers

Syntax checking shows only that Node can parse a file. A no-browser preflight test shows filesystem behavior. A synthetic merge test shows ledger processing. A local fixture browser test proves only that controlled test environment. A real SDK run proves provider/tool integration for that run. None of those alone proves safe hosting or general app quality.
