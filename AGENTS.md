# Working policy

## One goal

Convert the user's running Vue + TypeScript UI into structurally editable OpenPencil layers, preserving supported appearance, explicit names and traceability to the source project. AI-generated UI uses the same path as other UI. TypeScript is the implementation language; the browser-rendered interface is the conversion input.

Output focus updated 2026-09-12: OpenPencil. Target editor is officially confirmed as [open-pencil/open-pencil](https://github.com/open-pencil/open-pencil) at [openpencil.dev](https://openpencil.dev/) (MIT License). Read [docs/02-research/openpencil.md](docs/02-research/openpencil.md) for feasibility details. Existing Figma code is retained as inactive reference; do not rename, delete or expand it.


## One task at a time

- Treat OpenPencil as an external, independently maintained editor. Use its documented public package exports, file I/O or supported integration APIs through a thin infrastructure adapter. Do not fork, patch, rebuild or modify the OpenPencil app, vendored source or installed package files. Do not import private internals or maintain a custom editor distribution. Inspect upstream source read-only when necessary. If public APIs cannot meet a requirement, document the gap and report it; do not expand into OpenPencil development.
- Pin tested OpenPencil artifacts and retain compatibility tests. Evaluate upgrades as separate bounded tasks before changing the pin. Keep upstream types behind the adapter so updates do not spread through domain code. Public APIs reduce coupling but do not guarantee future compatibility.

- Read README.md, docs/01-product/brief.md and docs/05-delivery/roadmap.md before changing application code.
- Select one bounded acceptance task. Implement it, run relevant checks, document the outcome and hand it back before starting another feature.
- Reuse existing modules and suitable dependencies. Avoid broad refactors, speculative abstractions, duplicate converters and extra frameworks.
- Keep three layers: presentation entrypoints, application/domain rules and infrastructure adapters. Use small responsibility-based modules only where useful.
- Vue is the first framework to validate. Preserve the existing React fixture as a regression example; do not expand React-specific functionality unless requested.
- Do not add a dashboard, database, hosted service, queue, MCP server, billing or other features to satisfy the conversion goal. Prior research about them is reference material, not an implementation queue.
- Record limitations and actual verification. A successful browser capture or mocked editor test is not proof of fidelity in OpenPencil.
- Supported visual-to-source updates are an explicitly requested product goal. Follow docs/05-delivery/milestone-01.md and the roadmap: verified conversion, mapping and backups first; one controlled source edit next; live synchronization later. Do not claim any stage works before verifying it.

## Quality and handoff

Keep the root limited to documentation entrypoints and required configuration. Validate scene inputs and preserve exact supplied names. Tests should exercise meaningful behavior or failures. Run checks proportional to the change; avoid broad repeated testing after relevant checks pass. Update affected documentation in the same task. State what works, what remains unverified and the single next task.
