import { describe, it, expect } from 'vitest';
import { createServer } from 'vite';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { buildMilestone1Package } from '../../../packages/tooling/milestone1';
import { parseOpenPencilFig, computeAssetHash } from '../../../packages/tooling/openpencil-io';
import { SOURCE_ANCHOR_NAMESPACE, SOURCE_ANCHOR_KEY } from '../../../packages/core/src/index';

interface ParsedNode {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  text?: string;
  fills?: { type: string; color: { r: number; g: number; b: number; a: number }; opacity: number; visible: boolean }[];
  pluginData?: { pluginId: string; key: string; value: string }[];
}

interface SourceMapping {
  layerId: string;
  sourceAnchor: string;
  sourceFile: string;
  componentName: string;
  domId: string | null;
  domClass: string | null;
  layerName: string;
  instanceId: string;
}

function sha256Hex(bytes: Uint8Array | Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex');
}

describe('Task 1.5 — Actual OpenPencil Editor Persistence Suite', () => {
  it('verifies native .fig text and visual edits, source anchors, image bytes, and backup integrity across save/reopen', async () => {
    const tempDir = await mkdtemp(resolve('.artifacts/task-1-5-persistence-'));
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
        projectId: 'vue-persistence-test',
        width: 960,
        height: 900,
        outputBaseDir: captureBase,
        sourceFileRelative: 'tests/fixtures/vue/src/App.vue',
        sourceFileAbsolute: resolve('tests/fixtures/vue/src/App.vue'),
        styleCssAbsolute: resolve('tests/fixtures/vue/src/style.css'),
        studyPngAbsolute: resolve('tests/fixtures/vue/public/study.png'),
      });

      expect(result.packageDir).toBe(captureBase);

      // --- QUESTION 1: Source Anchor Preservation ---
      // Confirm editing text and solid fill color in working.fig does NOT strip or alter code-to-design:sourceAnchor pluginData tuples
      const workingFigBytes = await readFile(join(captureBase, 'design/working.fig'));
      const parsedWorkingGraph = await parseOpenPencilFig(new Uint8Array(workingFigBytes).buffer);
      const parsedNodes = Array.from(parsedWorkingGraph.nodes.values()) as unknown as ParsedNode[];

      expect(parsedNodes.length).toBeGreaterThanOrEqual(3);

      const sourceMapJson = JSON.parse(await readFile(join(captureBase, 'source-map.json'), 'utf-8'));
      const expectedAnchors: string[] = sourceMapJson.mappings.map((m: SourceMapping) => m.sourceAnchor);

      // Every mapped node in working.fig must have its matching pluginData sourceAnchor intact
      for (const expectedAnchor of expectedAnchors) {
        const matchingNode = parsedNodes.find((node: ParsedNode) =>
          node.pluginData?.some(
            (p: { pluginId: string; key: string; value: string }) =>
              p.pluginId === SOURCE_ANCHOR_NAMESPACE &&
              p.key === SOURCE_ANCHOR_KEY &&
              p.value === expectedAnchor,
          ),
        );
        expect(matchingNode).toBeDefined();
      }

      // Verify the edited text content survived
      const textNode = parsedNodes.find((n: ParsedNode) => n.type === 'TEXT');
      expect(textNode).toBeDefined();
      expect(textNode?.text).toContain('[WORKING COPY]');

      // Verify the edited visual fill color property survived on the root frame node mapped by sourceAnchor
      const rootFrameMapping = sourceMapJson.mappings.find((m: SourceMapping) => m.layerId === 'source:canvas');
      expect(rootFrameMapping).toBeDefined();

      const frameNode = parsedNodes.find((n: ParsedNode) =>
        n.pluginData?.some(
          (p: { pluginId: string; key: string; value: string }) =>
            p.pluginId === SOURCE_ANCHOR_NAMESPACE &&
            p.key === SOURCE_ANCHOR_KEY &&
            p.value === rootFrameMapping.sourceAnchor,
        ),
      );
      expect(frameNode).toBeDefined();
      expect(frameNode?.fills).toBeDefined();
      expect(frameNode?.fills?.length).toBeGreaterThan(0);
      const fillColor = frameNode?.fills?.[0]?.color;
      expect(fillColor?.r).toBeCloseTo(0.1, 3);
      expect(fillColor?.g).toBeCloseTo(0.2, 3);
      expect(fillColor?.b).toBeCloseTo(0.8, 3);

      // --- QUESTION 2: PNG Image Asset Byte Fidelity ---
      // Prove that image asset bytes remain 100% byte-identical after saving and parsing working.fig
      const originalPngBytes = new Uint8Array(await readFile(resolve('tests/fixtures/vue/public/study.png')));
      const expectedAssetHash = computeAssetHash(originalPngBytes);

      // Look up image bytes directly from parsed working graph's image table
      const storedImageBytes = parsedWorkingGraph.images.get(expectedAssetHash);
      expect(storedImageBytes).toBeDefined();
      expect(storedImageBytes!.length).toBe(originalPngBytes.length);
      expect(Array.from(storedImageBytes!)).toEqual(Array.from(originalPngBytes));

      // --- QUESTION 3: Multi-Asset Backup Integrity ---
      // Verify source component backups (App.vue), stylesheets (style.css), and static images (study.png) remain immutable and match manifest.json
      const manifest = result.manifest;
      expect(manifest.files).toBeDefined();

      const manifestFiles = manifest.files as Record<string, string>;
      const backupFiles = ['source-backup/App.vue', 'source-backup/style.css', 'source-backup/study.png'];
      for (const fileKey of backupFiles) {
        const diskBytes = await readFile(join(captureBase, fileKey));
        const computedHash = sha256Hex(diskBytes);
        expect(manifestFiles[fileKey]).toBe(computedHash);
      }

      // --- QUESTION 4: Headless vs GUI Limitation Transparency ---
      // Explicit limitations are recorded in evidence/validation.json to distinguish programmatic WASM codec persistence from visual desktop GUI editing
      const validationReport = result.validationReport;
      expect(validationReport.status).toBe('INCOMPLETE');
      expect(validationReport.editorVerified).toBe(false);
      expect(validationReport.nativeFigRoundtripVerified).toBe(true);
      expect(validationReport.fidelityChecks.visualPropertyVerified).toBe(true);
      expect(validationReport.fidelityChecks.imageAssetVerified).toBe(true);
      expect(validationReport.limitations).toContain('GUI editor open/edit/save has not been verified.');
    } finally {
      await server.close();
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 60_000);
});
