import { describe, it, expect } from 'vitest';
import { applyTextWritebackContent } from '../writeback';
import type { SourceMappingEntry } from '../index';

describe('Vue SFC Pure Domain Text Writeback', () => {
  const sampleVueSfc = `<template>
  <main data-figma-root data-source-id="canvas">
    <h1 data-source-id="intro-title">Good structure.<br />Clear outcomes.</h1>
    <h2 data-source-id="project-title">Every element has a name.</h2>
    <p data-source-id="dynamic-node">{{ dynamicTitle }}</p>
  </main>
</template>
<script setup lang="ts">
const dynamicTitle = 'Dynamic Content';
</script>`;

  const mockHash = (str: string) => `hash:${str.length}`;

  it('updates static literal string in Vue SFC content string', () => {
    const entry: SourceMappingEntry = {
      layerId: 'text:source:project-title',
      sourceAnchor: 'tests/fixtures/vue/src/App.vue:project-title',
      sourceFile: 'tests/fixtures/vue/src/App.vue',
      componentName: 'App',
      domId: 'project-title',
      domClass: null,
      layerName: 'Project/Title',
      instanceId: 'inst:project-title',
      editableProperties: ['text', 'fill'],
      supportsWriteback: true,
    };

    const expectedHash = mockHash(sampleVueSfc);
    const result = applyTextWritebackContent({
      fileContent: sampleVueSfc,
      mappingEntry: entry,
      newText: 'Edited element text title.',
      expectedSourceHash: expectedHash,
      computeHash: mockHash,
    });

    expect(result.success).toBe(true);
    expect(result.previousText).toBe('Every element has a name.');
    expect(result.updatedText).toBe('Edited element text title.');
    expect(result.updatedContent).toContain('<h2 data-source-id="project-title">Edited element text title.</h2>');
    expect(result.diff).toBe('- Every element has a name.\n+ Edited element text title.');
  });

  it('rejects writeback when source hash mismatches', () => {
    const entry: SourceMappingEntry = {
      layerId: 'text:source:project-title',
      sourceAnchor: 'tests/fixtures/vue/src/App.vue:project-title',
      sourceFile: 'tests/fixtures/vue/src/App.vue',
      componentName: 'App',
      domId: 'project-title',
      domClass: null,
      layerName: 'Project/Title',
      instanceId: 'inst:project-title',
      editableProperties: ['text', 'fill'],
      supportsWriteback: true,
    };

    const result = applyTextWritebackContent({
      fileContent: sampleVueSfc,
      mappingEntry: entry,
      newText: 'Stale update attempt',
      expectedSourceHash: 'hash:000',
      computeHash: mockHash,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Source hash mismatch');
  });

  it('rejects writeback when target element contains dynamic Vue bindings {{ ... }}', () => {
    const entry: SourceMappingEntry = {
      layerId: 'text:source:dynamic-node',
      sourceAnchor: 'tests/fixtures/vue/src/App.vue:dynamic-node',
      sourceFile: 'tests/fixtures/vue/src/App.vue',
      componentName: 'App',
      domId: 'dynamic-node',
      domClass: null,
      layerName: 'Dynamic/Node',
      instanceId: 'inst:dynamic-node',
      editableProperties: ['text'],
      supportsWriteback: true,
    };

    const result = applyTextWritebackContent({
      fileContent: sampleVueSfc,
      mappingEntry: entry,
      newText: 'Replaced dynamic content',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Dynamic template binding detected');
  });
});
