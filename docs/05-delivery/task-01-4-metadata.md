# Task 1.4 — DOM metadata and layer identity correction

The bounded metadata correction is implemented. The product goal remains one Vue page converted through public OpenPencil APIs; no editor code, dependencies or source-writeback behavior changed.

## Contract

Scene nodes now accept optional nullable htmlId, htmlClass, sourceId, sourceFile and sourceComponent strings. The browser reader captures id, class and data-source-* attributes verbatim from the rendered DOM. Synthetic leaf-text layers inherit the owning element's provenance. Vue may normalize class whitespace before capture. Missing HTML attributes stay null; design IDs are never reported as HTML IDs.

Existing data-figma-id annotations retain priority for scene IDs, followed by data-source-id, then the legacy traversal fallback. Per-node source annotations take priority over explicit caller defaults. Legacy scenes remain readable, but traversal fallback IDs and caller defaults are not proof of durable or automatically recovered source identity. Source annotations are supplied provenance, not independently verified AST ownership.

Each layer sourceAnchor is the JSON tuple `[sourceFile, sourceId, kind]`. Tuple encoding avoids separator collisions; frame/text/image roles distinguish generated layers. The shared instanceId tuple `[sourceFile, sourceId]` records common source ownership. Duplicate layer IDs or source anchors fail mapping generation. Repeated template instances still require a future instance-identity contract and are not silently supported.

This changes anchor values from the former `sourceFile:cleanId` format. Recapture to obtain consistent sidecars and design metadata; do not pair old sidecars with new documents. No existing artifacts are rewritten. Native I/O continues to consume the same generated anchor map through the existing infrastructure adapter.

## Evidence

- Baseline: 48 tests passed before changes.
- Final `pnpm check`: 51 tests across 15 files passed; TypeScript, ESLint, React build, plugin build and Vue build passed.
- Focused checks: mapping validation, provenance schema rejection, legacy compatibility and native I/O expectations pass.
- A real Vite-served Vue fixture is copied to an isolated temporary location, given an HTML ID distinct from its design ID, captured and exported through the existing package command. The test checks rendered ID/classes, annotated file/component ownership, shared source ownership with unique layer roles, native anchor uniqueness and names, backup hashes and unchanged source content.
- Temporary test output and server are cleaned up. Original fixture files are not edited by this test.
- ESLint now prohibits @open-pencil/* imports in core. Only read-dom.ts executes inside Chromium; capture-project.ts remains a Node infrastructure adapter.

## Remaining milestone work

Actual editor opening, a text and visual-property edit, save/reopen, and visual/geometry fidelity are unverified. This task does not complete milestone 1 or establish general Vue AST extraction. The next bounded task is Task 1.5's actual editor persistence verification, retaining the original design and source backups.
