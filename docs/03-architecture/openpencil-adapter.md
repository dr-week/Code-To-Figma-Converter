# OpenPencil adapter boundary

Updated 2026-09-20. OpenPencil is an external editor. This repository does not fork, patch or rebuild it.

## Stable boundary

Application code imports the stable `packages/tooling/openpencil-io.ts` entrypoint. Direct `@open-pencil/*` runtime imports live below `packages/tooling/openpencil/`:

```text
UI / CLI / package builder
          ↓
openpencil-io.ts                 stable local entrypoint
          ↓
openpencil/
  compatibility.ts              tested version and file format
  asset-hash.ts                 image identity
  scene-adapter.ts              shared Scene → native SceneGraph
  native-io.ts                  codec initialization, export and parse
          ↓
@open-pencil/* 0.14.0           external public APIs
```

Core domain modules and the web UI do not import OpenPencil packages or native editor types. An editor update is isolated to this infrastructure adapter.

## Upgrade procedure

1. Create one bounded upgrade task; do not combine it with a product feature.
2. Review the target OpenPencil release and its public exports.
3. Change all exact OpenPencil pins together in `packages/tooling/package.json` and the isolated spike lockfile.
4. Update `OPENPENCIL_ADAPTER_VERSION` in `compatibility.ts`.
5. Run adapter tests, native save/reopen probes and `pnpm check`.
6. Generate a fresh package and verify open/edit/save/reopen in the unmodified editor.
7. Record format or behavior changes in the OpenPencil research document and roadmap.

If a public API changes, adapt files inside `packages/tooling/openpencil/` while preserving `openpencil-io.ts`. If the public API cannot meet a requirement, document the limitation; do not modify OpenPencil.

## Optional live-editor companion

OpenPencil does not require a conventional in-editor plug-in. Its supported programmable surfaces include CLI scripting with a Figma-compatible API, live desktop RPC and MCP over local authenticated transports. A future “Open in editor / sync selection / apply supported edit” integration should therefore be a separate companion bridge:

```text
apps/web → our bridge port → OpenPencil CLI/RPC or MCP → unmodified OpenPencil
```

The companion must be optional and must not be imported by core, capture or native document conversion. Its first bounded task is capability detection and read-only health/document inspection. Mutation and synchronization require separate acceptance tasks. Do not use the Vue SDK to ship a custom editor for this project; that would duplicate editor maintenance.
