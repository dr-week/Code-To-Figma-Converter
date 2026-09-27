import { createServer } from "vite";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { buildMilestone1Package } from "./build-package";

export async function runMilestoneFixture(): Promise<void> {
  const server = await createServer({
    root: resolve("tests/fixtures/vue"),
    server: { host: "127.0.0.1", port: 4174, strictPort: true },
  });
  try {
    await server.listen();
    const result = await buildMilestone1Package({
      url: "http://127.0.0.1:4174",
      selector: "[data-figma-root]",
      projectId: "vue-fixture",
      width: 960,
      height: 900,
      sourceFileRelative: "tests/fixtures/vue/src/App.vue",
      sourceFileAbsolute: resolve("tests/fixtures/vue/src/App.vue"),
      styleCssAbsolute: resolve("tests/fixtures/vue/src/style.css"),
      studyPngAbsolute: resolve("tests/fixtures/vue/public/study.png"),
    });
    const backupFiles = await readdir(
      resolve(result.packageDir, "source-backup"),
    );
    console.log(`\n== Milestone 1 INCOMPLETE ==`);
    console.log(`Package: ${result.packageDir}`);
    console.log(
      `Nodes: ${result.validationReport.sceneNodeCount} | Images: ${result.validationReport.assetsCount}`,
    );
    console.log(
      `Round-trip: ${result.validationReport.nativeFigRoundtripVerified ? "PASS" : "FAIL"}`,
    );
    console.log(`Backups: ${backupFiles.join(", ")}`);
    process.exitCode = 0;
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await server.close();
  }
}
