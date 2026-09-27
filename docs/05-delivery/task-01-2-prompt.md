# Next coding task — stable source identity across native save/reopen

Use this entire document as the coding-agent prompt. Work in the existing CODEtoFIGMA checkout. Implement this task now; do not produce another planning-only handoff. Stop after its acceptance checks and report. Do not start another feature.

## Goal and scope

OpenPencil is an external dependency, not our development project. Use documented public APIs only. Do not fork, rebuild, patch or edit the editor, upstream checkout, vendored source or installed packages. Do not use private deep imports or undocumented runtime hooks. Keep our integration behind a small infrastructure adapter; shared domain contracts must not adopt upstream types. If a needed public capability is unavailable, report the gap and keep the task incomplete rather than implementing changes to OpenPencil. Pin tested versions; upgrades are separate compatibility tasks.

Extend the existing OpenPencil compatibility probe to reconstruct `sourceAnchor → current editor node ID` after two native .fig save/reopen cycles. Keep original DOM IDs, classes, explicit names and source references unchanged. This is a bounded identity proof within milestone 1, not a complete converter or a source-writeback task.

Use the existing locked npm 0.14.0 artifacts as the test baseline. Their lockfile pins the tested distribution; it does not establish correspondence to local upstream HEAD. Record that distinction without rebuilding upstream or reopening the package-selection research. Do not change dependency versions for this task unless an observed blocker requires it.

## Required reading, in order

Relative links below resolve from this document and remain usable in another checkout.

1. [Working policy](../../AGENTS.md)
2. [Project status](../../README.md)
3. [Product contract](../01-product/brief.md)
4. [Milestone 1 acceptance contract](milestone-01.md)
5. [Roadmap](roadmap.md) and [implementation plan](implementation-plan.md)
6. [Measured OpenPencil findings, Q1–Q5](../02-research/openpencil.md)
7. [Three-layer architecture](../03-architecture/overview.md) and [repository map](../03-architecture/repository-map.md)
8. [Code-editing workflow](workflow.md)
9. [Probe setup and reproduction](../../tests/spikes/openpencil/README.md)

Consult [naming rules](../04-modules/naming/spec.md), [scene contract](../04-modules/scene/spec.md), [validation](../06-quality/validation.md) and [verification audit](verification-audit.md) only as needed for the change.

Some historical documents still describe raw editor IDs as persistent or call earlier work complete. For this task, preserve durable source identity and explicitly reconstruct its current editor-ID association. Report raw IDs separately. Never silently claim that source-anchor persistence means raw IDs remained equal. Overall milestone acceptance remains pending actual editor verification.

## Inspect and reuse

Start with `git status --short` and inspect these existing files:

- [Native probe](../../tests/spikes/openpencil/probe.ts)
- [Probe test](../../tests/spikes/openpencil-probe.test.ts)
- [Isolated dependencies](../../tests/spikes/openpencil/package.json)
- [Exact dependency lockfile](../../tests/spikes/openpencil/package-lock.json)
- [Existing source-mapping module](../../packages/core/src/modules/source-mapping/index.ts)

Preserve uncommitted and untracked work. Do not reset, clean or recreate the repository. The current fixture lives at `tests/fixtures/vue`, not `apps/vue-fixture`.

The probe already exports and parses a real .fig with a frame, text and an image. It proves full PNG byte retention and text sourceAnchor retention; raw node IDs change. Extend this path rather than creating another serializer or another conversion pipeline.

## Implementation steps

1. Run the existing focused probe test and record any baseline failure. If its isolated dependencies are missing, install them using the locked setup command below.
2. Assign distinct explicit source anchors to the probe's frame, text and image through native pluginData. Use the existing `code-to-design` namespace and `sourceAnchor` key. Anchor values identify source elements, not line numbers, names or generated editor IDs.
3. Implement a small pure mapping validator that accepts normalized records and an expected anchor set, and returns a deterministic anchor-to-editor-ID map. Keep it within the spike unless reuse demonstrably requires an existing domain module. Do not import OpenPencil or filesystem APIs into domain code.
4. Validate metadata by namespace and key. Require exactly one nonempty anchor per expected supported element. Reject duplicate anchors across layers, duplicate anchor entries on a layer, missing expected anchors and conflicting mappings. Ignore unrelated plugin namespaces. Editor-generated document/page wrappers are outside the expected supported-element set.
5. Export using the already verified public API, write the bytes to disk, read them back and parse them. Extract metadata from reopened nodes and reconstruct the mapping from their current IDs. Do not locate mapped nodes by display name, traversal position or old editor ID.
6. Repeat export/write/read/parse on the reopened graph. Verify the same expected anchors resolve uniquely to the correct frame, text and image after both cycles. Check names, text, anchored parent relationships and full image-byte equality. Report raw IDs at each stage without requiring them to stay equal or to change on every run.
7. Save diagnostic results in an isolated ignored output directory under `.artifacts/`. Include original/first/second mappings, actual file hashes, retention results and failures. Keep existing evidence separate when practical; do not describe diagnostic outputs as immutable milestone backup packages.
8. Update Q3 and the task status in the affected documentation with commands and actual observations. Keep milestone 1 incomplete and GUI/fidelity checks explicitly unverified. Stop after handing back this task.

DOM IDs, class values and component names are supporting provenance, not unique identity. Do not guess any of them from layer names. The hand-authored probe anchors establish persistence behavior only; they do not prove automatic Vue source extraction.

## Meaningful acceptance checks

- Every expected frame/text/image source anchor resolves to exactly one current node after each of two native file round trips.
- Duplicate display names do not confuse mapping; include a focused case proving resolution uses anchors.
- Missing, empty and duplicate anchors fail with a useful error identifying the anchor or node. Test these explicitly.
- A matching key from an unrelated plugin namespace cannot satisfy the source-anchor requirement.
- Names, text, anchored hierarchy and complete PNG bytes survive both cycles.
- Mapping validation does not silently fall back to old IDs, inferred names or traversal indices.
- Domain logic remains free of editor/platform dependencies.
- The existing converter and writeback code remain unchanged.

## Commands and verification

Run commands from the repository root. In PowerShell use `npm.cmd`/`pnpm.cmd` if script execution policy requires them.

```sh
git status --short
# Only if the isolated dependencies need installation:
npm ci --prefix tests/spikes/openpencil --ignore-scripts --no-audit --no-fund
pnpm exec vitest run tests/spikes/openpencil-probe.test.ts
```

After implementation, run the changed mapping tests and probe first, then run `pnpm check` once. It already includes TypeScript, ESLint, Vitest, React/plugin builds and the Vue build; do not repeat those builds separately without a reason. Format changed files only. Fix only failures caused by this task and disclose any pre-existing failures. Never skip tests to obtain a green result.

Use TypeScript and apply_patch. Keep three layers, descriptive filenames and small focused functions. Use existing contracts wherever they fit. Do not add framework packages, new services or speculative abstractions. Do not write another design-system document or redesign the fixture.

## Explicit exclusions

No converter integration, full Vue conversion expansion, GUI automation, visual overlays, live synchronization, source writeback, extra editor targets, dashboards, databases, hosting, authentication, AI chat, MCP server, queues or billing. No upstream rebuild or package upgrade merely to match a version string. No publishing, pushing or external messages.

## Final report

```yaml
Task: Stable source identity across native save/reopen
Status: COMPLETE or INCOMPLETE
Files changed:
  - Exact paths
Evidence:
  - Commands and results
  - Locked package versions
  - Mapping results for both round trips
  - Negative-case results
  - Names, text, hierarchy and full image-byte retention
  - Generated evidence paths
Unverified:
  - Actual editor opening/editing/rendering
  - Automatic Vue source extraction
  - Published artifacts' correspondence to the inspected source commit
Milestone 1: INCOMPLETE
Next task:
  - One bounded task supported by the findings
```

Mark this bounded task COMPLETE only when its own acceptance checks pass. That does not complete milestone 1. If blocked, report the exact failing operation and smallest required next action. Do not invent results or continue to future work.
