# Claude Design Frontend Specification: UserFlow Red Team

## Status

This is the primary product and frontend design specification for the hosted UserFlow Red Team application.

Use this document together with:

- `docs/HARNESS_ARCHITECTURE.md`
- `docs/LIVE_AGENT_RUN_GRAPH.md`
- `design-reference/ai-agent-pipeline.tsx`
- `design-reference/demo.tsx`
- `SKILL.md`

The existing repository already contains the red-team testing method and local browser/evidence tooling. This specification defines the product experience that wraps that engine in a multi-user web application.

---

# 1. Product in one sentence

**UserFlow Red Team connects to an application, understands what the product is supposed to do, creates realistic target-user personas, runs those personas through the product with autonomous test agents, shows the work live, produces an evidence-backed report, and turns the report into an actionable improvement or remediation plan.**

This must not feel like a chat wrapper around QA scripts.

It should feel like a premium AI operations console where a coordinated red team is visibly working through an application.

---

# 2. Core product principles

## 2.1 The system must never feel like a black box

At every stage the user should be able to answer:

- What stage is the run in?
- What has the system understood about my app?
- Which personas did it create?
- Why are those personas materially different?
- What jobs is each persona trying to complete?
- Which agents are active?
- What is each agent doing right now?
- What page or route is it on?
- What evidence has it collected?
- What findings have appeared?
- What remains untested?
- What happens next?

Avoid long spinner-only states.

## 2.2 Show observable execution, not hidden reasoning

The live visualization should be labeled **Agent Run Graph**, **Live Execution Trace**, or similar.

Do not call it a literal chain of thought.

Show:

- high-level goals
- steps being executed
- tool calls
- page/route changes
- screenshots
- browser events
- source files consulted
- evidence captured
- findings created
- agent status
- orchestration state
- retries and blockers

Do not attempt to display private internal model reasoning.

## 2.3 Source code and runtime are separate concepts

This distinction must be obvious in the intake UX.

A repository gives the system code to inspect.

A deployed URL or successfully launched sandbox gives agents something real to click.

Best case:

`Source + Runnable Runtime`

Fallbacks:

- source only -> code-review-only where browser execution is impossible
- runtime only -> real UX testing with limited source-level root-cause tracing
- docs/screenshots only -> design/workflow review, not end-to-end browser testing

Never imply that a repo alone guarantees a runnable browser test.

## 2.4 Audit access and remediation access are different permissions

Audit should default to read-only.

Writing code, creating a branch, committing files, opening a pull request, deploying previews, or changing application data must require explicit authorization.

## 2.5 Evidence outranks opinion

The visual hierarchy of reports should make it obvious whether something is:

- OBSERVED
- VERIFIED
- INFERRED
- UNKNOWN
- UNTESTED

Screenshots, browser events, source references, logs, and reproduction steps should be easy to inspect.

---

# 3. Visual direction

## 3.1 Overall aesthetic

Use the provided `ai-agent-pipeline.tsx` component as a strong visual reference.

The working application should feel like:

- modern AI developer infrastructure
- premium observability console
- autonomous-agent mission control
- restrained cybersecurity/red-team cues
- serious, precise, technical, and polished

Avoid:

- cartoon hacker themes
- Matrix clichés
- playful robot avatars
- noisy neon gradients
- oversized marketing typography inside the app
- generic SaaS admin-dashboard templates
- fake terminal output as decoration

## 3.2 Base visual language

Recommended foundation:

- near-black shell
- charcoal panels
- thin low-contrast borders
- electric blue active state inspired by the reference component
- soft white typography
- restrained green, amber, red, and violet semantic states
- selective monospaced metadata
- subtle animated signal dots and path movement during live execution

Use blue as the main active/running color.

Use green only for confirmed success/completion.

Use amber for partial, needs-review, waiting, or warning states.

Use red for blockers, failures, critical findings, and true errors.

Use violet only if needed to distinguish orchestration/model activity from browser execution.

Do not let severity colors overwhelm the overall dark/blue product identity.

## 3.3 Typography

Use a modern sans-serif UI family.

Use mono selectively for:

- routes
- file paths
- commit SHAs
- run IDs
- agent IDs
- technical events
- commands
- timing and metrics

## 3.4 Motion

Motion must communicate state.

Good motion:

- dots moving along active graph edges
- a node border/pulse while active
- new activity events arriving
- agent state changing from queued to running to complete
- the findings canvas sliding in from the right
- new finding count incrementing
- screenshot thumbnail updating
- graph branches expanding as subagents launch

Avoid decorative animation that makes a completed/static screen look busy.

---

# 4. Information architecture

## 4.1 Persistent application shell

Desktop-first web application.

### Left sidebar

Primary navigation:

- Projects
- Runs
- Reports
- Integrations
- Settings

When inside a project, add contextual items:

- Overview
- Sources
- Test Plan
- Runs
- Reports
- Remediation

Bottom:

- workspace switcher
- help/docs
- user/profile

### Top bar

Show contextual project/run state:

- project name
- source type
- branch and short commit SHA when applicable
- runtime target
- runtime health
- current run status
- optional integration-health icons
- primary CTA for current state

Examples:

- Create Run
- Analyze Project
- Review Plan
- Run Plan
- Open Findings
- Generate Improvement Plan
- Review Remediation
- Retest

---

# 5. Canonical product lifecycle

Use this lifecycle throughout the interface:

```text
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
```

A persistent stage indicator should show where the user is.

Do not force the entire experience into one transient wizard. Once a project exists, every stage should be revisitable.

---

# 6. Screen: Authentication and first-run onboarding

## Goal

Get the user into a workspace without making setup feel like enterprise configuration.

## Login

Simple centered card:

**Sign in to UserFlow Red Team**

Options can include:

- GitHub
- Google
- email magic link

Do not make GitHub authentication automatically imply repository write access.

## First-run onboarding

Three short cards:

1. Connect a project
2. Let the red team build a test plan
3. Watch agents test it and generate a report

CTA:

**Create first project**

Secondary:

**Configure integrations first**

---

# 7. Screen: Projects home

## Header

**Projects**

`Connect an application and run evidence-based user-flow red teams against it.`

Primary button:

**New Project**

## Project list/card content

For each project show:

- project name
- user-written one-line description
- source type: GitHub / ZIP / Folder / Files / URL / Mixed
- branch + short SHA when GitHub-backed
- runtime status: Ready / Needs setup / Offline / Code-review only
- last run date
- last report status
- latest finding summary
- last tested source snapshot
- CTA: Open Project

Example finding summary:

`2 critical · 5 high · 11 other`

## Empty state

Headline:

**Give the red team something to break.**

Body:

`Connect a repository, upload a project, or point us at a running application. We will understand the product, create realistic target users, build a test plan, and run it in real browser sessions.`

Button:

**Connect your first project**

---

# 8. Screen: New Project - Connect Project

This is one of the most important screens.

Use a clear two-part model:

1. **Source** - what can we inspect?
2. **Runtime** - what can the agents actually run?

Then collect the creator's own description before analysis begins.

---

## 8.1 Source section

Headline:

**What should the red team inspect?**

Subtext:

`Give us the source when possible. It lets the red team trace user-visible problems back to routes, components, state, APIs, permissions, data, and implementation details.`

### Source option A: GitHub repository

Large connection card.

Copy:

`Connect a GitHub repository and select the exact branch or commit to test.`

Flow:

1. Connect GitHub
2. Select personal account or organization
3. Select repository
4. Select branch
5. Resolve exact commit SHA
6. Show snapshot confirmation

Default permissions:

**Read-only audit access**

Helper text:

`Write access is not required to run an audit. Remediation permissions can be enabled later.`

Display:

- repository name
- owner
- visibility
- branch
- commit SHA
- last commit timestamp
- source snapshot state

### Source option B: Upload ZIP

Copy:

`Upload a complete source project as a ZIP.`

Accepted examples:

- React / Next.js / Vue / Nuxt / Svelte projects
- static HTML/CSS/JS applications
- full-stack web projects
- monorepos
- backend services that support a browser application
- Node, Python, Ruby, PHP, Go, Java, .NET, and similar source when relevant to the web app
- package manifests
- configuration files
- API schemas
- SQL schemas and migrations
- Docker/dev-container files
- tests
- Markdown documentation

Show exclusion guidance:

`Do not include node_modules, build artifacts, .git history, secret files, or .env files.`

Do not invent upload limits in the design. Limits should come from backend configuration.

### Source option C: Upload folder

Copy:

`Select a project folder. We will package the source while excluding obvious local-only and secret files.`

Before upload show an exclusion preview such as:

- `.git`
- `node_modules`
- `.env*`
- `.next`
- `dist`
- `build`
- browser evidence directories
- caches

Allow an advanced exclusion editor.

### Source option D: Individual files

Useful for targeted review.

Accepted context examples:

- source files
- README files
- PRDs
- architecture docs
- user stories
- API schemas
- screenshots
- diagrams
- exported design references
- PDF documentation if the hosted ingestion layer supports parsing it

Warning:

`A partial file set can support targeted design/code review, but it may not support a full executable end-to-end audit.`

### Source option E: No source

Copy:

`Test a deployed application from the outside without connecting its source.`

Consequence:

`Browser UX testing is available. Source-level root-cause tracing and automatic remediation will be limited.`

---

## 8.2 Runtime section

Headline:

**What can the agents actually run?**

The user must understand that runtime is separate from source.

### Runtime option A: Deployed or staging URL

Input:

`https://...`

Button:

**Verify Runtime**

Verification panel:

- reachable / unreachable
- response status
- page title
- login page detected / not detected
- TLS status
- screenshot preview when safe
- latency

### Runtime option B: Build from source in sandbox

Show only when a sufficiently complete project is present.

Auto-detect and present editable fields:

- framework
- package manager
- install command
- build command
- start command
- expected port
- health-check path
- environment variables required

Example:

```text
Detected
Next.js
pnpm

Install       pnpm install
Build         pnpm build
Start         pnpm start
Port          3000
Health check  /
```

Buttons:

- Test Build
- Edit Configuration

Never echo secret values in build logs.

### Runtime option C: Local/private runtime

Advanced/future capability.

Copy:

`Use a local runner or secure tunnel when the application is only available on your laptop, VPN, or private network.`

### Runtime option D: Code-review only

Intentional fallback.

Copy:

`No live browser runtime. The system will inspect the project and produce a source review, but no user flow will be labeled browser-tested.`

---

## 8.3 Capability summary

A live capability panel should update based on the chosen source/runtime combination.

Example best case:

```text
This setup supports
✓ Repository reconnaissance
✓ Persona generation
✓ Real browser testing
✓ Desktop + mobile viewport testing
✓ Screenshot evidence
✓ Console/network evidence
✓ Source-level root-cause tracing
✓ Improvement planning
✓ Remediation branch later, if authorized
```

Example runtime-only:

```text
This setup supports
✓ Real browser UX testing
✓ Screenshot evidence
✓ Browser event evidence
△ Root-cause tracing is limited without source
✕ Automatic code remediation is unavailable
```

---

# 9. Screen: Describe Product

This should happen before AI analysis so the creator's intended product model is preserved.

## Main prompt

Headline:

**Describe the app in your own words**

Subtext:

`Tell the red team what this product is supposed to do. We will compare your intent with what the source and running application actually do.`

Large text area prompt:

`What does the product do? Who is it for? What are the most important jobs users need to complete? What would make this app successful?`

## Optional structured context

Collapsible **Add more context** section:

- primary user/customer type
- business outcome
- most important workflow
- known roles and permissions
- known problem areas
- test accounts
- environment notes
- restricted actions
- data-reset instructions

Checkboxes:

- This is a staging/test environment
- Do not modify production data
- Use fictional test data whenever possible
- Do not send real email/SMS
- Do not trigger billing/charges

## Context attachments

Allow optional supporting context:

- README
- PRD
- screenshots
- user stories
- architecture diagram
- onboarding notes
- test-account instructions

Primary CTA:

**Analyze Project**

---

# 10. Screen: Project Analysis

## Goal

Show the system building a product model in real time.

This screen should already introduce the **Agent Run Graph visual language**, but in a simpler reconnaissance form.

## Desktop layout

Two primary regions:

- left: analysis pipeline / graph
- right: live discoveries and detected product model

### Analysis stages

Possible stages:

1. Source snapshot
2. Repository instructions
3. Framework and runtime
4. Routes/screens
5. Authentication
6. Roles/permissions
7. Data/state models
8. APIs/services
9. Existing tests
10. Primary workflows
11. Persona candidates
12. Test-plan draft

Each stage has:

- queued/running/complete/partial/failed state
- short human-readable activity
- expandable technical details

### Live discoveries

Cards can appear as analysis progresses.

Examples:

**Roles detected**
- Admin
- Advisor
- Client

**Primary workflow**
`Create request → invite participant → participant responds → advisor reviews → approval`

**Runtime**
`Next.js · pnpm · port 3000 · health check passed`

**Possible risk**
`Role gating appears partially client-side. Needs runtime verification.`

Do not convert reconnaissance observations into confirmed findings prematurely.

Use labels:

- Detected
- Inferred
- Needs verification
- Unknown

Completion state:

**Project model ready**

CTA:

**Review Red Team Plan**

---

# 11. Screen: Red Team Plan

This is the user's approval point before autonomous testing begins.

## Header

**Red Team Plan**

`We created target users from the product description, source, permissions, workflows, and runtime. Review who will test the app and what each one will try to accomplish.`

Primary CTA:

**Run Plan**

Disable it until required runtime/test prerequisites are satisfied or the user explicitly chooses code-review-only mode.

---

## 11.1 Persona cards

Each persona card should be substantial and editable.

Fields:

- persona name
- role label
- context sentence
- knowledge level
- permissions
- primary job-to-be-done
- secondary jobs
- entry point
- expected success state
- likely risk areas
- test account/data assignment
- planned journeys
- viewport targets
- selected/excluded state

Example:

### First-Time Customer

`A new customer with no prior product knowledge who arrived from an invitation and wants to complete the primary workflow without training.`

**Primary job**
Complete onboarding and submit the required information correctly.

**Risk focus**
Terminology, navigation, ambiguous next steps, form recovery, mobile usability.

**Planned journeys**
7

Actions:

- Edit persona
- View journeys
- Exclude

Button:

**Add Persona**

---

## 11.2 Journey cards

Within each persona, show the concrete journeys the agent will attempt.

Each journey should include:

- goal
- starting state
- entry route
- required data/account
- expected outcome
- failure/recovery variations
- viewport(s)
- handoff dependency if any

---

## 11.3 Coverage matrix

Rows are workflows.

Columns can include:

- Happy path
- First-time use
- Returning user
- Missing input
- Invalid input
- Refresh/re-entry
- Back navigation
- Duplicate action
- Failure/retry
- Permission mismatch
- Empty state
- Partial state
- Concurrency
- Stale link
- Desktop
- Mobile

Cell states:

- Included
- Not applicable
- Needs data
- Blocked

---

## 11.4 Handoff map

Cross-user workflows should be visualized.

Example:

```text
Advisor creates request
        ↓
Client receives invite
        ↓
Client submits response
        ↓
Advisor reviews response
        ↓
Approver finalizes
```

Show which persona agent owns each segment and where state is expected to transfer.

---

## 11.5 Tool/capability panel

Compact readiness checklist:

- Browser runtime: Ready / Missing
- Source inspection: Ready / Limited
- GitHub: Connected / Not connected
- Test credentials: Ready / Missing
- Jev structured judgment: Connected / Optional
- treg external validation: Connected / Optional
- Database verification: Connected / Optional
- Logs/observability: Connected / Optional
- Image generation: Connected / Optional

Missing optional tools should not block a run.

---

## 11.6 Plan graph preview

Before execution, show a static preview using the same visual grammar as the live graph.

Example:

```text
PROJECT
   ↓
RECONNAISSANCE
   ↓
RED TEAM PLAN
   ↓
ORCHESTRATOR
   ├─ First-Time User · 7 journeys
   ├─ Admin · 6 journeys
   ├─ Operations Manager · 8 journeys
   ├─ Power User · 5 journeys
   └─ Mobile User · 5 journeys
   ↓
SYNTHESIS
   ↓
REPORT
```

Queued edges are muted/dashed.

Nothing should animate like active work until the run actually begins.

---

## 11.7 Run confirmation

When clicking **Run Plan**, show a concise confirmation:

**Start red-team run?**

Summary:

- 5 personas
- 31 journeys
- desktop + mobile
- staging runtime
- read-only source access
- external writes disabled
- production changes disabled

Buttons:

- Cancel
- **Run Plan**

---

# 12. Signature Screen: Live Agent Operations Center

This is the defining screen of the product.

It should combine:

- phase progress
- a dynamic **Agent Run Graph**
- selected-agent detail
- evidence/activity stream
- findings access

The reference component is not just decorative inspiration. Preserve its strongest ideas:

- near-black surface
- thin border
- animated signal dots traveling along paths
- active node with electric-blue border
- small status indicators
- monospaced live activity ticker
- compact metrics footer

But rebuild it as a responsive, real-data-driven product component.

See `docs/LIVE_AGENT_RUN_GRAPH.md` for exact graph behavior.

---

## 12.1 Live page layout

Recommended desktop layout:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Project / Run # / branch / runtime                         Findings 12      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Preflight  Recon  Persona Runs  Merge  Handoffs  Adversarial  Report       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         AGENT RUN GRAPH · LIVE                              │
│                                                                             │
│  Project → Recon → Orchestrator                                             │
│                         ├─ A1 Admin → Browser → Findings                    │
│                         ├─ A2 First-Time User → Browser → Findings          │
│                         ├─ A3 Ops Manager → Browser/Source → Findings       │
│                         └─ A4 Mobile User → Browser → Findings              │
│                                      ↓                                      │
│                                 Synthesis                                   │
│                                      ↓                                      │
│                                   Report                                    │
│                                                                             │
├──────────────────────────────────────────────┬──────────────────────────────┤
│ Live activity                                │ Selected agent                │
│ › A2 opened /signup                          │ A2 · First-Time User          │
│ › A2 submitted onboarding                    │ Goal / current route          │
│ › A2 captured finding UFR-014                │ Screenshot / evidence         │
│ › A3 testing permission boundary             │ Findings / progress           │
└──────────────────────────────────────────────┴──────────────────────────────┘
```

The exact arrangement can evolve, but the graph must remain visually central.

---

## 12.2 Run phase rail

Show:

- Preflight
- Recon
- Persona Runs
- Merge
- Handoffs
- Adversarial
- Root Cause
- Report

States:

- queued
- active
- complete
- partial
- failed
- blocked

Clicking a phase should filter the graph and activity stream to that phase.

---

## 12.3 Agent Run Graph behavior

The graph is a visualization of actual run events, not a fake animation.

### Node families

**Project/Input**
- source snapshot
- runtime target

**Analysis**
- recon
- route map
- role map
- workflow map

**Orchestrator**
- plan coordinator
- agent launcher
- synthesis coordinator

**Persona Agent**
- A1 Admin
- A2 First-Time User
- etc.

**Tool/Capability**
- Browser
- Source
- Logs
- DB
- Jev
- treg
- Image

Only show tool nodes that are actually used.

**Finding/Artifact**
- finding count or grouped finding node
- screenshot/evidence node when useful

**Synthesis**
- merge
- root-cause grouping
- report
- improvement plan

### Edge behavior

Queued edge:
- muted gray/blue dashed line

Active edge:
- blue line with animated dots moving in the actual direction of work

Complete edge:
- subtle solid line, no continuous animation

Waiting edge:
- amber pulse

Failed/blocking edge:
- red accent and stopped movement

### Node state

Queued:
- muted

Booting:
- faint pulse

Running:
- blue border
- active top accent
- animated status dots

Waiting:
- amber status dot

Complete:
- green status indicator

Partial:
- amber indicator

Failed:
- red indicator

### Graph expansion

At first the graph can show:

```text
Project → Recon → Orchestrator
```

As persona agents launch, branches animate into existence.

As tools are called, tool nodes can appear beside an agent.

As findings accumulate, each agent can show a small finding output node/count rather than creating an unreadable node for every finding.

Clicking the finding output filters the Findings Canvas to that agent.

### Click behavior

Every meaningful node should be inspectable.

Clicking a persona agent opens the **Agent Inspector**.

Clicking Browser shows current/recent browser session evidence.

Clicking Source shows files currently referenced.

Clicking Findings opens the right-side Findings Canvas filtered to that branch.

Clicking Synthesis shows merge/root-cause state.

### Zoom/layout

Support:

- fit-to-screen
- zoom
- pan
- reset layout
- focus selected agent
- compact overview mode

Do not make the graph feel like a free-form architecture editor. The product controls layout.

---

## 12.4 Live activity ticker

Directly under or attached to the graph, keep a compact live event ticker inspired by the supplied component.

Examples:

```text
› A02 · First-Time User opened /signup
› A02 · Filled onboarding form with valid test data
› A02 · Submitted onboarding
› A02 · Navigation stalled for 4.2s
› A02 · FINDING UFR-014 created
› A02 · Screenshot evidence captured
› A04 · Mobile viewport detected clipped primary action
```

Default language is human-readable.

A technical-details toggle may show selectors, request IDs, file paths, or tool names.

Do not expose hidden model reasoning.

---

## 12.5 Agent Inspector

When a persona node/card is selected, show a persistent right or lower detail panel, unless the Findings Canvas is open.

Show:

- agent ID
- persona name
- persona description
- assigned job
- current journey
- current step
- current page/route
- viewport
- browser session state
- progress based on planned journeys/steps
- latest screenshot
- evidence count
- findings count
- blockers
- last 5 actions
- planned next observable action, when known

Example:

**A02 · First-Time User**

`A new customer with no product training trying to complete onboarding and submit the first request.`

Current journey:

`Invitation → signup → onboarding → first submission`

Now:

`Checking whether the confirmation state explains what happens next.`

Route:

`/discovery/complete`

Viewport:

`390 × 844`

Metrics:

`7/11 steps · 18 evidence · 3 findings`

---

## 12.6 Live metrics footer

Replace the reference component's generic token/workflow footer with product metrics.

Recommended:

- AGENTS `4 / 5 active/complete`
- JOURNEYS `18 / 31`
- SCREENS `64`
- FINDINGS `12`
- CRITICAL `2`
- EVIDENCE `103`
- ELAPSED `06:42`

Far right:

- MODE `Full Red Team`
- RUNTIME `Chromium · Desktop + Mobile`

Token/model metrics can live inside technical logs, not the primary product footer.

---

# 13. Signature Interaction: Findings Canvas

The user specifically wants a structured report canvas that opens from the right while the run remains visible.

This should become a defining interaction.

## 13.1 Behavior

Clicking **Findings** opens a right-side canvas at roughly 48 to 56 percent of the desktop viewport.

Requirements:

- live run stays visible on the left
- canvas updates while agents continue running
- deep-linkable finding IDs
- width can be expanded to full screen
- optional drag resize
- close without losing graph position/selection
- sticky report navigation

Do not use a chat transcript presentation.

The content should look like a structured HTML audit document.

---

## 13.2 Canvas header

Show:

- Run Report
- project
- run ID
- source snapshot/commit
- runtime target
- live/complete status
- last update
- export
- full-screen
- close

When active run:

`LIVE · 12 findings · 3 agents still running`

---

## 13.3 Report navigation

Tabs or sticky internal nav:

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

A finding can belong to more than one category.

---

## 13.4 Report overview

Summary metrics:

- personas tested
- journeys planned/executed
- Pass / Fail / Partial / Untested
- findings by severity
- evidence items
- systemic root-cause groups
- blocked coverage

Sections:

### What is working

Evidence-backed strengths.

### What is breaking users

Outcome-level failures.

### Biggest systemic causes

Root-cause clusters that create multiple symptoms.

### Coverage gaps

What could not be verified and why.

---

## 13.5 Finding card anatomy

Each finding includes:

- ID, e.g. `UFR-014`
- severity
- evidence status
- concise title
- affected persona(s)
- job/journey
- route/screen
- user impact
- expected behavior
- observed behavior
- reproduction steps
- screenshots
- browser/network/log evidence
- source references
- root-cause layer
- root-cause group
- recommended change
- acceptance test

### Evidence status badges

Use explicit labels:

- OBSERVED
- VERIFIED
- INFERRED
- UNKNOWN

### Screenshot evidence

Allow:

- large preview
- zoom
- annotated screenshot if available
- compare later with remediated screenshot
- route metadata
- viewport metadata

---

# 14. Completed Report screen

After the run finishes, Findings Canvas content becomes a persistent report page.

Header actions:

- Export report
- Share
- Generate Improvement Plan
- Retest

Do not hide untested/blocked areas to make the report look cleaner.

Add a provenance footer:

- source snapshot
- runtime
- run start/end
- agent count
- environment
- capabilities used
- capabilities unavailable

---

# 15. Screen: Generate Improvement Plan

This is the bridge from diagnosis to action.

CTA from completed report:

**Generate Improvement Plan**

The system should convert findings into grouped implementation work, not merely repeat the report.

## 15.1 Improvement-plan structure

Group by workstream/root cause.

For each workstream show:

- objective
- findings addressed
- affected personas
- affected routes
- likely files/components/services
- recommended implementation changes
- dependencies
- risks
- acceptance criteria
- test cases to rerun
- evidence that should prove resolution

Suggested ordering categories:

- Blockers
- Workflow correctness
- State/recovery
- Permissions/security
- Usability/clarity
- UI hierarchy/responsiveness
- Technical cleanup supporting user outcomes

Do not invent a numerical priority score unless the system has a defined rubric.

---

## 15.2 Improvement-plan actions

Primary actions:

- **Generate Implementation Instructions**
- **Authorize Remediation**
- Export

### Generate Implementation Instructions

Produces a structured handoff file suitable for Claude Code, Codex, or a development team.

Recommended output file:

`USERFLOW_REMEDIATION_PLAN.md`

It should contain:

1. Source baseline
2. Target outcome
3. Findings being addressed
4. Ordered workstreams
5. File/component guidance
6. Constraints and non-goals
7. Acceptance criteria
8. Required tests
9. Retest instructions
10. Definition of done

Also allow machine-readable export later if useful.

---

# 16. Optional Screen: Remediation Authorization

Remediation is separate from audit.

The UI must say exactly what the system is about to modify.

Show permissions:

- repository read
- create branch
- write files
- create commits
- open pull request
- preview deployment
- no merge-to-main by default

Suggested flow:

1. Choose findings/workstreams
2. Choose repository branch baseline
3. Create remediation branch
4. Generate changes
5. Run tests
6. Build preview
7. Show diff
8. Rerun original red-team plan
9. Open PR

Never silently push to the default branch.

---

# 17. Screen: Remediation Workbench

Layout:

- left: workstream checklist
- center: file/diff view
- right: agent execution/status

Show:

- files modified
- tests added/updated
- build state
- preview runtime
- findings expected to be resolved
- unresolved findings

CTA:

**Retest Against Original Plan**

---

# 18. Screen: Retest / Before vs After

The strongest product loop is proving the intervention worked.

Use the same personas and journeys where possible.

Show comparison:

```text
Baseline Run                       Retest
------------------------------------------------
31 journeys planned               31 journeys planned
28 executed                       31 executed
4 blockers                        0 blockers
12 total findings                 4 remaining
68% outcome pass                  94% outcome pass
```

Only show percentages when based on defined executed/planned outcome counts.

For each baseline finding:

- Resolved
- Improved but not resolved
- Reproduced
- Unable to verify

Support screenshot before/after comparison.

---

# 19. Integrations and API Keys

This must be a first-class settings area because users will need to connect external capabilities.

## 19.1 Integrations page

Group connections by purpose.

### Source control

**GitHub**

Use OAuth/GitHub App wherever possible instead of asking users to paste personal access tokens.

Show:

- connected account
- organizations accessible
- repository permissions
- read-only vs remediation/write scope

### Agent/model runtime

The hosted product needs at least one model/agent provider for autonomous orchestration unless the deployment supplies one centrally.

The frontend should support provider connection cards rather than hardcoding one vendor.

Possible fields:

- provider
- API key
- optional base URL
- model selection
- test connection

Never show the full secret after save.

### Structured judgment

**TypeSafe Jev**

Optional.

Show:

- connected/not connected
- key status
- model status
- test connection

### External validation

**treg**

Optional.

Show:

- connected/not connected
- token status
- provider/catalog availability if discoverable

### Runtime data sources

Optional connectors:

- database
- application logs
- observability platform
- email/SMS test inbox
- object storage

### Visual remediation

Optional image-generation provider.

Use for mockups/repair concepts, not for fabricating audit evidence.

---

## 19.2 Secret UX

Secrets must be handled like credentials, not ordinary form fields.

After save, show only:

- connected state
- last 4/fingerprint if appropriate
- created/updated date
- last successful connection test

Actions:

- Test connection
- Replace credential
- Disconnect

Never render a saved API key back to the browser.

Never place secrets in activity logs.

---

# 20. Runs page

Table of historical runs.

Columns:

- project
- run ID
- source snapshot
- runtime
- run mode
- started
- duration
- personas
- journeys
- findings
- status

Filters:

- project
- status
- date
- run mode
- branch

Opening a historical run should restore:

- graph final state
- event timeline
- evidence
- report
- improvement plan
- remediation linkage

---

# 21. Run replay

After a run, the Agent Run Graph should support replay.

Add a timeline:

```text
00:00 ━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━ 08:42
```

User can scrub through:

- agent launches
- browser steps
- findings
- blockers
- handoffs
- synthesis

This can become a strong demo feature and a useful forensic tool.

Replay should use persisted run events, not regenerated fake animation.

---

# 22. Component inventory for Claude Design

Design reusable components for at least:

- AppShell
- ProjectCard
- SourceConnectionCard
- RuntimeConnectionCard
- CapabilitySummary
- IntegrationStatusCard
- ProductDescriptionForm
- AnalysisStageList
- DiscoveryCard
- PersonaCard
- JourneyCard
- CoverageMatrix
- HandoffMap
- PlanGraphPreview
- RunPhaseRail
- AgentRunGraph
- AgentNode
- ToolNode
- OutputNode
- GraphLegend
- LiveActivityTicker
- AgentInspector
- ScreenshotPreview
- EvidenceItem
- EventRow
- FindingsButton
- FindingsCanvas
- FindingCard
- EvidenceBadge
- ReportSummary
- CoverageSummary
- ImprovementWorkstreamCard
- RemediationPermissionPanel
- DiffViewer
- RetestComparison
- IntegrationSecretForm
- EmptyState
- ErrorState
- BlockedRunPanel

---

# 23. Data/state expectations for design

The frontend should be designed against real application state rather than static mockups.

Suggested conceptual entities:

```ts
type Project = {
  id: string
  name: string
  userDescription: string
  source: SourceSnapshot | null
  runtime: RuntimeTarget | null
}

type Run = {
  id: string
  projectId: string
  state: RunState
  phase: RunPhase
  startedAt?: string
  completedAt?: string
  agents: AgentExecution[]
  metrics: RunMetrics
}

type AgentExecution = {
  id: string
  personaId: string
  label: string
  status: AgentStatus
  currentJourney?: string
  currentAction?: string
  currentRoute?: string
  viewport?: string
  evidenceCount: number
  findingCount: number
}

type RunEvent = {
  id: string
  timestamp: string
  runId: string
  agentId?: string
  type: string
  summary: string
  technical?: Record<string, unknown>
}

type Finding = {
  id: string
  severity: string
  evidenceStatus: string
  title: string
  personaIds: string[]
  route?: string
  journey?: string
  expected: string
  observed: string
  userImpact: string
  reproductionSteps: string[]
  evidenceIds: string[]
  sourceRefs: string[]
  recommendedChange?: string
  acceptanceTest?: string
}
```

Do not treat these as final backend schemas. They exist so the UI is designed around persistent product objects.

---

# 24. Agent Run Graph data model

The reference component currently hardcodes node positions and messages. The production component must accept structured data.

Conceptual API:

```ts
type RunGraphNode = {
  id: string
  kind: "project" | "analysis" | "orchestrator" | "agent" | "tool" | "finding" | "synthesis" | "report"
  label: string
  eyebrow?: string
  status: "queued" | "booting" | "running" | "waiting" | "complete" | "partial" | "failed"
  meta?: string
  agentId?: string
  count?: number
}

type RunGraphEdge = {
  id: string
  source: string
  target: string
  status: "queued" | "active" | "complete" | "waiting" | "failed"
}
```

Use this or an equivalent state-driven approach.

The graph must not depend on hardcoded labels such as Pinecone, Claude, Email Draft, CRM Update, or Report Gen from the original demo.

---

# 25. Responsive behavior

This is desktop-first because live multi-agent observability requires space.

## Desktop

Full graph + inspector + findings drawer.

## Tablet

Graph stays central.

Inspector becomes drawer.

Findings canvas becomes approximately 70 percent width.

## Mobile

Do not force the entire graph into an unusable miniature.

Switch to:

- phase rail
- vertical agent execution list
- focused selected-agent mini graph
- full-screen Findings Canvas

Historical reports must remain readable on mobile.

---

# 26. Empty, blocked, and failure states

Design these deliberately.

## Runtime build failed

Show:

- failed stage
- human-readable reason
- relevant log excerpt
- edit build config
- retry
- switch to deployed URL
- continue code-review-only

## Login required

Show:

- agent blocked at login
- option to provide test credentials securely
- retry affected agent

## Optional integration missing

Show a small capability warning, not a fatal red screen.

## Agent failed

Show:

- which persona
- which journey
- last successful step
- exact blocker
- retry agent
- skip journey
- continue run

## Partial report

If some agents fail, generate a report with clear coverage gaps instead of hiding the failure.

---

# 27. Trust and safety UX

Always make the following visible when relevant:

- environment being tested
- source commit/snapshot
- whether browser actions can write application data
- whether email/SMS/payment side effects are enabled
- whether repository write access is enabled
- whether remediation can push code

Strong default:

**Audit mode: read source, interact with test runtime, no repository writes.**

---

# 28. Design deliverables requested from Claude Design

Produce a coherent design system and high-fidelity desktop screens for:

1. Login
2. Projects home
3. New Project / Connect Project
4. Describe Product
5. Project Analysis
6. Red Team Plan
7. Live Agent Operations Center
8. Live run with Findings Canvas open
9. Completed Report
10. Improvement Plan
11. Remediation Authorization
12. Remediation Workbench
13. Retest / Before vs After
14. Integrations / API Keys
15. Historical Runs

Also design states for:

- empty project
- GitHub connected
- ZIP upload
- sandbox build success
- sandbox build failure
- code-review-only
- active run
- blocked agent
- partial run
- completed run
- live finding arrival
- no findings
- remediation disabled

---

# 29. Most important design requirement

The **Live Agent Operations Center** and **Agent Run Graph** are the visual identity of the working product.

Do not reduce the run to cards plus a spinner.

The user should feel that they have launched a coordinated AI red team into their application and can watch the operation unfold.

The graph must show real execution state, while the activity stream and inspector make that state understandable.

Then the right-side Findings Canvas converts the operation into an evidence-backed report without making the user leave the live run.

The product loop should feel like:

```text
CONNECT
   ↓
UNDERSTAND
   ↓
PLAN
   ↓
LAUNCH RED TEAM
   ↓
WATCH THE OPERATION
   ↓
INSPECT EVIDENCE
   ↓
UNDERSTAND WHAT BROKE
   ↓
GENERATE IMPROVEMENT PLAN
   ↓
OPTIONALLY REMEDIATE
   ↓
RETEST THE SAME USER FLOWS
   ↓
PROVE THE APP GOT BETTER
```

That is the experience to design.