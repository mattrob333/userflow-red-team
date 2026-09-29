# Backend runtime: Claude Agent SDK + Opus 5.5

Status: chosen architecture, configuration helper present; SDK worker integration not implemented. Decision date: 2026-09-28.

## 1. What we are choosing

Use `@anthropic-ai/claude-agent-sdk` in a long-running TypeScript worker. This is the programmable runtime that embeds Claude Code's agent loop, built-in tools, sessions, hooks, and delegation. A generic Claude Messages API call alone would leave us building those behaviors ourselves. [Official overview](https://code.claude.com/docs/en/agent-sdk/overview).

Use **`claude-opus-5-5`** explicitly for the coordinator, generated persona definitions, specialist reviewers, synthesis, improvement planning, and separately authorized remediation. The direct Anthropic API model ID is documented in the [model overview](https://platform.claude.com/docs/en/models/opus-5-5/overview). Preserve the requested model, actual reported model, SDK version, and policy hash in run provenance. Check actual account availability at job preflight; a missing model is a setup error, not permission to switch silently.

The SDK version must be selected, installed, locked, and integration-tested in M2. This bundle does not claim an installed SDK version or verified paid execution. Codex is an optional future `AgentRuntime` adapter; it is not a second MVP runtime and is not needed for subagents.

## 2. Intelligence versus authority

Claude proposes personas, journeys, diagnoses, and changes. Application code owns approval, job creation, permissions, scheduling, spend reservation, event ordering, artifact identity, and report completeness. No model can grant its own repo write access, classify itself as successfully tested without evidence, or expand the approved target list.

The plan-review call ends with a draft. The backend persists it and waits. Run Plan creates a separate approved execution record. Improvement and remediation are also separate jobs; do not hold an idle agent process open while a user reads the report.

## 3. Subagent strategy

Generate named `AgentDefinition` entries from the **approved plan**, using the SDK's `agents` configuration. Enable the coordinator's `Agent` tool. Each definition has an explicit model, role description, persona/task prompt, and restricted tools. The current SDK supports parallel and nested subagents; our product policy intentionally limits delegation to one child layer initially. [SDK subagent reference](https://code.claude.com/docs/en/agent-sdk/subagents).

Our defaults are product choices, not provider guarantees:

- At most 3 active persona agents per run. Additional approved personas remain queued.
- Spawn depth 1. Persona agents do not recursively invent more agents.
- Configurable per-query turn and USD limits, plus a separate durable whole-run budget.
- One browser/session/data namespace per persona execution; one writer per output namespace.
- Cross-user handoffs run as explicitly dependent tasks over shared synthetic fixtures, not accidental concurrent edits.

The SDK documents `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`, `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`, and `maxBudgetUsd` controls. Pin and test a release supporting these controls; the application also needs its own queue, timeout, and aggregate budget enforcement. SDK context isolation is not OS, filesystem, process, browser, or credential isolation.

The coordinator prompt must delegate to every selected persona by registered name. The worker reconciles actual subagent start/stop events against the selected list. A missing invocation is UNTESTED, not a completed persona. General-purpose or undeclared spawns are rejected by application policy. Discovery must not itself authorize tool calls.

## 4. Tool contract

Use harness-owned tools that are small and attributable:

| Tool contract | Responsibility | Enforced boundary |
|---|---|---|
| `read_source` | Read bounded source ranges, search approved snapshot | Snapshot and path allowlist; no secrets or host files |
| `browser_action` | Navigate, observe, click, fill, upload test fixture, inspect | Execution-bound browser and approved action/target policy |
| `capture_evidence` | Capture screenshot, accessibility tree, logs | Raw capture -> redaction -> private artifact store -> event |
| `record_finding` | Submit structured candidate finding | Validate schema and evidence IDs; identity comes from worker |
| `finish_journey` | Record outcome and evidence references | Matches approved journey, attempt, and persona |
| `request_operator` | Request OTP, missing fixture, permission clarification | Private challenge channel, expiry, audit trail |

The configuration helper uses `mcp__userflow__...` names to describe these required tools. Those are **our proposed names, not bundled SDK capabilities**. They need actual implementations and integration tests before `query()` can execute a browser audit.

Do not give hosted audit subagents unrestricted Bash as a shortcut. The local CLI helpers can inform an internal adapter, but a browser broker with a long-lived page is the target. In remediation, narrowly scoped file edits and test execution are enabled in a different worktree and authorization scope.

SDK `allowedTools` describes preapproval, not a complete network/filesystem sandbox. Use an explicit available tool set, permission callback/hooks, broker validation, and OS/network controls. [Permission reference](https://code.claude.com/docs/en/agent-sdk/permissions).

## 5. Process and credential layout

```text
Browser UI
  -> Authenticated API / durable job record
  -> Trusted Claude worker (coordinator + named Opus subagents)
       -> Policy-controlled browser broker
       -> Read-only source service
       -> Evidence/finding service
       -> Credential broker
  -> Ordered sanitized events -> database -> SSE -> Graph + Canvas

Untrusted uploaded application
  -> Separate build/runtime sandbox
  -> Only test-app configuration, never platform/provider/GitHub credentials
```

The worker and tested application must not share an unrestricted process environment. A persona's private conversation is not a secret vault. Prefer broker-held integration secrets and a controlled inference gateway when the threat model requires keeping provider keys outside agent-accessible tools. Scope job credentials and remove them at cleanup. [Secure deployment guidance](https://code.claude.com/docs/en/agent-sdk/secure-deployment).

Construct an allowlisted worker environment. The TypeScript SDK's `env` replaces the subprocess environment, so required runtime variables such as PATH/HOME must be intentionally supplied; do not blindly copy a multi-tenant API server's environment or user shell profile.

## 6. Provider login and model handling

The hosted service supports server-side Anthropic API credentials. Workspace BYOK is the initial product plan; owner-supplied platform billing can be added later. UserFlow sign-in is a different operation from connecting an AI provider.

Anthropic does not permit third-party products to offer claude.ai login/subscription allowances without prior approval. Do not reuse Claude Pro/Max browser sessions or ask users to paste Claude Code session tokens. [Authentication quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart).

During build setup, install the SDK normally and retain its supported runtime dependencies. Record the bundled Claude binary version. Verify model availability without a browser run first, then run a tiny paid subagent smoke test with explicit spending approval and a low cap. Do not claim that repository checks verified access.

Opus 5.5 has API-specific behavior changes, including always-on adaptive thinking, restrictions on forced tool selection, and changes to text returned between tool calls. Use a compatible SDK; do not force old thinking/tool schemas or depend on conversational text arriving continuously. Drive the UI from actual tool/lifecycle events. [Model behavior](https://platform.claude.com/docs/en/models/opus-5-5/overview).

## 7. Progress and report production

Map SDK lifecycle/tool events into our contract, preserving parent invocation and persona execution IDs. Browser tools create their own events and artifacts. The SDK's final message alone is insufficient for live per-agent evidence. Filter private thinking and secrets before persistence to the user-visible event stream; concise action summaries are safe when grounded in the actual operation.

No fake progress timers. No green "connected" merely because a key string is long enough. No "resolved" because a repair agent says it changed code. Treat costs as estimates until finalized, distinguish tool errors from model API failures, and surface partial outcomes.

For new SDK calls after resumption, synthesis, and remediation, reserve from the same run-level budget. Parent and child costs must not be double-counted. Native per-query limits do not limit total spend across all jobs by themselves.

## 8. What is still missing

SDK installation and worker entrypoint; durable scheduler; concrete MCP/browser adapters; strict permission callback; secret broker; subagent event correlation; genuine model-access test; actual browser run; trusted artifact redaction; final report compiler; budget tests. `runtime/build-agent-definitions.mjs` only makes configuration deterministic and testable.

See `BUILD_PLAN.md` M2/M3 for acceptance tests. Use the product-facing label **Claude Agent** or **Powered by Claude**, while retaining UserFlow branding; the SDK overview includes vendor branding guidance.