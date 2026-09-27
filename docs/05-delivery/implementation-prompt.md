# AI Developer Master Instruction & Prompt Guide ("gstack" Standard)

> **Integration boundary confirmed by the user:** OpenPencil remains an external, independently maintained editor. Use documented public APIs through a thin infrastructure adapter and pin tested versions. Do not fork, patch, rebuild or modify the OpenPencil application, upstream source or installed packages; do not depend on private internals. Report unsupported capabilities instead of taking on editor development. Validate upstream upgrades separately with compatibility tests. This rule supersedes any older suggestion to rebuild or customize the editor.

> **Status correction, 2026-09-13: Milestone 1 INCOMPLETE.** The completion/native-editor claims below are superseded by the [verification audit](verification-audit.md). Existing output is custom prototype JSON, not verified OpenPencil output. Actual editor rendering, editing and save/reopen remain unverified. Milestone 2 work is inactive; retain its existing code without expanding it. Complete milestone-1 gates first.

> **Instructions for AI Assistants (Cursor, Gemini, Claude, Antigravity, ChatGPT, etc.):**  
> Read this entire document before performing any task in this codebase. This prompt is pre-engineered with all project rules, architectural constraints, "gstack" high-velocity principles, and active milestone objectives.

---

## 🎯 Core Assignment & Active Milestone

- **Project:** `Code to Design` (Vue 3 + TypeScript → OpenPencil editor target).
- **Target Editor:** `open-pencil/open-pencil` ([openpencil.dev](https://openpencil.dev), MIT License).
- **Current Status:** **Milestone 1 is INCOMPLETE and currently ACTIVE.**
- **Active Assignment:** **Milestone 1: Verification & Native OpenPencil Integration**.

---

## ⚡ The Garry Tan "gstack" Engineering Mindset

1. **High-Velocity, Zero-Bloat:** Focus exclusively on shipping core capability. Spend 100% of engineering effort on solving the direct user goal—never on unnecessary microservices, cloud servers, or speculative abstractions.
2. **Boring Technology is Good Technology:** Stick to simple, battle-tested tools (TypeScript, Vue 3, Vite, Vitest). Do not introduce extra frameworks, external databases, MCP servers, or complex dependencies without explicit authorization.
3. **Clean Monolithic Architecture:** Keep all core domain logic modular, clean, and isolated in a single codebase.

---

## 🛡️ Core Rules & Architectural Mandates (Strict Policy)

1. **One Task at a Time:**
   - Execute exactly one bounded acceptance task per turn.
   - Never add speculative features, dashboards, databases, microservices, or extra frameworks.
2. **Strict 3-Layer Architecture:**
   - **Presentation:** CLI (`apps/cli`) & plugin entrypoints.
   - **Application / Domain:** Scene contracts (`packages/contracts`), OpenPencil converter, naming, and pure domain writeback (`packages/core`).
   - **Infrastructure:** Browser DOM capture (`packages/browser`), filesystem adapters, file I/O.
3. **Pure Domain Rule:**
   - Files under `packages/core` MUST remain pure domain logic with **zero Node.js or Browser runtime imports** (no `fs`, `crypto`, `path`, `playwright`, `react`, etc.).
4. **Controlled Source Writeback Principles (Milestone 2):**
   - Target only static literal strings in Vue 3 Single File Components (`App.vue`).
   - Always validate the source hash before mutating to prevent overwriting out-of-band edits.
   - Always generate an immutable pre-edit backup file (`App.vue.<timestamp>.bak`).
   - Explicitly reject dynamic template interpolations (`{{ dynamicVar }}`) or dynamic directives (`v-if`, `v-for`).
5. **Verification & Quality:**
   - Never declare a task complete without running tests (`pnpm test`) and full suite validation (`pnpm check`).
   - All tests (`vitest`), type checks (`tsc --noEmit`), lints (`eslint .`), and builds (`pnpm build`) MUST pass cleanly with 0 errors.

---

## 📚 Essential Reading Order

Before making code edits, inspect these authoritative documentation files:

1. [Working Policy](../../AGENTS.md)
2. [Project Status & Setup](../../README.md)
3. [Product Brief](../01-product/brief.md)
4. [Sequential Roadmap](roadmap.md)
5. [Three-Layer Architecture](../03-architecture/overview.md)
6. [Repository Map](../03-architecture/repository-map.md)
7. [OpenPencil Feasibility](../02-research/openpencil.md)

---

## 🚀 Execution Workflow for AI Assistants

```text
Step 1: Inspect the task and verify the current checkout state (`pnpm test`).
Step 2: Read relevant documentation and module contracts before editing.
Step 3: Implement the single bounded task within its designated layer (Presentation, Core, or Infrastructure).
Step 4: Execute verification (`pnpm check`). Fix any type, lint, or test failures.
Step 5: Document the outcome in affected docs and hand back reproducible test evidence.
```
