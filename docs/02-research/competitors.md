# Competitor research

Checked 2026-09-11. This is a desk review of primary documentation, not a hands-on benchmark. Features below are vendor descriptions. Prices and usage allowances are omitted because they change and do not determine the architecture.

| Product | Verified overlap | Implication for this project |
| --- | --- | --- |
| [code.to.design](https://code.to.design/) — added 2026-09-12 | Website documents HTML/CSS/JavaScript conversion through clipboard and plugin API modes, with a JavaScript SDK. | Direct overlap and a possible external provider. Not benchmarked; open-source engine availability and our source-link requirements are unverified. |
| [html.to.design](https://html.to.design/docs/what-is-html-to-design) | Imports websites into Figma for editable design work. | Strong direct competitor for the generic website-import use case. |
| [story.to.design](https://story.to.design/docs/compatibility) | Converts stories into Figma components and variants; works at DOM level across frameworks, including supported Storybook and Histoire setups. | Direct competitor for component libraries. Storybook support alone is not differentiation. |
| [Builder HTML to Figma](https://github.com/BuilderIO/figma-html) | Repository describes website-to-editable-Figma conversion and redirects users to Builder's Chrome extension. | Useful implementation reference; verify current extension behavior and license obligations before reuse. The old repository is not evidence of current maintenance. |
| [Figma remote MCP](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/) | Documents live UI capture into Figma for select clients. | The platform itself competes with the central capture use case. |
| [Figma write to canvas](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/) | Agents can create native canvas structures through supported clients. | Native generation is already available; evaluate as an integration or baseline. |

[story.to.design also documents synchronization status](https://story.to.design/docs/components-status). Therefore, synchronization is not an unoccupied market either.

## Strategy

Do not present this as the first code-to-Figma application. Position it as an engineering portfolio with a narrow, testable proposition: explicit source names, per-node provenance, repeatable snapshots and measurable losses. Whether existing tools handle these better remains an open benchmark question.

The opportunity is a hypothesis: teams working with annotated components may value a local workflow with inspectable scene files and transparent conversion reports. Validate that hypothesis with a small demonstration and interviews before commercial expansion.

## Fair comparison protocol

Use identical owned fixtures, fonts, routes and viewport sizes. Compare the MVP against html.to.design and official Figma capture when account access permits; compare story.to.design on component stories only. Record product version/date, setup time, import time, manual cleanup time, retained names, text editability, layout error, rasterized coverage and failure messages. Publish the fixture and raw measurements. Record unavailable capabilities as untested, not absent.

No competitor was installed, purchased, connected or tested during this planning task.
