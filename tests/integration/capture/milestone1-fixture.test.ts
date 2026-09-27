import { expect, it } from "vitest";
import { createServer } from "vite";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
  symlink,
} from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { buildMilestone1Package } from "../../../packages/tooling/milestone1";
import { parseSceneJson } from "../../../packages/contracts/src/index";
import { generateSourceMap } from "../../../packages/core/src/index";
import { parseOpenPencilFig } from "../../../packages/tooling/openpencil-io";

it("captures Vue provenance and resolves unique native layers without changing source IDs or classes", async () => {
  await mkdir(".artifacts", { recursive: true });
  const directory = await mkdtemp(resolve(".artifacts/vue-metadata-"));
  const fixture = join(directory, "fixture");
  let server: Awaited<ReturnType<typeof createServer>> | undefined;
  try {
    await cp(resolve("tests/fixtures/vue"), fixture, {
      recursive: true,
      filter: (path) =>
        !/[\\/](node_modules|dist|\.backup)([\\/]|$)/.test(path),
    });
    await symlink(
      resolve("tests/fixtures/vue/node_modules"),
      join(fixture, "node_modules"),
      "junction",
    );
    const sourcePath = join(fixture, "src/App.vue");
    // Isolated fixture variation proves actual HTML IDs differ from design IDs.
    const source = (await readFile(sourcePath, "utf8")).replace(
      "<main",
      '<main id="actual-html-id" class="test  root"',
    );
    await writeFile(sourcePath, source);
    server = await createServer({
      root: fixture,
      server: { host: "127.0.0.1", port: 0 },
    });
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === "string")
      throw new Error("Missing server address");
    const result = await buildMilestone1Package({
      url: `http://127.0.0.1:${address.port}`,
      outputBaseDir: join(directory, "capture"),
      sourceFileAbsolute: sourcePath,
      styleCssAbsolute: join(fixture, "src/style.css"),
      studyPngAbsolute: join(fixture, "public/study.png"),
    });
    const scene = parseSceneJson(
      await readFile(join(result.packageDir, "scene.json"), "utf8"),
    );
    const map = generateSourceMap(scene, "wrong-fallback.vue", "WrongFallback");
    expect(new Set(map.mappings.map((entry) => entry.sourceAnchor)).size).toBe(
      scene.nodes.length,
    );
    expect(
      map.mappings.every(
        (entry) =>
          entry.sourceFile === "tests/fixtures/vue/src/App.vue" &&
          entry.componentName === "App",
      ),
    ).toBe(true);
    const root = map.mappings.find(
      (entry) => entry.layerId === "source:canvas",
    );
    // Vue normalizes template class whitespace before producing the DOM attribute.
    expect(root).toMatchObject({
      domId: "actual-html-id",
      domClass: "test root",
    });
    const wordmark = map.mappings.find(
      (entry) => entry.layerId === "source:wordmark",
    );
    const wordmarkText = map.mappings.find(
      (entry) => entry.layerId === "text:source:wordmark",
    );
    expect(wordmark).toMatchObject({ domClass: "wordmark", domId: null });
    expect(wordmarkText?.instanceId).toBe(wordmark?.instanceId);
    expect(wordmarkText?.sourceAnchor).not.toBe(wordmark?.sourceAnchor);
    const original = await readFile(
      join(result.packageDir, "design/original.fig"),
    );
    const reopened = await parseOpenPencilFig(new Uint8Array(original).buffer);
    for (const mapping of map.mappings) {
      const matches = [...reopened.nodes.values()].filter((node) =>
        node.pluginData.some(
          (entry) =>
            entry.pluginId === "code-to-design" &&
            entry.key === "sourceAnchor" &&
            entry.value === mapping.sourceAnchor,
        ),
      );
      expect(matches).toHaveLength(1);
      expect(matches[0]?.name).toBe(mapping.layerName);
    }
    const recordedHashes: Record<string, string> = result.manifest.files;
    for (const name of ["App.vue", "style.css", "study.png"]) {
      const bytes = await readFile(
        join(result.packageDir, "source-backup", name),
      );
      expect(recordedHashes[`source-backup/${name}`]).toBe(
        createHash("sha256").update(bytes).digest("hex"),
      );
    }
    expect(await readFile(sourcePath, "utf8")).toBe(source);
    expect(result.validationReport.editorVerified).toBe(false);
  } finally {
    await server?.close();
    await rm(directory, { recursive: true, force: true });
  }
}, 60_000);
