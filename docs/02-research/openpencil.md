# OpenPencil feasibility and requirements

Research date: 2026-09-12. Scope: Vue + TypeScript → editable OpenPencil document. No application code, packages or editor installations changed during this assessment.

## Project identity and licenses

The user has confirmed **[open-pencil/open-pencil](https://github.com/open-pencil/open-pencil)** at **[openpencil.dev](https://openpencil.dev/)**. The separately maintained [ZSeven-W/openpencil](https://github.com/ZSeven-W/openpencil) is not the target. Their APIs are not interchangeable.

Penpot is also open source, under [MPL-2.0](https://github.com/penpot/penpot/blob/develop/LICENSE). Open-pencil/open-pencil uses MIT. These are different licenses and projects. Penpot remains comparison context, not a second output adapter to implement.

## Evidence and version boundary

Source was inspected at commit `9d4fe4e421ac2be301a3d76a0c7d7883350656a8`, whose package manifests say 0.14.0. GitHub's latest release endpoint returned [v0.14.0](https://github.com/open-pencil/open-pencil/releases/tag/v0.14.0), published 2026-08-11, with Windows x64 installers. A matching version string does not establish that later master-branch APIs are present in that release. The spike must verify the exact installed artifacts and editor version.

This was a documentation and targeted source review, not a working conversion demonstration. No accuracy percentage or time-saving percentage is established.

## What can carry over?

| Existing part | Assessment |
| --- | --- |
| Running the user's Vue app in Chromium | Reusable approach; the current prototype has only a React fixture, so Vue still needs validation. |
| Measured bounds, text, asset collection | Reusable observations. Browser output is independent of which design editor receives it. |
| Explicit names and IDs | Reusable contract; we must map them into OpenPencil and verify persistence. |
| Scene validation and quality tests | Largely reusable. Keep editor-specific handles and serialization out of the shared contract. |
| Import orchestration through EditorPort | Potentially reusable; inspect adapter compatibility rather than rewrite core by default. |
| Figma plugin UI, messages and exports | Platform-specific. OpenPencil does not become compatible by renaming the manifest. |
| Figma API adapter | Some methods overlap, but fonts, export, metadata and saving need an OpenPencil implementation or compatibility check. |

These are engineering assessments of our code boundaries, not measured reuse percentages. Three layers still apply: a local entrypoint; conversion/naming/validation rules; browser and OpenPencil adapters. A new editor, database or service is unnecessary.

## Reuse opportunity

OpenPencil's [DOM/CSS package](https://github.com/open-pencil/open-pencil/blob/9d4fe4e421ac2be301a3d76a0c7d7883350656a8/packages/dom-css/README.md) provides conversion helpers. Its documentation recommends the browser runtime when fidelity matters and describes the headless runtime as approximate. The [browser entrypoint](https://github.com/open-pencil/open-pencil/blob/9d4fe4e421ac2be301a3d76a0c7d7883350656a8/packages/dom-css/src/browser.ts) accepts HTML plus CSS and returns a design document or scene graph. It is not a Vue application compiler.

We still need to run the Vue app with its assets, scoped styles, viewport and data state, then provide rendered content and the relevant compiled CSS. Re-rendering a serialized subtree in an iframe may change inherited styles, dimensions and state. Compare its geometry with the original browser measurements rather than assuming equivalence.

Use the upstream converter for the single fixture if it passes. If a specific mismatch blocks it, use our measured scene with a small OpenPencil adapter. Choose one production path from the evidence; do not maintain two complete conversion engines.

## Concrete problems and responses

| Problem | Evidence or reason | Requirement |
| --- | --- | --- |
| Layer names differ | The inspected [mapping source](https://github.com/open-pencil/open-pencil/blob/9d4fe4e421ac2be301a3d76a0c7d7883350656a8/packages/dom-css/src/to-scene-graph.ts) assigns frame names from HTML id, class or tag. | Explicitly preserve our supplied names; check duplicate names and unique source IDs independently. |
| Images missing after save | In that source, data-URL image bytes are added to the graph; ordinary URLs can be retained as metadata instead. This is a specific code path, not a verdict on all upstream workflows. | Collect/resolve original image bytes and prove the saved document reopens with the image available. |
| Font/layout drift | Browser text metrics and the editor renderer can differ. Font portability remains an upstream roadmap item. | Use one known font initially; inspect actual family/style, line breaks and bounds after reopening. |
| Figma API gaps | The [scripting reference](https://github.com/open-pencil/open-pencil/blob/9d4fe4e421ac2be301a3d76a0c7d7883350656a8/packages/docs/programmable/cli/scripting.md) documents a Figma-compatible global, but font loading is a no-op and node.exportAsync is not a compatible helper. | Implement real font availability checks and use OpenPencil's export/save surface. Our existing font preflight cannot be trusted unchanged. |
| File serialization differs from scene JSON | The focused [fig package](https://github.com/open-pencil/open-pencil/blob/9d4fe4e421ac2be301a3d76a0c7d7883350656a8/packages/fig/src/index.ts) exposes archive/container APIs and directs scene-graph read/write users to core. | Save through supported core/CLI document I/O; do not rename our JSON file to .fig or hand-write the binary codec. |
| Compatibility still evolving | The [upstream roadmap](https://github.com/open-pencil/open-pencil/blob/9d4fe4e421ac2be301a3d76a0c7d7883350656a8/packages/docs/development/roadmap.md) lists work on fidelity, saves, masks and international text. | Pin compatible package/editor versions, test our small subset and save a new output file during the spike. |
| Project link confused with reverse sync | Source references alone cannot translate arbitrary visual edits back into Vue components. | The user subsequently confirmed controlled source updates as a goal. Prepare mappings and backups in milestone 1; implement one supported source edit separately in milestone 2. See the [roadmap](../05-delivery/roadmap.md). |

Editable HTML/JSX export, where available upstream, does not prove faithful reconstruction of the original Vue repository, component boundaries or business logic.

## Minimum requirements

- One running local Vue SFC with TypeScript; deterministic data and a fixed viewport.
- One card with text, a button, simple containers and a local PNG/JPEG, with explicit names/IDs.
- Existing Node/pnpm/TypeScript/Playwright tooling. Verify supported runtime and actual npm package contents before adding anything.
- A pinned OpenPencil editor or web build and the smallest compatible package set. Upstream uses Bun for its own build; that alone does not require migrating this repository. Do not install Rust/Tauri or rebuild the editor unless a demonstrated blocker requires it.
- A working document-save/open route, fonts/assets available to the editor, and an isolated generated output location.
- Native text/shape editing and a screenshot comparison. No AI provider key, hosted backend or new MCP server is needed for deterministic conversion.

An embedded Vue SDK is optional infrastructure for building a custom editor; our task is to import into the existing editor, so embedding it would add unnecessary scope.

## Task 1.1 measured findings — 2026-09-13

This section replaces the previous false empirical claims. The old probe read source text and serialized a custom JSON object. It never executed OpenPencil. Baseline: 13 files / 40 tests passed, including those three inadequate probe tests. They have been replaced by a real native-I/O test; a smaller test count does not mean acceptance was weakened.

### Q1 — Public APIs and format

Runtime-tested published 0.14.0 APIs: `SceneGraph` from `@open-pencil/scene-graph`; `exportFigFile(graph)` and asynchronous `parseFigFile(ArrayBuffer)` from the public `@open-pencil/core/io/formats/fig` entrypoint; `parseFigBuffer` from `@open-pencil/fig`; `initCodec` from `@open-pencil/kiwi/fig/codec`. A 30,936-byte .fig was written, read from disk and parsed successfully. It is a ZIP container with Kiwi canvas data and one image asset.

The public core root also imported successfully under Node and exposes exportFigFile, parseFigFile and readFigFile. Contrary to the earlier report, parseFigFileSync is private in the inspected source and is not the supported public reader. Pen exports readPenFile/parsePenFile; only imports were verified, not .pen write/read. The chosen tested format is .fig, not .openpencil.

### Q2 — Pin, provenance and reproducibility

- Inspected repository: https://github.com/open-pencil/open-pencil
- Local source location: C:/Users/disha/Documents/CODES/studio/open-pencil-upstream
- Local HEAD: 9d4fe4e421ac2be301a3d76a0c7d7883350656a8; manifest: 0.14.0.
- Upstream bun.lock SHA-256: 48b606be2a65c32a980ef04ae9b164d2d00aef6b787a8d61d46f6bf1e5e99cbf.
- Remote tag v0.14.0 resolves to annotated tag 28bca1f2ad59f13a39756bc77cce17a202e26099 and peeled commit c29654cd07ac46b53e76c16b18505919f16571be, which differs from local HEAD.
- The upstream checkout has extensive staged deletions/untracked files. It was not modified or rebuilt by this task. HEAD alone does not certify its working-tree contents.
- Executed artifacts: six published npm packages pinned to 0.14.0 in [isolated package.json](../../tests/spikes/openpencil/package.json), with transitive versions, tarball URLs and integrity hashes in [package-lock.json](../../tests/spikes/openpencil/package-lock.json). There is no established build provenance linking those npm artifacts to local HEAD. Their core dependency ranges differ from that checkout.
- All six direct package manifests declare MIT. Core transitively depends on fig/kiwi/pen/scene-graph, compression, CanvasKit, Yoga and additional utilities; the complete resolved dependency/license list is in the isolated lockfile. No install scripts were run.
- [Reproduction commands](../../tests/spikes/openpencil/README.md). Root pnpm dependencies and converter code are unchanged. CI installs the isolated locked dependencies before checking.

### Q3 — Metadata and layer IDs

The real .fig round trip preserved text, names, parent hierarchy and the sourceAnchor entry placed in native pluginData. It did **not** preserve raw node IDs: the text ID changed from 0:4 to 0:12 in standalone execution. Thus source mapping must use durable metadata and rebuild its editor-ID association on reopening. A sidecar keyed only by pre-save layer IDs is insufficient. This is a measured incompatibility with the current milestone ID-persistence expectation, not a successful identity gate.

### Q4 — Image retention

The probe reads the full fixture study.png, hashes it with SHA-1 for the image key, inserts its bytes into SceneGraph.images, and references it through a RECTANGLE with an IMAGE fill. After native export and parse, the image fill's hash resolves to bytes exactly equal to the original Uint8Array. The archive contains one image. This proves binary retention for this asset, not correct visual rendering, cropping or general image support.

### Q5 — Node and TypeScript execution

Node v24.15.0 imported core, scene-graph, fig, kiwi, pen and dom-css. The focused Vitest test invoked actual export/parse and codec functions; a separate Node process using tsx also ran the full round trip. Root strict TypeScript 5.9.3 typecheck passed against installed declarations. Core's first broad import was slow; the public focused I/O entrypoint works without constructing an editor or providing window/Tauri globals.

No CanvasKit rendering or headless thumbnail fidelity is claimed: export used its default thumbnail path. DOM/CSS browser conversion functions were imported but not executed. Actual desktop/browser editor open/edit/save remains unverified.

### Status and next task

**User scope clarification, 2026-09-13:** [ADR-013](../03-architecture/decisions.md) supersedes the exact-local-source runtime requirement below. Locked published artifacts are the integration baseline; local HEAD remains research provenance only. Do not rebuild or modify OpenPencil to establish equivalence. Continue the source-anchor identity proof through public APIs. This clarification does not turn the failed raw-ID check into a pass or establish GUI/fidelity verification.

Final verification: focused native-I/O test passed; standalone Node/tsx execution passed; `pnpm check` passed with 13 test files / 38 tests, strict typecheck, ESLint, React build, plugin build and Vue build. No main converter changes. Generated evidence: `.artifacts/openpencil-spike/probe.fig` and `result.json`. The root gate requires the isolated dependency install documented above; no tests are skipped when dependencies are missing.

Task 1.1 is **INCOMPLETE under the requested exact-source verification requirement**: runtime evidence applies to pinned published npm artifacts, not a verified build of local HEAD. The native-ID retention gate also fails. Do not mark milestone 1 complete or silently relax identity criteria.

The next bounded task is to resolve the source/package version boundary and select a reproducible integration artifact. Then validate stable source metadata and reconstructed editor-ID mappings through actual editor save/reopen. No converter, writeback or live-sync implementation was changed.
