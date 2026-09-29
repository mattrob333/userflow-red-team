# Paste-Ready Claude Design Handoff

Copy the prompt below into Claude Design and attach or give it access to this repository.

---

I want you to design the frontend for **UserFlow Red Team**, using the files in this repository as the source of truth.

Start by reading these files in order:

1. `docs/CLAUDE_DESIGN_FRONTEND_SPEC.md`
2. `docs/LIVE_AGENT_RUN_GRAPH.md`
3. `design-reference/ai-agent-pipeline.tsx`
4. `design-reference/demo.tsx`
5. `docs/HARNESS_ARCHITECTURE.md`
6. `README.md`
7. `SKILL.md`

## Product concept

UserFlow Red Team is an autonomous user-flow testing and remediation platform.

A user connects an application by GitHub repo, ZIP, folder, individual files, deployed URL, or a combination of source plus runtime. They describe in their own words what the app is supposed to do and who it is for. The system analyzes the project, creates realistic target-user personas, creates journeys and a red-team test plan, and lets the user review that plan before execution.

When the user clicks **Run Plan**, multiple persona agents test the application. The user must be able to watch the operation in real time. The system captures screenshots, browser events, evidence, findings, source references, and cross-user workflow behavior. The final report can be turned into an improvement plan, implementation handoff, or an explicitly authorized remediation branch followed by a retest.

## The defining visual idea

The supplied `ai-agent-pipeline.tsx` component is the visual seed for the product's signature screen.

Do not use it as a static demo.

Transform its visual language into a dynamic **Agent Run Graph** driven by actual run data.

Preserve the feel of:

- near-black rounded panel
- subtle low-contrast borders
- electric-blue active node
- animated signal dots traveling along active paths
- status dots
- concise labels
- monospaced live event ticker
- compact execution metrics

Replace all demo-specific labels and hardcoded pipeline logic.

The live graph should begin roughly as:

`Project → Recon → Orchestrator`

Then expand as persona agents launch:

- A01 Admin
- A02 First-Time User
- A03 Operations Manager
- A04 Power User
- A05 Mobile User

Each agent can branch into tools that it actually uses, such as Browser, Source, Logs, DB, Jev, or treg, then into a Findings output. After agents finish, the graph flows into Merge, Handoffs, Adversarial Testing, Root Cause, and Report.

Animated dots must represent real active execution. Queued paths are muted. Completed paths become quiet/static. Blocked or failed paths use meaningful status states.

Clicking an agent should reveal its persona, goal, current journey, current page/route, viewport, last action, latest screenshot, evidence count, findings, and blockers.

Clicking Findings should open the report canvas filtered to that agent.

Call this an **Agent Run Graph** or **Live Execution Trace**. Do not present it as literal hidden chain-of-thought. Show observable actions, tools, evidence, and state.

## Required product flow

Design the following lifecycle clearly:

1. Connect Project
2. Describe Product
3. Analyze Project
4. Review Personas + Test Plan
5. Run Plan
6. Watch Agent Run Graph
7. Review Findings
8. Generate Improvement Plan
9. Optional Remediation
10. Retest
11. Compare Before vs After

## Project intake

The intake UI must clearly separate **Source** from **Runtime**.

Source choices:

- GitHub repository
- ZIP
- folder
- individual source/context files
- no source

Runtime choices:

- deployed/staging URL
- sandbox build from source
- local/private runner when supported
- code-review-only

Explain capability differences instead of pretending every input supports the same audit.

The user must also describe the product in their own words before analysis begins.

## Plan screen

After analysis, create a polished Red Team Plan screen showing:

- rich persona cards
- persona goals and permissions
- jobs-to-be-done
- planned user journeys
- coverage matrix
- cross-user handoff map
- runtime/tool readiness
- static preview of the planned agent graph

The user reviews and can edit/exclude personas, then clicks **Run Plan**.

## Live run screen

This is the most important screen.

Design it as an AI operations center, not a dashboard full of unrelated cards.

Must include:

- run phase rail
- large Agent Run Graph
- live activity ticker
- selected-agent inspector
- current screenshots/evidence
- agent/journey progress
- findings counter
- controls for blocked/failed agents

Use real product metrics in the graph footer, such as Agents, Journeys, Screens, Findings, Critical, Evidence, and Elapsed Time.

## Findings Canvas

Clicking **Findings** opens a structured HTML report canvas from the right, covering roughly 48 to 56 percent of the desktop viewport.

The run remains visible behind/alongside it and continues updating.

The canvas must support live updates during a run and persistent report mode afterward.

Report areas should include:

- Overview
- Critical Findings
- UI & Visual Hierarchy
- Usability & Clarity
- Workflow Logic
- State & Recovery
- Permissions & Security
- Cross-user Handoffs
- Mobile / Responsive
- Technical Evidence
- Coverage

Each finding must show evidence status, affected persona, user impact, expected vs observed behavior, reproduction, screenshots, technical evidence, source references, root cause, recommended change, and acceptance test.

## Improvement and remediation

After the report, the user can click **Generate Improvement Plan**.

The plan groups findings into implementation workstreams and can produce a structured `USERFLOW_REMEDIATION_PLAN.md` for Claude Code, Codex, or a developer.

If the user explicitly authorizes remediation, design a workflow that can create a branch, make changes, run tests, build a preview, show diffs, rerun the original red-team plan, and then open a pull request.

Do not design silent writes to the default branch.

## Integrations

Design a first-class Integrations/API Keys screen for:

- GitHub
- model/agent provider
- TypeSafe Jev, optional
- treg, optional
- database/log/observability integrations, optional
- visual-remediation image provider, optional

Saved secrets are never displayed back in full.

## Visual direction

Use the supplied component as the anchor:

- premium dark interface
- electric-blue active state
- strong technical hierarchy
- subtle motion
- sparse semantic status colors
- monospaced technical metadata
- polished observability feel

Avoid hacker clichés, cartoon agents, generic SaaS dashboard styling, and fake terminal decoration.

## Deliverables

Create a coherent design system and high-fidelity desktop screens for:

1. Login
2. Projects
3. New Project / Connect
4. Describe Product
5. Project Analysis
6. Red Team Plan
7. Live Agent Operations Center
8. Live Agent Operations Center with Findings Canvas open
9. Completed Report
10. Improvement Plan
11. Remediation Authorization
12. Remediation Workbench
13. Retest / Before vs After
14. Integrations / API Keys
15. Historical Runs / Run Replay

Also provide the reusable components and important empty, loading, blocked, partial, failure, and completed states.

Do not simplify the live testing experience into a spinner. The entire point is that the user can see the autonomous red team operating against the app.