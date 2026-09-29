# Security boundaries and release gate

**This repository is not safe to expose as a public upload-and-execute service today.** The current helper scripts assume a trusted local operator. The design's safety labels are requirements, not implemented enforcement.

## Threat model

Untrusted inputs include repositories, manifests/install scripts, `.claude` hooks and instruction files, documents, browser pages, provider/tool responses, generated reports, runtime URLs, screenshots, and model proposals. Any may contain prompt injection or hostile executable content. A prompt telling an agent to be careful is not a security boundary.

## Required controls

**Workspace separation:** validate membership on every project/run/credential/artifact/event/export operation. Test ID substitution and direct object URLs. Never trust workspace or agent IDs supplied by the model.

**Code execution:** no uploaded code on the main API process, no host filesystem mounts, no privileged containers, no Docker socket, no broad cloud identity. Limit compute, time, disk, processes, archive expansion, and network. Keep dependency installation inside a reviewed sandbox. Do not auto-load user repository hooks/MCP/skills as trusted policy.

**Source/runtime split:** audits do not modify source. Approved browser tests may modify test data only. Production actions and external writes are separately authorized or disabled. Billing/email/SMS are stubbed at the tested application's server where necessary, not merely hidden in the UI.

**Secrets:** broker-held credentials with encryption/key rotation, scoped references and short lifetimes; no raw values in frontend persistence, model-visible files, logs, SSE, reports, or exported instructions. Test key replacement, permission revocation, invalid keys, and unavailable models. A new API key must never be "validated" by length or a timer.

**Network:** permit only approved targets/tool endpoints; block cloud metadata/private hosts unless an explicitly authorized private-runner mode supplies a narrower policy. Revalidate DNS, redirect, scheme, and subresource behavior. Protect provider base-URL input from SSRF. An allowed external domain may still allow dangerous APIs; constrain methods/paths and operations too.

**Evidence:** keep originals private, redact derivatives before wider access, hash artifacts, check reference ownership, use short-lived authorized access, and remove raw browser state at cleanup. Screenshot placeholders and generated repair concepts must never masquerade as observations.

**Output rendering:** structured report components with text escaping/sanitization. Never execute arbitrary agent-generated HTML or uploaded SVG scripts in the authenticated app origin. Export filenames, hyperlinks, source snippets, and attachments require validation.

**Authority:** immutable plan approval and separate repo-write approval. Validate repo/base/branch/scope again in the git broker. Deny default-branch writes, automatic merges, and hidden production deployment. A checkbox in a client UI is not sufficient.

**Budget and availability:** bound agent nesting, concurrency, turns, total spend, and wall time. Preserve partial outcomes. Cancel orphan jobs/browsers, revoke temporary tokens, clean disks, and surface cleanup failure. Do not silently downgrade model or drop coverage to claim success.

## Safe defaults for the first build

Local trusted operator; synthetic test app and data; direct Anthropic API credential confined to worker; no arbitrary source execution; no automatic remediation; read-only source; explicit test-URL authorization; no raw vendor event logging; no public report links. Expand only after negative tests in `docs/TEST_STRATEGY.md` pass.

## Disclosure and licensing

A public vulnerability reporting channel has not been configured. Use the repository owner's private contact channel for sensitive reports, not an issue containing keys or customer evidence. No production security/compliance certification is claimed. The assembled project's license remains an owner decision.