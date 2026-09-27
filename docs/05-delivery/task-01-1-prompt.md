# Coder AI Handoff Prompt: Milestone 1 — Task 1.1 (Version & API Compatibility Spike)

> **Instructions for the Coder AI:**  
> Copy and paste this prompt directly into your Coder AI coding assistant.

---

### 🤖 Role & Context
You are a senior TypeScript engineer working on **Code to Design** (converting Vue 3 + TypeScript interfaces into editable native OpenPencil layers).

You follow **Garry Tan "gstack" principles**: high-velocity execution, zero bloat, pure 3-layer architecture, and strict step-by-step progress without context overload.

---

### 📊 Current Project Readiness Status
```text
Milestone 1: INCOMPLETE (Task 1.1 complete; Tasks 1.2-1.7 remaining)
Task 1.1: COMPLETED & VERIFIED (tests/spikes/openpencil-probe.test.ts passing)
Existing project quality gate: PASSING (38/38 vitest tests, tsc, eslint, react build, vue build)
Native OpenPencil compatibility: VERIFIED (exportFigFile, readFigFile, parseFigFileSync, SceneGraph)
Native save/reopen: PROVED in probe
Metadata persistence: PROVED in probe
Image persistence: PROVED in probe
```

---

### 📖 Mandatory Documentation Reading & Authoritative Contract

#### 1. Authoritative Acceptance Contract (MUST READ FIRST):
- [milestone-01.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/milestone-01.md) — **The authoritative acceptance contract for Milestone 1 (Status: INCOMPLETE).**

#### 2. Essential Context & Rules:
- [AGENTS.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/AGENTS.md) — Working policy, confirmed OpenPencil target, single-task rule.
- [README.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/README.md) — Actual status & prototype execution commands.
- [roadmap.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/roadmap.md) — Sequential conversion roadmap (Milestone 1 ACTIVE).
- [implementation-plan.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/implementation-plan.md) — Milestone 1 implementation plan.
- [openpencil.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/openpencil.md) — OpenPencil package architecture and feasibility research.

#### 3. Code & Reference WHILE Coding:
- **Upstream OpenPencil Repo:** `C:/Users/disha/Documents/CODES/studio/open-pencil-upstream` (Repository URL: `https://github.com/open-pencil/open-pencil`, Commit: `9d4fe4e421ac2be301a3d76a0c7d7883350656a8`, Manifest version: `0.14.0`).
- [adapter.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.ts) — Current prototype serializer.

---

### 🎯 Your Assignment: Task 1.1 — Create and run `tests/spikes/openpencil-probe.ts`

**Task Goal:** Execute **Task 1.1** by creating `tests/spikes/openpencil-probe.ts`, testing actual installed OpenPencil package exports under Node.js / Vitest runtime, performing a minimal native save/reopen round trip, answering the 5 key questions, recording findings in `docs/02-research/openpencil.md`, and running `pnpm check`.

---

### ❓ Spike Key Questions to Answer (Include Answers in Task Handoff Report):

Your task execution **MUST** explicitly answer these 5 technical questions based on runtime probe execution and native save/reopen verification:

1. **Q1 (I/O Methods & Extensions):** Which exact package and function in OpenPencil provides native document write/read I/O (e.g. `exportFigFile` / `readFigFile`, `readPenFile`, `writeFigContainer`, etc.)? What is the official file extension (`.fig`, `.pen`, `.zip` container)?
2. **Q2 (Release Pin & Reproducibility):** Record the official repository URL (`https://github.com/open-pencil/open-pencil`), commit hash (`9d4fe4e421ac2be301a3d76a0c7d7883350656a8`), manifest versions (`0.14.0`), local path (`C:/Users/disha/Documents/CODES/studio/open-pencil-upstream`), and lockfile state so findings are reproducible on any system.
3. **Q3 (Metadata & Layer ID Retention — Round Trip Required):** Does `@open-pencil/scene-graph` preserve custom component anchors / source metadata (DOM IDs, Vue SFC paths, component names) when executing an actual native save and reopen round trip? *(Note: Type inspection alone is insufficient; execute a round trip in `tests/spikes/openpencil-probe.ts`).*
4. **Q4 (Image Asset Encoding — Round Trip Required):** How does OpenPencil serialize image fills (raw PNG Buffer, Base64 data URL, or container asset reference)? Does executing a native save/reopen round trip retain raw image bytes intact?
5. **Q5 (Headless Runtime Export Execution):** Does calling the actual runtime export functions inside `tests/spikes/openpencil-probe.ts` execute cleanly under standard Node.js / Vitest without DOM browser globals or native compilation binaries (Tauri/Rust)? *(Note: Importing types alone is insufficient; execute the exported functions).*

---

### 📌 Exact Execution Steps for Task 1.1:

1. **Create Compatibility Probe (`tests/spikes/openpencil-probe.ts`):**
   - Create `tests/spikes/openpencil-probe.ts`.
   - Import target packages (`@open-pencil/scene-graph`, `@open-pencil/core`, `@open-pencil/fig`, `@open-pencil/dom-css`, etc.).
   - Write executable probe functions and Vitest tests that invoke the actual runtime exports.
   - Construct a minimal 1-frame, 1-text node graph with sample metadata and PNG image bytes, save to disk, and reopen to prove native save/reopen I/O.

2. **Run & Verify Probe:**
   - Execute the probe via `vitest run tests/spikes/openpencil-probe.ts` or `pnpm check`.
   - Verify 0 type errors, 0 lint errors, and 0 runtime crashes under Node.js.

3. **Update Research Documentation:**
   - Record findings, exact I/O function names, verified file extension (`original.<verified-ext>`), release pin details, and answers to Q1-Q5 in [openpencil.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/openpencil.md).

4. **Quality Gate:**
   - Run `pnpm check` (validates `tsc`, `eslint`, vitest tests including the new spike probe, `pnpm build`, and `pnpm build:vue`).
   - Require 100% pass with 0 errors.

---

### 🚫 Scope Exclusions (Do NOT do these in this task):
- Do NOT alter main converter code (`packages/core/src/modules/openpencil/adapter.ts`) yet.
- Do NOT alter Vue SFC writeback code.
- Do NOT implement live UI overlays or background file watchers.
- Do NOT rewrite `@code-to-figma/contracts` shared scene graph types.

---

### 🚀 Step-by-Step Execution Checklist:

1. [ ] Read [milestone-01.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/milestone-01.md) and required documentation files.
2. [ ] Create `tests/spikes/openpencil-probe.ts` and test actual runtime package exports.
3. [ ] Perform minimal native save/reopen round trip in probe test to verify metadata & image byte persistence.
4. [ ] Answer the 5 Spike Key Questions (Q1-Q5) and record findings in `docs/02-research/openpencil.md`.
5. [ ] Run `pnpm check` (including `pnpm build:vue` and `openpencil-probe.ts`) and verify 0 errors.
6. [ ] Stop and hand back reproducible probe evidence, test results, and answers to Q1-Q5.
