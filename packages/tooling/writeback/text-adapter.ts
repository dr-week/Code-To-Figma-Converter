/**
 * Infrastructure File Saver — Text Writeback
 *
 * Connects pure domain logic (`applyTextWritebackContent` from core) to the
 * Node.js filesystem. Reads the target Vue SFC, delegates transformation to
 * the domain layer, then writes a timestamped backup and the updated file.
 *
 * This file is responsible for exactly one thing: persisting a text change.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import {
  applyTextWritebackContent,
  type TextWritebackParams,
  type SourceMappingEntry,
} from '../../core/src/index';

export type SaveTextWritebackOptions = {
  filePath: string;
  mappingEntry: SourceMappingEntry;
  newText: string;
  expectedSourceHash?: string;
  backupDir?: string;
  dryRun?: boolean;
  forceOverride?: boolean;
};

export type SaveTextWritebackResult = {
  success: boolean;
  filePath: string;
  backupPath?: string;
  previousText?: string;
  updatedText?: string;
  diff?: string;
  error?: string;
};

function computeSha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Infrastructure File Saver Adapter:
 * Connects pure domain writeback logic (`applyTextWritebackContent`) to the Node.js filesystem.
 */
export async function saveTextWritebackToFile(
  options: SaveTextWritebackOptions
): Promise<SaveTextWritebackResult> {
  const { filePath, mappingEntry, newText, expectedSourceHash, backupDir, dryRun = false, forceOverride = false } = options;

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

  const writebackParams: TextWritebackParams = {
    fileContent,
    mappingEntry,
    newText,
    ...(expectedSourceHash && !forceOverride ? { expectedSourceHash } : {}),
    computeHash: computeSha256,
  };

  const domainResult = applyTextWritebackContent(writebackParams);

  if (!domainResult.success || !domainResult.updatedContent) {
    return {
      success: false,
      filePath: absoluteFilePath,
      error: domainResult.error ?? 'Text writeback validation failed',
    };
  }

  if (dryRun) {
    return {
      success: true,
      filePath: absoluteFilePath,
      ...(domainResult.previousText ? { previousText: domainResult.previousText } : {}),
      ...(domainResult.updatedText ? { updatedText: domainResult.updatedText } : {}),
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
    ...(domainResult.previousText ? { previousText: domainResult.previousText } : {}),
    ...(domainResult.updatedText ? { updatedText: domainResult.updatedText } : {}),
    ...(domainResult.diff ? { diff: domainResult.diff } : {}),
  };
}
