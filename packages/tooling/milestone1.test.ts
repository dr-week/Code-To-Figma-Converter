import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sampleScene } from '../contracts/src/test-fixture';
import { buildMilestone1Package } from './milestone1';

vi.mock('../browser/src/index', () => ({
  captureProject: async () => ({ scene: sampleScene(), screenshot: Buffer.from('browser-only') }),
}));

const temporaryDirectories: string[] = [];
afterEach(async () => {
  for (const directory of temporaryDirectories.splice(0)) {
    await rm(directory, { recursive: true, force: true });
  }
});

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'milestone-evidence-'));
  temporaryDirectories.push(directory);

  const sourceFileAbsolute = join(directory, 'App.vue');
  await writeFile(sourceFileAbsolute, '<template><h1>Original</h1></template>');

  // Additional source files required by Task 1.4 complete backup
  const styleCssAbsolute = join(directory, 'style.css');
  await writeFile(styleCssAbsolute, 'h1 { color: red; }');

  const studyPngAbsolute = join(directory, 'study.png');
  // Minimal valid PNG header bytes
  await writeFile(studyPngAbsolute, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  return {
    sourceFileAbsolute,
    styleCssAbsolute,
    studyPngAbsolute,
    outputBaseDir: join(directory, 'capture'),
  };
}

describe('milestone evidence integrity', () => {
  it('produces native .fig files, passes round-trip by sourceAnchor, verifies image bytes, and backs up all three source files', async () => {
    const options = await setup();
    const result = await buildMilestone1Package(options);

    // Status gates: milestone remains INCOMPLETE; GUI editor is unverified
    expect(result.validationReport.status).toBe('INCOMPLETE');
    expect(result.validationReport.editorVerified).toBe(false);

    // Native .fig round-trip (API-level, found by sourceAnchor not display name)
    expect(result.validationReport.nativeFigRoundtripVerified).toBe(true);

    // openPencilVersion reflects the pinned npm package (0.14.0), not null
    expect(result.manifest.tools.openPencilVersion).toBe('0.14.0');
    expect(result.validationReport.openPencilVersion).toBe('0.14.0');

    // Geometry comparison is NOT measured by fidelity-reporter.ts (null, not a pixel diff)
    expect(result.validationReport.fidelityChecks.geometryPreservedWithin1px).toBeNull();

    // design/ must contain native .fig files (not prototype JSON)
    const designFiles = await readdir(join(result.packageDir, 'design'));
    expect(designFiles).toContain('original.fig');
    expect(designFiles).toContain('working.fig');
    expect(designFiles).not.toContain('original.prototype.json');
    expect(designFiles).not.toContain('working.prototype.json');

    // source-backup/ must contain ALL THREE files
    const backupFiles = await readdir(join(result.packageDir, 'source-backup'));
    expect(backupFiles).toContain('App.vue');
    expect(backupFiles).toContain('style.css');
    expect(backupFiles).toContain('study.png');

    // Backup content must match what was written (not a placeholder)
    const backedUpVue = await readFile(join(result.packageDir, 'source-backup', 'App.vue'), 'utf-8');
    expect(backedUpVue).toBe('<template><h1>Original</h1></template>');
    const backedUpCss = await readFile(join(result.packageDir, 'source-backup', 'style.css'), 'utf-8');
    expect(backedUpCss).toBe('h1 { color: red; }');

    // Manifest file hashes must include all three backup files
    const manifestFiles = result.manifest.files as Record<string, string>;
    expect(manifestFiles['source-backup/App.vue']).toBeDefined();
    expect(manifestFiles['source-backup/style.css']).toBeDefined();
    // design/ contains design-preview.png (Scene HTML canvas preview, NOT OpenPencil-rendered)
    expect(designFiles).toContain('design-preview.png');
  }, 60_000);

  it('fails on missing source instead of inventing a backup', async () => {
    const options = await setup();
    await expect(
      buildMilestone1Package({
        ...options,
        sourceFileAbsolute: join(options.sourceFileAbsolute, 'missing.vue'),
      }),
    ).rejects.toThrow();
    // source-backup/ directory is created early but App.vue must NOT have been written
    // (because readFile on the missing source fails before any backup is written)
    const backupContents = await readdir(join(options.outputBaseDir, 'source-backup'));
    expect(backupContents).not.toContain('App.vue');
  });
});
