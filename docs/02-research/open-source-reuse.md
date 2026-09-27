# Open-source reuse strategy

**Priority updated 2026-09-12:** the output focus is OpenPencil. Its existing DOM/CSS package is the first reuse candidate for the single-screen spike; details and source evidence are in [OpenPencil research](openpencil.md). No new package has been installed in this assessment.

Checked 2026-09-11. The user explicitly supports using existing open-source code to reduce workload. Prefer reuse where integration and maintenance cost are lower than implementing the same behavior. Implementation status corrected 2026-09-12: Playwright, esbuild, Zod and pixelmatch are installed in the prototype. No third-party converter was adopted or benchmarked, and create-figma-plugin was not installed. Use the existing pipeline for the next Vue task; do not start a broad reuse investigation alongside it.

## Candidate decisions

| Candidate | Evidence and license | Proposed use |
| --- | --- | --- |
| [BuilderIO/figma-html](https://github.com/BuilderIO/figma-html) | MIT; README says the project moved. API metadata reports last push 2025-08-19. Inspected package configuration uses React 16, Webpack 4 and an OpenSSL legacy-provider build option. | Evaluate reusable conversion code from a pinned revision. Do not copy its complete application/build stack or assume the current commercial extension is covered by the old repository license. |
| [kbishopzz/HTML-to-Figma](https://github.com/kbishopzz/HTML-to-Figma) | Repository reports MIT; last push 2026-01-29. Inspected `src/converters/html-converter.ts` contains native text/frame helpers, but its image helper creates a placeholder and its text helper trims content. | Candidate for selected mapping helpers, subject to tests. Those inspected behaviors conflict with our image/text fidelity contract and must be fixed or excluded. This is a file-level finding, not proof of every runtime path's behavior. |
| [create-figma-plugin](https://github.com/yuanqing/create-figma-plugin) | MIT toolkit for Figma plugin development. | Preferred candidate for plugin build/UI plumbing. Check compatibility and generated dependencies; keep the scene importer independent of the toolkit. |
| [pixelmatch](https://github.com/mapbox/pixelmatch) | ISC image-comparison library. | Reuse for pixel differences rather than implementing a diff algorithm. Our validation module still defines thresholds and reporting. |
| [Web2UI](https://github.com/Lynavo/web2ui) | AGPL-3.0; API reports a recent push on 2026-09-10. | Comparison candidate. Do not select it as the default code foundation without choosing a compatible licensing/distribution model. Recent activity alone does not prove maturity. |
| [Official MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | Current LICENSE describes a transition from MIT to Apache-2.0 with some contributions remaining MIT; documentation has separate terms. | Use an appropriate released SDK for the later MCP adapter. Record the exact release's applicable notices rather than labeling the entire moving repository simply MIT. |

Existing planned tools such as Playwright and framework tooling already avoid substantial infrastructure work. The biggest uncertain shortcut is the actual DOM-to-Figma mapping, which must satisfy our fixtures before we rely on it.

Repository push dates are API metadata, not validated release dates or evidence of support. Recheck package releases and full dependency trees when selecting an immutable revision.

## Keep our differentiating behavior

Own the explicit naming contract, source/instance identity, framework provenance adapters, versioned scene format, warning policy, import recovery and measured fidelity reports. Existing code may implement parts of these, but our acceptance contract remains authoritative. We do not need to write every line ourselves to demonstrate engineering judgment.

The portfolio should state which libraries or files were reused and show our concrete contributions: corrected mappings, source traceability, integration boundaries, regression tests and measured results. Never describe a lightly renamed fork as an original conversion engine.

## Integration pattern

Prefer a versioned package dependency when it exposes the needed behavior. If modification is necessary, use a pinned fork or copy only a small auditable subset, retaining original notices and recording changes. A wrapper converts upstream input/output into our scene types; core code must not depend directly on upstream private types.

Place adopted runtime code in the appropriate adapter module from the [repository map](../03-architecture/repository-map.md). If vendoring becomes necessary, use an explicitly named upstream subtree within that adapter, with source commit, license and patch notes. Do not mix unexplained copied code into domain files or add entire unrelated repositories to the root.

## Timeboxed evaluation within phase 0

1. Pin candidate commits and inspect their licenses, entrypoints, dependency scripts and required external services.
2. Verify a clean build on a supported runtime. Identify conversion source actually available at that revision; a package name or README is not enough.
3. Run the same owned fixture containing a box, annotated button, multiline text and real image. Inspect native Figma output, exact names, text whitespace, image bytes and local coordinates.
4. Estimate the changes needed to wrap or repair it. Prefer the candidate with the smallest tested integration cost, not the most stars.
5. Record adopt/adapt/reject, evidence, upstream revision, outstanding issues and revised effort. Stop evaluation after 1–2 focused days; implement a narrow supported path if candidates cost more to repair.

No percentage reduction is defensible before this test. Tooling reuse should reduce setup effort; converter reuse may save mapping work, but outdated dependencies and incomplete behavior can consume those savings. The earlier 34–55-day multi-feature estimate is superseded by the sequential conversion-only roadmap.

## Attribution and release records

For each adopted dependency or copied subset, record name, source URL, immutable version/commit, applicable license, copyright/notices, changed files and reason for adoption. Preserve required license/notice material in distributions. Generate a dependency inventory when code exists, and add `docs/07-attribution/third-party.md` at that point; an empty attribution ledger is unnecessary now.

MIT permits reuse subject to its notice conditions; a public repository without a suitable license is not equivalent permission. AGPL has source-sharing conditions, including a provision concerning modified network-accessible versions, so it needs a deliberate distribution decision. These candidate-specific terms should be checked against the exact revision and intended use. [Builder MIT license](https://github.com/BuilderIO/figma-html/blob/master/LICENSE.md) · [Web2UI license](https://github.com/Lynavo/web2ui/blob/main/LICENSE) · [MCP SDK license](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/LICENSE)

## Source inspection record

Read through the GitHub API: Builder `package.json`, blob `aa053c925e9c8f08709eb6f17d7b7220fe7ee708`; HTML-to-Figma `src/converters/html-converter.ts`, blob `bfa32c4915aaae375e60279f09de5fc5b702f2a4`; MCP SDK `LICENSE`, blob `4a93985763241755401a10678395303de4e720ba`. These identify inspected files, not selected dependency commits. Full execution paths, transitive licenses and runtime behavior remain unverified.

## User-supplied code.to.design reference

The [code.to.design website](https://code.to.design/) describes an HTML/CSS/JavaScript conversion API with clipboard and plugin modes and a JavaScript SDK. It is a potential external conversion provider as well as a competitor. An available API/SDK does not establish that the conversion engine is open source. License, pricing, data handling, preservation of our names and Vue fixture fidelity have not been verified. No integration, account or subscription was created.
