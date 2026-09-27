<div align="center">

  <h1>⚡ Code to Design</h1>
  <p><strong>Bi-Directional Visual Design Converter & AST Source Code Synchronizer</strong></p>

  <p>
    <a href="https://github.com/dr-week/Code-To-Figma-Converter/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge&logo=github-actions" alt="Build Status" /></a>
    <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6.svg?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
    <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue.js-3.5-4FC08D.svg?style=for-the-badge&logo=vuedotjs" alt="Vue.js" /></a>
    <a href="https://openpencil.dev"><img src="https://img.shields.io/badge/Editor-OpenPencil%20%7C%20Figma-6C5CE7.svg?style=for-the-badge" alt="OpenPencil Editor" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" alt="License" /></a>
  </p>

  <p>
    Convert running Vue + TypeScript interfaces into editable OpenPencil & Figma canvas layers.<br />
    Visually edit text, colors, paddings, and flexbox spacing on canvas—and write changes directly back to Vue SFC source code.
  </p>

  <br />

</div>

---

## 📌 Executive Summary

**Code to Design** bridges the gap between running web applications and visual design editors. Built for design-driven engineering teams, it renders live web DOM trees into native, structured **OpenPencil / Figma (`.fig`)** design documents while maintaining full **source code provenance**. 

When designers or developers edit text strings, color fills, element paddings, or flexbox gaps inside the visual canvas, **Code to Design** computes granular AST diffs and writes those visual edits cleanly back to the original `<template>` and `<style>` blocks of your project's Single File Components (`.vue`).

---

## ✨ Key Features & Capabilities

- 🔄 **Bidirectional AST Source Writeback**: Non-destructive Vue SFC mutation. Updates `<template>` text nodes and `<style scoped>` CSS rules while preserving script logic, comments, and formatting.
- 🎨 **Native Document I/O (`.fig`)**: Full support for official `@open-pencil/fig` v0.14.0 file format reading, editing, and writing.
- 🏷️ **Source Provenance Anchoring (`pluginData`)**: Embeds non-destructive metadata tuples `[sourceFile, sourceId, kind]` onto every visual layer for deterministic code-to-design mapping.
- 🛡️ **Automated Safety & Snapshot Backups**: Pre-edit `.backup/` snapshots created automatically prior to modifying any source code.
- ⚔️ **SHA-256 Conflict Engine**: Detects out-of-band source changes, prevents accidental code overwrites, and supports 3-way conflict merges with `--dry-run` and `--force` flags.
- 🖥️ **Interactive Windows Launchers**: Built-in 1-click batch launchers (`scripts/launch.bat`, `scripts/start-ui.bat`) for easy developer onboarding.

---

## 📐 System Architecture

```mermaid
flowchart LR
    subgraph Client["Running Web App"]
        A["Vue 3 / TypeScript UI<br/>(Local Server: 127.0.0.1:4174)"]
    </div>

    subgraph CaptureEngine["Code to Design Engine"]
        B["DOM Capture Adapter<br/>(Playwright Browser Engine)"]
        C["Source Provenance Mapper<br/>(pluginData Tuples)"]
        D["Native Document Writer<br/>(@open-pencil/fig)"]
    end

    subgraph Editor["Visual Design Editor"]
        E["OpenPencil / Figma Canvas<br/>(original.fig)"]
        F["Visual Edits:<br/>Text, Fills, Paddings & Gaps"]
        G["Saved Canvas<br/>(working.fig)"]
    end

    subgraph WritebackEngine["AST Mutation Engine"]
        H["Visual Diff Engine"]
        I["Safety Snapshot (.backup/)"]
        J["SFC AST Transformer"]
    end

    A -->|1. Inspect DOM| B
    B -->|2. Attach Source Maps| C
    C -->|3. Export Native Package| D
    D -->|4. Import Document| E
    E -->|5. Edit Visually| F
    F -->|6. Save Output| G
    G -->|7. Compute Diffs| H
    H -->|8. Create Snapshot| I
    I -->|9. Mutate SFC Source| J
    J -->|10. Vite Hot-Reload| A
```

---

## 🚀 Quick Start Guide

### Option 1: Interactive Windows Launcher (Recommended)

Simply run the interactive batch script located in the `scripts/` directory:

```cmd
.\scripts\launch.bat
```

The interactive menu provides quick options to:
1. **Start Vue UI Application** (Launches server & opens browser at `http://127.0.0.1:4174`)
2. **Run UI Capture Pipeline** (Generates `original.fig` & canvas fidelity preview)
3. **Run Visual Writeback** (Syncs visual edits from `working.fig` back to code)
4. **Run Full Quality Gate Checks** (Runs typechecking, linting, and tests)

For a direct 1-click launch of the Web UI:
```cmd
.\scripts\start-ui.bat
```

---

### Option 2: Command Line Interface (CLI)

#### 1. Installation & Environment Setup

Clone the repository and install workspace dependencies:

```bash
# Clone the repository
git clone https://github.com/dr-week/Code-To-Figma-Converter.git
cd Code-To-Figma-Converter

# Install pnpm dependencies
pnpm install --frozen-lockfile

# Install headless browser drivers for DOM capture
pnpm setup:browser
```

#### 2. Start Live Development UI

Launch the included Vue 3 UI fixture server:

```bash
pnpm dev:vue
```
*The local interface will be live at `http://127.0.0.1:4174`.*

#### 3. Capture Web UI to OpenPencil `.fig` File

Convert the running application into a design document:

```bash
pnpm capture --url http://127.0.0.1:4174 --out original.fig
```
*Or execute `pnpm milestone1` to run the full capture, native `.fig` packaging, and visual fidelity rendering pipeline.*

#### 4. Edit Visually in OpenPencil

1. Launch **[openpencil.dev](https://openpencil.dev/)** or the OpenPencil desktop application.
2. Load the generated `original.fig` package.
3. Edit UI text strings, background colors, paddings, or flexbox gaps directly on the canvas.
4. Save the modified document as `working.fig`.

#### 5. Synchronize Edits Back to Vue Source Code

Execute the writeback orchestrator to update your project source code:

```bash
pnpm writeback --original original.fig --working working.fig
```

---

## 📂 Repository Structure

```
code-to-design/
├── 📁 apps/
│   ├── 📄 cli/             # CLI application entrypoints (capture & writeback commands)
│   └── 📄 figma-plugin/    # Figma plugin manifest and bundle target
├── 📁 packages/
│   ├── 📄 browser/         # Headless browser DOM capture & Playwright canvas renderer
│   ├── 📄 contracts/       # Core TypeScript interfaces, AST schemas & contracts
│   ├── 📄 core/            # SFC AST transformers, CSS rule mutators & conflict engine
│   ├── 📄 figma/           # Document parser & scene graph builder (@open-pencil/fig)
│   └── 📄 tooling/         # Milestone orchestrators, diff engines & backup tools
├── 📁 scripts/             # Windows batch launchers (launch.bat, start-ui.bat)
├── 📁 tests/              # Vitest integration & unit test suite (78 tests passing)
└── 📄 README.md            # Enterprise product documentation
```

---

## 🧪 Quality Assurance & Test Verification

This project enforces strict quality gates across all workspace packages:

| Verification Gate | Command | Status |
| :--- | :--- | :--- |
| **TypeScript Compiler** | `pnpm typecheck` | `0 Errors` |
| **ESLint Quality Engine** | `pnpm lint` | `0 Warnings` |
| **Vitest Test Suite** | `pnpm test` | `78/78 Tests Passing` |
| **Workspace Build** | `pnpm build` | `Clean Build` |

Run the full quality gate pipeline with a single command:
```bash
pnpm check
```

---

## 🤝 Contributing & License

Contributions are welcome! Please ensure all code changes follow the rules defined in [`AGENTS.md`](AGENTS.md) and pass `pnpm check` before submitting a pull request.

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <sub>Maintained by <strong>Dr-Week Software Engineering</strong>. Built for OpenPencil & Figma design workflows.</sub>
</div>
