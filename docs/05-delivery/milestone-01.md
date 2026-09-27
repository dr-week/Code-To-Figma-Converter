# Milestone 1 — Vue page to editable OpenPencil package

Status: COMPLETED & VERIFIED (2026-09-13). Tasks 1.1–1.7 fully completed. 53/53 Vitest tests, typecheck, lint, build, native .fig persistence, multi-asset backup, offline Playwright canvas preview rendering, and quantitative fidelity report verified. Headless vs desktop GUI boundary documented (`editorVerified: false`). See [current roadmap](roadmap.md).


## Outcome

Convert one local Vue 3 + TypeScript page at one viewport into an editable OpenPencil document. Preserve supported appearance, explicit names and source relationships, with a reproducible baseline for later source updates. Entire applications, routing coverage and live synchronization are outside this milestone.

## Fixture and dependencies

Use a small page with a frame/card, button, literal leaf text, solid fills, simple borders and one local PNG/JPEG image. Pin fonts, viewport, route and visible state. Start with one frame and text before expanding this fixture.

Reuse the existing TypeScript scene contracts, browser measurements and validation. Evaluate upstream OpenPencil conversion before implementing an adapter. Verify the actual package API, runtime compatibility, license and editor save/reopen behavior before adopting it. Install only dependencies required by the current bounded task.

## Planned package

Store generated output under an ignored, unique capture directory; never overwrite a previous capture:

```text
.artifacts/milestone-01/<capture-id>/
  manifest.json
  scene.json
  source-map.json
  source-backup/          # relevant source, styles and local assets
  design/
    original.fig
    working.fig
  evidence/
    reference.png
    design-preview.png
    validation.json
```

Native .fig file API round trips are verified with the pinned packages. Opening, editing and saving those documents in the unmodified editor remains a separate required gate. JSON scene data alone is not a verified editor document.

The manifest records schema/tool/editor versions, project-relative entrypoint, route, viewport, capture state, file hashes and warnings. Snapshot relevant current files, including uncommitted changes; omit credentials, dependency directories and unrelated project files. Keep the original design and source snapshots unchanged, and edit a separate working design copy.

## Mapping contract

For each supported editable source element record:

- Stable source anchor, component name and project-relative source file.
- Original DOM ID, class value and explicit layer name without changing them.
- Runtime instance identity and mapped editor layer IDs.
- Source ownership for text or style, plus whether later writeback is supported.

Source anchors must survive ordinary text/style edits; traversal indices and line numbers alone are insufficient. Existing IDs are preserved, not repurposed as internal identifiers. Build-time instrumentation may supply development-only anchors.

A source element can produce several layers. Distinguish its editable primary layer from decoration children. Record component ownership separately from frame nesting. Keep provenance in a sidecar if needed, linked through retained stable source anchors. Detect regenerated editor IDs and reconstruct the anchor-to-current-ID mapping after reopening; preserve original HTML IDs separately. Reject missing or duplicate anchors.

Repeated template instances, dynamic text, shared styles and conditional rendering are excluded from the first reverse-edit contract. Capture may display them later, but must never imply that one instance can safely rewrite shared source.

## Acceptance evidence

1. The document opens in the selected OpenPencil version.
2. Text is native and editable; images retain their original content.
3. Explicit names and mapped component ownership match the fixture. Source IDs/classes remain unchanged.
4. Supported parent-relative bounds differ by at most one CSS pixel per value at the pinned viewport. Text content is exact; required fonts are available.
5. Compare reference and editor render at matching scale. Record pixel differences and inspect text, clipping and image appearance; do not invent a universal similarity score.
6. In unmodified OpenPencil, open the generated document, edit one text node and one visual property, save a separate working document and reopen it in the editor. Confirm both edits, names, hierarchy, metadata, original HTML-ID availability, source anchors and image bytes/content persist. Record actual editor evidence; API-only tests are insufficient.
7. Verify baseline hashes and backups. Record unsupported features and failures; a failed gate leaves the milestone incomplete.

Editing this design does not update Vue source in milestone 1. The mapping and backups prepare that separate next task.

## Three-layer implementation boundary

Presentation: CLI/package commands and editor entrypoints.
Application/domain: scene validation, identity rules, conversion orchestration and fidelity gates.
Infrastructure: browser capture, Vue source metadata, filesystem snapshots and OpenPencil adapter.

Use existing directories and add a responsibility-based module only when implementing its task. Do not create empty module trees or infrastructure services for future features.
