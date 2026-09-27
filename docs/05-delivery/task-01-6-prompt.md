# Coder AI Master Handoff Prompt: Milestone 1 — Task 1.6 (Offline Fidelity Report)

> **Instructions for AI Assistants (Cursor, Gemini, Claude, Antigravity, ChatGPT, etc.):**  
> Copy and paste this prompt directly into your AI coding assistant. Follow all linked documentation files and rules strictly. Implement Task 1.6 now; do not produce another planning-only response.

---

### 📖 Project Narrative & Architectural Context

#### 1. Project Goal & Origin
The goal of **Code to Design** is to convert running Vue 3 + TypeScript web interfaces into editable native OpenPencil (`.fig`) design layers, attaching durable source anchors (`pluginData`) that enable visual edit writebacks to original Vue SFC source code.

#### 2. Why We Were Getting Stuck (Root Cause & Resolution)
- **The Custom JSON Trap:** Earlier prototype iterations generated custom JSON files (`.openpencil`) rather than official OpenPencil binary `.fig` document files. This was audited and corrected on 2026-09-13.
- **Headless Node.js vs. Desktop GUI Boundary:** Programmatic integration tests execute in headless Node.js using `@open-pencil/core`, `@open-pencil/fig`, and `@open-pencil/scene-graph` WASM codecs. They can verify native `.fig` file generation, parsing, layer hierarchy, and source anchor retention, BUT they cannot open an interactive desktop GUI window or simulate mouse clicks inside the OpenPencil electron application.
- **3-Layer Architecture Isolation:** Moving `@open-pencil/*` dependencies out of `@code-to-figma/core` into `@code-to-figma/tooling` resolved browser bundle build failures for the Figma plugin IIFE (`apps/figma-plugin`).

#### 3. Verified Repository Baseline (Tasks 1.1–1.5 Complete)
- **Task 1.1:** OpenPencil v0.14.0 API spike & isolated probe passing (`exportFigFile`, `parseFigFile`, PNG byte retention).
- **Task 1.2:** Identity reconstruction proof across save/reopen cycles via `extractAndValidateSourceMap`.
- **Task 1.3:** Pure 3-layer `convertSceneToOpenPencilGraph` adapter in `packages/tooling/openpencil-io.ts`.
- **Task 1.4:** Provenance sidecar `source-map.json` using JSON tuple anchors (`[sourceFile, sourceId, kind]`), DOM attribute capture, and multi-asset snapshot backups (`source-backup/App.vue`, `style.css`, `public/study.png`) with SHA-256 manifest verification.
- **Task 1.5:** Verified multi-property native `.fig` persistence across text edits and solid fill color updates in `tests/integration/openpencil-persistence.test.ts`.
- **Monorepo Quality Gate:** **52/52 Vitest tests passing across 16 test files**, 0 `tsc` errors, 0 `eslint` errors, 100% clean production builds.

---

### 🎯 The Next Job: Milestone 1 — Task 1.6 (Offline Fidelity Report)

**Task Goal:** Compare the visual layout, typography, bounds, and image fidelity between the source Vue 3 page render (`reference.png`) and the exported OpenPencil design document (`design-preview.png`) offline without requiring an interactive UI overlay:

1. Capture the DOM snapshot of the running Vue fixture page as `reference.png`.
2. Render/export the generated `original.fig` design document into `design-preview.png`.
3. Perform matching-size pixel and layout geometry comparison (layer bounds, typography metrics, color spaces, image asset diffs).
4. Write a quantitative fidelity report in `evidence/fidelity-report.json` and `evidence/fidelity-report.md`.

---

### ❓ Key Verification Questions Embedded in Prompt (AI Assistant MUST Answer During Execution)

When executing Task 1.6, the AI assistant MUST address and verify the following 4 technical questions in its final report:

1. **Pixel & Dimension Alignment:**  
   *Question:* How do we verify that `reference.png` (captured DOM) and `design-preview.png` (rendered `.fig`) share identical pixel dimensions and aspect ratios, and what delta threshold is acceptable for sub-pixel text rendering?  
   *Target:* Ensure viewport width, height, and node bounding boxes match within acceptable tolerances.

2. **Typography & Font Fallback Fidelity:**  
   *Question:* How are custom web fonts or system fallback fonts handled when rendering `.fig` canvas nodes offline, and how do line-height / letter-spacing differences manifest in visual diffs?  
   *Target:* Measure text bounding box discrepancies and document font family mapping accuracy.

3. **Color Space & Solid Fill Accuracy:**  
   *Question:* Are CSS HSL/RGB colors in the Vue component translated 1:1 into OpenPencil normalized RGBA floats (`{ r, g, b, a }`), and do rendered pixel colors match expected hex values?  
   *Target:* Verify zero color drift between CSS computed styles and OpenPencil node fill properties.

4. **Offline Canvas Rendering vs. Interactive GUI Limitation:**  
   *Question:* What visual elements (e.g. CSS shadow effects, backdrop filters, SVG vectors) require specialized fallback handling in headless rendering, and how are these limitations logged in `evidence/fidelity-report.json`?  
   *Target:* Ensure exact layer-by-layer diff summary and explicit limitations are recorded in `fidelity-report.json`.

---

### 🔗 Complete File & Specification Sitemap (Linked for Direct Navigation)

#### 1. Authoritative Contracts & Delivery Rules:
- [milestone-01.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/milestone-01.md) — **Authoritative Acceptance Contract for Milestone 1**
- [AGENTS.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/AGENTS.md) — Working Policy, Upstream Adapter Rules & Handoff Guidelines
- [README.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/README.md) — Project Overview & Command Reference
- [roadmap.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/roadmap.md) — Sequential Conversion Roadmap
- [implementation-plan.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/implementation-plan.md) — Detailed Implementation Plan
- [openpencil.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/openpencil.md) — Empirical OpenPencil Research & Q1–Q5 Findings

#### 2. Core Source Code Files to Edit & Reference:
- [openpencil-io.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/openpencil-io.ts) — Native OpenPencil `.fig` I/O Adapter
- [milestone1.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/milestone1.ts) — Milestone 1 Package Generator & Fidelity Importer
- [openpencil-persistence.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/integration/openpencil-persistence.test.ts) — Persistence Integration Suite
- [milestone1-fixture.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/integration/milestone1-fixture.test.ts) — Milestone 1 Integration Suite

---

### 📌 Execution Instructions for Task 1.6:

1. Run `pnpm check` to ensure clean baseline before initiating fidelity report.
2. Implement offline image comparison utility in `packages/tooling/fidelity-reporter.ts` or test suite.
3. Compare `reference.png` and `design-preview.png` metrics.
4. Record structured JSON report in `evidence/fidelity-report.json` and human-readable Markdown summary in `evidence/fidelity-report.md`.
5. Answer all 4 embedded verification questions in the final task handoff output.
