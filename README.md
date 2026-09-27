# Code to Design — OpenPencil & Figma Converter

> **Status: Milestones 1–5 COMPLETED & VERIFIED.** All quality gates pass (`pnpm check`: 78/78 Vitest integration tests passing, 0 `tsc` errors, 0 `eslint` errors, clean package builds across core, contracts, tooling, browser, CLI, figma-plugin, and vue-fixture).

Convert a running Vue + TypeScript interface into editable OpenPencil / Figma layers with clear layer hierarchy, measured placement, and bidirectional traceability to its source code project. Edit live web interfaces visually in the design editor and automatically write back visual edits (text content, fill colors, paddings, gaps, and scoped CSS rules) cleanly into Vue SFC source code.

Target editor is officially [open-pencil/open-pencil](https://github.com/open-pencil/open-pencil) at [openpencil.dev](https://openpencil.dev/).

---

## Completed Milestones & Capabilities

- **Milestone 1 — Native OpenPencil Integration & Canvas Fidelity:**
  - Official OpenPencil package exports (`@open-pencil/fig` `0.14.0`) with native `.fig` document I/O (`original.fig`, `working.fig`).
  - Source provenance anchors (`pluginData` tuples: `[sourceFile, sourceId, kind]`).
  - Multi-asset backups (`App.vue`, `style.css`, `study.png`) and Playwright canvas fidelity rendering.

- **Milestone 2 — Visual Text & Solid Fill Color Vue SFC Writeback:**
  - Controlled Vue SFC text writeback (`saveTextWritebackToFile`) and fill color writeback (`saveColorWritebackToFile`).
  - Automatic pre-edit `.backup/` snapshots.

- **Milestone 3 — Multi-Property Layout Writeback:**
  - Multi-property layout writeback (`saveLayoutWritebackToFile` for paddings & flexbox gaps).
  - End-to-end recapture integration suite.

- **Milestone 4 — Staleness Engine & Conflict Resolution:**
  - SHA-256 source file staleness checking (`checkSourceStaleness`).
  - 3-way conflict merge resolver (`resolveSourceConflict`) and CLI `--dry-run`/`--force` flags.

- **Milestone 5 — Pure Domain Vue SFC AST Transformer:**
  - Vue SFC AST transformer engine (`applySfcAstTextUpdate`, `applySfcAstStyleUpdate`).
  - Scoped CSS `<style>` rule mutator (`applySfcCssRuleUpdate`).

---

## Quick Start & Usage

### Option A: Interactive Windows Launchers (Recommended for Windows)

In File Explorer or Terminal, execute:
- **`scripts\launch.bat`** — Interactive menu launcher for starting the UI server, capturing DOM to `.fig`, executing writebacks, or running quality checks.
- **`scripts\start-ui.bat`** — 1-click launcher to start the local Vue web application at `http://127.0.0.1:4174` and open it in your browser.

---

### Option B: CLI Commands

1. **Install Dependencies & Browser Drivers:**
   ```sh
   pnpm install --frozen-lockfile
   pnpm setup:browser
   ```

2. **Start the Live Vue UI Server:**
   ```sh
   pnpm dev:vue
   ```
   App runs at `http://127.0.0.1:4174`.

3. **Capture UI to OpenPencil `.fig` File:**
   ```sh
   pnpm capture --url http://127.0.0.1:4174 --out original.fig
   ```
   *Or run `pnpm milestone1` for full pipeline capture and canvas preview rendering.*

4. **Edit Visually in OpenPencil:**
   - Open `original.fig` in **[openpencil.dev](https://openpencil.dev/)**.
   - Edit text, change colors, or adjust paddings/gaps visually.
   - Save file as `working.fig`.

5. **Write Back Edits to Vue Source Code:**
   ```sh
   pnpm writeback --original original.fig --working working.fig
   ```

6. **Run Quality Gate Verification Suite:**
   ```sh
   pnpm check
   ```

---

## Repository Architecture & Structure

```
├── apps/
│   ├── cli/             # Command-line interface (capture & writeback commands)
│   └── figma-plugin/    # Figma plugin manifest & output bundle
├── packages/
│   ├── browser/         # Playwright DOM capture & canvas rendering
│   ├── contracts/       # Core TypeScript interfaces & domain schemas
│   ├── core/            # AST transformations, CSS mutators & conflict resolvers
│   ├── figma/           # Document parser & scene graph builder (@open-pencil/fig)
│   └── tooling/         # Milestone orchestrators & writeback helpers
├── scripts/             # Windows batch launchers (launch.bat, start-ui.bat)
└── tests/              # Vitest unit & integration test suites (78 passing tests)
```

---

## Documentation

- [Working Policy & Rules](AGENTS.md)
- [Modularity Plan & Maintenance Rules](docs/05-delivery/modularity-plan.md)
- [OpenPencil Adapter & Upgrade Boundary](docs/03-architecture/openpencil-adapter.md)
- [Product Contract & Project Linkage](docs/01-product/brief.md)
- [Sequential Roadmap](docs/05-delivery/roadmap.md)
- [Three Layers Overview](docs/03-architecture/overview.md)
