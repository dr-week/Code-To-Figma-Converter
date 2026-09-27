# Product contract

Updated 2026-09-20. Nuxt/Vue and React are project inputs; Vue 3 + TypeScript remains the first fully validated source-mapping path. OpenPencil is the first editor target. See the [milestone package](../05-delivery/milestone-01.md).

## Purpose

The product has two connected responsibilities:

1. Detect a local Nuxt/Vue or React project, capture a selected running page and generate an editable native `.fig` package with source mappings and backups.
2. Detect supported edits saved from OpenPencil, map them to their original source elements, update the source safely and let the project's normal development server refresh the page.

Preserve component names, DOM IDs, classes and behavior. Conversion, controlled source updates and live synchronization remain sequential milestones.

TypeScript catches type errors during development; it does not automatically make software secure or remove duplication. Conversion needs the running UI, CSS, fonts, assets, data, viewport and state. Source metadata supplies relationships that the rendered DOM alone cannot recover.

## Conversion flow

```text
Project folder → framework detection → running local page → DOM/CSS capture
→ scene and source map → native .fig package → OpenPencil or download
```

The local web UI and TypeScript backend own project detection, capture orchestration and artifact download. The browser UI cannot read arbitrary folders directly, so filesystem and process access remain in the local backend. Automatic development-server launching is not yet implemented.

## First validated scope

One local Vue page containing frames/cards, a button, literal leaf text and a local PNG/JPEG image. Measure at one fixed viewport and state. Preserve explicit names verbatim; existing `data-figma-name` annotations remain supported without an unrelated rename.

Produce native editable design layers, source mappings, original source/design backups and a fidelity report. Component ownership must be recorded separately from visual layer hierarchy: Vue components and DOM elements are not necessarily one-to-one. Report unsupported features explicitly. Do not silently flatten supported text or fabricate source provenance.

Position accuracy is measured, initially targeting one CSS pixel per bounds value on the supported fixture. Text content and supplied names must match exactly. Font substitution is a failure of the fixture's fidelity gate. Arbitrary CSS, responsive behavior and application logic cannot be inferred from a static design snapshot.

## Source updates

The user explicitly requires visual edits to update the original project. This is planned, not implemented. The first reverse update will change one statically authored text value in one Vue component. Later properties require their own validated mappings.

Source hashes prevent overwriting intervening code changes. Each apply operation retains a backup and preserves IDs, classes, handlers and unrelated code. Dynamic bindings, repeated template instances and shared styles require explicit ownership rules; reject ambiguous edits rather than guessing which source to rewrite.

The intended later flow is:

```text
OpenPencil edit → saved .fig or live RPC/MCP event → layer/source mapping
→ supported source update → development-server refresh
```

Live synchronization follows reliable controlled updates; it is not established by the current implementation.

## Current status and boundaries

The local product UI detects Vue and React fixtures and converts a running local page through the existing OpenPencil adapter. Native API export is verified; actual OpenPencil editor persistence and visual fidelity remain unverified. Nuxt detection is implemented from package metadata and conventional entry paths but does not yet have an integration fixture. See the [roadmap](../05-delivery/roadmap.md).

No custom editor, dashboard, database, cloud execution, MCP server or simultaneous Figma/Penpot integration is required. Keep three architectural layers and small modules. Work on one acceptance task at a time.
