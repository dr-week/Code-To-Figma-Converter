import { describe, it, expect } from 'vitest';
import { createServer } from 'vite';
import { readFile, rm, cp, mkdir, mkdtemp, symlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { captureProject } from '../../../packages/browser/src/index';
import { convertSceneToOpenPencil, type SourceMappingEntry } from '../../../packages/core/src/index';
import { saveLayoutWritebackToFile } from '../../../packages/tooling/index';

describe('Milestone 3 Task 3.3 — Layout Writeback & Recapture Integration Suite', () => {
  it('executes controlled layout (padding & gap) writeback, recaptures via Vite & Playwright, and verifies scene graph', async () => {
    await mkdir('.artifacts', { recursive: true });
    const tempDir = await mkdtemp(resolve('.artifacts/layout-recapture-test-'));
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

      // 1. Compute initial source hash
      const initialHash = createHash('sha256').update(originalVueContent).digest('hex');

      const mappingEntry: SourceMappingEntry = {
        layerId: 'frame:source:project-card',
        sourceAnchor: 'tests/fixtures/vue/src/App.vue:project-card',
        sourceFile: targetVueFile,
        componentName: 'App',
        domId: 'project-card',
        domClass: 'project',
        layerName: 'Project/Card',
        instanceId: 'inst:project-card',
        editableProperties: ['fill', 'bounds'],
        supportsWriteback: true,
      };

      // 2. Execute saveLayoutWritebackToFile to apply padding: 32px 24px and gap: 20px
      const writebackResult = await saveLayoutWritebackToFile({
        filePath: targetVueFile,
        mappingEntry,
        layoutProps: {
          padding: { top: 32, right: 24, bottom: 32, left: 24 },
          gap: 20,
        },
        expectedSourceHash: initialHash,
        backupDir,
      });

      expect(writebackResult.success).toBe(true);
      expect(writebackResult.backupPath).toBeDefined();
      expect(writebackResult.updatedLayout).toContain('padding: 32px 24px');
      expect(writebackResult.updatedLayout).toContain('gap: 20px');

      // Verify file content updated on disk
      const updatedVueContent = await readFile(targetVueFile, 'utf-8');
      expect(updatedVueContent).toContain('style="padding: 32px 24px; gap: 20px;"');

      // 3. Launch Vite dev server with isolated fixture
      server = await createServer({
        root: fixtureDir,
        server: { host: '127.0.0.1', port: 0, strictPort: false },
        logLevel: 'error',
      });
      await server.listen();

      const address = server.httpServer?.address();
      if (!address || typeof address === 'string') throw new Error('Failed to obtain dev server port');
      const serverUrl = `http://127.0.0.1:${address.port}`;

      // 4. Recapture rendered Vue UI via Playwright browser capture
      const { scene } = await captureProject({
        url: serverUrl,
        selector: '[data-figma-root]',
        projectId: 'vue-layout-recapture-test',
        width: 960,
        height: 900,
      });

      // 5. Convert to OpenPencil Document graph & assert recaptured frame node structure
      const openPencilDoc = convertSceneToOpenPencil(scene);
      expect(openPencilDoc.schema).toBe('openpencil-scenegraph');

      const cardNode = scene.nodes.find(
        node => node.id === 'source:project-card' || node.sourceId === 'project-card'
      );
      expect(cardNode).toBeDefined();
      expect(cardNode?.name).toBe('Project/Card');
      expect(cardNode?.width).toBeGreaterThan(0);
      expect(cardNode?.height).toBeGreaterThan(0);

      // Verify OpenPencil document contains frame node with matching source anchor
      function findOpenPencilNode(nodes: typeof openPencilDoc.nodes, id: string): typeof openPencilDoc.nodes[0] | undefined {
        for (const node of nodes) {
          if (node.id === id || node.sourceAnchor === id) return node;
          if (node.children) {
            const found = findOpenPencilNode(node.children, id);
            if (found) return found;
          }
        }
        return undefined;
      }

      const openPencilCard = findOpenPencilNode(openPencilDoc.nodes, 'source:project-card');
      expect(openPencilCard).toBeDefined();
      expect(openPencilCard?.type).toBe('FRAME');
    } finally {
      await server?.close();
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 60000);
});
