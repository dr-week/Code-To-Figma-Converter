import type { Scene } from "@code-to-figma/contracts";

// Types are defined in types.ts — single source of truth for this module.
export type { SourceMappingEntry, SourceMap } from "./types";

export function generateSourceMap(
  scene: Scene,
  defaultSourceFile = "tests/fixtures/vue/src/App.vue",
  defaultComponent = "App",
): import("./types").SourceMap {
  const mappings: import("./types").SourceMappingEntry[] = [];
  const anchors = new Set<string>();
  const layerIds = new Set<string>();

  for (const node of scene.nodes) {
    const isText = node.kind === "text";
    const isFrame = node.kind === "frame";

    const cleanId = node.id.startsWith("source:")
      ? node.id.slice("source:".length)
      : node.id.startsWith("text:source:")
        ? node.id.slice("text:source:".length)
        : node.id;

    const sourceFile = node.sourceFile ?? defaultSourceFile;
    const componentName = node.sourceComponent ?? defaultComponent;
    const sourceId = node.sourceId ?? cleanId;
    // Tuple encoding keeps separators in user annotations unambiguous. The role
    // distinguishes a generated text layer from the owning element's frame.
    const sourceAnchor = JSON.stringify([sourceFile, sourceId, node.kind]);
    if (anchors.has(sourceAnchor))
      throw new Error(`Duplicate source anchor: ${sourceAnchor}`);
    if (layerIds.has(node.id))
      throw new Error(`Duplicate mapping layer ID: ${node.id}`);
    anchors.add(sourceAnchor);
    layerIds.add(node.id);
    const editableProperties: import("./types").SourceMappingEntry["editableProperties"] = isText
      ? ["text", "fill"]
      : isFrame
        ? ["fill", "border", "bounds", "opacity"]
        : ["bounds", "opacity"];

    mappings.push({
      layerId: node.id,
      sourceAnchor,
      sourceFile,
      componentName,
      domId: node.htmlId ?? null,
      domClass: node.htmlClass ?? null,
      layerName: node.name,
      instanceId: JSON.stringify([sourceFile, sourceId]),
      editableProperties,
      supportsWriteback: false, // Milestone 1 explicit policy: writeback capability verified in M2/M3
    });
  }

  return {
    schemaVersion: "0.1",
    projectId: scene.source.projectId,
    mappings,
  };
}

export { applyTextWritebackContent } from "./writeback";
export type {
  TextWritebackParams,
  TextWritebackContentResult,
} from "./writeback";
export {
  applyColorWritebackContent,
  colorToHexOrRgba,
} from "./color-writeback";
export type {
  ColorWritebackParams,
  ColorWritebackContentResult,
} from "./color-writeback";
export {
  applyLayoutWritebackContent,
  formatPaddingCss,
} from "./layout-writeback";
export type {
  LayoutPadding,
  LayoutProps,
  LayoutWritebackParams,
  LayoutWritebackContentResult,
} from "./layout-writeback";
export { checkSourceStaleness } from "./conflict";
export type {
  SourceStalenessCheckOptions,
  SourceStalenessResult,
} from "./conflict";
export { resolveSourceConflict } from "./conflict-merge";
export type {
  ConflictMergeOptions,
  ConflictMergeResult,
} from "./conflict-merge";
export {
  parseVueSfcSections,
  findSfcElementBySourceId,
  applySfcAstTextUpdate,
  applySfcAstStyleUpdate,
} from "./sfc-ast-transformer";
export type {
  SfcAttributeAst,
  SfcElementAstNode,
  VueSfcSections,
} from "./sfc-ast-transformer";
export { applySfcCssRuleUpdate } from "./css-writeback";
export type {
  CssRuleUpdateParams,
  CssRuleUpdateResult,
} from "./css-writeback";
