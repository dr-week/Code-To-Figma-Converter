# Repository map

Actual repository structure reviewed 2026-09-15. Vue 3 + TypeScript is the primary fixture.
Modular maintenance updated 2026-09-15. Follow the [maintenance plan](../05-delivery/modularity-plan.md) before moving files.

```text
CODEtoFIGMA/
├── README.md                         # status and navigation
├── AGENTS.md                         # one-task working policy
├── docs/
│   ├── 01-product/                   # brief, personas, goals
│   ├── 02-research/                  # OpenPencil feasibility, comparison notes
│   ├── 03-architecture/              # overview, decisions, this repository map
│   ├── 04-modules/                   # per-module specification
│   ├── 05-delivery/                  # roadmap, milestones
│   └── 06-quality/                   # quality gates, test strategy
│
├── apps/
│   ├── web/
│   │   ├── src/components/           # Vue conversion form and result panels
│   │   ├── server/                   # local API and Vite composition root
│   │   └── README.md                 # UI operating instructions
│   ├── cli/src/
│   │   ├── main.ts                   # arg-parse entry point only (~50 lines)
│   │   └── commands/
│   │       ├── capture.ts            # capture command — build + print
│   │       └── writeback.ts          # writeback command — execute + print
│   └── figma-plugin/src/             # Figma plugin entrypoint (inactive reference)
│
├── packages/
│   ├── contracts/src/
│   │   └── index.ts                  # versioned Scene schema and type validation
│   │
│   ├── browser/src/
│   │   ├── capture-project.ts        # Playwright DOM capture → Scene
│   │   └── read-dom.ts               # DOM metadata extraction (runs in Chromium)
│   │
│   ├── core/src/
│   │   ├── index.ts                  # public barrel — all core exports
│   │   └── modules/
│   │       ├── naming/               # explicit and inferred layer naming
│   │       ├── figma-import/         # import orchestration through editor port
│   │       ├── openpencil/           # legacy prototype contracts; no native runtime
│   │       └── source-mapping/
│   │           ├── __tests__/        # all unit tests for this module
│   │           ├── types.ts          # SourceMappingEntry, SourceMap — single lookup
│   │           ├── index.ts          # module barrel re-exporting everything
│   │           ├── conflict.ts       # staleness check
│   │           ├── conflict-merge.ts # merge strategy
│   │           ├── writeback.ts      # text writeback domain logic
│   │           ├── color-writeback.ts
│   │           ├── layout-writeback.ts
│   │           ├── css-writeback.ts
│   │           └── sfc-ast-transformer.ts
│   │
│   └── tooling/
│       ├── index.ts                  # public barrel (unchanged)
│       ├── openpencil-io.ts          # stable adapter entrypoint
│       ├── openpencil/
│       │   ├── compatibility.ts      # tested editor version and format
│       │   ├── asset-hash.ts         # image identity calculation
│       │   ├── scene-adapter.ts      # shared Scene to native graph
│       │   └── native-io.ts          # public codec/export/parse APIs
│       │
│       ├── milestone1.ts             # stable library/command entrypoint
│       ├── milestone/
│       │   ├── types.ts              # build options
│       │   ├── build-package.ts      # composes capture, backups and evidence
│       │   └── run-fixture.ts        # Vite lifecycle and command output
│       ├── fidelity-reporter.ts      # barrel → fidelity/
│       ├── file-adapter.ts           # barrel → writeback/ + createSourceBackup
│       ├── writeback-orchestrator.ts # executor: loads docs, calls diff-engine
│       │
│       ├── backup/
│       │   └── source-backup.ts      # sha256Hex + backupSourceFiles
│       │
│       ├── capture/
│       │   └── scene-helpers.ts      # findFirstTextNode, findRootFrameNode, buildWorkingScene
│       │
│       ├── fidelity/
│       │   ├── types.ts              # FidelityReport type + formatRgba helper
│       │   ├── preview-builder.ts    # generateDesignPreviewScreenshot (Playwright)
│       │   ├── compare.ts            # compareFidelity — scene metadata → FidelityReport
│       │   └── report-markdown.ts    # formatFidelityReportMarkdown
│       │
│       ├── validation/
│       │   └── roundtrip-verifier.ts # verifyWorkingFigRoundtrip — .fig round-trip checks
│       │
│       └── writeback/
│           ├── text-adapter.ts       # saveTextWritebackToFile
│           ├── color-adapter.ts      # saveColorWritebackToFile
│           ├── layout-adapter.ts     # saveLayoutWritebackToFile
│           └── diff-engine.ts        # computeDiffs, flattenNodes, mapOpenPencilNode (pure)
│
└── tests/
    ├── fixtures/
    │   ├── vue/                      # primary Vue 3 + TypeScript fixture
    │   └── react/                    # regression baseline fixture
    ├── spikes/                       # exploratory, non-regression scripts
    └── integration/
        ├── capture/                  # capture.test.ts, milestone1-fixture.test.ts
        ├── writeback/                # writeback-recapture, cli-writeback, css-writeback,
        │                             #   layout-recapture, conflict-handling
        ├── persistence/              # openpencil-persistence.test.ts
        └── fidelity/                 # fidelity-report.test.ts
```

## Architecture layers (unchanged)

```
Presentation  →  apps/cli/src/commands/
Application   →  packages/tooling/  (orchestrators + adapters)
Domain        →  packages/core/src/modules/  (pure logic)
Contracts     →  packages/contracts/src/  (shared types)
Infrastructure→  packages/browser/src/ and packages/tooling/ adapters
```

## Navigation rules

- **Find a type**: look in `contracts/src/index.ts` or the relevant module's `types.ts`.
- **Find domain logic**: look in `core/src/modules/<module>/`.
- **Find file I/O**: look in `tooling/writeback/`, `tooling/backup/`, or `tooling/validation/`.
- **Find a CLI command**: look in `apps/cli/src/commands/`.
- **For an explicitly scoped new CLI command**: use `commands/<name>.ts` and dispatch from `main.ts`.
- **For an explicitly scoped writeback property**: reuse domain rules and place file I/O in `writeback/`.

## Invariants

- Browser and Figma adapters stay in separate packages (different runtimes).
- Direct `@open-pencil/*` imports stay inside `tooling/openpencil/`; see the [adapter boundary](openpencil-adapter.md).
- Barrel files (`file-adapter.ts`, `fidelity-reporter.ts`, `milestone1.ts`) absorb splits so
  external imports never break when internals are reorganised.
- Tests beside source use `__tests__/` subdirectories; integration tests group by domain.
- No dashboard, database, hosted service, queue or MCP server directories exist or should be added.
- Generated outputs stay in `.artifacts/` and `dist/`. Source fixture assets belong with fixtures.
