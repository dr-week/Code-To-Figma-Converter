import { describe, it, expect } from 'vitest';
import { applySfcCssRuleUpdate } from '../css-writeback';

describe('Milestone 5 Task 5.2 — Pure Domain Scoped CSS Writeback Engine', () => {
  const sampleSfc = `<template>
  <div class="project-card" data-source-id="card">Card</div>
</template>

<style scoped>
.project-card {
  display: flex;
  padding: 16px;
  background-color: #ffffff;
}
</style>`;

  it('updates existing CSS declarations inside matching .class rule in <style scoped> block', () => {
    const result = applySfcCssRuleUpdate({
      fileContent: sampleSfc,
      className: 'project-card',
      cssProperties: {
        'background-color': '#1e293b',
        padding: '24px 32px',
        gap: '20px',
      },
    });

    expect(result.success).toBe(true);
    expect(result.previousRule).toContain('.project-card');
    expect(result.updatedContent).toContain('background-color: #1e293b;');
    expect(result.updatedContent).toContain('padding: 24px 32px;');
    expect(result.updatedContent).toContain('gap: 20px;');
  });

  it('appends a new CSS rule inside <style scoped> block if selector does not exist', () => {
    const result = applySfcCssRuleUpdate({
      fileContent: sampleSfc,
      className: 'new-badge',
      cssProperties: {
        color: '#ff0000',
        'font-weight': '600',
      },
    });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toContain('.new-badge {');
    expect(result.updatedContent).toContain('color: #ff0000;');
    expect(result.updatedContent).toContain('font-weight: 600;');
  });

  it('fails gracefully when no <style> block exists in Vue SFC file', () => {
    const noStyleSfc = `<template><div>No Style</div></template>`;

    const result = applySfcCssRuleUpdate({
      fileContent: noStyleSfc,
      className: 'test',
      cssProperties: { color: '#000' },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('No valid <style> block found');
  });
});
