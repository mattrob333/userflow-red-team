# Integrations and credentials

Status: target configuration, not implemented connections. No real keys are included or needed for repository validation.

## Required for the first local real-agent loop

Node, a supported and pinned Claude Agent SDK, a compatible Playwright/Chromium installation, an Anthropic API key with Opus 5.5 access, an authorized test app URL, and suitable test identities/fixtures. Repo source is helpful but not needed for a URL-only audit. A model key does not grant GitHub, app login, browser, or database access.

`ANTHROPIC_API_KEY` is for the trusted worker only. Never prefix it with a browser-exposed environment namespace. The SDK reads its process environment; it does not automatically load `.env` files. [Official setup](https://code.claude.com/docs/en/agent-sdk/quickstart).

The other variables in `.env.example` are proposed UserFlow configuration or hosted infrastructure placeholders. They are not all required by the existing local scripts. Environment variable names are documented there; empty values are intentional.

## Required before multi-user hosting

| Service | Secret/config | Where it belongs |
|---|---|---|
| Authentication | Provider client credentials, session-signing configuration | API/control plane; actual provider chosen at M4 |
| Database | Control-plane database connection | Server/worker service identities, never target app |
| Private object storage | Bucket configuration and constrained identity | Evidence/upload services |
| Durable scheduler | Connection/service identity | Control plane and job workers |
| KMS/secret manager | Key reference and restricted identity | Credential broker |
| GitHub App | App identity, private key, webhook secret | Repo integration service |
| Anthropic | Per-workspace credential reference or platform account | Trusted worker/inference broker |

Each connection has separate states: absent, testing, verified, permission-limited, expired, revoked, unavailable. A test response should include timestamp, endpoint/account identity where available, supported capabilities, and failure reason. A provider's successful model listing alone is not proof that the account can run the selected model.

## Optional adapters

**TypeSafe/Jev:** structured judgment and confidence questions. Preserve exact question, context digest, model identity, result, and evidence relationship. Missing Jev never blocks core browser testing; label it not executed. Existing question banks are in `references/`. Reverify provider auth/model/schema during adapter implementation rather than treating historical examples as live configuration.

**treg:** independent verification of external effects or external context. Use the app's own UI workflow first, then inspect the result via an authorized adapter. Approved read scopes, data egress, provider budget, and endpoint allowlists are mandatory. Never use an external-tool aggregator to bypass source/runtime restrictions.

**Database/logs:** read-only test-environment access where available. Prefer vetted query/log tools to arbitrary connection strings in prompts. Validate UI outcomes against state without letting reviewers modify data.

**Test inbox/OTP:** dedicated test email/SMS channels. OTPs go through short-lived private challenges and are excluded from general events and screenshots. A missing test inbox creates a waiting/blocked journey, not a UI bypass.

**Image generation:** optional concept creation. Every generated image is labeled PROPOSED CONCEPT, never presented as before/after proof. Original evidence remains separately stored.

## GitHub permissions

Keep platform sign-in separate from GitHub App installation. Audit requires repository contents read and metadata. Remediation requires separately approved contents write and pull requests write for an intended repo/job.

The prototype's `refs:write` is not an independent GitHub repository permission to implement. Creating a Git reference uses repository Contents write permissions. [Git reference API](https://docs.github.com/en/rest/git/refs#create-a-reference). A GitHub App's granted permission set and repository installation scope are not equivalent to a per-branch security boundary; UserFlow must enforce the approved branch and operations itself.

Write authority is checked at the API, job dispatcher, credential issuance, and git broker. Do not promise GitHub will show a fresh native prompt for every run. Reuse existing granted installation access only within an explicit UserFlow job authorization. Preserve actual commit verification metadata; do not claim signed commits unless signatures are genuinely verified.

## Costs and consent

Default policy is BYOK and a user-confirmed run budget. Display estimated API/sandbox/browser costs separately, with actual usage when reported. Unknown cost is unknown, not zero. No optional provider is auto-enabled because it appears in the design. A strict budget stop preserves partial results and cancels pending work, rather than quietly picking a cheaper model.
