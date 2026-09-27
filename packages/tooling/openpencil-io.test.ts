import { describe, it, expect } from "vitest";
import {
  convertSceneToOpenPencilGraph,
  computeAssetHash,
  exportSceneToOpenPencilFig,
  parseOpenPencilFig,
} from "./openpencil-io";
import {
  SOURCE_ANCHOR_NAMESPACE,
  SOURCE_ANCHOR_KEY,
  generateSourceMap,
} from "@code-to-figma/core";
import type { Scene } from "@code-to-figma/contracts";

interface TestPluginData {
  pluginId: string;
  key: string;
  value: string;
}

interface TestNode {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  text?: string;
  pluginData?: TestPluginData[];
}

// Image node uses 'source:' prefix — matches what read-dom.ts produces for <img data-figma-id="hero">
const SOURCE_FILE = "tests/fixtures/vue/src/App.vue";

const sampleScene: Scene = {
  schemaVersion: "0.1",
  source: {
    projectId: "test-app",
    route: "/",
    viewport: { width: 960, height: 900 },
  },
  nodes: [
    {
      id: "source:canvas",
      parentId: null,
      name: "Portfolio/Overview",
      nameOrigin: "explicit",
      kind: "frame",
      x: 0,
      y: 0,
      width: 960,
      height: 900,
      opacity: 1,
      fill: { r: 0.9, g: 0.9, b: 0.9, a: 1 },
      border: { r: 0, g: 0, b: 0, a: 0 },
      borderWidth: 0,
      radius: 0,
      clipsContent: true,
    },
    {
      id: "text:source:title",
      parentId: "source:canvas",
      name: "Introduction/Title",
      nameOrigin: "explicit",
      kind: "text",
      x: 40,
      y: 40,
      width: 400,
      height: 50,
      opacity: 1,
      text: "Every element has a name.",
      color: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
      fontFamily: "Inter",
      fontStyle: "Bold",
      fontSize: 23,
      lineHeight: 30,
      letterSpacing: 0,
      align: "LEFT",
    },
    {
      // 'source:hero' matches the pattern read-dom.ts produces: source:${data-figma-id}
      id: "source:hero",
      parentId: "source:canvas",
      name: "Project/Image",
      nameOrigin: "explicit",
      kind: "image",
      x: 40,
      y: 100,
      width: 288,
      height: 176,
      opacity: 1,
      assetId: "asset_png_123",
      fit: "FILL",
      fill: { r: 1, g: 1, b: 1, a: 1 },
      border: { r: 0, g: 0, b: 0, a: 0 },
      borderWidth: 0,
      radius: 0,
    },
  ],
  assets: [
    {
      id: "asset_png_123",
      bytes: [137, 80, 78, 71, 13, 10, 26, 10], // PNG header
    },
  ],
  warnings: [],
};

// Build anchor map the same way milestone1.ts does: generateSourceMap → Map<layerId, sourceAnchor>
function buildAnchorMap(scene: Scene, sourceFile: string): Map<string, string> {
  const sourceMap = generateSourceMap(scene, sourceFile, "App");
  return new Map(sourceMap.mappings.map((m) => [m.layerId, m.sourceAnchor]));
}

describe("OpenPencil File I/O Adapter", () => {
  it("converts Scene contract into native OpenPencil SceneGraph with sourceFile:cleanId anchors", () => {
    const anchorMap = buildAnchorMap(sampleScene, SOURCE_FILE);
    const graph = convertSceneToOpenPencilGraph(sampleScene, anchorMap);
    expect(graph).toBeDefined();

    const page = graph.getPages()[0];
    expect(page).toBeDefined();

    const nodes = Array.from(graph.nodes.values()) as unknown as TestNode[];
    expect(nodes.length).toBeGreaterThanOrEqual(3);

    // Text node pluginData must carry sourceFile:cleanId anchor, not raw sceneNode.id
    const textNode = nodes.find((n) => n.name === "Introduction/Title");
    expect(textNode).toBeDefined();
    expect(textNode?.type).toBe("TEXT");
    expect(textNode?.text).toBe("Every element has a name.");

    const textAnchor = textNode?.pluginData?.find(
      (p) =>
        p.pluginId === SOURCE_ANCHOR_NAMESPACE && p.key === SOURCE_ANCHOR_KEY,
    );
    expect(textAnchor).toBeDefined();
    // Must be sourceFile:cleanId — not the raw 'text:source:title'
    expect(textAnchor?.value).toBe(
      JSON.stringify([SOURCE_FILE, "title", "text"]),
    );

    // Image node anchor
    const imageNode = nodes.find((n) => n.name === "Project/Image");
    const imageAnchor = imageNode?.pluginData?.find(
      (p) =>
        p.pluginId === SOURCE_ANCHOR_NAMESPACE && p.key === SOURCE_ANCHOR_KEY,
    );
    expect(imageAnchor?.value).toBe(
      JSON.stringify([SOURCE_FILE, "hero", "image"]),
    );

    // Frame node anchor
    const frameNode = nodes.find((n) => n.name === "Portfolio/Overview");
    const frameAnchor = frameNode?.pluginData?.find(
      (p) =>
        p.pluginId === SOURCE_ANCHOR_NAMESPACE && p.key === SOURCE_ANCHOR_KEY,
    );
    expect(frameAnchor?.value).toBe(
      JSON.stringify([SOURCE_FILE, "canvas", "frame"]),
    );
  });

  it("exports into native .fig, round-trips cleanly, and persists sourceFile:cleanId anchors", async () => {
    const anchorMap = buildAnchorMap(sampleScene, SOURCE_FILE);
    const figBytes = await exportSceneToOpenPencilFig(sampleScene, anchorMap);
    expect(figBytes).toBeInstanceOf(Uint8Array);
    expect(figBytes.length).toBeGreaterThan(0);

    const parsedGraph = await parseOpenPencilFig(
      figBytes.buffer as ArrayBuffer,
    );
    expect(parsedGraph).toBeDefined();

    const nodes = Array.from(
      parsedGraph.nodes.values(),
    ) as unknown as TestNode[];
    const frameNode = nodes.find((n) => n.name === "Portfolio/Overview");
    const textNode = nodes.find((n) => n.name === "Introduction/Title");
    const imageNode = nodes.find((n) => n.name === "Project/Image");

    expect(frameNode).toBeDefined();
    expect(textNode).toBeDefined();
    expect(imageNode).toBeDefined();

    expect(textNode?.text).toBe("Every element has a name.");
    expect(textNode?.parentId).toBe(frameNode?.id);
    expect(imageNode?.parentId).toBe(frameNode?.id);

    // sourceFile:cleanId anchors must survive the native .fig round-trip
    const textAnchor = textNode?.pluginData?.find(
      (p) =>
        p.pluginId === SOURCE_ANCHOR_NAMESPACE && p.key === SOURCE_ANCHOR_KEY,
    );
    expect(textAnchor?.value).toBe(
      JSON.stringify([SOURCE_FILE, "title", "text"]),
    );

    const imageAnchor = imageNode?.pluginData?.find(
      (p) =>
        p.pluginId === SOURCE_ANCHOR_NAMESPACE && p.key === SOURCE_ANCHOR_KEY,
    );
    expect(imageAnchor?.value).toBe(
      JSON.stringify([SOURCE_FILE, "hero", "image"]),
    );

    // Image bytes must be recoverable by computing the same hash used at export time
    const assetBytes = new Uint8Array(sampleScene.assets[0]!.bytes);
    const expectedHash = computeAssetHash(assetBytes);
    const storedBytes = parsedGraph.images.get(expectedHash);
    expect(storedBytes).toBeDefined();
    expect(Array.from(storedBytes!)).toEqual(sampleScene.assets[0]!.bytes);
  });
});
