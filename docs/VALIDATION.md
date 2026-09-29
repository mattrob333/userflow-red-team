# Consolidation validation

Recorded: 2026-09-28. Bundle 2.2.0. Parent local commit before consolidation: `50207bc`.

## Executed checks

| Check | Result | Scope |
|---|---|---|
| `npm test` | 22 passed, 0 failed | Node built-in tests; configuration, manifest, synthetic fixtures, temporary filesystem preflight/merge |
| `npm run check` | Passed with known design-dependency warnings | Current required files, MJS syntax, embedded DC script syntax, JSON parse, original export hashes, current relative Markdown links, limited credential-pattern scan |
| `npm run check:strict` | Exit 2, expected failure | Correctly refuses to call the original export complete without support.js/data.js |
| `tsc --noEmit --strict --target ES2022 --module NodeNext --moduleResolution NodeNext contracts/domain.ts` | Passed | Initial domain type declarations only; TypeScript 5.8.3 in preparation environment |
| Python `Draft202012Validator.check_schema` + validation with `FormatChecker` | Passed | Event schema and 7 synthetic event envelopes; not payload authorization or business validation |
| `node scripts/publish-github.mjs --help` | Passed | CLI usage only, not remote publication |

Preparation environment: Node v22.16.0; Linux. These results are local. No GitHub Actions run occurred.

## Original design integrity

All 3 supplied `.dc.html` files match their recorded SHA-256 hashes; total original bytes: 296,662. Missing dependencies are support.js (all three files) and data.js (main app). The main export references 28 data-module symbols and 16 screen entries.

## Explicitly not verified / not implemented

- Standalone rendering or interaction of the DC prototype; required files are absent.
- React/Next frontend build; no hosted frontend scaffold exists.
- Claude SDK installation, Anthropic account/model access, any paid model call, or real subagent execution.
- Real browser audit of a customer app; preflight regression used --no-browser with temporary fake data.
- Authentication, encryption/vault, multi-tenant permissions, sandbox/SSRF safety, durable jobs, live event delivery, production export.
- GitHub repository creation, file push, pull request, deployment, or CI.
- Resolution of application bugs or real before/after evidence.

The credential-pattern scan is heuristic and checks common token/private-key patterns in repository text. Passing is not a comprehensive secret audit. Original images were not OCR-scanned. No font binaries or live API credentials were intentionally included.

## Publication status

Authenticated GitHub account lookup returned `mattrob333`. A lookup of `mattrob333/userflow-red-team` returned 404. The discovered connected actions include writes to existing repos but no repository-create action. The preparation container had no GitHub CLI binary or GH_TOKEN/GITHUB_TOKEN. Therefore no remote was created or pushed here.

Use the provided publisher from an authenticated developer machine, or supply an accessible existing repository for a read/compare/integration cycle. Do not claim publication from this local validation record.

## Updating this record

When actual implementation begins, append the tested commit, environment, commands, artifacts, SDK/model identity, pass/fail/skipped results, and remaining blockers. Replace the stage status only after the relevant build gate is proven.
