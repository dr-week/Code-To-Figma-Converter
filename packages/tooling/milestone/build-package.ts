/** Composes existing capture, backup, export and verification modules. */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { captureProject } from "../../browser/src/index";
import { generateSourceMap } from "../../core/src/index";
import type { Color } from "../../contracts/src/index";
import { backupSourceFiles, sha256Hex } from "../backup/source-backup";
import {
  exportSceneToOpenPencilFig,
  exportGraphToOpenPencilFig,
  convertSceneToOpenPencilGraph,
  OPENPENCIL_ADAPTER_VERSION,
} from "../openpencil-io";
import {
  findFirstTextNode,
  findRootFrameNode,
  buildWorkingScene,
} from "../capture/scene-helpers";
import { verifyWorkingFigRoundtrip } from "../validation/roundtrip-verifier";
import {
  generateDesignPreviewScreenshot,
  compareFidelity,
  formatFidelityReportMarkdown,
} from "../fidelity-reporter";

import type { BuildMilestonePackageOptions } from "./types";

export async function buildMilestone1Package(
  options: BuildMilestonePackageOptions = {},
) {
  const url = options.url ?? "http://127.0.0.1:4174";
  const selector = options.selector ?? "[data-figma-root]";
  const projectId = options.projectId ?? "vue-fixture-m1";
  const width = options.width ?? 960;
  const height = options.height ?? 900;
  const captureId = `capture-${randomUUID()}`;
  const baseDir = resolve(
    options.outputBaseDir ?? `.artifacts/milestone-01/${captureId}`,
  );
  const sourceBackupDir = resolve(baseDir, "source-backup");
  const designDir = resolve(baseDir, "design");
  const evidenceDir = resolve(baseDir, "evidence");

  await mkdir(resolve(baseDir, ".."), { recursive: true });
  await mkdir(baseDir);
  await Promise.all([
    mkdir(sourceBackupDir, { recursive: true }),
    mkdir(designDir, { recursive: true }),
    mkdir(evidenceDir, { recursive: true }),
  ]);

  const startTime = performance.now();
  const { scene, screenshot } = await captureProject({
    url,
    selector,
    projectId,
    width,
    height,
  });

  const relativeSourceFile =
    options.sourceFileRelative ?? "tests/fixtures/vue/src/App.vue";
  const absoluteSourceFile =
    options.sourceFileAbsolute ?? resolve(process.cwd(), relativeSourceFile);

  const sourceMap = generateSourceMap(scene, relativeSourceFile, "App");
  const anchorMap = new Map(
    sourceMap.mappings.map((m) => [m.layerId, m.sourceAnchor]),
  );

  const { fileHashes } = await backupSourceFiles({
    baseDir,
    sourceBackupDir,
    sourceFileAbsolute: absoluteSourceFile,
    sourceFileRelative: relativeSourceFile,
    ...(options.styleCssAbsolute
      ? { styleCssAbsolute: options.styleCssAbsolute }
      : {}),
    ...(options.studyPngAbsolute
      ? { studyPngAbsolute: options.studyPngAbsolute }
      : {}),
  });

  const originalFigBytes = await exportSceneToOpenPencilFig(scene, anchorMap);
  const originalFigPath = resolve(designDir, "original.fig");
  await writeFile(originalFigPath, originalFigBytes);

  const editableTextNode = findFirstTextNode(scene);
  const editableFrameNode = findRootFrameNode(scene);
  const originalTextContent =
    editableTextNode?.kind === "text" ? editableTextNode.text : "";
  const updatedTextContent = `${originalTextContent} [WORKING COPY]`;
  const updatedFillColor: Color = { r: 0.1, g: 0.2, b: 0.8, a: 1 };

  const workingScene = buildWorkingScene(
    scene,
    updatedTextContent,
    updatedFillColor,
  );
  const workingGraph = convertSceneToOpenPencilGraph(workingScene, anchorMap);
  const workingFigBytes = await exportGraphToOpenPencilFig(workingGraph);
  await writeFile(resolve(designDir, "working.fig"), workingFigBytes);

  const verifyOptions: Parameters<typeof verifyWorkingFigRoundtrip>[0] = {
    workingFigBytes: new Uint8Array(workingFigBytes),
    originalFigBytes: new Uint8Array(originalFigBytes),
    scene,
    anchorMap,
    updatedTextContent,
    updatedFillColor,
  };
  if (editableTextNode?.id)
    verifyOptions.editableTextNodeId = editableTextNode.id;
  if (editableFrameNode?.id)
    verifyOptions.editableFrameNodeId = editableFrameNode.id;

  const {
    nativeFigRoundtripVerified,
    imageAssetVerified,
    visualPropertyVerified,
  } = await verifyWorkingFigRoundtrip(verifyOptions);

  const designPreviewScreenshot = await generateDesignPreviewScreenshot(
    scene,
    width,
    height,
  );
  await writeFile(
    resolve(designDir, "design-preview.png"),
    designPreviewScreenshot,
  );
  fileHashes["design/design-preview.png"] = sha256Hex(designPreviewScreenshot);

  const fidelityReport = compareFidelity(
    scene,
    screenshot,
    designPreviewScreenshot,
    captureId,
  );
  const fidelityReportJson = JSON.stringify(fidelityReport, null, 2);
  const fidelityReportMarkdown = formatFidelityReportMarkdown(fidelityReport);

  await Promise.all([
    writeFile(
      resolve(evidenceDir, "fidelity-report.json"),
      fidelityReportJson,
      "utf-8",
    ),
    writeFile(
      resolve(evidenceDir, "fidelity-report.md"),
      fidelityReportMarkdown,
      "utf-8",
    ),
  ]);

  const sceneJson = JSON.stringify(scene, null, 2);
  const sourceMapJson = JSON.stringify(sourceMap, null, 2);
  const sceneSha256 = sha256Hex(sceneJson);
  const sourceMapSha256 = sha256Hex(sourceMapJson);
  const originalFigSha256 = sha256Hex(originalFigBytes);
  const workingFigSha256 = sha256Hex(workingFigBytes);

  await Promise.all([
    writeFile(resolve(baseDir, "scene.json"), sceneJson, "utf-8"),
    writeFile(resolve(baseDir, "source-map.json"), sourceMapJson, "utf-8"),
    writeFile(resolve(evidenceDir, "reference.png"), screenshot),
  ]);

  const validationReport = {
    capturedAt: new Date().toISOString(),
    captureId,
    status: "INCOMPLETE" as const,
    editorVerified: false,
    openPencilVersion: OPENPENCIL_ADAPTER_VERSION,
    nativeFigRoundtripVerified,
    limitations: [
      "GUI editor open/edit/save has not been verified.",
      "Source ownership uses supplied annotations or caller defaults.",
      ...fidelityReport.limitations,
    ],
    sceneNodeCount: scene.nodes.length,
    explicitNamesCount: scene.nodes.filter((n) => n.nameOrigin === "explicit")
      .length,
    assetsCount: scene.assets.length,
    warningsCount: scene.warnings.length,
    sourceMappingsCount: sourceMap.mappings.length,
    fidelityChecks: {
      textNativeAndEditable: nativeFigRoundtripVerified,
      geometryPreservedWithin1px: null,
      originalBackupsIntact: true,
      saveReopenVerified: nativeFigRoundtripVerified,
      imageAssetVerified,
      visualPropertyVerified,
      originalText: originalTextContent,
      editedText: updatedTextContent,
    },
  };

  const validationJson = JSON.stringify(validationReport, null, 2);
  await writeFile(
    resolve(evidenceDir, "validation.json"),
    validationJson,
    "utf-8",
  );

  const manifest = {
    schemaVersion: "0.1",
    captureId,
    timestamp: new Date().toISOString(),
    project: {
      id: projectId,
      entrypoint: relativeSourceFile,
      route: scene.source.route,
      viewport: scene.source.viewport,
    },
    tools: {
      openPencilVersion: OPENPENCIL_ADAPTER_VERSION,
      generator: "code-to-design@0.1.0",
      nodeVersion: process.version,
    },
    files: {
      "scene.json": sceneSha256,
      "source-map.json": sourceMapSha256,
      "design/original.fig": originalFigSha256,
      "design/working.fig": workingFigSha256,
      "evidence/validation.json": sha256Hex(validationJson),
      ...fileHashes,
    } as Record<string, string>,
    warnings: scene.warnings,
    validationStatus: validationReport.status,
    executionTimeMs: Math.round(performance.now() - startTime),
  };

  await writeFile(
    resolve(baseDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8",
  );
  return { packageDir: baseDir, captureId, manifest, validationReport };
}
