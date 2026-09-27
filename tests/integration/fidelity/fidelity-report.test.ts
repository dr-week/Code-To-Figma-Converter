import { describe, it, expect } from 'vitest';
import { createServer } from 'vite';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { buildMilestone1Package } from '../../../packages/tooling/milestone1';
import type { FidelityReport } from '../../../packages/tooling/fidelity-reporter';

describe('Task 1.6 — Offline Fidelity Report Integration Suite', () => {
  it('generates design-preview.png (Scene HTML preview), fidelity-report.json (partial), and fidelity-report.md with explicit unverified fields', async () => {
    const tempDir = await mkdtemp(resolve('.artifacts/task-1-6-fidelity-'));
    const captureBase = join(tempDir, 'package');

    const server = await createServer({
      root: resolve('tests/fixtures/vue'),
      server: { host: '127.0.0.1', port: 0 },
    });

    try {
      await server.listen();
      const address = server.httpServer?.address();
      if (!address || typeof address === 'string') {
        throw new Error('Server address missing');
      }

      const result = await buildMilestone1Package({
        url: `http://127.0.0.1:${address.port}`,
        selector: '[data-figma-root]',
        projectId: 'vue-fidelity-test',
        width: 960,
        height: 900,
        outputBaseDir: captureBase,
        sourceFileRelative: 'tests/fixtures/vue/src/App.vue',
        sourceFileAbsolute: resolve('tests/fixtures/vue/src/App.vue'),
        styleCssAbsolute: resolve('tests/fixtures/vue/src/style.css'),
        studyPngAbsolute: resolve('tests/fixtures/vue/public/study.png'),
      });

      expect(result.packageDir).toBe(captureBase);

      // design-preview.png exists and is a valid PNG (Scene HTML canvas render, NOT OpenPencil-rendered)
      const designPreviewPng = await readFile(join(captureBase, 'design/design-preview.png'));
      expect(designPreviewPng.length).toBeGreaterThan(0);
      expect(designPreviewPng.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47])); // PNG header

      // fidelity-report.json: check what IS measured and that NOT MEASURED fields are null
      const fidelityReportJson: FidelityReport = JSON.parse(
        await readFile(join(captureBase, 'evidence/fidelity-report.json'), 'utf-8'),
      );

      // Viewport dimensions come from scene metadata — this IS recorded
      expect(fidelityReportJson.dimensions.reference).toEqual({ width: 960, height: 900 });
      expect(fidelityReportJson.dimensions.designPreview).toEqual({ width: 960, height: 900 });
      expect(fidelityReportJson.dimensions.match).toBe(true); // both buffers non-empty

      // Node counts come from scene metadata — this IS recorded
      expect(fidelityReportJson.geometryChecks.totalNodes).toBeGreaterThan(0);
      expect(fidelityReportJson.typographyChecks.textNodesCount).toBeGreaterThan(0);
      expect(fidelityReportJson.typographyChecks.fontFamiliesMapped.length).toBeGreaterThan(0);
      expect(fidelityReportJson.assetChecks.imageCount).toBeGreaterThan(0);

      // NOT MEASURED fields must be null — not fabricated success values
      expect(fidelityReportJson.geometryChecks.matchingBoundsWithin1px).toBeNull();
      expect(fidelityReportJson.geometryChecks.maxDeltaPx).toBeNull();
      expect(fidelityReportJson.typographyChecks.matchingTextContentCount).toBeNull();
      expect(fidelityReportJson.colorChecks.colorDriftMax).toBeNull();
      expect(fidelityReportJson.assetChecks.byteIdentical).toBeNull();

      // Limitations list must document each unverified field
      expect(fidelityReportJson.limitations.length).toBeGreaterThanOrEqual(4);
      expect(fidelityReportJson.limitations.some(l => l.includes('NOT compared'))).toBe(true);

      // fidelity-report.md documents the scope and limitations
      const fidelityReportMd = await readFile(join(captureBase, 'evidence/fidelity-report.md'), 'utf-8');
      expect(fidelityReportMd).toContain('NOT MEASURED');
      expect(fidelityReportMd).toContain('UNVERIFIED');
      expect(fidelityReportMd).toContain('Limitations');

      // validation.json: geometry is null, API round-trip is verified, GUI is not
      expect(result.validationReport.fidelityChecks.geometryPreservedWithin1px).toBeNull();
      expect(result.validationReport.fidelityChecks.textNativeAndEditable).toBe(true);
      expect(result.validationReport.fidelityChecks.originalBackupsIntact).toBe(true);
      expect(result.validationReport.status).toBe('INCOMPLETE');
      expect(result.validationReport.editorVerified).toBe(false);
    } finally {
      await server.close();
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 60_000);
});


