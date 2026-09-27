# Engineering execution prompt — Code to Design

Use this document as the coding-agent instruction. Respond only in clear, structured English. Execute the selected task; do not return another plan in place of authorized work.

## Workspace and goal

Current checkout: `C:/Users/disha/Documents/CODES/studio/CODEtoFIGMA`. On another machine, use the provided checkout. All relative links below resolve from this document; code paths in the execution instructions are relative to the repository root.

Convert a running Vue 3 + TypeScript interface into an editable native design file, starting with .fig and OpenPencil. Preserve appearance within the tested support boundary, names, hierarchy, original HTML IDs/classes and source-to-layer mappings. Later, supported visual changes will update the user's Vue project. Source writeback and live synchronization are not the current assignment.

OpenPencil and Figma are external products. Never edit, fork, patch or rebuild their applications, upstream source, installed packages or behavior. Use documented public APIs or the unmodified editor. Own only our converter, infrastructure adapters, mappings and verification. Report a missing public capability instead of implementing changes inside an editor.

## Before any development: read in this order

1. [AGENTS.md — working policy](../../AGENTS.md)
2. [README.md — setup and status](../../README.md)
3. [Product contract](../01-product/brief.md)
4. [Roadmap — task order](roadmap.md)
5. [Milestone 1 — acceptance contract](milestone-01.md)
6. [Implementation plan](implementation-plan.md)
7. [Architecture and dependency direction](../03-architecture/overview.md)
8. [Repository map](../03-architecture/repository-map.md)
9. [Architecture decisions, particularly ADR-013](../03-architecture/decisions.md)
10. [Measured OpenPencil API findings](../02-research/openpencil.md)
11. [Task 1.4 metadata evidence](task-01-4-metadata.md)
12. [Development workflow](workflow.md)
13. [Validation criteria](../06-quality/validation.md)
14. [Security and support limits](../06-quality/security-and-limits.md)

Inspect applicable nested AGENTS.md files before editing their directories. Current user instructions and the active acceptance contract supersede historical task prompts and stale completion statements. Read actual evidence and implementation before accepting a status claim. Do not reopen decisions already confirmed by the owner.

## Remaining Markdown index

All other existing project Markdown files are linked here. Read them only when relevant; their presence does not authorize extra tasks.

| Purpose | Documents |
| --- | --- |
| Module contracts | [Index](../04-modules/README.md), [capture](../04-modules/capture/spec.md), [naming](../04-modules/naming/spec.md), [scene](../04-modules/scene/spec.md) |
| Inactive module proposals | [Figma import](../04-modules/figma-import/spec.md), [persistence](../04-modules/persistence/spec.md) |
| Research context | [Reuse](../02-research/open-source-reuse.md), [competitors](../02-research/competitors.md), [Swiss employment](../02-research/swiss-market.md), [MCP](../02-research/mcp.md) |
| Verification history | [Audit](verification-audit.md), [isolated probe setup](../../tests/spikes/openpencil/README.md) |
| Earlier broad prompts | [Master AI prompt](master-ai-prompt.md), [implementation prompt](implementation-prompt.md) |
| Earlier milestone handoffs | [Task 1.1](task-01-1-prompt.md), [Task 1.2](task-01-2-prompt.md), [Task 1.3](task-01-3-prompt.md) |
| Deferred/historical handoffs | [Task 2](task-02-prompt.md), [Task 3](task-03-prompt.md), [Task 4](task-04-prompt.md), [Task 5](task-05-prompt.md) |

This is the Markdown inventory at prompt creation. Discover subsequently added relevant documents without crawling dependency or generated-output directories.

## Current assignment — Task 1.5 only

Verify actual editor persistence using unmodified OpenPencil. Tasks 1.1–1.4 have repository-level evidence; milestone 1 remains incomplete. The recorded baseline is 51 tests across 15 files, but inspect the current checkout rather than treating that count as a required constant.

1. Generate a fresh native .fig package from the Vue fixture. Record package paths, capture ID, tested npm versions, actual editor version and baseline hashes of original.fig, source backups and source-map.json.
2. Open original.fig in the actual unmodified OpenPencil editor. Existing headless package tests do not satisfy this step.
3. Select a mapped text node and change its text. Change one mapped frame's solid fill as the visual-property edit. Record anchors and exact before/after values.
4. Save a separate working document through the editor. Do not overwrite original.fig. The package generator may already create a programmatically edited working.fig; that file does not establish editor editing. Use a distinct editor-saved path if needed and record it.
5. Close and reopen the saved working document in the editor. Confirm both edits persist and text remains editable.
6. Inspect the actual saved file through supported public I/O APIs. Reconstruct source-anchor-to-current-node-ID mappings. Verify unique anchors, names, hierarchy, metadata and full image bytes. Check image appearance in the editor. Original HTML IDs/classes may remain available through the unchanged sidecar linked by surviving anchors; do not claim they are embedded unless verified.
7. Compare original design, source-backup and sidecar hashes against the baseline. Verify source files were not changed by the workflow.
8. Write a concise evidence report under `docs/05-delivery/` and generated screenshots/data under the capture's ignored evidence directory. Update only affected task status. Stop after this bounded task.

Public APIs may help inspect editor-produced files. An in-memory graph edit followed by export/parse is not a substitute for editing and reopening in the actual editor runtime. Use supported automation if available; do not inject private application hooks, expose hidden stores or patch the app to manufacture a pass. If editor access or an API is unavailable, record the exact blocker and keep the task incomplete.

Task 1.6 will handle the full visual/geometry comparison against the original UI. Screenshots here document persistence; they do not establish pixel fidelity.

## Inspect these files before changing code

| Concern | Existing file |
| --- | --- |
| Package generation and backups | [packages/tooling/milestone1.ts](../../packages/tooling/milestone1.ts) |
| Public OpenPencil adapter | [packages/tooling/openpencil-io.ts](../../packages/tooling/openpencil-io.ts) |
| Scene schema | [packages/contracts/src/index.ts](../../packages/contracts/src/index.ts) |
| Source mappings | [packages/core/src/modules/source-mapping/index.ts](../../packages/core/src/modules/source-mapping/index.ts) |
| Browser DOM reader | [packages/browser/src/read-dom.ts](../../packages/browser/src/read-dom.ts) |
| Node-side browser orchestration | [packages/browser/src/capture-project.ts](../../packages/browser/src/capture-project.ts) |
| Vue acceptance fixture | [App.vue](../../tests/fixtures/vue/src/App.vue), [style.css](../../tests/fixtures/vue/src/style.css) |
| Real fixture regression | [tests/integration/milestone1-fixture.test.ts](../../tests/integration/milestone1-fixture.test.ts) |
| Native I/O and evidence tests | [openpencil-io.test.ts](../../packages/tooling/openpencil-io.test.ts), [milestone1.test.ts](../../packages/tooling/milestone1.test.ts) |
| Identity proof | [probe.ts](../../tests/spikes/openpencil/probe.ts), [probe test](../../tests/spikes/openpencil-probe.test.ts) |
| Scripts/dependencies | [package.json](../../package.json), [tooling package](../../packages/tooling/package.json), [pnpm lockfile](../../pnpm-lock.yaml) |
| Boundaries and CI | [ESLint config](../../eslint.config.mjs), [CI workflow](../../.github/workflows/ci.yml) |

Reuse these paths. Add only the smallest helper or regression test required by an observed blocker. Do not recreate the adapter or reorganize the repository.

## Identity and architecture rules

- Preserve original HTML IDs, classes and names. Internal OpenPencil IDs can change.
- Source anchors currently encode `[sourceFile, sourceId, layer kind]`; shared source ownership uses `[sourceFile, sourceId]`. Use the existing mapper instead of inventing another encoding.
- Resolve by namespaced source metadata, not display name or traversal position. Reject missing/duplicate anchors and conflicting mappings.
- Caller defaults and supplied annotations are not proof of automatic AST source extraction. Repeated template instances remain outside the current support contract.
- Presentation: CLI/editor entrypoints and reports. Domain: pure contracts, identity, validation and orchestration rules. Infrastructure: Node filesystem, browser orchestration and OpenPencil integration.
- No @open-pencil/*, Node or browser runtime imports inside core. Only read-dom.ts runs inside Chromium; the browser orchestration package legitimately uses Node APIs. Probe code is test infrastructure, not domain code.
- Keep strict TypeScript, descriptive names and small modules. Use apply_patch, inspect changes and preserve all existing uncommitted work. Do not introduce casts merely to silence API mismatches.

## Commands, efficiency and verification

Start with `git status --short`. Inspect available scripts and dependencies. Install only missing, already pinned dependencies with the documented locked commands; do not upgrade packages or build upstream.

`pnpm milestone1` currently exits nonzero while milestone gates remain incomplete. Inspect its report to distinguish expected incomplete status from a real generation error. Do not remove this guard to make a command appear successful.

Run focused checks after code changes, followed by `pnpm check`. It includes typecheck, lint, tests, React/plugin build and Vue build. Avoid redundant full-suite reruns or separate duplicate builds. Documentation-only changes need consistency/link checks, not repeated application builds. Retain evidence of pre-existing failures and fix only task-related defects. Do not skip or weaken tests.

No dashboards, databases, hosting, authentication, MCP server, AI chat, queues, billing, additional frameworks, new editor targets, source writeback, live synchronization or UI redesign. Preserve the source design. Do not create a new design system. No Git reset/clean, publishing, pushing or external messages without authorization.

## Completion report

Report Task 1.5 COMPLETE only when every editor-persistence acceptance step above is evidenced. Otherwise report INCOMPLETE with the exact missing gate.

```yaml
Task: Task 1.5 — actual OpenPencil editor persistence
Status: COMPLETE or INCOMPLETE
Files changed:
  - Exact paths
Evidence:
  - Commands and check results
  - Actual editor version and pinned API package versions
  - Capture ID and original/working file locations
  - Editor actions and before/after text and fill values
  - Save/reopen result
  - Source mapping, names, hierarchy and metadata results
  - Full image-byte comparison and visible image result
  - Original design, sidecar and source-backup hash checks
  - Screenshots and machine-readable evidence paths
Unverified:
  - Remaining gaps, including full visual fidelity
Milestone 1: INCOMPLETE until all milestone gates pass
Next task:
  - One bounded task supported by the findings
```

Use observed values, not example IDs, placeholder hashes or invented percentages. Keep progress updates concise and stop when the assigned task is complete.
