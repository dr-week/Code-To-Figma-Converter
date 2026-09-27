import type { SceneGraph } from "@open-pencil/scene-graph";
import { exportFigFile, parseFigFile } from "@open-pencil/core/io/formats/fig";
import { initCodec } from "@open-pencil/kiwi/fig/codec";
import type { Scene } from "@code-to-figma/contracts";
import { convertSceneToOpenPencilGraph } from "./scene-adapter";

/**
 * Serializes Scene contract directly into native OpenPencil .fig file bytes.
 * Handles Node.js I/O and OpenPencil WASM codec initialization.
 */
export async function exportSceneToOpenPencilFig(
  scene: Scene,
  sourceAnchorMap?: Map<string, string>,
): Promise<Uint8Array> {
  await initCodec();
  const graph = convertSceneToOpenPencilGraph(scene, sourceAnchorMap);
  return await exportFigFile(graph);
}

/**
 * Serializes native OpenPencil SceneGraph directly into .fig file bytes.
 */
export async function exportGraphToOpenPencilFig(
  graph: SceneGraph,
): Promise<Uint8Array> {
  await initCodec();
  return await exportFigFile(graph);
}

/**
 * Parses native OpenPencil .fig file bytes into a SceneGraph instance.
 */
export async function parseOpenPencilFig(
  bytes: ArrayBuffer,
): Promise<SceneGraph> {
  await initCodec();
  return await parseFigFile(bytes);
}
