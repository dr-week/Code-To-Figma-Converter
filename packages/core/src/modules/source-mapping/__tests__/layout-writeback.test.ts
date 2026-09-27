import { describe, it, expect } from 'vitest';
import { applyLayoutWritebackContent, formatPaddingCss } from '../layout-writeback';
import type { SourceMappingEntry } from '../index';

describe('applyLayoutWritebackContent', () => {
  const mappingEntry: SourceMappingEntry = {
    layerId: 'frame:source:project-card',
    sourceAnchor: 'tests/fixtures/vue/src/App.vue:project-card',
    sourceFile: 'tests/fixtures/vue/src/App.vue',
    componentName: 'App',
    domId: 'project-card',
    domClass: 'project',
    layerName: 'Project/Card',
    instanceId: 'inst:project-card',
    editableProperties: ['fill', 'bounds'],
    supportsWriteback: true,
  };

  const sampleVueSfc = `<template>
  <section class="project" data-source-id="project-card">
    <h2>Title</h2>
  </section>
</template>`;

  it('formats padding numbers and object structures to CSS strings', () => {
    expect(formatPaddingCss(16)).toBe('16px');
    expect(formatPaddingCss({ top: 12, right: 16, bottom: 12, left: 16 })).toBe('12px 16px');
    expect(formatPaddingCss({ top: 8, right: 12, bottom: 16, left: 24 })).toBe('8px 12px 16px 24px');
  });

  it('adds new inline style attribute with padding and gap when no style attribute exists', () => {
    const result = applyLayoutWritebackContent({
      fileContent: sampleVueSfc,
      mappingEntry,
      layoutProps: { padding: 16, gap: 12 },
    });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toContain('style="padding: 16px; gap: 12px;"');
    expect(result.updatedLayout).toBe('padding: 16px; gap: 12px');
  });

  it('updates existing inline style attribute properties', () => {
    const sfcWithStyle = `<template>
  <section class="project" data-source-id="project-card" style="padding: 8px; color: red;">
    <h2>Title</h2>
  </section>
</template>`;

    const result = applyLayoutWritebackContent({
      fileContent: sfcWithStyle,
      mappingEntry,
      layoutProps: { padding: 24 },
    });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toContain('style="padding: 24px; color: red;"');
  });

  it('fails cleanly on target anchor mismatch', () => {
    const result = applyLayoutWritebackContent({
      fileContent: sampleVueSfc,
      mappingEntry: { ...mappingEntry, domId: 'missing-node' },
      layoutProps: { padding: 16 },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Could not anchor target element with sourceId 'missing-node'");
  });
});
