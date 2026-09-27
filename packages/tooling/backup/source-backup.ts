/**
 * Source Backup — Asset copy and hash utilities
 *
 * Creates an immutable snapshot of all source assets (Vue SFC, styles, images)
 * into a capture package's source-backup/ directory.
 *
 * This module is responsible for exactly one thing: persisting source file
 * copies with their SHA-256 hashes so the capture is self-contained and
 * traceable.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

/** Compute a SHA-256 hex digest over any binary or string input. */
export function sha256Hex(data: string | Uint8Array | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

export type BackupSourceOptions = {
  baseDir: string;
  sourceBackupDir: string;
  sourceFileAbsolute: string;
  sourceFileRelative: string;
  styleCssAbsolute?: string | undefined;
  studyPngAbsolute?: string | undefined;
};

export type BackupSourceResult = {
  /** Map from relative capture-package path to SHA-256 hex. */
  fileHashes: Record<string, string>;
  appVueSource: string;
};

/**
 * Copies App.vue (and optional style.css / study.png) into source-backup/,
 * computing a SHA-256 hash for each file for manifest inclusion.
 */
export async function backupSourceFiles(options: BackupSourceOptions): Promise<BackupSourceResult> {
  const { sourceBackupDir, sourceFileAbsolute, styleCssAbsolute, studyPngAbsolute } = options;

  await mkdir(sourceBackupDir, { recursive: true });

  const fileHashes: Record<string, string> = {};

  // Primary entrypoint — always required.
  const appVueSource = await readFile(sourceFileAbsolute, 'utf-8');
  await writeFile(resolve(sourceBackupDir, 'App.vue'), appVueSource, 'utf-8');
  fileHashes['source-backup/App.vue'] = sha256Hex(appVueSource);

  // Optional: scoped stylesheet.
  if (styleCssAbsolute) {
    const styleCssSource = await readFile(styleCssAbsolute);
    await writeFile(resolve(sourceBackupDir, 'style.css'), styleCssSource);
    fileHashes['source-backup/style.css'] = sha256Hex(styleCssSource);
  }

  // Optional: local image asset.
  if (studyPngAbsolute) {
    const studyPngSource = await readFile(studyPngAbsolute);
    await writeFile(resolve(sourceBackupDir, 'study.png'), studyPngSource);
    fileHashes['source-backup/study.png'] = sha256Hex(studyPngSource);
  }

  return { fileHashes, appVueSource };
}
