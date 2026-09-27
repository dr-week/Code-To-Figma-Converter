# Figma import module

**Inactive target reference, 2026-09-12:** OpenPencil is the current focus. This file describes the existing Figma prototype; it is not a requirement to extend that plugin. Native editor import/save/export differences are covered in [OpenPencil research](../../02-research/openpencil.md).

Prototype status, 2026-09-12: the importer has been built but not verified in the actual Figma editor. It loads fonts strictly, maps frames/text/images, and tracks generated nodes for cleanup. It stores node IDs/name origin, not a full source-project reference. SVG, inferred auto layout, fallback font selection and update merging below are not implemented and are not part of the next Vue capture task.

Use a plugin executing inside the user's open Figma file. The public REST API is not the planned general scene-creation mechanism; use the documented editor Plugin API for native writes. [Plugin API](https://developers.figma.com/docs/plugins/) · [REST API](https://developers.figma.com/docs/rest-api/)

## Mapping policy

| Scene feature | Figma representation | Fidelity rule |
| --- | --- | --- |
| Container | Frame | Measured size and local placement; clipping when supported. |
| Background/border | Fills and strokes | Match stroke alignment; verify CSS border-box effects. |
| Text | Text node with supported runs | Load fonts before assigning content; preserve text and report substitution. |
| Image | Image paint on a node | Match crop/fit and asset bytes within supported cases. |
| Safe SVG | Native vector import where valid | Unsupported filters/external references require warning or fallback. |
| Simple flex | Optional auto layout | Enable only for tested mappings whose geometry remains within tolerance. |
| Complex grid, transforms or effects | Measured supported nodes or fallback | Do not infer editable layout rules without verification. |

Snapshot mode uses measured placement. Editable-layout mode is a later explicitly selected capability, not an automatic guarantee that all CSS has an equivalent Figma rule.

## Import flow

Validate schema and resource limits, resolve assets, and preflight fonts. Present blocking errors or an explicit fallback report. Create a staging root tagged with capture ID, artifact hash and importer version. Build parents before children in bounded batches, setting names and local coordinates. Verify counts, references and geometry. Finalize the root and return generated node IDs plus diagnostics.

Preserve provenance in plugin data. Track every created node. On failure/cancellation, attempt to remove only this attempt's generated root; report remaining IDs if cleanup fails. Never delete unrelated content.

First release creates a new import root. Repeated identical imports should detect the same artifact and offer reuse or an explicitly separate copy. Incremental updates are later work: require stable IDs, an update preview and a policy for user-edited generated nodes. Do not overwrite manual changes silently.

## Font handling

Plugins must use fonts available in the editor; arbitrary website font URLs are not equivalent to available Figma fonts. Load the chosen font before text mutation. If unavailable, offer blocking strict mode or a named fallback with a warning. Record the resulting geometry difference. [Figma font access](https://developers.figma.com/docs/plugins/)

## Completion evidence

Inspect native text editability and layer names in the editor. Export a PNG of the imported root at the capture scale for comparison. Store node IDs and the report alongside the scene package. A screenshot-only import does not pass native editability acceptance.
