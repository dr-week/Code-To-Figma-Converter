# Intermediate scene contract

Prototype status, 2026-09-12: the executable schema is version `0.1` in `packages/contracts/src/index.ts`. It supports frames, text and images in parent-first order, inline image bytes, source project ID/route/viewport and warnings. The illustrative `1.0` envelope below is earlier design reference, not the current import format or a requirement to add fields in the next task.

The scene is a versioned data document, never executable JavaScript. Validate it before saving and again before importing.

## Proposed envelope

```ts
type SceneDocument = {
  schemaVersion: '1.0';
  captureId: string;
  source: { projectId: string; route: string; revision?: string };
  viewport: { width: number; height: number; deviceScaleFactor: number };
  stateKey: string;
  rootIds: string[];
  nodes: SceneNode[];
  assets: AssetManifestEntry[];
  warnings: ConversionWarning[];
};
```

This is an illustrative design, not a complete implemented type. `SceneNode` must become a discriminated union: frame, rectangle, text, vector and image. Specify payloads per kind instead of one object full of optional properties.

Common fields: ID, parent ID, ordered child IDs, layer name/origin, optional source and instance references, local geometry in CSS pixels, opacity, clipping and fidelity status. Text nodes own characters, font description and styled ranges; image nodes reference asset IDs; vector nodes reference sanitized supported SVG data. Warnings contain code, node/source ID, severity, explanation and fallback choice.

## Invariants

IDs are unique; parents exist; the graph is acyclic; roots have no parent; every non-root is reachable once. Geometry is finite and dimensions are nonnegative. Text ranges are valid. Asset references resolve and hashes match bytes. Validate node/depth/byte limits before traversal. Reject unknown major versions; define explicit minor-version compatibility and migrations rather than assuming all newer fields are safe.

One CSS pixel maps to one Figma coordinate unit in snapshot mode; device scale affects screenshot resolution, not node dimensions. Store the capture environment and screenshot scale so comparison can use matching units.

## Packaging and determinism

Package scene JSON, an asset manifest and referenced bytes; the first implementation can use a bounded archive after testing plugin decoding. Reject unsafe archive paths and decompression bombs. Keep timestamps outside the canonical content hash. Hash canonical scene content plus assets, engine version and capture settings; do not claim repeated live data captures are identical without frozen data.

The schema must remain independent of framework ASTs and Figma-specific runtime objects. Preserve source metadata as provenance and adapter-specific details only in a versioned extension field when necessary.
