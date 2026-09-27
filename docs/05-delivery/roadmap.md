# Sequential conversion roadmap

Updated 2026-09-14. Status descriptions distinguish API-verified from GUI-verified from partially-implemented.

Working assumption: OpenPencil means [open-pencil/open-pencil](https://github.com/open-pencil/open-pencil). See the [assessment](../02-research/openpencil.md).

## Accurate status (14 September 2026)

Local conversion UI (added 20 September 2026): a Vue 3 + TypeScript interface now accepts a running localhost page, calls the existing package builder and downloads `original.fig`. This is a presentation layer only; it does not change editor verification or fidelity status below.

| Area | Status |
|---|---|
| Vue capture and DOM source metadata | Implemented; integration tests pass |
| Native `.fig` export and parsing (API) | Implemented; API-level round-trip tests pass |
| Source tuple anchors and unique mappings | Implemented; collision-detection tests pass |
| Multi-asset backups and SHA-256 hashes | Implemented; byte-comparison tests pass |
| Offline Scene HTML preview (`design-preview.png`) | Implemented; rendered from scene graph, not from OpenPencil |
| **Actual OpenPencil desktop/browser editor open/edit/save** | **UNVERIFIED — no desktop GUI session has been recorded** |
| Fidelity comparison (pixel diff) | **NOT IMPLEMENTED** — report records metadata only; all comparison fields are null |
| Controlled text and color writeback to Vue SFC | Implemented; integration tests with Playwright recapture pass |
| Layout (padding/gap) writeback to Vue SFC | Implemented; recapture integration tests pass |
| Conflict detection by SHA-256 staleness | Implemented; unit tests pass |
| Safe conflict merge (SAFE_MERGE) | Implemented with documented limitation: element presence ≠ property unchanged |
| Vue SFC AST transformation | Implemented with documented limitation: nested same-tag elements are unsafe |
| Live synchronization across repeated edit cycles | Not established |

---

## Milestone 1 — Vue Page to Editable Native OpenPencil Package

### Task 1.1: Version and API Compatibility Spike — API-VERIFIED
Real npm 0.14.0 `.fig` round trip passes for text, hierarchy, source pluginData and full PNG bytes.
Q1–Q5 answers recorded in [openpencil.md](../02-research/openpencil.md).

Note from openpencil.md §Q3: raw node IDs changed on reopen (`0:4 → 0:12`). Source mapping
uses durable sourceAnchor pluginData, not raw node IDs.

### Task 1.2: Minimal Native Document Proof — API-VERIFIED
Verified sourceAnchor identity reconstruction via `extractAndValidateSourceMap` across native
`.fig` save/reopen cycles without ID collisions.

### Task 1.3: Scene Contract Adapter & Native Serializer — API-VERIFIED
Adapted shared `@code-to-figma/contracts` Scene graph to official OpenPencil scene graph schema.
Native conversion and I/O live in `packages/tooling/openpencil-io.ts`; core remains independent
of editor runtime packages.

### Task 1.4: Verified Source Mappings & Complete Multi-Asset Backups — API-VERIFIED
Source anchors encode `[sourceFile, sourceId, layer kind]`. Duplicate anchors rejected.
Backup includes `App.vue`, `style.css`, `public/study.png`; all three hashes in `manifest.json`.
Architecture boundary: `@open-pencil/*` removed from `packages/core`.

### Task 1.5: Actual OpenPencil Editor Persistence — INCOMPLETE
What is verified (API-level):
- Text edit `[WORKING COPY]` survives `exportFigFile`/`parseFigFile` round trip.
- Solid fill color delta < 0.001 RGBA survives round trip.
- All sourceAnchor pluginData survive round trip.
- PNG image asset bytes byte-identical after round trip.
- Multi-asset backup hashes byte-identical.

What is NOT verified:
- A user has not opened the generated `.fig` in the unmodified OpenPencil editor.
- No desktop or browser editor session has been recorded.
- `editorVerified: false` in `validation.json` is accurate and must remain until this is done.

Blocker: Task 1.5 acceptance requires opening `design/original.fig` in unmodified OpenPencil,
editing text and a solid fill, saving as a separate working document, reopening that document,
and recording a screenshot and the resulting file as evidence. This is the single next task.

### Task 1.6: Offline Fidelity Report — PARTIALLY IMPLEMENTED
What is produced:
- `design/design-preview.png` — rendered from captured Scene as HTML canvas, **not** from OpenPencil.
- `evidence/fidelity-report.json` — records node counts and font families from scene metadata.
- `evidence/fidelity-report.md` — documents scope and limitations.

What is NOT measured (all fields are null in the JSON):
- `matchingBoundsWithin1px` — no PNG decode or coordinate delta.
- `maxDeltaPx` — not measured.
- `matchingTextContentCount` — text rendering not compared to reference screenshot.
- `colorDriftMax` — pixel colors not compared.
- `byteIdentical` — image bytes verified separately in the native .fig round-trip.

A genuine fidelity comparison requires independently obtained OpenPencil-rendered output.

### Task 1.7: Milestone 1 Quality Gates — PARTIAL
Tests pass (78/78 as of 2026-09-14). Type and lint checks pass. Builds pass.
However, tests that assert `editorVerified: false` or null fidelity fields cannot substitute
for the acceptance requirements that remain unverified. The test suite is sound; the product
acceptance for Task 1.5 and the pixel-diff for Task 1.6 remain incomplete.

---

## Milestone 2 — Controlled Visual Edit → Vue Source Update — IMPLEMENTATION EXISTS

### Task 2.1: Controlled Text Edit Writeback
Pure domain `applyTextWritebackContent` in `writeback.ts`.
Infrastructure `saveTextWritebackToFile` in `file-adapter.ts`.
Verified end-to-end writeback and Playwright recapture in `writeback-recapture.test.ts`.

### Task 2.2: Solid Fill Color Writeback
Pure domain `applyColorWritebackContent` in `color-writeback.ts`.
Infrastructure `saveColorWritebackToFile` in `file-adapter.ts`.

### Task 2.3: Native `.fig` Unified CLI Writeback Orchestration
`executePackageWriteback` in `writeback-orchestrator.ts` parses native `.fig` documents,
computes text and color diffs, matches `source-map.json`, updates Vue SFC files.
Verified in `cli-writeback.test.ts`.

Note: The complete editor-to-source workflow (human edits `.fig` in OpenPencil → writeback
applied to source) is not established because the editor step of Task 1.5 is not verified.

---

## Milestone 3 — Multi-Property Writeback (Layouts, Paddings & Gaps) — IMPLEMENTATION EXISTS

### Task 3.1: Layout & Spacing Writeback
`applyLayoutWritebackContent` in `layout-writeback.ts`.
`saveLayoutWritebackToFile` in `file-adapter.ts`.

### Task 3.2: Native `.fig` Layout Edit Extraction & CLI Integration
Extended `executePackageWriteback` to compute layout diffs (padding, gap) between `.fig` files.

### Task 3.3: End-to-End Layout Recapture Suite
Integration test `layout-recapture.test.ts` exercises controlled writeback and Playwright recapture.

---

## Milestone 4 — Live Synchronization & Conflict Handling — IMPLEMENTATION EXISTS WITH LIMITATIONS

### Task 4.1: Source SHA-256 Staleness & Conflict Detection
`checkSourceStaleness` in `conflict.ts` — verified in `conflict.test.ts`.

### Task 4.2: Bi-Directional Diff & Safe Conflict Merge
`resolveSourceConflict` in `conflict-merge.ts`.

**Known limitation documented in source:** SAFE_MERGE checks element ID presence, not property
value stability. If both design and source changed the same property independently, SAFE_MERGE
will silently overwrite the developer's edit. Property-level comparison is not implemented.

---

## Milestone 5 — AST-Based SFC Transformation & Scoped CSS Writeback — IMPLEMENTATION EXISTS WITH LIMITATIONS

### Task 5.1: Vue SFC AST Transformer
`findSfcElementBySourceId`, `applySfcAstTextUpdate`, `applySfcAstStyleUpdate` in `sfc-ast-transformer.ts`.

**Known limitation documented in source:** Closing tag is found by `String.indexOf`, which
returns the first occurrence. Nested same-tag elements (e.g. `<div>` inside `<div>`) produce
incorrect offsets. A future implementation should use `@vue/compiler-dom`.

### Task 5.2: Scoped CSS & `<style>` Block Writeback
`applySfcCssRuleUpdate` in `css-writeback.ts`.

---

## Sequential Milestone Sequence

- **Milestone 1:** Native OpenPencil Integration, Backups & Fidelity — API-verified; GUI persistence incomplete
- **Milestone 2:** Controlled Text & Color Writeback — implementation verified; editor-to-source workflow incomplete pending M1 Task 1.5
- **Milestone 3:** Multi-Property Writeback (Paddings, Gaps) — implementation verified
- **Milestone 4:** Conflict Handling — implementation verified with documented SAFE_MERGE limitation
- **Milestone 5:** AST Transformation — implementation verified with documented nested-tag limitation

## Outside this implementation sequence

Custom editor, dashboard, database, hosted execution, queues, MCP server, AI chat and billing.
Research and existing Figma code remain reference material.
