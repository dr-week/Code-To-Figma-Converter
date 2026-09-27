/**
 * Fidelity — Shared Types
 *
 * The FidelityReport type is the contract between the reporter, the JSON
 * writer, and the Markdown formatter. Centralised here so each consumer
 * only imports what it needs.
 */
import type { Color } from '@code-to-figma/contracts';

export type FidelityReport = {
  timestamp: string;
  captureId: string;
  /**
   * Viewport dimensions are taken from the scene source metadata, not decoded from PNG.
   * `match` is true only when both buffers are non-empty — it does not compare pixel dimensions.
   */
  dimensions: {
    reference: { width: number; height: number };
    designPreview: { width: number; height: number };
    match: boolean;
  };
  /**
   * NOT MEASURED: geometry bounds are not compared between reference.png and design-preview.png.
   * A real comparison would decode both PNGs, render each scene node in both, and measure
   * coordinate deltas. These fields are null until that comparison is implemented.
   */
  geometryChecks: {
    totalNodes: number;
    matchingBoundsWithin1px: null;
    maxDeltaPx: null;
  };
  /**
   * fontFamiliesMapped and textNodesCount are derived from the scene graph.
   * matchingTextContentCount is NOT MEASURED — text rendering in the preview is not compared
   * to the reference screenshot.
   */
  typographyChecks: {
    fontFamiliesMapped: string[];
    textNodesCount: number;
    matchingTextContentCount: null;
  };
  /**
   * NOT MEASURED: colorDriftMax is not computed. Color space is documented for reference.
   */
  colorChecks: {
    colorDriftMax: null;
    colorSpace: string;
  };
  /**
   * imageCount is the number of image assets in the scene.
   * byteIdentical is NOT MEASURED here — image bytes are verified separately in the
   * native .fig round-trip (computeAssetHash in openpencil-io.ts), not in this fidelity report.
   */
  assetChecks: {
    imageCount: number;
    byteIdentical: null;
  };
  limitations: string[];
};

/** Utility used across fidelity modules: formats a normalised RGBA color to CSS rgba(). */
export function formatRgba(c?: Color): string {
  if (!c) return 'transparent';
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${c.a})`;
}
