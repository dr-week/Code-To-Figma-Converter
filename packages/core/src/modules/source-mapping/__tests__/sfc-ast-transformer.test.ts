import { describe, it, expect } from 'vitest';
import {
  findSfcElementBySourceId,
  applySfcAstTextUpdate,
  applySfcAstStyleUpdate,
  parseVueSfcSections,
} from '../sfc-ast-transformer';

describe('Milestone 5 Task 5.1 — Pure Domain Vue SFC AST Transformer Engine', () => {
  const sampleSfc = `<template>
  <main data-source-id="canvas">
    <header class="app-header" data-source-id="header">
      <span data-source-id="brand-name">Brand Name</span>
    </header>
    <section class="card" data-source-id="project-card" style="padding: 16px; background-color: #ffffff;">
      <h2 data-source-id="project-title">Original Title</h2>
    </section>
  </main>
</template>

<script setup lang="ts">
const title = 'Vue SFC';
</script>

<style scoped>
.card { display: flex; }
</style>`;

  it('parses SFC top-level sections (<template>, <script>, <style>)', () => {
    const sections = parseVueSfcSections(sampleSfc);

    expect(sections.templateContent).toContain('<template>');
    expect(sections.scriptContent).toContain('<script setup');
    expect(sections.styleContent).toContain('<style scoped>');
  });

  it('locates target element AST node by data-source-id', () => {
    const astNode = findSfcElementBySourceId(sampleSfc, 'project-title');

    expect(astNode).toBeDefined();
    expect(astNode?.tagName).toBe('h2');
    expect(astNode?.innerText).toBe('Original Title');
    expect(astNode?.attributes.get('data-source-id')?.value).toBe('project-title');
  });

  it('performs AST-accurate text replacement preserving template boundaries', () => {
    const result = applySfcAstTextUpdate(sampleSfc, 'project-title', 'Updated AST Title');

    expect(result.success).toBe(true);
    expect(result.previousText).toBe('Original Title');
    expect(result.updatedContent).toContain('<h2 data-source-id="project-title">Updated AST Title</h2>');
    expect(result.updatedContent).toContain('<script setup');
  });

  it('performs AST-accurate inline style property mutation', () => {
    const result = applySfcAstStyleUpdate(sampleSfc, 'project-card', {
      'background-color': '#1e293b',
      padding: '24px 32px',
      gap: '16px',
    });

    expect(result.success).toBe(true);
    expect(result.previousStyle).toBe('padding: 16px; background-color: #ffffff;');
    expect(result.updatedContent).toContain('background-color: #1e293b');
    expect(result.updatedContent).toContain('padding: 24px 32px');
    expect(result.updatedContent).toContain('gap: 16px');
    expect(result.updatedContent).toContain('class="card"');
  });

  it('inserts new style attribute cleanly when target element has no existing style', () => {
    const result = applySfcAstStyleUpdate(sampleSfc, 'brand-name', {
      color: '#ff0000',
    });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toContain('<span data-source-id="brand-name" style="color: #ff0000;">Brand Name</span>');
  });
});
