# Coder AI Handoff Prompt: Milestone 2 — Task 4

> **Instructions for the Coder AI:**  
> Copy and paste this prompt directly into your Coder AI coding assistant.

---

### 🤖 Role & Context
You are a senior TypeScript engineer working on **Code to Design** (converting Vue 3 + TypeScript interfaces into editable OpenPencil layers, and supporting controlled visual edit writeback to original Vue SFC source).

You follow **Garry Tan "gstack" principles**: high-velocity execution, zero bloat, pure 3-layer architecture, and strict step-by-step progress without context overload.

---

### 📖 Mandatory Documentation Reading

#### 1. Read BEFORE Writing Any Code:
- [AGENTS.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/AGENTS.md) — Working policy & strict "one task at a time" rules.
- [README.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/README.md) — Actual status & prototype execution commands.
- [roadmap.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/roadmap.md) — Sequential roadmap & Milestone 2 breakdown.
- [implementation-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/implementation-prompt.md) — Garry Tan "gstack" master prompt guide.

#### 2. Code Reference WHILE Coding:
- [writeback.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/source-mapping/writeback.ts) — Pure domain text writeback logic (`applyTextWritebackContent`).
- [file-adapter.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/file-adapter.ts) — Infrastructure file saver adapter (`saveTextWritebackToFile`).
- [App.vue](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/fixtures/vue/src/App.vue) — Target Vue 3 fixture file.

---

### 🎯 Your Assignment: Milestone 2 — Task 4 Only

**Task Goal:** Implement **Controlled Solid Fill Color Writeback** to allow visual fill color changes in OpenPencil (e.g. `{ r: 1, g: 0, b: 0, a: 1 }`) to update inline `style="..."` hex/rgb color attributes or scoped CSS rules in Vue SFC files (`App.vue`).

#### 📌 Exact Requirements for Task 4:
1. **Pure Domain Logic Extension:**
   Add `applyColorWritebackContent()` in `packages/core/src/modules/source-mapping/color-writeback.ts` (or `writeback.ts`):
   - Accepts `fileContent`, `mappingEntry`, `newFillColor` (`{ r, g, b, a }`), and optional `expectedSourceHash`.
   - Converts RGBA color object to canonical hex string (e.g., `#FF0000`).
   - Anchors target node by `data-source-id` / `data-figma-id`.
   - Updates inline `style="background-color: ..."` or `style="color: ..."` on the element.
   - If target element has no inline style, safely adds or updates the `style` attribute without breaking existing element attributes.
   - Validates source hash before mutating.
2. **Infrastructure Saver Integration:**
   - Integrate color writeback into file adapter (`saveColorWritebackToFile`) with pre-edit `.backup/App.vue.<timestamp>.bak` snapshot creation.
3. **Unit Tests:**
   Create unit tests verifying:
   - Successful hex color replacement on inline style attributes.
   - Pre-edit rollback snapshot generation.
   - Rejection on hash mismatch.
4. **Quality & Verification Gate:**
   - Run `pnpm test` and `pnpm check`.
   - Ensure 100% of tests pass, `tsc` has 0 errors, `eslint` has 0 errors, and `pnpm build` succeeds.

---

### 🚫 Scope Exclusions (Do NOT do these in this task):
- Do NOT implement dynamic CSS variable parsing or external stylesheet updates.
- Do NOT add background live sync listeners or file watchers.
- Do NOT break existing text writeback functionality.

---

### 🚀 Step-by-Step Execution Checklist:

1. [ ] Read the required markdown docs above.
2. [ ] Implement pure domain color writeback logic.
3. [ ] Add infrastructure file saver integration & backup generation.
4. [ ] Write unit tests verifying color writeback.
5. [ ] Run `pnpm check` and verify 0 type/lint/test errors.
6. [ ] Stop and hand back reproducible test evidence.
