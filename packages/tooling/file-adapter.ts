/**
 * file-adapter.ts — Barrel re-export for writeback infrastructure adapters.
 *
 * Implementation is split into focused files under writeback/:
 *   writeback/text-adapter.ts   — saveTextWritebackToFile
 *   writeback/color-adapter.ts  — saveColorWritebackToFile
 *   writeback/layout-adapter.ts — saveLayoutWritebackToFile
 *
 * createSourceBackup lives here because it is an orthogonal backup concern
 * (not a writeback concern) and is small enough to stay in this file.
 *
 * Existing imports from '../tooling/file-adapter' continue to resolve unchanged.
 */
import { mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

// Re-export the split adapter functions and their types.
export {
  saveTextWritebackToFile,
  type SaveTextWritebackOptions,
  type SaveTextWritebackResult,
} from './writeback/text-adapter';

export {
  saveColorWritebackToFile,
  type SaveColorWritebackOptions,
  type SaveColorWritebackResult,
} from './writeback/color-adapter';

export {
  saveLayoutWritebackToFile,
  type SaveLayoutWritebackOptions,
  type SaveLayoutWritebackResult,
} from './writeback/layout-adapter';

// ---------------------------------------------------------------------------
// Source backup — orthogonal to writeback adapters; kept here for cohesion.
// ---------------------------------------------------------------------------

export type CreateSourceBackupOptions = {
  packageDir: string;
  sourceFiles: string[];
  assetPaths?: string[];
};

export type CreateSourceBackupResult = {
  backupDir: string;
  copiedFiles: string[];
};

/**
 * Infrastructure Backup Adapter:
 * Creates an immutable source-backup/ directory inside the capture package folder,
 * copying source files, styles, and local assets for complete traceability.
 */
export async function createSourceBackup(
  options: CreateSourceBackupOptions
): Promise<CreateSourceBackupResult> {
  const { packageDir, sourceFiles, assetPaths = [] } = options;
  const backupDir = resolve(packageDir, 'source-backup');
  await mkdir(backupDir, { recursive: true });

  const copiedFiles: string[] = [];
  const allFiles = [...sourceFiles, ...assetPaths];

  for (const relPath of allFiles) {
    const srcPath = resolve(relPath);
    const destPath = resolve(backupDir, relPath);
    await mkdir(dirname(destPath), { recursive: true });
    await copyFile(srcPath, destPath);
    copiedFiles.push(destPath);
  }

  return {
    backupDir,
    copiedFiles,
  };
}
