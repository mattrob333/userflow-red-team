# Runtime integration boundary

Backend selected: `@anthropic-ai/claude-agent-sdk`; model `claude-opus-5-5`.

`claude-runtime-profile.json` is an application-owned configuration document, **not an object to pass wholesale to query()**. `build-agent-definitions.mjs` builds the SDK-compatible per-agent definitions from approved persona inputs. It makes no network requests and does not import or install the SDK.

M2 must wire:

```text
approved TestPlanVersion
  -> plan/policy/model/credential preflight
  -> buildAgentDefinitions(personas)
  -> query({prompt, options: {
       model: profile.coordinatorModel,
       agents: generatedDefinitions,
       ...explicit available tools, implemented MCP servers,
       ...permission callback, SDK lifecycle hooks,
       ...bounded env, maxTurns, maxBudgetUsd,
       ...controlled cwd and session handling
     }})
  -> validated/sanitized domain events
  -> persisted evidence/finding records
  -> HTML/Markdown/JSON report
```

This is a wiring outline, not runnable pseudocode disguised as a backend. No web endpoint, worker loop, MCP tools, encrypted vault, or paid SDK test is included here.

`mcp__userflow__*` tool names are proposed interfaces owned by this project. Implement each tool and bind caller identity outside model-supplied arguments. The persona factory's input validation is not security isolation. Tool and source policies must be enforced by the application.

See `../docs/BACKEND_RUNTIME.md` for the current vendor sources, exact native SDK limit mappings, and the model/account verification gate.
