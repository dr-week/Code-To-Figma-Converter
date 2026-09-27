# Milestone 1 verification audit

Date: 2026-09-13. Status: **Milestone 1 INCOMPLETE**.

## Findings

- The Vue fixture and capture implementation exist. The baseline `pnpm check` passed: 11 test files, 35 tests, typecheck, lint and the configured React/Figma build. This does not prove editor integration.
- `packages/core/src/modules/openpencil/adapter.ts` defines its own JSON structure. It does not call the upstream editor or supported document I/O. Its version string is not evidence of an installed editor version.
- The prior package generator marked editor verification from JSON stringify/parse, hardcoded successful fidelity gates and reused the source screenshot as the design preview. Those are invalid acceptance evidence.
- Source mappings infer class names and default all ownership to one component; they are not verified source provenance. The backup only includes App.vue, omitting styles and assets.
- Existing milestone-2 source-edit code is retained, but is outside the current task. Historical handoffs describing milestone 2 as active are superseded by the current user request to finish milestone 1.

## Correction

The package now reports INCOMPLETE, unknown editor version and unverified editor/fidelity gates. JSON files use `.prototype.json`, and no editor preview is emitted without an editor render. JSON-roundtrip evidence is labeled separately. Missing source fails instead of creating fabricated backup content. Existing capture directories are refused rather than overwritten. Previously generated artifacts are retained as historical, unreliable evidence; do not use them to certify completion.

The confirmed editor is [open-pencil/open-pencil](https://github.com/open-pencil/open-pencil). Its [pinned fig package source](https://github.com/open-pencil/open-pencil/blob/9d4fe4e421ac2be301a3d76a0c7d7883350656a8/packages/fig/src/index.ts) directs scene-graph document read/write to `@open-pencil/core`; custom JSON roundtrips are not that API.

## Verification of this correction

- Focused evidence-integrity tests: 2 passed.
- `pnpm check`: passed after correction, 12 test files and 37 tests, plus typecheck, lint and configured build. A final console-label wording change followed this run.
- `pnpm milestone1`: captured 26 nodes and one image; exited 1 deliberately because editor gates remain unverified. Capture ID: `capture-a44a796e-5aae-445e-9ec8-56c358288c0d`. Generated prototype artifacts are diagnostic output, not accepted design files. No actual editor version, save format or fidelity measurement is established.
- Native editor save/reopen and complete source/style/asset backup verification: unverified. The next milestone cannot start from this evidence.

## Next implementation task

Verify one frame and one text node through the real pinned OpenPencil document API, opening, editing, saving and reopening in the selected editor. Then address source provenance, complete backups and actual visual comparison sequentially. Do not begin additional writeback work.
