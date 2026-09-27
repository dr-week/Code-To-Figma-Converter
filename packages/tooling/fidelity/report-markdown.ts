/**
 * Fidelity — Markdown Report Formatter
 *
 * Formats a FidelityReport into human-readable Markdown answering the four
 * embedded verification questions (geometry, typography, color, images).
 *
 * This module is responsible for exactly one thing: producing a Markdown string.
 * It does NOT write files, take screenshots, or compute the report.
 */
import type { FidelityReport } from './types';

/**
 * Formats a FidelityReport into human-readable Markdown answering the 4 embedded verification questions.
 */
export function formatFidelityReportMarkdown(report: FidelityReport): string {
  const dim = report.dimensions.match ? '✅ Both buffers non-empty' : '❌ One or both buffers empty';
  return `# Task 1.6 — Offline Fidelity Report

**Capture ID:** \`${report.captureId}\`  
**Timestamp:** \`${report.timestamp}\`  

> ⚠️ **Important:** This report records what was captured and what is structurally present.
> It does NOT measure pixel-level fidelity between the reference screenshot and the design preview.
> Fields marked NOT MEASURED require PNG decoding and coordinate/pixel delta comparison
> against independently obtained OpenPencil-rendered output.

---

## Summary

| Metric | Value | Method | Status |
|---|---|---|---|
| **Viewport Dimensions** | ${report.dimensions.reference.width}×${report.dimensions.reference.height}px | Scene metadata | ${dim} |
| **Total Scene Nodes** | ${report.geometryChecks.totalNodes} | Scene node count | Recorded |
| **Geometry Accuracy** | NOT MEASURED | Requires PNG decode + delta | ⚠️ UNVERIFIED |
| **Font Families** | ${report.typographyChecks.fontFamiliesMapped.join(', ') || 'none'} | Scene metadata | Recorded |
| **Text Nodes** | ${report.typographyChecks.textNodesCount} | Scene node count | Recorded |
| **Text Rendering Match** | NOT MEASURED | Requires render comparison | ⚠️ UNVERIFIED |
| **Color Drift** | NOT MEASURED | Requires pixel comparison | ⚠️ UNVERIFIED |
| **Image Assets** | ${report.assetChecks.imageCount} assets in scene | Scene metadata | Recorded |
| **Image Byte Identity** | Verified separately | computeAssetHash in .fig round-trip | See validation.json |

---

## Limitations

${report.limitations.map(l => `- ${l}`).join('\n')}
`;
}
