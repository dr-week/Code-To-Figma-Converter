/**
 * fidelity-reporter.ts — Barrel re-export for fidelity infrastructure.
 *
 * Implementation is split into focused files under fidelity/:
 *   fidelity/types.ts          — FidelityReport type + formatRgba helper
 *   fidelity/preview-builder.ts — generateDesignPreviewScreenshot (Playwright)
 *   fidelity/compare.ts         — compareFidelity (scene metadata → FidelityReport)
 *   fidelity/report-markdown.ts — formatFidelityReportMarkdown
 *
 * Existing imports from './fidelity-reporter' continue to resolve unchanged.
 */
export type { FidelityReport } from './fidelity/types';
export { generateDesignPreviewScreenshot } from './fidelity/preview-builder';
export { compareFidelity } from './fidelity/compare';
export { formatFidelityReportMarkdown } from './fidelity/report-markdown';
