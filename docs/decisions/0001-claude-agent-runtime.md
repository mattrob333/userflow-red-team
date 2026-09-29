# ADR 0001: Claude Agent SDK with explicit Opus 5.5

Date: 2026-09-28. Status: accepted product direction, implementation pending.

Matt explicitly requested the Claude Code-capable backend that supports subagents, preferring Opus 5.5. Select the TypeScript Claude Agent SDK as the embedded runtime and pin `claude-opus-5-5` in every coordinator/persona definition. A plain model completion endpoint alone does not meet the orchestration requirement.

Consequences: maintain a long-running worker; secure tool and browser boundaries; use API credentials for hosting; map SDK lifecycle to persisted product events; bound nesting, concurrency, spend, and time; test actual provider access. No silent model fallback. Native subagents do not eliminate the need for a durable scheduler, browser isolation, or permission enforcement.

Alternative: Codex behind an `AgentRuntime` adapter later. Defer implementation until the first Claude-based audit loop works.

Sources and implementation detail: `../BACKEND_RUNTIME.md`.
