# Coder AI Handoff Prompt: Milestone 3 — Unified CLI Writeback Orchestration

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
- [roadmap.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/roadmap.md) — Sequential roadmap & Milestone 2/3 breakdown.
- [implementation-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/implementation-prompt.md) — Garry Tan "gstack" master prompt guide.

#### 2. Code Reference WHILE Coding:
- [main.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/apps/cli/src/main.ts) — CLI entrypoint.
- [writeback.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/source-mapping/writeback.ts) — Pure domain text writeback logic.
- [file-adapter.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/file-adapter.ts) — Infrastructure file saver adapter.
- [adapter.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.ts) — OpenPencil serializer & deserializer.

---

### 🎯 Your Assignment: Milestone 3 — Unified CLI Writeback Orchestration

**Task Goal:** Implement a CLI command in `apps/cli` (`pnpm writeback <package-dir>`) that orchestrates reading an edited `.openpencil` document package, comparing modified layers against `source-map.json`, executing controlled SFC writebacks to Vue source, and outputting `writeback-manifest.json`.

#### 📌 Exact Requirements for Milestone 3:
1. **CLI Command Implementation (`apps/cli/src/main.ts`):**
   - Accept argument `<package-dir>` (pointing to `.artifacts/milestone-01/<capture-id>/`).
   - Read `manifest.json`, `source-map.json`, `design/original.fig`, and `design/working.fig`.
   - Deserialize both native `.fig` documents and diff modified nodes (text characters, fill colors).
   - Match modified layer IDs against `source-map.json` entries.
   - For each modified node with `supportsWriteback: true`, invoke the file saver adapter (`saveTextWritebackToFile` or `saveColorWritebackToFile`).
   - Write execution results and diff summary to `.artifacts/milestone-01/<capture-id>/writeback-manifest.json`.
2. **Integration Test:**
   Create `tests/integration/cli-writeback.test.ts` verifying:
   - CLI command execution on a mock milestone package directory.
   - Verification that `App.vue` was modified and `.backup/` snapshot was created.
   - Verification that `writeback-manifest.json` contains valid status metadata.
3. **Quality & Verification Gate:**
   - Run `pnpm test` and `pnpm check`.
   - Ensure 100% of tests pass, `tsc` has 0 errors, `eslint` has 0 errors, and `pnpm build` succeeds.

---

### 🚫 Scope Exclusions (Do NOT do these in this task):
- Do NOT build an interactive web dashboard, cloud database, or MCP server.
- Do NOT implement background live-reloading or file watchers.
- Do NOT break existing capture or plugin builds.

---

### 🚀 Step-by-Step Execution Checklist:

1. [ ] Read the required markdown docs above.
2. [ ] Implement `pnpm writeback` orchestration in `apps/cli/src/main.ts`.
3. [ ] Add CLI integration test in `tests/integration/cli-writeback.test.ts`.
4. [ ] Run `pnpm check` and verify 0 type/lint/test errors.
5. [ ] Stop and hand back reproducible test evidence.
