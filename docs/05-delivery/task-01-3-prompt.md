# Coder AI Master Handoff Prompt: Milestone 1 — Task 1.3 (Scene Contract Adapter & Native Serializer)

> **Instructions for AI Assistants (Cursor, Gemini, Claude, Antigravity, ChatGPT, etc.):**  
> Copy and paste this prompt directly into your AI coding assistant. Follow all linked documentation files and rules strictly. Implement Task 1.3 now; do not produce another planning-only response.

---

### 🤖 Role & Architecture Policy
You are a senior TypeScript engineer working on **Code to Design** (converting Vue 3 + TypeScript interfaces into editable native OpenPencil layers).

You follow **Garry Tan "gstack" principles**: high-velocity execution, zero bloat, pure 3-layer architecture, and strict step-by-step progress without context overload.

---

### 📊 Current Project Readiness Status
```text
Milestone 1: INCOMPLETE (Tasks 1.1 & 1.2 complete; Task 1.3 ACTIVE)
Task 1.1: COMPLETED & VERIFIED (API spike & isolated probe)
Task 1.2: COMPLETED & VERIFIED (Stable source identity proof across 2 cycles)
Task 1.3: ACTIVE (Scene Contract Adapter & Native Serializer)
Existing project quality gate: PASSING (45/45 vitest tests, tsc, eslint, react build, vue build)
Native OpenPencil compatibility: VERIFIED (exportFigFile, parseFigFile, SceneGraph)
Source Anchor mapping: VERIFIED (code-to-design:sourceAnchor in pluginData)
```

---

### 🔗 Complete File & Specification Sitemap (Linked for Direct Navigation)

#### 1. Authoritative Contracts & Delivery Rules:
- [milestone-01.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/milestone-01.md) — **Authoritative Acceptance Contract for Milestone 1**
- [AGENTS.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/AGENTS.md) — Working Policy, Target Editor & 3-Layer Boundaries
- [README.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/README.md) — Project Overview & Command Reference
- [roadmap.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/roadmap.md) — Sequential Conversion Roadmap
- [implementation-plan.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/implementation-plan.md) — Detailed Implementation Plan
- [openpencil.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/openpencil.md) — Empirical OpenPencil Research & Q1–Q5 Findings
- [verification-audit.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/verification-audit.md) — Verification Audit & Baseline Status

#### 2. Architecture & Design Specifications:
- [overview.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/03-architecture/overview.md) — 3-Layer Architecture (Presentation, Application/Domain, Infrastructure)
- [repository-map.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/03-architecture/repository-map.md) — Monorepo Architecture & Directory Structure
- [decisions.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/03-architecture/decisions.md) — Architecture Decision Log (ADR-011 Target Confirmation)
- [naming spec](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/04-modules/naming/spec.md) — Layer Naming Rules & Explicit Name Retention
- [scene spec](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/04-modules/scene/spec.md) — Scene Graph & Contract Specification

#### 3. Core Source Code Files to Edit & Reference:
- [contracts index](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/contracts/src/index.ts) — Shared `Scene` Contract Types
- [adapter.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.ts) — OpenPencil Adapter Module (**Target File for Task 1.3 Edits**)
- [adapter.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.test.ts) — Adapter Unit Tests
- [openpencil-io.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/openpencil-io.ts) — OpenPencil Native I/O Adapter
- [core index.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/index.ts) — Core Package Root Exports
- [probe.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/spikes/openpencil/probe.ts) — Reference Probe with `extractAndValidateSourceMap`
- [openpencil-probe.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/spikes/openpencil-probe.test.ts) — Passing Probe Vitest Suite
- [package.json](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/package.json) — Workspace Scripts & `pnpm check` Suite

---

### 🎯 Your Assignment: Milestone 1 — Task 1.3 Only

**Task Goal:** Implement `convertSceneToOpenPencilGraph`, `exportSceneToOpenPencilFig`, and `parseOpenPencilFig` in [adapter.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.ts), adapting `@code-to-figma/contracts` `Scene` graph into a native `@open-pencil/scene-graph` `SceneGraph` with native `pluginData` sourceAnchors.

---

### 📌 Exact Technical Requirements for Task 1.3:

1. **Pure Domain Boundary:**
   - Keep shared `@code-to-figma/contracts` `Scene` contract 100% independent of OpenPencil internal AST types.
   - Domain conversion logic in [adapter.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.ts) maps `SceneNode` kinds:
     - `frame` $\rightarrow$ `SceneGraph.createNode('FRAME', parentId, { name, x, y, width, height, opacity, fills, strokes, strokeWeight, cornerRadius, pluginData })`
     - `text` $\rightarrow$ `SceneGraph.createNode('TEXT', parentId, { name, text, x, y, width, height, opacity, fontFamily, fontSize, lineHeight, pluginData })`
     - `image` $\rightarrow$ `SceneGraph.createNode('RECTANGLE', parentId, { name, x, y, width, height, opacity, fills: [{ type: 'IMAGE', imageHash }], pluginData })`

2. **Native Source Anchors & Assets:**
   - Attach native `pluginData` to every created node:
     `[{ pluginId: 'code-to-design', key: 'sourceAnchor', value: sceneNode.id }]`
   - Map `scene.assets` (array of `{ id: string, bytes: number[] }`) into `SceneGraph.images` map (`Map<string, Uint8Array>`), converting asset byte arrays to Uint8Arrays indexed by asset ID hash.

3. **Native Serialization & Deserialization I/O:**
   - Implement `exportSceneToOpenPencilFig(scene: Scene): Promise<Uint8Array>` using `exportFigFile(graph)`.
   - Implement `parseOpenPencilFig(bytes: Uint8Array): Promise<SceneGraph>` using `parseFigFile(bytes.buffer)`.
   - Export the native I/O functions from [openpencil-io.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/openpencil-io.ts) and the existing package entrypoints.

4. **Unit Tests in `adapter.test.ts`:**
   - Update [adapter.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.test.ts) to test:
     - Conversion of a full `Scene` (frame + text + image) into a native `SceneGraph`.
     - Exporting `Scene` to `.fig` bytes and parsing back to `SceneGraph`.
     - Reconstructing layer identity using `extractAndValidateSourceMap` across save/reopen cycles.
     - Verifying preserved layer names, text content, parent hierarchy, and raw image byte equality.

5. **Quality & Verification Gate:**
   - Run `pnpm check` (typecheck, lint, vitest tests, React build, Vue build).
   - Require 100% pass with zero errors before handing back.

---

### 🚫 Scope Exclusions (Do NOT do these in this task):
- Do NOT alter Vue SFC writeback code (`packages/core/src/modules/source-mapping/writeback.ts`).
- Do NOT implement live UI overlays or background file watchers.
- Do NOT rewrite `@code-to-figma/contracts` shared scene graph types.

---

### 🚀 Step-by-Step Execution Checklist:

1. [ ] Read mandatory documentation links above.
2. [ ] Implement native scene adapter functions in [adapter.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.ts).
3. [ ] Re-export new functions through the existing package entrypoints.
4. [ ] Write native adapter unit tests in [adapter.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.test.ts).
5. [ ] Run `pnpm check` and verify 0 type/lint/test/build errors.
6. [ ] Hand back task summary and test results.
