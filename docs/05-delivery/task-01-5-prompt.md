# Coder AI Master Handoff Prompt: Milestone 1 — Task 1.5 (Actual OpenPencil Editor Persistence)

> **Instructions for AI Assistants (Cursor, Gemini, Claude, Antigravity, ChatGPT, etc.):**  
> Copy and paste this prompt directly into your AI coding assistant. Follow all linked documentation files and rules strictly. Implement Task 1.5 now; do not produce another planning-only response.

---

### 📖 Project Narrative & Architectural Context

#### 1. Project Goal & Origin
The goal of **Code to Design** is to convert running Vue 3 + TypeScript web interfaces into editable native OpenPencil (`.fig`) design layers, attaching durable source anchors (`pluginData`) that enable visual edit writebacks to original Vue SFC source code.

#### 2. Why We Were Getting Stuck (Root Cause & Resolution)
- **The Custom JSON Trap:** Earlier prototype iterations generated custom JSON files (`.openpencil`) rather than official OpenPencil binary `.fig` document files. This was audited and corrected on 2026-09-13.
- **Headless Node.js vs. Desktop GUI Boundary:** Programmatic integration tests execute in headless Node.js using `@open-pencil/core`, `@open-pencil/fig`, and `@open-pencil/scene-graph` WASM codecs. They can verify native `.fig` file generation, parsing, layer hierarchy, and source anchor retention, BUT they cannot open an interactive desktop GUI window or simulate mouse clicks inside the OpenPencil electron application.
- **3-Layer Architecture Isolation:** Moving `@open-pencil/*` dependencies out of `@code-to-figma/core` into `@code-to-figma/tooling` resolved browser bundle build failures for the Figma plugin IIFE (`apps/figma-plugin`).

#### 3. Verified Repository Baseline
- **Task 1.1:** OpenPencil v0.14.0 API spike & isolated probe passing (`exportFigFile`, `parseFigFile`, PNG byte retention).
- **Task 1.2:** Identity reconstruction proof across save/reopen cycles via `extractAndValidateSourceMap`.
- **Task 1.3:** Pure 3-layer `convertSceneToOpenPencilGraph` adapter in `packages/tooling/openpencil-io.ts`.
- **Task 1.4:** Provenance sidecar `source-map.json` using JSON tuple anchors (`[sourceFile, sourceId, kind]`), DOM attribute capture, and multi-asset snapshot backups (`source-backup/App.vue`, `style.css`, `public/study.png`) with SHA-256 manifest verification.
- **Monorepo Quality Gate:** **51/51 Vitest tests passing**, 0 `tsc` errors, 0 `eslint` errors, 100% clean production builds.

---

### 🎯 The Next Job: Milestone 1 — Task 1.5 (Actual OpenPencil Editor Persistence)

**Task Goal:** Verify native `.fig` persistence and document uncorrupted editing using unmodified OpenPencil package APIs:
1. Generate a fresh Vue fixture package (`original.fig`, `source-backup/`, `source-map.json`).
2. Open `original.fig`, edit one text node content and one visual property (e.g. fill color or border width), and save a separate `working.fig`.
3. Reopen `working.fig` and verify that updated text, visual property, layer hierarchy, source anchors, and original backup hashes remain intact and uncorrupted.

---

### ❓ Key Verification Questions Embedded in Prompt (AI Assistant MUST Answer During Execution)

When executing Task 1.5, the AI assistant MUST address and verify the following 4 technical questions in its final report:

1. **Source Anchor Preservation:**  
   *Question:* How do we confirm that editing text characters and solid fill colors in `working.fig` does NOT alter or strip the `code-to-design:sourceAnchor` `pluginData` tuples?  
   *Target:* Verify `extractAndValidateSourceMap` succeeds on the re-opened `working.fig`.

2. **PNG Image Asset Byte Fidelity:**  
   *Question:* How do we prove that image asset bytes (`graph.images.get(hash)`) remain 100% byte-identical after saving and parsing `working.fig`?  
   *Target:* Assert SHA-256 hash equality between original PNG asset bytes and recovered `working.fig` image bytes.

3. **Multi-Asset Backup Integrity:**  
   *Question:* How do we verify that source component backups (`App.vue`), stylesheets (`style.css`), and static images (`public/study.png`) remain immutable and match `manifest.json` hashes?  
   *Target:* Assert file existence and SHA-256 hash matches for all entries in `manifest.json`.

4. **Headless vs. GUI Limitation Transparency:**  
   *Question:* What explicit limitations are recorded in `evidence/validation.json` to distinguish programmatic WASM codec persistence from visual desktop GUI editing?  
   *Target:* Ensure `status: 'INCOMPLETE'` and explicit `limitations` strings are documented in `validation.json`.

---

### 🔗 Complete File & Specification Sitemap (Linked for Direct Navigation)

#### 1. Authoritative Contracts & Delivery Rules:
- [milestone-01.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/milestone-01.md) — **Authoritative Acceptance Contract for Milestone 1**
- [AGENTS.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/AGENTS.md) — Working Policy, Target Editor & 3-Layer Boundaries
- [README.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/README.md) — Project Overview & Command Reference
- [roadmap.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/roadmap.md) — Sequential Conversion Roadmap
- [implementation-plan.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/implementation-plan.md) — Detailed Implementation Plan
- [openpencil.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/openpencil.md) — Empirical OpenPencil Research & Q1–Q5 Findings
- [task-01-4-metadata.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-01-4-metadata.md) — Task 1.4 Metadata & Identity Evidence

#### 2. Core Source Code Files to Edit & Reference:
- [openpencil-io.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/openpencil-io.ts) — Native OpenPencil `.fig` I/O Adapter & `convertSceneToOpenPencilGraph`
- [openpencil-io.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/openpencil-io.test.ts) — Native OpenPencil I/O Vitest Suite
- [file-adapter.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/file-adapter.ts) — Infrastructure Backup & File Saver Adapter
- [milestone1.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/milestone1.ts) — Milestone 1 Package Generator (`original.fig`, `working.fig`, `source-backup/`, `source-map.json`)
- [milestone1-fixture.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/integration/milestone1-fixture.test.ts) — Milestone 1 Integration Suite
- [openpencil-probe.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/spikes/openpencil-probe.test.ts) — Upstream OpenPencil Compatibility Probe Suite

---

### 📌 Exact Technical Requirements for Task 1.5:

1. **Unmodified Public Editor API Verification**:
   - Use documented public OpenPencil package APIs (`@open-pencil/core`, `@open-pencil/fig`, `@open-pencil/scene-graph`).
   - Do NOT fork, patch, rebuild, or modify OpenPencil app, vendored source, or installed package files.

2. **Package Artifact Generation & Hash Recording**:
   - Verify `original.fig`, `source-backup/` (`App.vue`, `style.css`, `public/study.png`), `source-map.json`, and `manifest.json` are created under a unique capture folder (e.g. `.artifacts/milestone-01/capture-<uuid>`).
   - Baseline SHA-256 hashes of all source backup files MUST be immutably recorded in `manifest.json`.

3. **Native `.fig` Edit & Save Verification**:
   - Create a `working.fig` representing an edited document state (modifying one text character sequence and one solid fill color or border property).
   - Reopen `working.fig` via `parseOpenPencilFig` / native OpenPencil loader.
   - Verify both modified text and modified visual properties persist accurately.

4. **Source Anchor & Identity Reconstruction**:
   - Extract `pluginData` sourceAnchors (`code-to-design:sourceAnchor`) from re-opened document nodes.
   - Reconstruct target layer mappings via `extractAndValidateSourceMap` across the save/reopen cycle.
   - Reject missing or duplicate source anchors; never treat internal node IDs as permanent source identity.

5. **Image & Hierarchy Fidelity**:
   - Verify image asset bytes (`graph.images.get(hash)`) remain intact and match original PNG byte array.
   - Verify parent-child node relationships survive without structural corruption.

6. **Quality & Verification Gate**:
   - Run `pnpm check` (typecheck, lint, vitest tests, React build, Vue build).
   - Ensure all tests pass cleanly with 0 errors.

---

### 🚀 Step-by-Step Execution Checklist:

1. [ ] Read mandatory narrative and technical requirements above.
2. [ ] Implement Task 1.5 persistence verification suite in `tests/integration/openpencil-persistence.test.ts` or `milestone1.ts`.
3. [ ] Answer the 4 embedded verification questions with concrete test evidence.
4. [ ] Run `pnpm check` and verify 0 type/lint/test/build errors.
5. [ ] Hand back task completion report.
