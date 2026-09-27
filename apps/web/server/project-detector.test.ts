import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { detectProject } from './project-detector';

describe('project detector', () => {
  it('detects the Vue fixture and its entry file', async () => {
    const result = await detectProject(resolve('tests/fixtures/vue'));
    expect(result.framework).toBe('vue');
    expect(result.entryFiles.map(file => file.relative)).toContain('src/App.vue');
    expect(result.devScript).toContain('vite');
  });

  it('detects the React fixture without adding framework-specific behavior', async () => {
    const result = await detectProject(resolve('tests/fixtures/react'));
    expect(result.framework).toBe('react');
    expect(result.entryFiles.map(file => file.relative)).toContain('src/main.tsx');
  });
});
