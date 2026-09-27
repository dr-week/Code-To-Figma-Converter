# Coder AI Handoff Prompt: Milestone 2 — Task 3

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
- [capture.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/integration/capture.test.ts) — Integration test reference for Playwright / Vite browser capture.
- [App.vue](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/fixtures/vue/src/App.vue) — Target Vue 3 fixture file.

---

### 🎯 Your Assignment: Milestone 2 — Task 3 Only

**Task Goal:** Implement an **End-to-End Writeback & Recapture Integration Test** verifying that a visual text edit written back to a Vue SFC file is rendered by Vite and captured correctly into an updated OpenPencil graph.

#### 📌 Exact Requirements for Task 3:
1. **Integration Test Location:**
   Create an integration test in `tests/integration/writeback-recapture.test.ts`:
   - Setup: Create a temporary working copy of `tests/fixtures/vue/src/App.vue` in a test directory.
   - Step 1: Execute `saveTextWritebackToFile()` targeting `project-title` (`Every element has a name.` -> `Updated Title via OpenPencil.`).
   - Step 2: Verify that `.backup/` snapshot is created and `App.vue` content was updated on disk.
   - Step 3: Launch Vite dev server on the updated Vue fixture.
   - Step 4: Call `captureProject()` via Playwright headless browser capture.
   - Step 5: Assert that the newly captured OpenPencil scene graph contains a text node with `text: "Updated Title via OpenPencil."` while retaining explicit layer names (`Project/Title`) and coordinate layout.
   - Cleanup: Close dev server and restore temporary test files.
2. **Quality & Verification Gate:**
   - Run `pnpm test` and `pnpm check`.
   - Ensure 100% of tests pass, `tsc` has 0 errors, `eslint` has 0 errors, and `pnpm build` succeeds.

---

### 🚫 Scope Exclusions (Do NOT do these in this task):
- Do NOT implement visual color writeback (Task 4).
- Do NOT add background file watchers or live two-way sync loops.
- Do NOT modify existing contracts or core package exports.

---

### 🚀 Step-by-Step Execution Checklist:

1. [ ] Read the required markdown docs above.
2. [ ] Create `tests/integration/writeback-recapture.test.ts`.
3. [ ] Implement test flow: Writeback -> Save -> Vite Serve -> Capture -> Assert OpenPencil Text Node.
4. [ ] Run `pnpm check` and verify 0 type/lint/test errors.
5. [ ] Stop and hand back reproducible test evidence.
