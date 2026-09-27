# MCP research and integration plan

**Inactive reference, 2026-09-12:** an MCP server is outside the current single-goal roadmap. The designs below are research only; do not implement them alongside Vue-to-Figma conversion.

Checked 2026-09-11. MCP means Model Context Protocol: an interface between AI applications and external tools/context, not a rendering engine or a converter. The official latest specification resolved to **2026-07-28** during research. Pin a protocol/SDK version supported by the intended clients; older tutorials may describe different lifecycle semantics. [Current specification](https://modelcontextprotocol.io/specification/2026-07-28)

## Available approaches

| Option | Role | Decision |
| --- | --- | --- |
| Official remote Figma MCP | Live UI capture and canvas workflows from supported clients. | Benchmark and optional integration; verify access before depending on it. |
| Own Figma plugin | Imports the deterministic scene into the open editor. | Primary MVP output path. |
| [Southleft Figma Console MCP](https://github.com/southleft/figma-console-mcp) | Third-party project describing extraction, creation and debugging tools. | Research reference; inspect release, license, permissions and bridge setup before any adoption. Not installed or security-reviewed here. |
| Own small MCP server | Exposes converter use cases to an IDE assistant. | Add after CLI/plugin correctness. Reuse core logic. |

Figma's remote setup documentation limits connections to supported catalog clients and offers a waitlist for new clients. A custom SaaS therefore should not assume it can embed this connection freely. [Remote setup](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)

Official canvas writing currently requires a Full seat and edit access. Its documentation lists beta limitations including images, custom fonts and a 20 KB output response limit. These are limitations of that tool, not a blanket statement about the separate Plugin API or live-capture tool. Recheck them before implementation. [Write to canvas](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/)

## Proposed own-server contract

| Tool | Input | Output/effect |
| --- | --- | --- |
| `capture_ui` | Registered project ID, route, viewport, state preset | Job ID; captures only a previously approved local target. |
| `get_capture_status` | Job ID | State, stage, bounded diagnostics and timing. |
| `validate_scene` | Artifact ID | Schema, supported-feature and naming report. |
| `prepare_figma_import` | Artifact ID | Validated import package and summary; does not modify a Figma file. |

The user imports through the plugin in the first version. Do not advertise an MCP `import_to_figma` tool until an authenticated plugin bridge exists and has been tested. A future tool must bind the artifact hash, destination file and requested operation, report created node IDs, and support cancellation and idempotency.

Use local stdio initially with a maintained official TypeScript SDK release compatible with the target host. Keep diagnostics off protocol stdout. Expose bounded artifact summaries rather than whole repositories. Model instructions embedded in captured UI are data, never privileged commands. Do not expose `eval`, arbitrary shell commands, unrestricted file paths or general browser navigation.

If remote access is later necessary, re-evaluate transport and authorization against the pinned specification and SDK. Require scoped artifact access, explicit write authorization, origin checks where applicable, rate limits and token redaction. An MCP tool annotation is not enforcement. [MCP trust model](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/SECURITY.md)

## Acceptance tests

Demonstrate discovery and a complete capture workflow in one supported client. Reject unknown projects and malformed schemas; cancel a capture; recover status after a timeout without duplicate work; deny cross-project artifacts; verify log redaction. The MCP path and CLI must produce the same scene for the same frozen input. MCP must not introduce an LLM dependency into geometry or naming.
