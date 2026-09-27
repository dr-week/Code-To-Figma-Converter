import { describe, it, expect } from 'vitest';
import { readFile, writeFile, mkdir, rm, mkdtemp } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { applySfcCssRuleUpdate } from '../../../packages/core/src/index';

describe('Milestone 5 — Scoped CSS Writeback Integration Suite', () => {
  it('updates scoped CSS rules in target Vue SFC file and verifies formatting', async () => {
    await mkdir('.artifacts', { recursive: true });
    const tempDir = await mkdtemp(resolve('.artifacts/css-writeback-test-'));
    const testVuePath = join(tempDir, 'AppCssTest.vue');

    try {
      const initialSfc = `<template>
  <main data-source-id="canvas">
    <div class="project-card" data-source-id="project-card">
      <h2 data-source-id="project-title">Card Title</h2>
    </div>
  </main>
</template>

<style scoped>
.project-card {
  display: flex;
  padding: 16px;
  background-color: #ffffff;
}
</style>`;

      await writeFile(testVuePath, initialSfc, 'utf-8');

      // Execute CSS rule update on .project-card class
      const result = applySfcCssRuleUpdate({
        fileContent: initialSfc,
        className: 'project-card',
        cssProperties: {
          'background-color': '#0f172a',
          padding: '32px 24px',
          gap: '16px',
        },
      });

      expect(result.success).toBe(true);
      expect(result.updatedContent).toContain('background-color: #0f172a;');
      expect(result.updatedContent).toContain('padding: 32px 24px;');
      expect(result.updatedContent).toContain('gap: 16px;');

      // Write updated content to disk and read back
      await writeFile(testVuePath, result.updatedContent!, 'utf-8');
      const diskContent = await readFile(testVuePath, 'utf-8');

      expect(diskContent).toContain('background-color: #0f172a;');
      expect(diskContent).toContain('<template>');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
