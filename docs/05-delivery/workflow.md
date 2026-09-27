# Development and code-editing workflow

Updated 2026-09-12. Runtime scripts and a CI configuration now exist; their presence alone does not mean the current working tree has passed every check. Read the [working policy](../../AGENTS.md) and [current task](roadmap.md) before editing code.

## Work-in-progress limit: one

Choose one conversion acceptance task, make the smallest cohesive change, verify it and report its outcome before starting the next. Do not add optional features, frameworks, services or broad refactors alongside it. If a defect blocks the chosen task, fix that defect within the same scope. Retained research is not a backlog to implement automatically. For documentation-only edits, check consistency and local links instead of rerunning unrelated runtime tests.

## One change from requirement to release

1. Write a small issue with the user behavior, support boundary and acceptance fixture.
2. Identify the owning module and affected contract. Record an ADR only for a consequential architectural decision.
3. Create a short-lived feature branch. Make one coherent change; avoid unrelated refactoring.
4. Add a meaningful regression fixture or test for behavior with risk. Update the support matrix when behavior changes.
5. Run formatting, lint, typecheck and relevant tests; run the required build/contract/fixture suite before merging.
6. Open a focused PR describing the problem, behavior, evidence and known limitations. Review the diff and generated artifacts. A solo self-review must be labeled honestly.
7. Merge after checks pass; tag demonstrable releases and record migration or rollback steps where relevant.

## Coding rules

Strict TypeScript; validate untrusted data at boundaries rather than casting it. Pure mapping functions where practical. Explicit return/error contracts at module boundaries. Named exports and consistent terminology. Structured logs with job/stage IDs, no source secrets. Inject browser, editor and storage ports so core tests run without those runtimes.

Avoid deep cross-module imports, speculative abstractions, duplicated schema definitions and framework dependencies in core. Keep route handlers and MCP handlers thin. Catch errors where recovery or useful context exists; never swallow them. Comments explain reasons and constraints, not obvious syntax.

## Proposed CI gates

Formatting/lint, strict typecheck, dependency-boundary checks, unit/contract tests, application/plugin builds and deterministic browser fixtures. Database migration tests join the gates when persistence exists. Editor-dependent validation may initially be a documented manual release gate; do not label mocked Plugin API tests as proof of real Figma fidelity.

Visual baseline changes require before/after review, not blanket automatic acceptance. Dependency updates use a focused PR with relevant regression fixtures and a committed lockfile.

## Definition of done

The acceptance fixture passes; output names and geometry are inspected; unsupported cases report honestly; affected documentation and contracts agree; no secrets/generated clutter are committed; and a reviewer can explain the code path from input to Figma output.

## PR template content

Problem and resulting behavior; affected module/contract; test evidence; screenshots or geometry report if visual; limitations and recovery instructions if relevant. Keep scope small enough for a reviewer to understand in one sitting.
