# Swiss market relevance and stack decision

## Evidence, not a national stack

There is no single Swiss frontend framework or database standard established by this research. Employer technology choices vary by sector and team. A portfolio should demonstrate careful delivery and transferable skills, while matching individual job descriptions.

| Primary source, checked 2026-09-11 | Evidence | Limit |
| --- | --- | --- |
| [Liip custom development](https://www.liip.ch/en/services/development/custom-development) | Lists Vue, React and Angular alongside several backend ecosystems; describes agile collaboration. | Service capability page, not a count of vacancies. |
| [Swissquote tech careers](https://www.swissquote.com/en/careers/tech-jobs) | Search-indexed employer page lists Java, Spring, TypeScript, React, Docker and Kubernetes. | Direct fetch timed out; evidence is the employer's indexed page excerpt, not a verified live vacancy. |
| [Institut International de Lancy role PDF](https://www.iil.ch/wp-content/uploads/2025/09/Developer_09.25-3.pdf) | Search-indexed employer PDF mentions React/TypeScript and PostgreSQL/Azure SQL. | Historical 2025 document; direct fetch was unavailable. It does not establish current recruitment. |

This small sample supports React/TypeScript relevance and shows that Vue is also used. It does not establish market share, Next.js dominance, sponsorship availability or which firms outsource to India. No verified Swiss-to-Indian vendor hiring relationship was established. Avoid claims about those relationships in the portfolio.

## Current stack direction — updated 2026-09-12

| Area | Selection | Why |
| --- | --- | --- |
| Conversion core and CLI | Strict TypeScript on supported Node.js LTS | Shared types with web UI and plugin; deterministic logic stays framework-independent. |
| Capture | Playwright with pinned Chromium | Executes actual UI and supplies repeatable browser measurements. |
| Dashboard | Outside current scope | Visual editing happens in Figma; no extra web application is needed to validate conversion. |
| Input validation priority | Vue + TypeScript first | Matches the user's workflow. Reuse one DOM capture engine; retain React as a regression fixture. |
| Figma importer | TypeScript plugin, lightweight UI | Native editor writes; reuse contracts and mapping rules. |
| Persistence | Local files | Enough for the current conversion workflow; PostgreSQL is prior research only. |
| Tests and repository | Vitest, Playwright, pnpm workspace, ESLint, formatter, GitHub Actions | Small, explainable workflow and reproducible evidence. |

These are engineering selections, not a claim that the sampled employers use this complete combination. PostgreSQL's documented capabilities include transactions, constraints and JSON support. [PostgreSQL overview](https://www.postgresql.org/about/)

Employer research does not override the user's Vue-first requirement. No additional dashboard framework or backend language is selected. Demonstrate quality through the narrow converter and its evidence.

Pin compatible stable releases at implementation kickoff after checking official support and security notices. Commit the lockfile and runtime version. Do not put guessed future package versions into the plan.

## Portfolio evidence to produce

Show one end-to-end working Vue conversion, a source-to-layer inspection, measured limitations, an architecture diagram, focused pull requests, tests and a release tag. Explain one failed mapping and the subsequent fix. Use readable English technical documentation and consistent naming. These are proposed professional practices, not certification against a Swiss standard.

For visual presentation, use a restrained grid, clear typography, consistent spacing and accessible controls. This is a Swiss-inspired visual direction only; it does not establish software compliance or improve conversion correctness by itself.
