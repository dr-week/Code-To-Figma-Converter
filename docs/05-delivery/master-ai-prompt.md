# 🤖 Historical Master AI Assistant Handoff & Execution Prompt
## Project: Code to Design (Vue + TS UI $\rightarrow$ OpenPencil Layer Conversion)

> **Instructions for AI Assistants (Antigravity, Cursor, Gemini, Claude, ChatGPT, etc.):**  
> Copy and paste this prompt directly into your AI coding assistant. You are operating inside the `CODEtoFIGMA` repository. Follow all linked rules, specifications, and architecture boundaries strictly.

---

### 🏛️ Working Policy & System Constraints

1. **Target Editor:** Officially confirmed as **OpenPencil** ([open-pencil/open-pencil](https://github.com/open-pencil/open-pencil) at [openpencil.dev](https://openpencil.dev), MIT License).
2. **Adapter Boundaries:** Treat OpenPencil as an external, independently maintained editor. Use its documented public package exports (`@open-pencil/core`, `@open-pencil/fig`, `@open-pencil/scene-graph`). Do NOT fork, patch, rebuild, or modify OpenPencil source or installed package files. Keep upstream types isolated behind infrastructure adapters.
3. **Three-Layer Architecture:**
   - **Presentation:** Rendered browser interface / DOM capture.
   - **Application/Domain Rules:** Pure `@code-to-figma/contracts` `Scene` graph.
   - **Infrastructure Adapters:** OpenPencil native `.fig` I/O and Vue source writeback adapter.
4. **Primary Validation Target:** Vue 3 + TypeScript.
5. **Quality Gate:** Every code change MUST pass `pnpm check` (TypeCheck, ESLint, Vitest tests, React build, Vue build).

---

### 🔗 Comprehensive Sitemap of All Project Documentation (Clickable Links)

#### 1. Core Policies & Product Specifications:
- [AGENTS.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/AGENTS.md) — Working Policy, Upstream Adapter Rules & Handoff Guidelines
- [README.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/README.md) — Project Overview, Architecture Overview & CLI Commands
- [brief.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/01-product/brief.md) — Product Brief, Core Goals & Scope Rules

#### 2. Feasibility & Upstream Research:
- [openpencil.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/openpencil.md) — Authoritative OpenPencil Spike Findings & Q1–Q5 Answers
- [open-source-reuse.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/open-source-reuse.md) — Open Source Ecosystem & Package Reuse Analysis
- [mcp.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/mcp.md) — Protocol & Integration Research
- [competitors.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/competitors.md) — Landscape & Differentiating Factors
- [swiss-market.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/02-research/swiss-market.md) — Target Market & Technical Standards

#### 3. Architecture & Design Rules:
- [overview.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/03-architecture/overview.md) — High-Level 3-Layer System Architecture
- [repository-map.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/03-architecture/repository-map.md) — Monorepo Directory Map & Dependencies
- [decisions.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/03-architecture/decisions.md) — Architecture Decision Log (ADR-011 OpenPencil Confirmation)

#### 4. Detailed Module Specifications:
- [modules/README.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/04-modules/README.md) — Module Overview & Standard Directory Layout
- [scene/spec.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/04-modules/scene/spec.md) — Shared `Scene` Graph & Node Contracts Specification
- [naming/spec.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/04-modules/naming/spec.md) — Layer Naming, Explicit Identity & Disambiguation Rules
- [capture/spec.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/04-modules/capture/spec.md) — DOM/Rendered Interface Capture Pipeline Spec
- [figma-import/spec.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/04-modules/figma-import/spec.md) — Legacy Figma Import Reference Spec (Inactive)
- [persistence/spec.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/04-modules/persistence/spec.md) — Source-Anchor Tracking & Disk Persistence Spec

#### 5. Delivery, Roadmap & Active Milestone Contracts:
- [milestone-01.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/milestone-01.md) — **Authoritative Acceptance Contract for Milestone 1**
- [roadmap.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/roadmap.md) — Sequential Product Delivery & Milestone Progression
- [implementation-plan.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/implementation-plan.md) — Current Master Implementation Plan
- [verification-audit.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/verification-audit.md) — Verification Audit & Test Suite Health Record
- [workflow.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/workflow.md) — Development Handoff & Review Workflow
- **Task Specific Handoff Prompts:**
  - [task-01-1-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-01-1-prompt.md) — Task 1.1 Compatibility Spike Prompt
  - [task-01-2-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-01-2-prompt.md) — Task 1.2 Stable Identity Across Cycles Prompt
  - [task-01-3-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-01-3-prompt.md) — Task 1.3 Scene Adapter & Native Serializer Prompt
  - [task-01-5-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-01-5-prompt.md) — Task 1.5 OpenPencil Persistence Prompt (Completed & Verified)
  - [task-01-6-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-01-6-prompt.md) — **Task 1.6 Active Offline Fidelity Report Prompt**
  - [task-02-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-02-prompt.md) — Task 2 Prompt
  - [task-03-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-03-prompt.md) — Task 3 Prompt
  - [task-04-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-04-prompt.md) — Task 4 Prompt
  - [task-05-prompt.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/task-05-prompt.md) — Task 5 Prompt

#### 6. Quality & Security Controls:
- [validation.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/06-quality/validation.md) — Test Automation & Verification Protocol
- [security-and-limits.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/06-quality/security-and-limits.md) — Security Boundaries & Resource Limits

---

### 💻 Core Codebase Sitemap (Direct File References)

#### Shared Contracts:
- [contracts index](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/contracts/src/index.ts) — Shared `Scene` and node interfaces

#### Core OpenPencil Adapter & Modules:
- [openpencil-io.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/openpencil-io.ts) — Native OpenPencil scene conversion and `.fig` I/O
- [openpencil-io.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/tooling/openpencil-io.test.ts) — Native I/O test suite
- [core adapter](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/modules/openpencil/adapter.ts) — Legacy prototype serializer retained for reference
- [core index.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/packages/core/src/index.ts) — Core Monorepo Exports Entrypoint

#### OpenPencil Spike Probes & Test Suite:
- [openpencil-probe.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/spikes/openpencil-probe.test.ts) — Integrated Vitest Probe Suite
- [milestone1-fixture.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/integration/milestone1-fixture.test.ts) — Milestone 1 Integration Suite
- [openpencil-persistence.test.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/integration/openpencil-persistence.test.ts) — Task 1.5 Persistence Verification Suite
- [probe.ts](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/spikes/openpencil/probe.ts) — Isolated Spike Probe (`extractAndValidateSourceMap`, `pluginData` validation)
- [README.md (spike)](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/spikes/openpencil/README.md) — Probe Setup & Command Documentation

### 📖 Project Narrative & Architectural Context

#### 1. Project Goal & Origin
The goal of **Code to Design** is to convert running Vue 3 + TypeScript web interfaces into editable native OpenPencil (`.fig`) design layers, attaching durable source anchors (`pluginData`) that enable visual edit writebacks to original Vue SFC source code.

#### 2. Why We Were Getting Stuck (Root Cause & Resolution)
- **The Custom JSON Trap:** Earlier prototype iterations generated custom JSON files (`.openpencil`) rather than official OpenPencil binary `.fig` document files. This was audited and corrected on 2026-09-13.
- **Headless Node.js vs. Desktop GUI Boundary:** Programmatic integration tests execute in headless Node.js using `@open-pencil/core`, `@open-pencil/fig`, and `@open-pencil/scene-graph` WASM codecs. They can verify native `.fig` file generation, parsing, layer hierarchy, and source anchor retention, BUT they cannot open an interactive desktop GUI window or simulate mouse clicks inside the OpenPencil electron application.
- **3-Layer Architecture Isolation:** Moving `@open-pencil/*` dependencies out of `@code-to-figma/core` into `@code-to-figma/tooling` resolved browser bundle build failures for the Figma plugin IIFE (`apps/figma-plugin`).

#### 3. Verified Repository Baseline
- **Milestone 1 (COMPLETED & VERIFIED 2026-09-13):** Native `.fig` I/O, `pluginData` source anchors, `source-backup/` snapshotting, Playwright canvas preview rendering (`design-preview.png`), offline fidelity reporting (`fidelity-report.json`), signoff package (`pnpm milestone1`).
- **Milestone 2 (COMPLETED & VERIFIED 2026-09-13):** Controlled text writeback (`saveTextWritebackToFile`), solid fill color writeback (`saveColorWritebackToFile`), writeback & recapture integration suite (`writeback-recapture.test.ts`), native `.fig` CLI writeback orchestration (`writeback-orchestrator.ts`), CLI command `pnpm writeback`.
- **Milestone 3 (COMPLETED & VERIFIED 2026-09-13):** Controlled layout writeback (`saveLayoutWritebackToFile`), flexbox padding & gap inline style mutations, native `.fig` layout diff extraction, layout recapture integration suite (`layout-recapture.test.ts`).
- **Milestone 4 (COMPLETED & VERIFIED 2026-09-13):** Source SHA-256 staleness and conflict engine (`conflict.ts`), 3-way conflict merge resolver (`conflict-merge.ts`), CLI `--dry-run` and `--force` options, integration suite (`conflict-handling.test.ts`).
- **Milestone 5 (COMPLETED & VERIFIED 2026-09-13):** AST-based Vue SFC transformer (`sfc-ast-transformer.ts`), scoped CSS rule mutator (`css-writeback.ts`), AST unit test suites (`sfc-ast-transformer.test.ts`, `css-writeback.test.ts`).
- **Monorepo Quality Gate:** **68/68 Vitest tests passing across 22 test files**, 0 `tsc` errors, 0 `eslint` errors, 100% clean production builds.

---

### 🎯 Active Target Task: Milestone 6 — End-to-End Delivery & Monorepo Handoff Package

#### Technical Specifications for Milestone 6:
1. **Target Operation:** Execute final monorepo quality signoff (`pnpm check`), verify all monorepo production builds, and summarize system architecture and execution commands.
2. **Deliverables:**
   - Monorepo package build outputs for `@code-to-figma/contracts`, `@code-to-figma/core`, `@code-to-figma/browser`, `@code-to-figma/tooling`, `@code-to-figma/cli`, `figma-plugin`, and `vue-fixture`.
   - Verification evidence and walkthrough summary in `walkthrough.md`.

---

### ❓ Key Verification Questions Embedded in Prompt

When executing Milestone 6, the AI assistant MUST address and verify the following:

1. **Build Integrity:**  
   *Question:* Are all 10 monorepo projects compiling without type errors, lint warnings, or missing export declarations?
2. **Test Automation & Provenance:**  
   *Question:* Does `pnpm test` verify native `.fig` I/O, `pluginData` source anchors, multi-property writebacks, AST mutations, and conflict resolution across all 68 Vitest tests?

---

### 🚀 Execution Instructions for AI Assistant

1. Review linked specs: [AGENTS.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/AGENTS.md) and [roadmap.md](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/docs/05-delivery/roadmap.md).

