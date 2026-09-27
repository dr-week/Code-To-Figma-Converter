import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { executePackageWriteback } from '../../../packages/tooling/index';
import {
  serializeOpenPencil,
  type OpenPencilDocument,
  type SourceMap,
} from '../../../packages/core/src/index';

describe('Milestone 3 — Unified CLI Writeback Orchestration Integration Test', () => {
  const fixtureVueDir = resolve('tests/fixtures/vue/src');
  const originalAppVuePath = resolve(fixtureVueDir, 'App.vue');
  const testVuePath = resolve(fixtureVueDir, 'AppWritebackTest.vue');

  const testPackageDir = resolve('.artifacts/milestone-01/test-cli-writeback');
  const designDir = resolve(testPackageDir, 'design');
  const backupDir = resolve(fixtureVueDir, '.backup');

  let originalVueContent: string;

  beforeAll(async () => {
    await rm(testPackageDir, { recursive: true, force: true });

    // 1. Read original App.vue content and write a test copy
    originalVueContent = await readFile(originalAppVuePath, 'utf-8');
    await writeFile(testVuePath, originalVueContent, 'utf-8');

    // 2. Setup mock milestone package directory structure
    await mkdir(designDir, { recursive: true });

    const manifest = {
      schemaVersion: '0.1',
      captureId: 'test-cli-capture-999',
      timestamp: new Date().toISOString(),
      project: { id: 'vue-fixture-test' },
    };
    await writeFile(
      resolve(testPackageDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    const sourceMap: SourceMap = {
      schemaVersion: '0.1',
      projectId: 'vue-fixture-test',
      mappings: [
        {
          layerId: 'text:source:project-title',
          sourceAnchor: 'tests/fixtures/vue/src/AppWritebackTest.vue:project-title',
          sourceFile: 'tests/fixtures/vue/src/AppWritebackTest.vue',
          componentName: 'AppWritebackTest',
          domId: 'project-title',
          domClass: null,
          layerName: 'Project/Title',
          instanceId: 'inst:project-title',
          editableProperties: ['text', 'fill'],
          supportsWriteback: true,
        },
        {
          layerId: 'frame:source:project-card',
          sourceAnchor: 'tests/fixtures/vue/src/AppWritebackTest.vue:project-card',
          sourceFile: 'tests/fixtures/vue/src/AppWritebackTest.vue',
          componentName: 'AppWritebackTest',
          domId: 'project-card',
          domClass: null,
          layerName: 'Project/Card',
          instanceId: 'inst:project-card',
          editableProperties: ['fill'],
          supportsWriteback: true,
        },
      ],
    };
    await writeFile(
      resolve(testPackageDir, 'source-map.json'),
      JSON.stringify(sourceMap, null, 2),
      'utf-8'
    );

    // Create original.openpencil
    const originalOpenPencil: OpenPencilDocument = {
      version: '0.14.0',
      generator: 'code-to-design@0.1.0',
      schema: 'openpencil-scenegraph',
      title: 'Original Capture',
      nodes: [
        {
          id: 'frame:source:project-card',
          name: 'Project/Card',
          type: 'FRAME',
          x: 0,
          y: 0,
          width: 400,
          height: 300,
          opacity: 1,
          fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
          sourceAnchor: 'frame:source:project-card',
          children: [
            {
              id: 'text:source:project-title',
              name: 'Project/Title',
              type: 'TEXT',
              x: 20,
              y: 20,
              width: 200,
              height: 30,
              opacity: 1,
              characters: 'Every element has a name.',
              sourceAnchor: 'text:source:project-title',
            },
          ],
        },
      ],
      assets: [],
      metadata: {
        capturedAt: new Date().toISOString(),
        viewport: { width: 960, height: 900 },
        nodeCount: 2,
      },
    };
    await writeFile(
      resolve(designDir, 'original.openpencil'),
      serializeOpenPencil(originalOpenPencil),
      'utf-8'
    );

    // Create working.openpencil with edited text and edited solid fill color
    const workingOpenPencil: OpenPencilDocument = JSON.parse(JSON.stringify(originalOpenPencil));
    workingOpenPencil.nodes[0]!.fills = [
      { type: 'SOLID', color: { r: 0.118, g: 0.161, b: 0.231, a: 1 } },
    ];
    workingOpenPencil.nodes[0]!.children![0]!.characters = 'CLI Writeback Title Verification.';

    await writeFile(
      resolve(designDir, 'working.openpencil'),
      serializeOpenPencil(workingOpenPencil),
      'utf-8'
    );
  });

  afterAll(async () => {
    // Clean up temporary files
    await rm(testVuePath, { force: true });
    await rm(testPackageDir, { recursive: true, force: true });
    await rm(backupDir, { recursive: true, force: true });
  });

  it('supports dry-run execution without modifying target Vue SFC files or creating backup snapshots', async () => {
    const dryRunManifest = await executePackageWriteback({
      packageDir: testPackageDir,
      backupDir,
      dryRun: true,
    });

    expect(dryRunManifest.status).toBe('PASSED');
    expect(dryRunManifest.writebacks.length).toBe(2);

    // Target file remains untouched
    const currentVueContent = await readFile(testVuePath, 'utf-8');
    expect(currentVueContent).toBe(originalVueContent);
  });

  it('orchestrates reading working.openpencil, updating Vue SFC source, creating backups, and outputting writeback-manifest.json', async () => {
    const manifest = await executePackageWriteback({
      packageDir: testPackageDir,
      backupDir,
    });

    // 1. Verify manifest status metadata
    expect(manifest.status).toBe('PASSED');
    expect(manifest.captureId).toBe('test-cli-capture-999');
    expect(manifest.diffSummary.modifiedNodesCount).toBe(2);
    expect(manifest.diffSummary.textEditsCount).toBe(1);
    expect(manifest.diffSummary.colorEditsCount).toBe(1);

    // 2. Verify writeback-manifest.json file written on disk
    const writtenManifestRaw = await readFile(
      resolve(testPackageDir, 'writeback-manifest.json'),
      'utf-8'
    );
    const writtenManifest = JSON.parse(writtenManifestRaw);
    expect(writtenManifest.status).toBe('PASSED');
    expect(writtenManifest.writebacks.length).toBe(2);

    // 3. Verify target Vue file modified with both text and color updates
    const updatedVueContent = await readFile(testVuePath, 'utf-8');
    expect(updatedVueContent).toContain('CLI Writeback Title Verification.');
    expect(updatedVueContent).toContain('style="background-color: #1e293b;"');

    // 4. Verify backup snapshot copy created in backup directory
    const firstWritebackResult = manifest.writebacks[0];
    expect(firstWritebackResult?.success).toBe(true);
    expect(firstWritebackResult?.backupPath).toBeDefined();

    const backupContent = await readFile(firstWritebackResult!.backupPath!, 'utf-8');
    expect(backupContent).toBe(originalVueContent);
  });
});
