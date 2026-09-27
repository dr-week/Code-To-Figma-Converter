/**
 * Infrastructure File Saver — Layout Writeback
 *
 * Connects pure domain logic (`applyLayoutWritebackContent` from core) to the
 * Node.js filesystem. Reads the target Vue SFC, delegates transformation to
 * the domain layer, then writes a timestamped backup and the updated file.
 *
 * This file is responsible for exactly one thing: persisting padding/gap changes.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import {
  applyLayoutWritebackContent,
  type LayoutWritebackParams,
  type LayoutProps,
  type SourceMappingEntry,
} from '../../core/src/index';

export type SaveLayoutWritebackOptions = {
  filePath: string;
  mappingEntry: SourceMappingEntry;
  layoutProps: LayoutProps;
  expectedSourceHash?: string;
  backupDir?: string;
  dryRun?: boolean;
  forceOverride?: boolean;
};

export type SaveLayoutWritebackResult = {
  success: boolean;
  filePath: string;
  backupPath?: string | undefined;
  previousLayout?: string | undefined;
  updatedLayout?: string | undefined;
  diff?: string | undefined;
  error?: string | undefined;
};

function computeSha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Infrastructure Saver Integration for Layout & Spacing Writeback:
 * Connects pure domain layout writeback logic (`applyLayoutWritebackContent`) to Node.js filesystem.
 * Generates pre-edit rollback backup copy before writing to disk.
 */
export async function saveLayoutWritebackToFile(
  options: SaveLayoutWritebackOptions
): Promise<SaveLayoutWritebackResult> {
  const { filePath, mappingEntry, layoutProps, expectedSourceHash, backupDir, dryRun = false, forceOverride = false } = options;

  const absoluteFilePath = resolve(filePath);

  let fileContent: string;
  try {
    fileContent = await readFile(absoluteFilePath, 'utf-8');
  } catch (err) {
    return {
      success: false,
      filePath: absoluteFilePath,
      error: `Failed to read source file '${absoluteFilePath}': ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const layoutParams: LayoutWritebackParams = {
    fileContent,
    mappingEntry,
    layoutProps,
    ...(expectedSourceHash && !forceOverride ? { expectedSourceHash } : {}),
    computeHash: computeSha256,
  };

  const domainResult = applyLayoutWritebackContent(layoutParams);

  if (!domainResult.success || !domainResult.updatedContent) {
    return {
      success: false,
      filePath: absoluteFilePath,
      error: domainResult.error ?? 'Layout writeback validation failed',
    };
  }

  if (dryRun) {
    return {
      success: true,
      filePath: absoluteFilePath,
      ...(domainResult.previousLayout ? { previousLayout: domainResult.previousLayout } : {}),
      ...(domainResult.updatedLayout ? { updatedLayout: domainResult.updatedLayout } : {}),
      ...(domainResult.diff ? { diff: domainResult.diff } : {}),
    };
  }

  const timestamp = Date.now();
  const fileBaseName = basename(absoluteFilePath);
  const targetBackupDir = resolve(backupDir ?? resolve(dirname(absoluteFilePath), '.backup'));

  await mkdir(targetBackupDir, { recursive: true });

  const backupPath = resolve(targetBackupDir, `${fileBaseName}.${timestamp}.bak`);

  await writeFile(backupPath, fileContent, 'utf-8');
  await writeFile(absoluteFilePath, domainResult.updatedContent, 'utf-8');

  return {
    success: true,
    filePath: absoluteFilePath,
    backupPath,
    ...(domainResult.previousLayout ? { previousLayout: domainResult.previousLayout } : {}),
    ...(domainResult.updatedLayout ? { updatedLayout: domainResult.updatedLayout } : {}),
    ...(domainResult.diff ? { diff: domainResult.diff } : {}),
  };
}
