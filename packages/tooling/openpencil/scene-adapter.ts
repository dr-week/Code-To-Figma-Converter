import { SceneGraph } from "@open-pencil/scene-graph";
import {
  SOURCE_ANCHOR_NAMESPACE,
  SOURCE_ANCHOR_KEY,
} from "@code-to-figma/core";
import type { Scene } from "@code-to-figma/contracts";
import { computeAssetHash } from "./asset-hash";

/**
 * Native Scene Contract Adapter for OpenPencil (@open-pencil/scene-graph).
 * Adapts shared @code-to-figma/contracts Scene graph to official OpenPencil SceneGraph instance,
 * attaching native pluginData sourceAnchors and embedding raw PNG image bytes.
 */
/**
 * @param sourceAnchorMap Optional map from sceneNode.id to the stable sourceAnchor produced
 *   by generateSourceMap (format: "[sourceFile, sourceId, layer kind]"). When provided, the pluginData value
 *   stored in the native .fig will be the sourceAnchor rather than the raw sceneNode.id,
 *   ensuring consistency between source-map.json sidecar and the native file.
 */
export function convertSceneToOpenPencilGraph(
  scene: Scene,
  sourceAnchorMap?: Map<string, string>,
): SceneGraph {
  const graph = new SceneGraph();
  const page = graph.getPages()[0];
  if (!page) throw new Error("No default page found in SceneGraph");

  // Embed image assets into SceneGraph images map by hash
  for (const asset of scene.assets) {
    const bytes = new Uint8Array(asset.bytes);
    const hash = computeAssetHash(bytes);
    graph.images.set(hash, bytes);
  }

  const nodeIdMap = new Map<string, string>(); // sceneNode.id -> native node.id

  for (const sceneNode of scene.nodes) {
    const parentNativeId =
      sceneNode.parentId !== null
        ? (nodeIdMap.get(sceneNode.parentId) ?? page.id)
        : page.id;

    // Use the stable sourceAnchor from the source map when available so the pluginData
    // value matches the sidecar source-map.json (format: "[sourceFile, sourceId, layer kind]").
    const sourceAnchorValue =
      sourceAnchorMap?.get(sceneNode.id) ?? sceneNode.id;
    const pluginData = [
      {
        pluginId: SOURCE_ANCHOR_NAMESPACE,
        key: SOURCE_ANCHOR_KEY,
        value: sourceAnchorValue,
      },
    ];

    if (sceneNode.kind === "frame") {
      const nodeProps: Record<string, unknown> = {
        name: sceneNode.name,
        x: sceneNode.x,
        y: sceneNode.y,
        width: sceneNode.width,
        height: sceneNode.height,
        opacity: sceneNode.opacity,
        pluginData,
      };

      if (sceneNode.fill && sceneNode.fill.a > 0) {
        nodeProps.fills = [
          {
            type: "SOLID",
            color: sceneNode.fill,
            opacity: sceneNode.fill.a,
            visible: true,
          },
        ];
      }

      if (sceneNode.borderWidth > 0 && sceneNode.border) {
        nodeProps.strokes = [
          {
            type: "SOLID",
            color: sceneNode.border,
            opacity: sceneNode.border.a,
            visible: true,
          },
        ];
        nodeProps.strokeWeight = sceneNode.borderWidth;
      }

      if (sceneNode.radius > 0) {
        nodeProps.cornerRadius = sceneNode.radius;
      }

      const frameNode = graph.createNode("FRAME", parentNativeId, nodeProps);
      nodeIdMap.set(sceneNode.id, frameNode.id);
    } else if (sceneNode.kind === "text") {
      const textProps: Record<string, unknown> = {
        name: sceneNode.name,
        text: sceneNode.text,
        x: sceneNode.x,
        y: sceneNode.y,
        width: sceneNode.width,
        height: sceneNode.height,
        opacity: sceneNode.opacity,
        fontFamily: sceneNode.fontFamily,
        fontSize: sceneNode.fontSize,
        pluginData,
      };

      if (sceneNode.color) {
        textProps.fills = [
          {
            type: "SOLID",
            color: sceneNode.color,
            opacity: sceneNode.color.a,
            visible: true,
          },
        ];
      }

      const textNode = graph.createNode("TEXT", parentNativeId, textProps);
      nodeIdMap.set(sceneNode.id, textNode.id);
    } else {
      // image
      const asset = scene.assets.find((a) => a.id === sceneNode.assetId);
      let imageHash = sceneNode.assetId;
      if (asset) {
        const bytes = new Uint8Array(asset.bytes);
        imageHash = computeAssetHash(bytes);
      }

      const rectProps: Record<string, unknown> = {
        name: sceneNode.name,
        x: sceneNode.x,
        y: sceneNode.y,
        width: sceneNode.width,
        height: sceneNode.height,
        opacity: sceneNode.opacity,
        fills: [
          {
            type: "IMAGE",
            color: { r: 1, g: 1, b: 1, a: 1 },
            opacity: 1,
            visible: true,
            imageHash,
            imageScaleMode: "FILL",
          },
        ],
        pluginData,
      };

      const rectNode = graph.createNode("RECTANGLE", parentNativeId, rectProps);
      nodeIdMap.set(sceneNode.id, rectNode.id);
    }
  }

  return graph;
}
