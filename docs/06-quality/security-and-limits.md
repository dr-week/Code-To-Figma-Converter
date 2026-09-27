# Security boundaries and operational limits

Scope note, 2026-09-12: hosted-service guidance below is inactive reference. The current task is local Vue capture. Project registration is not implemented; the prototype accepts an explicitly supplied local HTTP URL and restricts browser requests to that origin.

These controls address concrete converter inputs and execution paths. They are design requirements, not a completed security audit or legal compliance certification.

## Local MVP

Only capture a project explicitly registered by the developer. Use a fresh browser context with no personal browser profile. Do not ingest cookies, `.env` files or arbitrary private source files. Capture only necessary visual data and metadata; screenshots themselves can contain sensitive information. Use synthetic data for public portfolio examples.

Allowlist local targets and required asset origins; validate redirects and resource fetches. Distinguish intentionally allowed local dev ports from unrestricted loopback/private-network access. Do not turn the CLI or an eventual server into an unrestricted URL fetch proxy.

Scene files and assets are untrusted inputs even if produced locally. Validate schema, size, depth, IDs, finite geometry, archive paths and decoded asset limits. Reject executable payloads and external SVG references. Keep file reads under registered artifact roots, resolving paths before access.

## Later hosted service

Arbitrary source repositories can execute code during installation, build and browser rendering. Hosting that feature requires an independently designed isolated execution environment with no production credentials, resource/time limits, constrained egress and cleanup. It is outside this plan's MVP. Do not rely on ordinary container packaging as proof of hostile-code isolation.

A public dashboard needs authentication, project-scoped authorization on every artifact/job, scoped Figma credentials if introduced, log redaction and retention/deletion controls. Preserve user consent for uploads and destination writes. An EU or Swiss hosting region by itself is not proof of privacy compliance.

## Release limitation statement

State supported frameworks, capture modes and CSS features, required fonts, tested size limits, fallback behavior and measured accuracy. State that generated Figma content represents captured visual states, not the original application's logic. Document recovery from incomplete imports and a way to identify generated nodes without affecting unrelated artwork.
