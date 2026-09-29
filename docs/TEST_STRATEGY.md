# Verification and acceptance strategy

## Checks included in this foundation

`npm test`: dependency-free tests of configuration/model choices, persona definition validation, source manifests, and selected existing helper behavior using temporary fake data. `npm run check`: script syntax, required files, configuration consistency, relative documentation references, original design hashes/dependencies. `npm run inspect:design`: direct inventory of exports and referenced data.

These are not hosted application E2E tests. No real customer app, model provider, cloud secret store, GitHub write, or deployment is exercised by them.

## Required functional tests during build

| Layer | Required proof |
|---|---|
| UI port | All route/state fixtures, real form editing, persona exclusion propagation, no-op action labeling, canvas/graph continuity |
| Accessibility | Keyboard paths, focus return, text graph alternative, contrast review, reduced motion, 390px viewport, touch |
| Auth/workspace | Two workspaces with ID substitution/URL/event/artifact access denied across boundaries |
| Intake | Missing dependency, incomplete files, zip traversal/symlink/bomb/oversize, poisoned instructions, repo permission denial |
| Runtime | Reachable, login-needed, unverified source/deployment match, non-2xx page, redirect policy, failed build |
| Claude SDK | Actual model returned, every selected persona invoked, denied undeclared agent, bounded concurrency/depth, independent identities |
| Browser | Long-lived state, desktop/mobile, role/login isolation, screenshots, network/log evidence, tab and refresh behavior |
| Reliability | Duplicate commands/events, dropped SSE, stale cursor, process death, lease expiry, retry unknown outcome |
| Operator controls | OTP private path, retry new attempt, skip untested, pause acknowledged, cancel cleanup |
| Budgets | Invalid/nonfinite limits, aggregate call cost, per-query cap, rate-limit backoff, user-confirmed resume |
| Findings/report | Stable IDs, no renumber by severity, partial coverage, inferred vs observed, invalid evidence rejected, safe HTML |
| Improvement | Dependency cycle rejected, verified vs guessed paths, all requested findings mapped, constraints retained |
| Remediation | Separate approval, branch/base scope, drift denial, test/build sandbox, no main writes/merge |
| Retest | Comparable plan/data, resolution requires runtime evidence, neutral unable-to-verify, new regressions retained |
| Secrets | Canary fake key never in public logs/events/report/screenshot; object access and revocation |
| Cleanup | User cancellation, worker crash, deletion across DB/storage, browser shutdown, orphan cleanup |

## A useful controlled fixture application

Build a small test-only app with two roles and a request -> upload -> review flow. Deliberately include one reproducible failure and a known passing flow. Seed test identities/data deterministically. The audit should identify the bug, preserve the passing result, and produce complete evidence. After a scoped fix, the original failing journey should pass in a new run. Keep this fixture separated from the product and label it intentionally vulnerable/test-only.

## Reporting results

For every milestone, record commit, environment, exact commands, pass/fail/skipped counts, captured artifacts, provider/model/SDK versions where used, and limitations. Syntax pass is not browser pass; browser pass is not evidence of provider integration; a screenshot of a mock is not successful execution. Unavailable tests are explicitly skipped/blocked, not green.
