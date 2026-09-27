/**
 * Fidelity — Scene Comparison
 *
 * Records what can be structurally determined about fidelity from the scene
 * metadata and the existence of both screenshot buffers.
 *
 * This module is responsible for exactly one thing: computing a FidelityReport.
 * It does NOT render HTML, take screenshots, or write files.
 *
 * What IS established here:
 * - Viewport dimensions expected (from scene.source.viewport).
 * - Both screenshot buffers are non-empty.
 * - Font families and text-node count in the captured scene.
 * - Image asset count in the scene.
 *
 * What is NOT established here (null fields):
 * - matchingBoundsWithin1px: no coordinate comparison is performed.
 * - maxDeltaPx: not measured.
 * - matchingTextContentCount: text rendering is not compared to the reference.
 * - colorDriftMax: color values from the scene are not compared to rendered pixels.
 * - byteIdentical: image byte verification is done separately via computeAssetHash
 *   in the native .fig round-trip, not in this report.
 */
import type { Scene } from '@code-to-figma/contracts';
import type { FidelityReport } from './types';

export function compareFidelity(
  scene: Scene,
  referencePng: Buffer,
  designPreviewPng: Buffer,
  captureId: string,
): FidelityReport {
  const width = scene.source.viewport.width;
  const height = scene.source.viewport.height;

  const textNodes = scene.nodes.filter(n => n.kind === 'text');
  const fontFamilies = [...new Set(textNodes.map(n => n.kind === 'text' ? n.fontFamily : '').filter(Boolean))];

  return {
    timestamp: new Date().toISOString(),
    captureId,
    dimensions: {
      reference: { width, height },
      designPreview: { width, height },
      // True only when both buffers are non-empty; does not decode or compare dimensions.
      match: referencePng.length > 0 && designPreviewPng.length > 0,
    },
    geometryChecks: {
      totalNodes: scene.nodes.length,
      matchingBoundsWithin1px: null,  // NOT MEASURED — requires PNG decode + coordinate delta
      maxDeltaPx: null,               // NOT MEASURED
    },
    typographyChecks: {
      fontFamiliesMapped: fontFamilies,
      textNodesCount: textNodes.length,
      matchingTextContentCount: null, // NOT MEASURED — text rendering not compared to reference
    },
    colorChecks: {
      colorDriftMax: null,            // NOT MEASURED — pixel color values not compared
      colorSpace: 'Normalized RGBA floats [0, 1] in scene; pixel comparison not performed',
    },
    assetChecks: {
      imageCount: scene.assets.length,
      byteIdentical: null,            // NOT MEASURED here — see computeAssetHash in openpencil-io.ts
    },
    limitations: [
      'Geometry bounds are NOT compared: matchingBoundsWithin1px and maxDeltaPx require PNG decode and coordinate delta measurement.',
      'Text rendering is NOT compared to the reference screenshot: matchingTextContentCount is not measured.',
      'Color drift is NOT measured: colorDriftMax requires pixel-level comparison of rendered output.',
      'Image byte identity is verified separately in the native .fig round-trip, not in this report.',
      'design-preview.png renders the captured Scene as HTML — it does NOT render the exported .fig through OpenPencil.',
      'A real fidelity comparison requires independently obtained OpenPencil-rendered output and actual pixel deltas.',
    ],
  };
}
