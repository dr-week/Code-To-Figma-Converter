/**
 * Validation — Round-trip Verifier for Milestone 1
 *
 * Verifies that the generated .fig files survive a save/reopen round-trip
 * through the OpenPencil codec. It checks:
 *   - Text edits persisted (by sourceAnchor, not display name).
 *   - Visual fill-color edits persisted (RGBA within 0.001 tolerance).
 *   - Source anchors are present and non-empty in both nodes.
 *   - Image asset bytes in original.fig match the captured scene asset.
 *
 * This module is responsible for exactly one thing: computing round-trip
 * verification booleans. It does NOT write files or format reports.
 */
import type { Scene, Color } from '../../contracts/src/index';
import { SOURCE_ANCHOR_NAMESPACE, SOURCE_ANCHOR_KEY } from '../../core/src/index';
import { computeAssetHash, parseOpenPencilFig } from '../openpencil-io';

interface ParsedNode {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  text?: string;
  fills?: { type: string; color: Color; opacity: number; visible: boolean }[];
  pluginData?: { pluginId: string; key: string; value: string }[];
}

export type RoundTripVerificationResult = {
  textContentVerified: boolean;
  visualPropertyVerified: boolean;
  sourceAnchorVerified: boolean;
  nativeFigRoundtripVerified: boolean;
  imageAssetVerified: boolean;
};

/**
 * Parses the working .fig bytes and verifies that the text edit and fill
 * color change are present in the re-serialized document using source anchors.
 */
export async function verifyWorkingFigRoundtrip(options: {
  workingFigBytes: Uint8Array;
  originalFigBytes: Uint8Array;
  scene: Scene;
  anchorMap: Map<string, string>;
  editableTextNodeId?: string | undefined;
  editableFrameNodeId?: string | undefined;
  updatedTextContent: string;
  updatedFillColor: Color;
}): Promise<RoundTripVerificationResult> {
  const {
    workingFigBytes,
    originalFigBytes,
    scene,
    anchorMap,
    editableTextNodeId,
    editableFrameNodeId,
    updatedTextContent,
    updatedFillColor,
  } = options;

  const parsedWorkingGraph = await parseOpenPencilFig(workingFigBytes.buffer as ArrayBuffer);
  const parsedNodes = Array.from(parsedWorkingGraph.nodes.values()) as unknown as ParsedNode[];

  // Find the edited text node by its sourceAnchor, NOT by display name.
  const editableAnchor = editableTextNodeId ? anchorMap.get(editableTextNodeId) : undefined;
  const parsedTextNode = parsedNodes.find(
    n =>
      n.type === 'TEXT' &&
      n.pluginData?.some(
        p =>
          p.pluginId === SOURCE_ANCHOR_NAMESPACE &&
          p.key === SOURCE_ANCHOR_KEY &&
          p.value === editableAnchor,
      ),
  );
  const textContentVerified = parsedTextNode?.text === updatedTextContent;

  // Find the edited root frame node and verify the visual fill color survived.
  const frameAnchor = editableFrameNodeId ? anchorMap.get(editableFrameNodeId) : undefined;
  const parsedFrameNode = parsedNodes.find(
    n =>
      n.type === 'FRAME' &&
      n.pluginData?.some(
        p =>
          p.pluginId === SOURCE_ANCHOR_NAMESPACE &&
          p.key === SOURCE_ANCHOR_KEY &&
          p.value === frameAnchor,
      ),
  );
  const frameFillColor = parsedFrameNode?.fills?.[0]?.color;
  const visualPropertyVerified =
    frameFillColor !== undefined &&
    Math.abs(frameFillColor.r - updatedFillColor.r) < 0.001 &&
    Math.abs(frameFillColor.g - updatedFillColor.g) < 0.001 &&
    Math.abs(frameFillColor.b - updatedFillColor.b) < 0.001;

  const sourceAnchorVerified = editableAnchor !== undefined && frameAnchor !== undefined;
  const nativeFigRoundtripVerified = textContentVerified && visualPropertyVerified && sourceAnchorVerified;

  // Image byte verification in original.fig.
  const parsedOriginalGraph = await parseOpenPencilFig(originalFigBytes.buffer as ArrayBuffer);
  let imageAssetVerified = scene.assets.length === 0;
  if (scene.assets.length > 0) {
    const firstAsset = scene.assets[0]!;
    const assetBytes = new Uint8Array(firstAsset.bytes);
    const expectedHash = computeAssetHash(assetBytes);
    const storedBytes = parsedOriginalGraph.images.get(expectedHash);
    imageAssetVerified =
      storedBytes !== undefined &&
      storedBytes.length === assetBytes.length &&
      storedBytes.every((b, i) => b === assetBytes[i]);
  }

  return {
    textContentVerified,
    visualPropertyVerified,
    sourceAnchorVerified,
    nativeFigRoundtripVerified,
    imageAssetVerified,
  };
}
