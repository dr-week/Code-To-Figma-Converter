# Coder AI Handoff Prompt: Milestone 2 — Task 2

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
- [roadmap.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/roadmap.md) — Sequential conversion roadmap & Milestone 2 breakdown.
- [implementation-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/implementation-prompt.md) — Garry Tan "gstack" master prompt guide.

#### 2. Code Reference WHILE Coding:
- [writeback.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/source-mapping/writeback.ts) — Pure domain writeback logic (`applyTextWritebackContent`).
- [writeback.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/source-mapping/writeback.test.ts) — Domain unit test examples.
- [overview.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/03-architecture/overview.md) — Three-layer architecture guidelines (Infrastructure vs. Domain).
- [App.vue](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/fixtures/vue/src/App.vue) — Target Vue 3 fixture file.

---

### 🎯 Your Assignment: Milestone 2 — Task 2 Only

**Task Goal:** Implement the **Infrastructure File Saver Adapter** (`saveTextWritebackToFile`) that connects pure domain writeback logic to the Node.js filesystem.

#### 📌 Exact Requirements for Task 2:
1. **Infrastructure Adapter Location:**
   Create an infrastructure adapter function (e.g., in `packages/core/src/modules/source-mapping/file-adapter.ts` or infrastructure module):
   - Reads the target `.vue` file from disk using `fs/promises`.
   - Computes its current SHA-256 hash using `crypto`.
   - Passes file content and hash to pure domain logic (`applyTextWritebackContent`).
   - If hash mismatches or dynamic binding is detected, returns error without touching the disk.
   - If successful, writes an immutable pre-edit rollback backup copy to `.backup/App.vue.<timestamp>.bak`.
   - Writes the updated `.vue` content to disk.
   - Returns execution result metadata (status, backup path, diff).
2. **Unit Tests:**
   Create unit tests verifying:
   - Successful file write and backup creation on temporary test files.
   - Rollback backup content byte-for-byte equality with original source.
   - File remains untouched if domain validation fails.
3. **Quality & Verification Gate:**
   - Run `pnpm test` and `pnpm check`.
   - Ensure 100% of tests pass, `tsc` has 0 errors, `eslint` has 0 errors, and `pnpm build` succeeds.

---

### 🚫 Scope Exclusions (Do NOT do these in this task):
- Do NOT implement visual color writeback (Task 4).
- Do NOT implement live synchronization or background file watchers.
- Do NOT modify the browser capture logic or add external services.

---

### 🚀 Step-by-Step Execution Checklist:

1. [ ] Read the required markdown docs above.
2. [ ] Write the infrastructure file saver adapter.
3. [ ] Add unit tests for file I/O & backup snapshot generation.
4. [ ] Run `pnpm check` and verify 0 type/lint/test errors.
5. [ ] Stop and hand back reproducible test evidence.
