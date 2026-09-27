import { describe, it, expect } from 'vitest';
import { createServer } from 'vite';
import { readFile, rm, cp, mkdir, mkdtemp, symlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { captureProject } from '../../../packages/browser/src/index';
import { convertSceneToOpenPencil, type SourceMappingEntry } from '../../../packages/core/src/index';
import { saveTextWritebackToFile } from '../../../packages/tooling/index';

describe('Milestone 2 Task 3 — Writeback & Recapture End-to-End Integration', () => {
  it('performs controlled text writeback, recaptures via Vite & Playwright, and verifies OpenPencil scene graph', async () => {
    await mkdir('.artifacts', { recursive: true });
    const tempDir = await mkdtemp(resolve('.artifacts/recapture-test-'));
    const fixtureDir = join(tempDir, 'fixture');
    let server: Awaited<ReturnType<typeof createServer>> | undefined;

    try {
      await cp(resolve('tests/fixtures/vue'), fixtureDir, {
        recursive: true,
        filter: (path) => !/[\\/](node_modules|dist|\.backup)([\\/]|$)/.test(path),
      });
      await symlink(
        resolve('tests/fixtures/vue/node_modules'),
        join(fixtureDir, 'node_modules'),
        'junction'
      );

      const targetVueFile = join(fixtureDir, 'src/App.vue');
      const backupDir = join(fixtureDir, 'src/.backup');
      const originalVueContent = await readFile(targetVueFile, 'utf-8');

      // Step 1: Compute initial hash of Vue SFC
      const initialHash = createHash('sha256').update(originalVueContent).digest('hex');

      const mappingEntry: SourceMappingEntry = {
        layerId: 'text:source:project-title',
        sourceAnchor: 'tests/fixtures/vue/src/App.vue:project-title',
        sourceFile: targetVueFile,
        componentName: 'App',
        domId: 'project-title',
        domClass: null,
        layerName: 'Project/Title',
        instanceId: 'inst:project-title',
        editableProperties: ['text', 'fill'],
        supportsWriteback: true,
      };

      const newTitleText = 'Updated Title via OpenPencil.';

      // Step 2: Execute saveTextWritebackToFile on Vue SFC source
      const writebackResult = await saveTextWritebackToFile({
        filePath: targetVueFile,
        mappingEntry,
        newText: newTitleText,
        expectedSourceHash: initialHash,
        backupDir,
      });

      expect(writebackResult.success).toBe(true);
      expect(writebackResult.previousText).toBe('Every element has a name.');
      expect(writebackResult.updatedText).toBe(newTitleText);
      expect(writebackResult.backupPath).toBeDefined();

      // Verify .backup copy created and target file updated on disk
      const backupContent = await readFile(writebackResult.backupPath!, 'utf-8');
      expect(backupContent).toBe(originalVueContent);

      const updatedVueContent = await readFile(targetVueFile, 'utf-8');
      expect(updatedVueContent).toContain(newTitleText);

      // Step 3: Launch Vite dev server serving the isolated updated Vue fixture
      server = await createServer({
        root: fixtureDir,
        server: { host: '127.0.0.1', port: 0, strictPort: false },
        logLevel: 'error',
      });
      await server.listen();

      const address = server.httpServer?.address();
      if (!address || typeof address === 'string') throw new Error('Failed to obtain dev server port');
      const serverUrl = `http://127.0.0.1:${address.port}`;

      // Step 4: Capture rendered Vue UI via Playwright browser capture
      const { scene } = await captureProject({
        url: serverUrl,
        selector: '[data-figma-root]',
        projectId: 'vue-recapture-test',
        width: 960,
        height: 900,
      });

      // Step 5: Convert to OpenPencil Document graph & assert text, layer name and placement
      const openPencilDoc = convertSceneToOpenPencil(scene);
      expect(openPencilDoc.schema).toBe('openpencil-scenegraph');

      // Find recaptured text node in scene
      const recapturedSceneText = scene.nodes.find(
        node => node.kind === 'text' && node.text === newTitleText
      );
      expect(recapturedSceneText).toBeDefined();
      expect(recapturedSceneText?.name).toBe('Project/Title/Text');
      expect(recapturedSceneText?.x).toBeGreaterThanOrEqual(0);
      expect(recapturedSceneText?.y).toBeGreaterThanOrEqual(0);
      expect(recapturedSceneText?.width).toBeGreaterThan(0);
      expect(recapturedSceneText?.height).toBeGreaterThan(0);

      // Verify OpenPencil tree hierarchy retains exact node characters and layer structure
      function findOpenPencilTextNode(nodes: typeof openPencilDoc.nodes): boolean {
        for (const node of nodes) {
          if (node.type === 'TEXT' && node.characters === newTitleText) {
            return true;
          }
          if (node.children && findOpenPencilTextNode(node.children)) {
            return true;
          }
        }
        return false;
      }

      expect(findOpenPencilTextNode(openPencilDoc.nodes)).toBe(true);
    } finally {
      await server?.close();
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 60000);
});
