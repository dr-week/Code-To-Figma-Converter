import { describe, it, expect } from 'vitest';
import { resolveSourceConflict } from '../conflict-merge';
import type { SourceMappingEntry } from '../index';

describe('Milestone 4 Task 4.2 — Bi-Directional Diff & Safe Conflict Merge Engine', () => {
  function simpleHash(content: string): string {
    let hashVal = 0;
    for (let i = 0; i < content.length; i++) {
      hashVal = (hashVal << 5) - hashVal + content.charCodeAt(i);
      hashVal |= 0;
    }
    return `hash-${hashVal}`;
  }

  const mappingEntry: SourceMappingEntry = {
    layerId: 'text:source:project-title',
    sourceAnchor: 'App.vue:project-title',
    sourceFile: 'App.vue',
    componentName: 'App',
    domId: 'project-title',
    domClass: null,
    layerName: 'Project/Title',
    instanceId: 'inst:project-title',
    editableProperties: ['text', 'fill'],
    supportsWriteback: true,
  };

  it('returns CLEAN resolution when source file has not changed since capture', () => {
    const content = '<h2 data-source-id="project-title">Title</h2>';
    const expectedHash = simpleHash(content);

    const result = resolveSourceConflict({
      fileContent: content,
      expectedSourceHash: expectedHash,
      computeHash: simpleHash,
      mappingEntry,
    });

    expect(result.canApply).toBe(true);
    expect(result.resolutionStatus).toBe('CLEAN');
  });

  it('returns SAFE_MERGE when source file changed elsewhere but target element remains present', () => {
    const originalContent = '<header>Old Header</header><h2 data-source-id="project-title">Title</h2>';
    const expectedHash = simpleHash(originalContent);

    // Modified header line, target element intact
    const modifiedContent = '<header>Updated Header by Dev</header><h2 data-source-id="project-title">Title</h2>';

    const result = resolveSourceConflict({
      fileContent: modifiedContent,
      expectedSourceHash: expectedHash,
      computeHash: simpleHash,
      mappingEntry,
    });

    expect(result.canApply).toBe(true);
    expect(result.resolutionStatus).toBe('SAFE_MERGE');
    expect(result.message).toContain('SAFE_MERGE');
  });

  it('returns UNRESOLVED_LINE_CONFLICT when target element was removed or altered in source', () => {
    const originalContent = '<h2 data-source-id="project-title">Title</h2>';
    const expectedHash = simpleHash(originalContent);

    // Target element removed by dev
    const modifiedContent = '<section>Title Removed</section>';

    const result = resolveSourceConflict({
      fileContent: modifiedContent,
      expectedSourceHash: expectedHash,
      computeHash: simpleHash,
      mappingEntry,
    });

    expect(result.canApply).toBe(false);
    expect(result.resolutionStatus).toBe('UNRESOLVED_LINE_CONFLICT');
    expect(result.message).toContain('cannot be auto-merged');
  });

  it('allows writeback under FORCE_OVERRIDDEN when forceOverride is enabled', () => {
    const originalContent = '<h2 data-source-id="project-title">Title</h2>';
    const expectedHash = simpleHash(originalContent);

    const modifiedContent = '<section>Title Removed</section>';

    const result = resolveSourceConflict({
      fileContent: modifiedContent,
      expectedSourceHash: expectedHash,
      computeHash: simpleHash,
      mappingEntry,
      forceOverride: true,
    });

    expect(result.canApply).toBe(true);
    expect(result.resolutionStatus).toBe('FORCE_OVERRIDDEN');
  });
});
