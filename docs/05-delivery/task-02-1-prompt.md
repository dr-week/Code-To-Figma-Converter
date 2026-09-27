# Coder AI Master Handoff Prompt: Milestone 2 — Task 2.1 (Controlled Visual Text Edit → Vue Source Update)

> **Instructions for AI Assistants (Cursor, Gemini, Claude, Antigravity, ChatGPT, etc.):**  
> Copy and paste this prompt directly into your AI coding assistant. Follow all linked documentation files and rules strictly. Implement Task 2.1 now; do not produce another planning-only response.

---

### 📖 Project Narrative & Architectural Context

#### 1. Current System State (Milestone 1 Complete)
Milestone 1 (Tasks 1.1–1.7) is **100% COMPLETED & VERIFIED**. Native OpenPencil binary `.fig` file generation, programmatic save/reopen persistence, multi-asset source backup snapshotting (`App.vue`, `style.css`, `public/study.png`), SHA-256 manifest hashing, source-anchor tuple tracking (`[sourceFile, sourceId, kind]`), and Playwright offline canvas fidelity rendering are fully operational and verified by 53 automated Vitest integration tests.

#### 2. Goal of Milestone 2 Task 2.1
Implement the reverse conversion path for a single controlled visual edit: updating a text string in a native OpenPencil document (`working.fig`) and writing that change back to the original Vue 3 Single File Component (`App.vue`), preserving AST formatting and verifying recapture.

---

### 🎯 Task 2.1 Acceptance Criteria

1. **Source Anchor Map Lookup:** Read modified OpenPencil scene graph, extract `pluginData` anchor `[sourceFile, sourceId, kind]`, and match against `source-map.json` sidecar map.
2. **Vue Template AST Modification:** Parse target Vue SFC using `@vue/compiler-sfc` / AST tool, update literal text content of the target node, and write back to disk without corrupting script, style, or template whitespace.
3. **Automated End-to-End Verification:** Run Vite dev server, trigger Playwright capture, and verify that the re-captured OpenPencil scene graph reflects the updated text string.
4. **Quality Gate:** Pass `pnpm check` (typecheck, lint, 53+ Vitest tests, builds) with zero errors.

---

### 🚀 Execution Steps

```bash
# 1. Verify clean monorepo baseline
pnpm check

# 2. Run writeback integration tests
pnpm test tests/integration/cli-writeback.test.ts
pnpm test tests/integration/writeback-recapture.test.ts
```
