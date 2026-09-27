import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, readFile, rm, mkdtemp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { saveTextWritebackToFile, saveColorWritebackToFile, saveLayoutWritebackToFile, createSourceBackup } from './file-adapter';
import type { SourceMappingEntry } from '../core/src/index';

describe('Infrastructure File Saver Adapter (saveTextWritebackToFile & saveColorWritebackToFile)', () => {
  let testTmpDir: string;
  let testVueFile: string;
  let backupDir: string;

  const initialVueContent = `<template>
  <main data-source-id="canvas">
    <h2 data-source-id="project-title">Every element has a name.</h2>
    <p data-source-id="dynamic-node">{{ dynamicText }}</p>
    <button type="button" data-source-id="inspect-button" style="background-color: #b63727;">Inspect</button>
  </main>
</template>
<script setup lang="ts">
const dynamicText = 'Dynamic Value';
</script>`;

  let validMappingEntry: SourceMappingEntry;
  let buttonMappingEntry: SourceMappingEntry;
  let dynamicMappingEntry: SourceMappingEntry;

  beforeEach(async () => {
    await mkdir('.artifacts', { recursive: true });
    testTmpDir = await mkdtemp(resolve('.artifacts/test-file-adapter-'));
    testVueFile = resolve(testTmpDir, 'AppTest.vue');
    backupDir = resolve(testTmpDir, '.backup');

    await writeFile(testVueFile, initialVueContent, 'utf-8');

    validMappingEntry = {
      layerId: 'text:source:project-title',
      sourceAnchor: 'AppTest.vue:project-title',
      sourceFile: testVueFile,
      componentName: 'AppTest',
      domId: 'project-title',
      domClass: null,
      layerName: 'Project/Title',
      instanceId: 'inst:project-title',
      editableProperties: ['text', 'fill'],
      supportsWriteback: true,
    };

    buttonMappingEntry = {
      layerId: 'source:inspect-button',
      sourceAnchor: 'AppTest.vue:inspect-button',
      sourceFile: testVueFile,
      componentName: 'AppTest',
      domId: 'inspect-button',
      domClass: null,
      layerName: 'Project/InspectButton',
      instanceId: 'inst:inspect-button',
      editableProperties: ['fill', 'border'],
      supportsWriteback: true,
    };

    dynamicMappingEntry = {
      layerId: 'text:source:dynamic-node',
      sourceAnchor: 'AppTest.vue:dynamic-node',
      sourceFile: testVueFile,
      componentName: 'AppTest',
      domId: 'dynamic-node',
      domClass: null,
      layerName: 'Dynamic/Node',
      instanceId: 'inst:dynamic-node',
      editableProperties: ['text'],
      supportsWriteback: true,
    };
  });

  afterEach(async () => {
    if (testTmpDir) {
      await rm(testTmpDir, { recursive: true, force: true });
    }
  });

  it('successfully writes text update to disk and creates pre-edit rollback backup', async () => {
    const originalHash = createHash('sha256').update(initialVueContent).digest('hex');

    const result = await saveTextWritebackToFile({
      filePath: testVueFile,
      mappingEntry: validMappingEntry,
      newText: 'Updated title text.',
      expectedSourceHash: originalHash,
      backupDir,
    });

    expect(result.success).toBe(true);
    expect(result.previousText).toBe('Every element has a name.');
    expect(result.updatedText).toBe('Updated title text.');
    expect(result.backupPath).toBeDefined();

    // Verify target file content on disk updated
    const updatedFileOnDisk = await readFile(testVueFile, 'utf-8');
    expect(updatedFileOnDisk).toContain('<h2 data-source-id="project-title">Updated title text.</h2>');
  });

  it('successfully writes color update to disk and creates pre-edit rollback backup', async () => {
    const originalHash = createHash('sha256').update(initialVueContent).digest('hex');

    const result = await saveColorWritebackToFile({
      filePath: testVueFile,
      mappingEntry: buttonMappingEntry,
      newFillColor: { r: 0, g: 0.5, b: 1, a: 1 },
      expectedSourceHash: originalHash,
      backupDir,
    });

    expect(result.success).toBe(true);
    expect(result.previousColor).toBe('#b63727');
    expect(result.updatedColor).toBe('#0080ff');

    // Verify target file content on disk updated with new hex color
    const updatedFileOnDisk = await readFile(testVueFile, 'utf-8');
    expect(updatedFileOnDisk).toContain('style="background-color: #0080ff;"');
  });

  it('keeps file untouched if color hash validation fails for color writeback', async () => {
    const invalidHash = '0000000000000000000000000000000000000000000000000000000000000000';

    const result = await saveColorWritebackToFile({
      filePath: testVueFile,
      mappingEntry: buttonMappingEntry,
      newFillColor: { r: 0, g: 1, b: 0, a: 1 },
      expectedSourceHash: invalidHash,
      backupDir,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Source hash mismatch');

    // Verify file content on disk remains unchanged
    const fileContentOnDisk = await readFile(testVueFile, 'utf-8');
    expect(fileContentOnDisk).toBe(initialVueContent);
  });

  it('keeps file untouched if text hash validation fails', async () => {
    const invalidHash = '0000000000000000000000000000000000000000000000000000000000000000';

    const result = await saveTextWritebackToFile({
      filePath: testVueFile,
      mappingEntry: validMappingEntry,
      newText: 'Should not be saved',
      expectedSourceHash: invalidHash,
      backupDir,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Source hash mismatch');

    // Verify file content on disk remains unchanged
    const fileContentOnDisk = await readFile(testVueFile, 'utf-8');
    expect(fileContentOnDisk).toBe(initialVueContent);
  });

  it('keeps file untouched if target node contains dynamic template binding {{ ... }}', async () => {
    const result = await saveTextWritebackToFile({
      filePath: testVueFile,
      mappingEntry: dynamicMappingEntry,
      newText: 'Attempted edit on dynamic node',
      backupDir,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    // Verify file content on disk remains unchanged
    const fileContentOnDisk = await readFile(testVueFile, 'utf-8');
    expect(fileContentOnDisk).toBe(initialVueContent);
  });

  it('returns error if target source file does not exist', async () => {
    const nonExistentFile = resolve(testTmpDir, 'NonExistent.vue');

    const result = await saveTextWritebackToFile({
      filePath: nonExistentFile,
      mappingEntry: validMappingEntry,
      newText: 'Test text',
      backupDir,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to read source file');
  });

  it('creates source-backup directory with component sources and static assets', async () => {
    const packageDir = resolve(testTmpDir, 'capture-package');

    const backupResult = await createSourceBackup({
      packageDir,
      sourceFiles: [testVueFile],
    });

    expect(backupResult.backupDir).toBe(resolve(packageDir, 'source-backup'));
    expect(backupResult.copiedFiles.length).toBe(1);

    const backedUpContent = await readFile(backupResult.copiedFiles[0]!, 'utf-8');
    expect(backedUpContent).toBe(initialVueContent);
  });

  it('successfully writes layout writeback (padding, gap) to disk and creates backup', async () => {
    const originalHash = createHash('sha256').update(initialVueContent).digest('hex');

    const result = await saveLayoutWritebackToFile({
      filePath: testVueFile,
      mappingEntry: buttonMappingEntry,
      layoutProps: { padding: 16, gap: 12 },
      expectedSourceHash: originalHash,
      backupDir,
    });

    expect(result.success).toBe(true);
    expect(result.updatedLayout).toBe('padding: 16px; gap: 12px');
    expect(result.backupPath).toBeDefined();

    const updatedFileOnDisk = await readFile(testVueFile, 'utf-8');
    expect(updatedFileOnDisk).toContain('padding: 16px; gap: 12px');
  });
});
