# Live Agent Run Graph Specification

## Purpose

The Agent Run Graph is the signature execution visualization for UserFlow Red Team.

It is based on the visual language of the supplied `design-reference/ai-agent-pipeline.tsx` component, but the production component must be dynamic and driven by real run events.

The graph is an **execution trace**, not a display of hidden model chain-of-thought.

It should show observable work:

- orchestration
- agent launches
- browser sessions
- source inspection
- optional tool usage
- evidence capture
- findings
- synthesis
- report generation

---

# 1. Visual qualities to preserve from the reference

Preserve:

- near-black rounded panel
- subtle 1px borders
- electric-blue active state
- dashed directional edges
- animated blue dots traveling on active edges
- compact status dots
- small uppercase eyebrow labels
- clear main node labels
- monospaced metadata beneath nodes
- live event ticker under graph
- compact metrics footer

Replace the original demo-specific labels and static stats.

---

# 2. Production graph topology

The graph should progressively expand as work begins.

Initial:

```text
PROJECT → RECON → ORCHESTRATOR
```

After plan launch:

```text
PROJECT → RECON → ORCHESTRATOR
                       ├─ A01 Admin
                       ├─ A02 First-Time User
                       ├─ A03 Ops Manager
                       ├─ A04 Power User
                       └─ A05 Mobile User
```

During execution:

```text
A02 First-Time User
     ├─ Browser
     ├─ Source
     └─ Findings 3
```

When specialist tools are actually used:

```text
A03 Ops Manager
     ├─ Browser
     ├─ Source
     ├─ Logs
     ├─ DB
     └─ Findings 5
```

Run completion:

```text
Persona agents → MERGE → HANDOFFS → ADVERSARIAL → ROOT CAUSE → REPORT
```

Improvement flow can extend later:

```text
REPORT → IMPROVEMENT PLAN → REMEDIATION → RETEST
```

---

# 3. Node types

## Project node

Shows:

- project name
- source snapshot
- branch/SHA when applicable
- runtime state

## Recon node

Shows:

- stage label
- status
- discovered route/workflow/role counts

## Orchestrator node

This is visually prominent, similar to the central LLM node in the reference.

Shows:

- `ORCHESTRATOR`
- current state such as `Launching agents`, `Coordinating handoffs`, or `Synthesizing`
- active agent count

It should not claim to display private reasoning.

## Persona agent node

Shows:

- agent ID
- persona short name
- state
- current journey
- finding count

Example:

```text
A02
FIRST-TIME USER
Testing onboarding
3 findings
```

## Tool node

Small utility node.

Possible labels:

- Browser
- Source
- Logs
- DB
- Jev
- treg
- Image

Only render tools actually used in the current branch.

## Findings node

Small output node showing count and status.

Example:

`Findings · 3`

Click opens the Findings Canvas filtered to that agent.

## Synthesis node

Possible states:

- Merging evidence
- Deduplicating
- Grouping root causes
- Building report

## Report node

Shows live/ready state and final finding count.

---

# 4. Edge states

## Queued

- low-opacity dashed line
- no moving dots

## Active

- electric-blue directional line
- animated dots travel source to target
- motion speed can reflect activity but not fabricated quantitative throughput

## Waiting

- subdued amber pulse
- no constant dot stream

## Complete

- subtle solid line
- one-time completion transition, then static

## Failed

- red accent
- movement stops
- source/target node exposes blocker

---

# 5. Graph interaction

## Click agent

Open Agent Inspector with:

- persona description
- goal
- journey
- current step
- route
- viewport
- screenshot
- latest actions
- evidence
- findings
- blockers

## Click tool

Open tool-specific evidence.

Examples:

Browser:
- current/recent page
- screenshot
- console/network events

Source:
- files referenced
- route/component trace

Logs:
- relevant structured logs

## Click findings

Open right-side Findings Canvas filtered to the selected agent or node.

## Click report

Open full report canvas/page.

---

# 6. Activity ticker

The reference component contains an animated message display. Keep this interaction, but messages must come from real events.

Examples:

```text
› A02 opened /signup
› A02 entered valid test credentials
› A02 completed onboarding step 2/4
› A02 captured screenshot EV-028
› A02 created finding UFR-014
› A03 is checking an admin permission boundary
› Orchestrator queued cross-user handoff H-03
› Merge grouped 3 findings under one root cause
```

Default mode is plain language.

Technical details may reveal:

- selector
- request ID
- source file path
- HTTP status
- tool name

Do not reveal hidden model reasoning.

---

# 7. Footer metrics

Use real run metrics.

Recommended:

```text
AGENTS      4 / 5
JOURNEYS    18 / 31
SCREENS     64
FINDINGS    12
CRITICAL    2
EVIDENCE    103
ELAPSED     06:42
```

Right side:

```text
MODE
Full Red Team

RUNTIME
Chromium · Desktop + Mobile
```

---

# 8. Layout modes

## Overview

Shows orchestrator and all active persona branches.

## Focus Agent

Selected agent becomes central and reveals tool/evidence nodes.

## Phase Filter

Graph shows nodes/events from selected run phase.

## Replay

Historical timeline controls graph state from persisted run events.

---

# 9. Responsive behavior

Desktop:
- full graph
- integrated inspector

Tablet:
- graph + drawer inspector

Mobile:
- do not shrink the entire graph into illegibility
- show vertical execution list
- allow a focused mini graph for one agent
- Findings Canvas becomes full screen

---

# 10. Implementation guidance

The provided reference uses hardcoded SVG paths and node positions. The production component should be driven by arrays such as:

```ts
type GraphNode = {
  id: string
  kind: "project" | "analysis" | "orchestrator" | "agent" | "tool" | "finding" | "synthesis" | "report"
  label: string
  status: "queued" | "booting" | "running" | "waiting" | "complete" | "partial" | "failed"
  meta?: string
  count?: number
}

type GraphEdge = {
  id: string
  source: string
  target: string
  status: "queued" | "active" | "waiting" | "complete" | "failed"
}
```

Possible implementation paths:

1. Custom SVG layout that preserves the exact visual identity of the supplied component.
2. A graph library used only for layout/pan/zoom, with heavily customized nodes and edges matching the supplied aesthetic.

Do not ship a generic node-editor look.

The graph is a controlled observability visualization, not a drag-and-drop workflow builder.