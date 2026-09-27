import { describe, it, expect } from 'vitest';
import { applyColorWritebackContent, colorToHexOrRgba } from '../color-writeback';
import type { SourceMappingEntry } from '../index';

describe('Vue SFC Pure Domain Solid Fill Color Writeback', () => {
  const sampleVueSfc = `<template>
  <main data-figma-root data-source-id="canvas">
    <section class="project" data-source-id="project-card">
      <button type="button" data-source-id="inspect-button" style="background-color: #b63727; color: #ffffff;">Inspect</button>
    </section>
  </main>
</template>`;

  const mockHash = (str: string) => `hash:${str.length}`;

  it('converts Color objects to canonical hex or rgba string', () => {
    expect(colorToHexOrRgba({ r: 1, g: 0, b: 0, a: 1 })).toBe('#ff0000');
    expect(colorToHexOrRgba({ r: 0, g: 1, b: 0, a: 1 })).toBe('#00ff00');
    expect(colorToHexOrRgba({ r: 0, g: 0, b: 1, a: 0.5 })).toBe('rgba(0, 0, 255, 0.5)');
  });

  it('updates existing inline style background-color on button element', () => {
    const entry: SourceMappingEntry = {
      layerId: 'source:inspect-button',
      sourceAnchor: 'App.vue:inspect-button',
      sourceFile: 'App.vue',
      componentName: 'App',
      domId: 'inspect-button',
      domClass: null,
      layerName: 'Project/InspectButton',
      instanceId: 'inst:inspect-button',
      editableProperties: ['fill', 'border'],
      supportsWriteback: true,
    };

    const expectedHash = mockHash(sampleVueSfc);
    const result = applyColorWritebackContent({
      fileContent: sampleVueSfc,
      mappingEntry: entry,
      newFillColor: { r: 0, g: 0.5, b: 1, a: 1 }, // #0080ff
      expectedSourceHash: expectedHash,
      computeHash: mockHash,
    });

    expect(result.success).toBe(true);
    expect(result.previousColor).toBe('#b63727');
    expect(result.updatedColor).toBe('#0080ff');
    expect(result.updatedContent).toContain('style="background-color: #0080ff; color: #ffffff;"');
  });

  it('adds style attribute when element has no pre-existing inline style', () => {
    const entry: SourceMappingEntry = {
      layerId: 'source:project-card',
      sourceAnchor: 'App.vue:project-card',
      sourceFile: 'App.vue',
      componentName: 'App',
      domId: 'project-card',
      domClass: 'project',
      layerName: 'Project/Card',
      instanceId: 'inst:project-card',
      editableProperties: ['fill', 'border'],
      supportsWriteback: true,
    };

    const result = applyColorWritebackContent({
      fileContent: sampleVueSfc,
      mappingEntry: entry,
      newFillColor: { r: 1, g: 1, b: 0, a: 1 }, // #ffff00
    });

    expect(result.success).toBe(true);
    expect(result.updatedColor).toBe('#ffff00');
    expect(result.updatedContent).toContain('<section class="project" data-source-id="project-card" style="background-color: #ffff00;">');
  });

  it('rejects writeback when expected source hash mismatches', () => {
    const entry: SourceMappingEntry = {
      layerId: 'source:project-card',
      sourceAnchor: 'App.vue:project-card',
      sourceFile: 'App.vue',
      componentName: 'App',
      domId: 'project-card',
      domClass: null,
      layerName: 'Project/Card',
      instanceId: 'inst:project-card',
      editableProperties: ['fill'],
      supportsWriteback: true,
    };

    const result = applyColorWritebackContent({
      fileContent: sampleVueSfc,
      mappingEntry: entry,
      newFillColor: { r: 1, g: 0, b: 0, a: 1 },
      expectedSourceHash: 'hash:invalid',
      computeHash: mockHash,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Source hash mismatch');
  });
});
