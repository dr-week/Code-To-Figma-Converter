# Modularity maintenance plan

Updated 2026-09-15. Scope: organize existing conversion infrastructure and repair imports from earlier test-folder moves. Preserve behavior, commands, artifact names and public exports. No new features or OpenPencil modifications.

## Read before editing

1. [Working policy](../../AGENTS.md)
2. [Product brief](../01-product/brief.md)
3. [Roadmap](roadmap.md)
4. [Architecture](../03-architecture/overview.md)
5. [Repository map](../03-architecture/repository-map.md)
6. The current task specification and affected tests.

## Execution plan

- Separate asset hashing, scene adaptation and native I/O behind `packages/tooling/openpencil-io.ts`.
- Separate build options, package orchestration and fixture command lifecycle behind `packages/tooling/milestone1.ts`.
- Reuse existing backup, capture, validation, fidelity and writeback folders.
- Repair stale imports in moved tests without changing assertions.
- Run `pnpm check`: TypeScript, ESLint, Vitest, React fixture/plugin and Vue fixture builds.

## Maintenance rules

- Choose the owning folder from the repository map before adding files.
- Split by responsibility, not line counts. Do not create empty or speculative child folders.
- Keep console output and server lifecycle outside reusable package builders.
- Keep editor runtime types in infrastructure; domain code depends on contracts.
- Keep compatibility entrypoints small. Internal modules import specific siblings.
- Update imports and execute affected tests whenever moving files.
- Reuse existing helpers and types rather than duplicating behavior.
- Keep artifacts in `.artifacts/` or package `dist/`. Root files remain documentation entrypoints and required configuration.

## Evidence

Baseline tests: 17 suites could not load because earlier folder moves left stale imports; 8 suites and 37 tests passed. Strict TypeScript also found optional values explicitly passed as undefined; callers now omit absent values.

Final verification (2026-09-15): `pnpm check` passed with 78 tests across 25 files, TypeScript, ESLint, React fixture/plugin and Vue fixture builds. After the final module extraction, TypeScript and focused ESLint passed; the existing milestone package and native adapter tests passed (4 tests across 2 files). No assertions were weakened.

Command verification: `pnpm milestone1` generated a package containing 26 nodes, 1 image and 3 source backups; native API round-trip passed. Output correctly reported Milestone 1 INCOMPLETE.

Structural task: complete. Existing import paths remain compatible. This task does not prove editor persistence, fidelity, safe conflict merging or general Vue AST support. The next product task remains actual unmodified OpenPencil editor persistence verification.
