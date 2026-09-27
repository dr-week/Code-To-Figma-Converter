# Module specifications

| Module | Owns | Read |
| --- | --- | --- |
| Capture | Stable browser observation and assets | [Capture contract](capture/spec.md) |
| Naming | Exact annotations, inferred names and source identity | [Naming contract](naming/spec.md) |
| Scene | Framework-neutral interchange and validation | [Scene contract](scene/spec.md) |
| OpenPencil | Native `.fig` scene graph (v0.14.0) conversion and editor validation | [OpenPencil research](../02-research/openpencil.md) |
| Source Mapping & Writeback | Layer-to-SFC source anchors (`source-map.json`), source hash checks & controlled Vue text writeback | [Milestone 1](../05-delivery/milestone-01.md) |
| Figma import (inactive) | Native node mapping, preflight and import recovery | [Import contract](figma-import/spec.md) |
| Persistence (inactive) | Earlier database research; outside current scope | [Storage reference](persistence/spec.md) |


Cross-cutting fidelity tests are in [validation](../06-quality/validation.md); orchestration and failure boundaries are in [architecture](../03-architecture/overview.md). [MCP research](../02-research/mcp.md) is inactive reference material. The [roadmap](../05-delivery/roadmap.md) selects one task at a time.
