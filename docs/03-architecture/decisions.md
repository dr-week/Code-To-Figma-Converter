# Architecture decision log

**ADR-013 — external editor boundary, 2026-09-13:** the user requires integration with unmodified OpenPencil through documented public APIs. Own only a thin infrastructure adapter, source mappings and compatibility tests. Pin published artifacts by version and lockfile integrity; retain the inspected upstream commit as separate research provenance, without claiming artifact/source equivalence. Rebuilding upstream to match that commit is not a prerequisite and is outside scope. No forks, installed-package patches, private imports or custom editor distributions. Unsupported public capabilities are reported, not implemented inside OpenPencil. Upgrades are separate bounded compatibility tasks. This supersedes earlier conditional suggestions to rebuild/customize the editor and exact-local-source build requirements.

**ADR-012 — confirmed source writeback, 2026-09-12:** the user requires supported visual edits to update the original Vue source while retaining names, IDs, classes and behavior. This supersedes ADR-010's unselected reverse-sync scope. Milestone 1 packages one Vue page with editable OpenPencil output, source mapping, backups and fidelity evidence. Milestone 2 starts with one controlled literal text update, checking source hashes and rejecting ambiguous ownership. Live synchronization is deferred. See the [package specification](../05-delivery/milestone-01.md). No writeback capability is currently implemented.

Initial proposals dated 2026-09-11; scope corrected 2026-09-12. A prototype now exists. ADR-010 supersedes the React-first order and the dashboard/database commitments in ADR-005/006. Earlier rows remain as decision history, not a task queue.

| ID | Decision | Alternative considered | Tradeoff and revisit trigger |
| --- | --- | --- | --- |
| ADR-001 | Browser capture plus optional source metadata | Pure AST conversion | Execution resolves styles/state; requires a running app. Revisit only for a constrained static component DSL. |
| ADR-002 | Versioned intermediate scene | Write Figma directly during capture | Extra schema maintenance buys testability, repeatable import and adapter independence. |
| ADR-003 | Own plugin for MVP output | Official MCP-only workflow | Requires plugin UX but avoids making a custom product depend on supported-client access. Revisit after access/capability benchmark. |
| ADR-004 | Three layers and feature modules | Microservices | Small deployment footprint and clear boundaries; separate only browser worker lifecycle when necessary. |
| ADR-005 | Strict TypeScript; React/Next.js later dashboard | Vue/Nuxt, Java or .NET dashboard backend | Consistent language and React relevance. Change if a concrete target role and project needs justify it. |
| ADR-006 | Files first, PostgreSQL for persistent jobs | Immediate hosted DB or document DB | Proves hardest conversion risk before persistence work; relational metadata suits later queries and constraints. |
| ADR-007 | Deterministic names and geometry | LLM-generated scene | Auditable behavior with no per-node token cost; less automatic semantic guessing. |
| ADR-008 | Snapshot placement first, constrained auto layout later | Infer auto layout everywhere | Better initial placement but less responsive editability. Extend only against passing geometry fixtures. |
| ADR-009 | Reuse libraries and selectively adapt open-source converter code | Build everything from scratch or fork an entire product unchanged | User-authorized reuse reduces boilerplate. Keep our contracts and verify license, build and fixture behavior before adoption. See the [reuse strategy](../02-research/open-source-reuse.md). |

**ADR-010 — accepted 2026-09-12:** Vue-first conversion; one acceptance task at a time; project traceability with no assumed reverse synchronization. Reuse the existing pipeline and retain React as regression evidence. Dashboard, database and MCP implementation are excluded from current scope by the user's instruction.

For a future change, add context, decision, consequences and evidence here. Supersede an old decision explicitly; do not silently rewrite the project history.

**ADR-011 — selected output focus, 2026-09-12:** target OpenPencil for one Vue-screen feasibility task. Target editor is officially confirmed as [open-pencil/open-pencil](https://github.com/open-pencil/open-pencil) at [openpencil.dev](https://openpencil.dev/) (MIT License). Prefer upstream DOM/CSS conversion plus our naming and fidelity checks, adapting only when a tested gap requires it. This supersedes the Figma destination in ADR-003/010 without deleting the existing code. Three layers and one task at a time remain. See [assessment](../02-research/openpencil.md).
