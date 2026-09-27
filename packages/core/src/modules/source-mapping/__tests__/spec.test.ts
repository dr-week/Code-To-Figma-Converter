import { describe, it, expect } from "vitest";
import { generateSourceMap } from "../index";
import type { Scene } from "@code-to-figma/contracts";
import { parseScene } from "@code-to-figma/contracts";
import { sampleScene } from "../../../../../contracts/src/test-fixture";

describe("Source Mapping", () => {
  it("preserves provenance through validation, uses roles, and rejects ambiguous anchors", () => {
    const scene = sampleScene();
    for (const node of scene.nodes)
      Object.assign(node, {
        sourceFile: "src/A:part.vue",
        sourceComponent: "ActualComponent",
        sourceId: "button/text",
        htmlId: "html-button",
        htmlClass: "one  two",
      });
    const map = generateSourceMap(
      parseScene(scene),
      "fallback.vue",
      "Fallback",
    );
    expect(map.mappings[0]).toMatchObject({
      sourceFile: "src/A:part.vue",
      componentName: "ActualComponent",
      domId: "html-button",
      domClass: "one  two",
    });
    expect(map.mappings[0]?.instanceId).toBe(map.mappings[1]?.instanceId);
    expect(map.mappings[0]?.sourceAnchor).not.toBe(
      map.mappings[1]?.sourceAnchor,
    );
    scene.nodes.push({ ...scene.nodes[1]!, id: "another-text" });
    expect(() => generateSourceMap(scene)).toThrow("Duplicate source anchor");
  });

  it("accepts legacy scenes without inventing HTML metadata and validates provenance types", () => {
    const scene = sampleScene();
    expect(generateSourceMap(parseScene(scene)).mappings[0]).toMatchObject({
      domId: null,
      domClass: null,
    });
    expect(() =>
      parseScene({
        ...scene,
        nodes: [{ ...scene.nodes[0], htmlId: 123 }, scene.nodes[1]],
      }),
    ).toThrow();
  });
  it("generates mapping entries with stable anchors and correct identity rules", () => {
    const mockScene: Scene = {
      schemaVersion: "0.1",
      source: {
        projectId: "vue-test",
        route: "/",
        viewport: { width: 960, height: 900 },
      },
      nodes: [
        {
          id: "source:card",
          parentId: null,
          name: "Project/Card",
          nameOrigin: "explicit",
          kind: "frame",
          x: 0,
          y: 0,
          width: 960,
          height: 300,
          opacity: 1,
          fill: { r: 1, g: 1, b: 1, a: 1 },
          border: { r: 0.8, g: 0.8, b: 0.8, a: 1 },
          borderWidth: 1,
          radius: 4,
          clipsContent: false,
        },
        {
          id: "text:source:title",
          parentId: "source:card",
          name: "Project/Title",
          nameOrigin: "explicit",
          kind: "text",
          x: 20,
          y: 20,
          width: 500,
          height: 30,
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
      ],
      assets: [],
      warnings: [],
    };

    const map = generateSourceMap(
      mockScene,
      "apps/vue-fixture/src/App.vue",
      "App",
    );

    expect(map.schemaVersion).toBe("0.1");
    expect(map.mappings.length).toBe(2);

    const frameMap = map.mappings[0]!;
    expect(frameMap.layerId).toBe("source:card");
    expect(JSON.parse(frameMap.sourceAnchor)).toEqual([
      "apps/vue-fixture/src/App.vue",
      "card",
      "frame",
    ]);
    expect(frameMap.sourceFile).toBe("apps/vue-fixture/src/App.vue");
    expect(frameMap.componentName).toBe("App");
    expect(frameMap.supportsWriteback).toBe(false);

    const textMap = map.mappings[1]!;
    expect(textMap.layerId).toBe("text:source:title");
    expect(JSON.parse(textMap.sourceAnchor)).toEqual([
      "apps/vue-fixture/src/App.vue",
      "title",
      "text",
    ]);
    expect(textMap.editableProperties).toContain("text");
  });
});
