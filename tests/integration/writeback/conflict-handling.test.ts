import { describe, it, expect } from 'vitest';
import { readFile, writeFile, mkdir, rm, mkdtemp } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { saveTextWritebackToFile } from '../../../packages/tooling/index';
import { type SourceMappingEntry } from '../../../packages/core/src/index';

describe('Milestone 4 — Conflict Handling Integration Suite', () => {
  function computeHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  it('rejects writeback when expectedSourceHash mismatch occurs and forceOverride is false', async () => {
    await mkdir('.artifacts', { recursive: true });
    const tempDir = await mkdtemp(resolve('.artifacts/conflict-test-'));
    const testVuePath = join(tempDir, 'AppConflictTest.vue');
    const backupDir = join(tempDir, '.backup');

    try {
      const originalVueContent = `<template>
  <main data-source-id="canvas">
    <h2 data-source-id="project-title">Original Title</h2>
  </main>
</template>`;
      await writeFile(testVuePath, originalVueContent, 'utf-8');

      const captureHash = computeHash(originalVueContent);

      // Simulate external modification by developer after capture
      const modifiedVueContent = `<template>
  <!-- Developer added a header -->
  <header>New Navigation Header</header>
  <main data-source-id="canvas">
    <h2 data-source-id="project-title">Original Title</h2>
  </main>
</template>`;
      await writeFile(testVuePath, modifiedVueContent, 'utf-8');

      const mappingEntry: SourceMappingEntry = {
        layerId: 'text:source:project-title',
        sourceAnchor: 'AppConflictTest.vue:project-title',
        sourceFile: testVuePath,
        componentName: 'AppConflictTest',
        domId: 'project-title',
        domClass: null,
        layerName: 'Project/Title',
        instanceId: 'inst:project-title',
        editableProperties: ['text', 'fill'],
        supportsWriteback: true,
      };

      // Execute saveTextWritebackToFile with initial capture hash (which is now stale relative to disk)
      const result = await saveTextWritebackToFile({
        filePath: testVuePath,
        mappingEntry,
        newText: 'Edited Title from OpenPencil',
        expectedSourceHash: captureHash,
        backupDir,
      });

      // Verification: Writeback rejected due to hash mismatch
      expect(result.success).toBe(false);
      expect(result.error).toContain('Source hash mismatch');

      // Target Vue file on disk remains unchanged
      const currentDiskContent = await readFile(testVuePath, 'utf-8');
      expect(currentDiskContent).toBe(modifiedVueContent);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('succeeds with safe writeback when expectedSourceHash matches disk content', async () => {
    await mkdir('.artifacts', { recursive: true });
    const tempDir = await mkdtemp(resolve('.artifacts/clean-writeback-test-'));
    const testVuePath = join(tempDir, 'AppCleanTest.vue');
    const backupDir = join(tempDir, '.backup');

    try {
      const currentVueContent = `<template>
  <main data-source-id="canvas">
    <h2 data-source-id="project-title">Current Title</h2>
  </main>
</template>`;
      await writeFile(testVuePath, currentVueContent, 'utf-8');

      const matchingHash = computeHash(currentVueContent);

      const mappingEntry: SourceMappingEntry = {
        layerId: 'text:source:project-title',
        sourceAnchor: 'AppCleanTest.vue:project-title',
        sourceFile: testVuePath,
        componentName: 'AppCleanTest',
        domId: 'project-title',
        domClass: null,
        layerName: 'Project/Title',
        instanceId: 'inst:project-title',
        editableProperties: ['text', 'fill'],
        supportsWriteback: true,
      };

      const result = await saveTextWritebackToFile({
        filePath: testVuePath,
        mappingEntry,
        newText: 'Updated Title Successfully',
        expectedSourceHash: matchingHash,
        backupDir,
      });

      expect(result.success).toBe(true);
      expect(result.updatedText).toBe('Updated Title Successfully');

      const updatedDiskContent = await readFile(testVuePath, 'utf-8');
      expect(updatedDiskContent).toContain('Updated Title Successfully');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
