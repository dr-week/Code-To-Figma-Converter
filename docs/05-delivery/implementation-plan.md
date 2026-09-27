# Implementation Plan: Milestone 1 Verification & Native OpenPencil Integration

Structural maintenance (2026-09-15): follow the [modularity plan](modularity-plan.md). This user-requested refactor preserves behavior and does not advance product acceptance gates.

> **Status:** Milestone 1 INCOMPLETE. All milestone acceptance gates must pass before milestone 2 writeback work is activated.

> **Current integration boundary:** use the locked published OpenPencil packages and documented public APIs. Do not rebuild, fork or patch OpenPencil to match the research checkout. Historical exact-source build requirements below are superseded by [ADR-013](../03-architecture/decisions.md). The next authorized handoff is the [source-anchor identity proof](task-01-2-prompt.md); actual editor and fidelity verification remain pending.

### 📊 Current Project Readiness Status
```text
Milestone 1: INCOMPLETE (Tasks 1.1–1.4 repository-verified; Task 1.5 active)
Task 1.1: COMPLETED & VERIFIED (tests/spikes/openpencil-probe.test.ts passing)
Task 1.2: COMPLETED & VERIFIED (Stable source identity proof across 2 cycles)
Task 1.3: COMPLETED & VERIFIED (convertSceneToOpenPencilGraph, exportSceneToOpenPencilFig, parseOpenPencilFig)
Active Bounded Task: Task 1.5 — Actual OpenPencil Editor Persistence
Existing project quality gate: PASSING (45/45 vitest tests, tsc, eslint, react build, vue build)
Native OpenPencil compatibility: VERIFIED (exportFigFile, parseFigFile, SceneGraph)
Native save/reopen: PROVED in adapter & probe tests
Metadata persistence: PROVED (code-to-design:sourceAnchor in pluginData)
Image persistence: PROVED in adapter & probe tests
```

---

## 🎯 Primary Goal & Requirements

Convert one local Vue 3 + TypeScript page into an editable, native OpenPencil document. Verify native editor document creation, save/reopen persistence, explicit layer names, stable source ownership mappings, complete source/style/asset backups, and offline rendering fidelity.

---

## 📋 Sequential Task Sequence for Milestone 1

### **Task 1.1 — Create and run `tests/spikes/openpencil-probe.ts` (Version & API Compatibility Spike)**
- **Action:** Create and execute `tests/spikes/openpencil-probe.ts` against installed OpenPencil packages (`@open-pencil/scene-graph`, `@open-pencil/core`, `@open-pencil/fig`, `@open-pencil/pen`, `@open-pencil/dom-css`) from upstream clone at commit `9d4fe4e421ac2be301a3d76a0c7d7883350656a8` (manifest version `0.14.0`, repo URL: `https://github.com/open-pencil/open-pencil`).
- **Target:** Test actual runtime package export execution and perform a minimal native save/reopen round trip in `tests/spikes/openpencil-probe.ts`. Pin the exact release details and record the verified document file format and extension (`original.<verified-ext>` and `working.<verified-ext>`).
- **Required Spike Answers:** Explicitly answer in handoff report:
  1. *Q1 (I/O Methods & Extension):* Official native document write/read I/O API and verified file extension (`.fig`, `.pen`, container).
  2. *Q2 (Release Pin & Reproducibility):* Repo URL (`https://github.com/open-pencil/open-pencil`), commit `9d4fe4e421ac2be301a3d76a0c7d7883350656a8`, manifest `0.14.0`, local path `C:/Users/disha/Documents/CODES/studio/open-pencil-upstream`, and lockfile state.
  3. *Q3 (Metadata & Layer ID Retention — Round Trip Required):* Layer ID & source anchor metadata retention verified via real native save/reopen round trip in `tests/spikes/openpencil-probe.ts`.
  4. *Q4 (Image Asset Encoding — Round Trip Required):* Image asset fill serialization (Buffer/Base64/container reference) verified via real native save/reopen round trip.
  5. *Q5 (Headless Runtime Export Execution):* Execution of actual installed runtime export functions under standard Node.js / Vitest.
- **Rule:** Do not change main converter code until package exports, runtime compatibility probe, native save/reopen, and document I/O methods are verified.

### **Task 1.2: Minimal Native Document Proof**
- **Action:** Create 1 minimal document with 1 frame and 1 native text node.
- **Verification:** Save and reopen through the official OpenPencil I/O path. Assert document type, node IDs, names, and text characters survive deserialization. Stop if this fails.

### **Task 1.3: Scene Contract Adapter & Native Serializer**
- **Action:** Adapt `@code-to-figma/contracts` `Scene` graph to verified OpenPencil scene graph schema (`@open-pencil/scene-graph`).
- **Rule:** Preserve explicit names, component source anchors, DOM IDs/classes, layer hierarchy, and raw PNG image bytes. Keep the shared `Scene` contract independent of editor-specific types.

### **Task 1.4: Complete Source Mappings & Multi-Asset Backups**
- **Action:** Update source mapping and backup generator:
  - Generate explicit `source-map.json` linking layer IDs to Vue SFC file locations, component anchors, exact DOM IDs, and valid CSS classes (do not guess class names).
  - Create immutable `source-backup/` snapshot containing Vue SFC components, scoped styles, and local image assets (`public/study.png`).

### **Task 1.5: Vue Fixture Conversion & Save/Reopen Persistence**
- **Authoritative scope:** [Task 1.5 in the roadmap](roadmap.md) requires actual unmodified editor opening, editing, saving and reopening, not another API-only test.
- **Action:** Use a fresh package from the Vue fixture (`tests/fixtures/vue`) containing cards, buttons, text, and local PNG image. Record editor version and baseline original-design, source-backup and sidecar hashes.
- **Verification:**
  - Save `original.<verified-ext>`. Verify native text editability and image asset presence.
  - Modify text and 1 visual property in a separate working copy `working.<verified-ext>`, save, and reopen in the editor runtime.
  - Verify edited text and visual property, names, hierarchy, metadata and image bytes/content. Preserve original HTML IDs through source metadata. Reconstruct regenerated editor IDs from stable anchors, checking uniqueness. Confirm original design and source-backup hashes remain unchanged.

### **Task 1.6: Offline Fidelity Report**
- **Action:** Capture source Vue page as `reference.png` and render/export original design `original.<verified-ext>` as `design-preview.png`.
- **Comparison:** Perform offline matching-size pixel and layout geometry comparison. Record bounds, typography, and asset diffs without interactive UI overlay scope.

### **Task 1.7: Milestone 1 Quality Gates**
- **Action:** Add native I/O unit and integration tests (`tests/integration/openpencil-io.test.ts`).
- **Verification:** Execute `pnpm check` (typecheck, lint, vitest, `pnpm build`, and `pnpm build:vue`) and `pnpm milestone1`. Authoritative contract: [milestone-01.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/milestone-01.md). Require zero errors before declaring Milestone 1 complete.

---

## 🚫 Deferred Until Milestone 1 Passes
- Source edit writeback (`applyTextWritebackContent`, `saveTextWritebackToFile`).
- Live synchronization & conflict handling.
- Multi-viewport capture, dashboard, database, microservices, or MCP servers.
