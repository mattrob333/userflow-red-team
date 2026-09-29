# Claude Design integration audit and porting plan

Inspected the supplied source files directly. Original bytes are preserved under `design/claude-design/`; hashes are in the manifest. This is a static source audit, not a browser-verified run of the design.

## 1. What was supplied

| File | Actual role | Important constraint |
|---|---|---|
| `UserFlow Red Team.dc.html` | App shell, 16 screen entries, forms, navigation, live views, report, remediation, integrations | Imports a missing `data.js`; uses the missing DC template runtime |
| `AgentRunGraph.dc.html` | Input-driven nodes/edges, SVG paths, status grammar, zoom/pan/focus, ticker/metrics | A DCLogic component, not directly importable TSX |
| `ScreenshotPreview.dc.html` | CSS-generated desktop/mobile placeholder with optional annotations | No actual screenshot URL or browser capture; never audit evidence |

All reference `./support.js`. The main file calls `import('./data.js')` in `componentDidMount`. Missing-module rejection is not handled there. The application gates much of its view on `this.D`, so absent fixture data prevents those screens from initializing. A static server alone cannot fix this.

28 `data.js` names are referenced: `ANALYSIS_END`, `ANALYSIS_STAGES`, `COVERAGE`, `COVERAGE_COLS`, `DIFFS`, `DISCOVERIES`, `EVENTS`, `FINDINGS`, `FINDING_MAP`, `INTEGRATIONS`, `JOURNEY_TOTAL`, `PERSONAS`, `PHASES`, `PROJECTS`, `REPORT_SECTIONS`, `RETEST`, `ROOT_CAUSES`, `RUNS`, `RUN_END`, `SEV_ORDER`, `WB_END`, `WB_STEPS`, `WORKSTREAMS`, `fmt`, `layoutAnalysis`, `layoutRun`, `layoutWorkbench`, `projectRun`.

Recover a complete export or port intentionally. A newly written fixture module must have its own provenance and Demo label; do not present it as the missing original.

## 2. Screen-to-implementation map

Proposed routes use real IDs. They are not routes already implemented in the exports.

| Design entry | Proposed route | Reusable UI / backend contract |
|---|---|---|
| 01 Login | `/login` | Auth forms, invitation/membership errors; genuine provider callback |
| 02 Projects | `/projects` | Project list + empty/loading/error; workspace-filtered query |
| 03 Connect | `/projects/new/connect` | SourcePicker, RuntimePicker, upload manifest, capability/readiness panel |
| 04 Describe | `/projects/:id/intent` | Intent form, constraints, attachments; versioned save |
| 05 Analysis | `/projects/:id/analyses/:analysisId` | Analysis stages, discoveries, source evidence, limited recon |
| 06 Plan | `/projects/:id/plans/:planId` | Persona cards, journey editor, handoffs, coverage, approval |
| 07 Live | `/runs/:runId` | AgentRunGraph, activity, agent list, inspector; snapshot + events |
| 08 Live + Canvas | `/runs/:runId?panel=findings` | Same run subscription, FindingsCanvas; filter by agent/finding |
| 09 Report | `/reports/:reportId` | Reusable report renderer, evidence manifest, immutable version |
| 10 Improve | `/improvements/:planId` | Dependency workstreams, instructions/export |
| 11 Authorize | `/remediations/new?improvement=:id` | Scope/base/budget/access form; explicit authorization |
| 12 Workbench | `/remediations/:id` | Workstream status, real diff, test/build status, preview |
| 13 Retest | `/comparisons/:id` | Comparable baseline/current coverage, finding resolution, real images |
| 14 Integrations | `/settings/integrations` | Provider capability/status, secure server-backed connection flow |
| 15 Runs/replay | `/runs` and `/runs/:id/replay` | Paged history, filters, persisted event playback |
| 16 System/states | `/dev/design-system` | Development-only component/state gallery |

The floating Screens menu and demo skip/restart controls belong in fixture mode only. Normal lifecycle navigation must not bypass completion/approval gates.

## 3. Preserve visually

Near-black shell, charcoal cards, thin borders, electric-blue running state, restrained semantic color, clear text hierarchy, small monospaced metadata, active-edge particles, quiet completed paths, selectable personas/tool nodes, activity timeline, and structured report. Avoid redesigning it into a generic SaaS card dashboard.

Keep the graph, selected-agent inspector, and findings tied to the same run context. Finding-node selection opens the right canvas scoped to that agent. A canvas close must not unsubscribe/restart the run.

## 4. Things that must not ship as real behavior

| Source behavior | Why it is prototype-only | Production replacement |
|---|---|---|
| `signIn` changes `loginStep` | No authentication happens | Server-verified identity/session and membership |
| `verifyRuntime` always resolves to ok after a timer | No actual reachability/TLS check | Target-policy validation and real probe with evidence |
| `testBuild` outcome depends on `dbSecret` flag | No build runs | Isolated build job and structured stage logs |
| API key accepted if length >3; 3 made-up models | No provider request or encryption | Backend key verification, real model access, vault persistence |
| `setInterval` increments `liveT` | Time drives simulation | Persisted worker/browser events drive production |
| Browser/agent/source statuses and counts hardcoded | They are fixture facts, not telemetry | Derived metrics from scoped records |
| `ScreenshotPreview` draws blocks | It is an illustration | Signed/private image fetch, redaction, provenance, annotations |
| `launchRun` resets a timer | No approved job is submitted | Idempotent run command bound to selected plan hash |
| Persona exclusions filter preview only | Live `projectRun` still uses global fixture data | Persist exclusion in new plan version, recompute dependencies |
| Retry, skip, and provide-code share `resolveBlock` | All jump timeline forward | Separate authenticated commands with different outcomes |
| Global lifecycle/top CTA can navigate anywhere | Approval and stage gating can be bypassed | Route guards plus mandatory backend policy checks |
| Workstream permissions/selections do not constrain execution | Authorization is visual only | Signed/bound approval record validated before each write |
| Header Retest navigates directly | Can show results before tests complete | Enable from actual completed preview and retest job |
| Downloads/share/PR/manage-installation have no real handler | Buttons are affordances only | Implement or show unavailable with explicit explanation |
| "Unable to verify" after image gets green tone | Suggests success without proof | Neutral/amber, no default "steps pass" message |
| Settings opens Integrations | No settings model | Real settings route, or remove until implemented |
| Mobile is displayed in a phone-shaped demo | Does not make the app shell responsive | Responsive shell, drawer, table, and graph behaviors |
| Claimed branch scopes and signed commits | Not backed by real GitHub control | Use actual permission vocabulary and verification status |

Source anchors in the original main file include `componentDidMount/tick`, `vPlan/launchRun`, `vLive/resolveBlock`, `vReport`, `vRemed`, `vRetest`, `vInteg/modalTestRun`, `vShell/CTA`, and `vFront/verifyRuntime`. Use `npm run inspect:design` for file dependencies, screen names, and checkable source inventory.

## 5. Reconciled labels and state

Use one canonical domain model from `contracts/domain.ts` and `docs/DATA_AND_EVENTS.md`. Map the prototype's `done`/`complete`, `blocked`/`waiting`, and `active`/`running` at the presentation boundary, not inconsistently in the database.

Phase rails show pipeline stage. Agent status shows execution. Finding severity shows user impact. A critical finding is not necessarily an execution failure. A complete report may describe partial coverage. Do not put those concepts into one color/status field.

The original skill's failure classifications remain useful as `failureType`; they are not the design's four impact severities. Browser verification and observed source evidence also differ. The new product spec defines this conversion explicitly.

## 6. Port the components, not the DC runtime

Create React components: `AppShell`, `SourcePicker`, `RuntimeReadiness`, `ProductIntentForm`, `PersonaPlanEditor`, `CoverageMatrix`, `RunPhaseRail`, `AgentRunGraph`, `AgentInspector`, `ActivityFeed`, `FindingsCanvas`, `ReportRenderer`, `EvidenceViewer`, `WorkstreamPlan`, `RemediationAuthorization`, `DiffWorkbench`, `RunComparison`, and `IntegrationCard`.

Convert `DCLogic` state to typed view models/hooks; replace `sc-if`, `sc-for`, `dc-import`, and interpolation with ordinary React composition. Extract colors/spacing/typography into shared tokens. Keep layouts derived from domain data, not from English status strings or the fixture timeline.

Use one data interface with two explicit adapters: `demo` and `live`. Demo serves deterministic synthetic fixtures with no credentials or paid calls. Live never substitutes demo success on errors. Empty responses remain empty; unauthorized/unavailable states remain visible.

The existing graph is data-driven visually and can be ported directly before introducing a graph library. Evaluate a library only if pan/zoom, accessibility, layout, or larger graphs justify it; do not install one merely because the UI has nodes.

## 7. Interaction and accessibility completion

On large desktop widths, the report canvas uses approximately 52% of viewport, with a visible/reflowed graph on the left. At narrower desktop/tablet widths, use an overlay/fullscreen report rather than reducing the graph to illegible labels. On mobile, use an agent list/focused branch and a full-screen findings view. Preserve filter and selected-agent state in navigation.

Keyboard-selectable graph nodes; text/table equivalent of the graph; visible focus; Esc closes and returns focus; tabs and dialogs have semantics; disabled controls are actually disabled; touch equivalents for hover; reduced-motion mode stops ALL particles, dots, live indicator pulses, and waiting-edge animation. The supplied `animate=false` does not uniformly govern all of those paths.

Keep event announcements polite and batched. Do not make every high-frequency event a screen-reader interruption. Provide pause-follow/scroll controls so reading older activity is possible. When a new finding arrives, do not steal focus or scroll the user's report reading position.

## 8. Acceptance for the UI port

All important screens render under explicit fixtures, reload/deep-link works, exclusion updates every relevant count, plan gate cannot be bypassed, graph/canvas derive from the same data, actions have real handlers or honest unavailable states, simulated data is labeled, keyboard and mobile paths work, no secrets are stored in browser persistence, and report export contains no executed script content.

A screenshot of each main screen is useful validation, but visual matching alone does not satisfy auth, backend, provider, or browser-execution tests. See `TEST_STRATEGY.md`.