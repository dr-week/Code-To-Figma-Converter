/**
 * Infrastructure File Saver — Color Writeback
 *
 * Connects pure domain logic (`applyColorWritebackContent` from core) to the
 * Node.js filesystem. Reads the target Vue SFC, delegates transformation to
 * the domain layer, then writes a timestamped backup and the updated file.
 *
 * This file is responsible for exactly one thing: persisting a fill-color change.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import type { Color } from '@code-to-figma/contracts';
import {
  applyColorWritebackContent,
  type ColorWritebackParams,
  type SourceMappingEntry,
} from '../../core/src/index';

export type SaveColorWritebackOptions = {
  filePath: string;
  mappingEntry: SourceMappingEntry;
  newFillColor: Color;
  targetProperty?: 'background-color' | 'color' | 'background';
  expectedSourceHash?: string;
  backupDir?: string;
  dryRun?: boolean;
  forceOverride?: boolean;
};

export type SaveColorWritebackResult = {
  success: boolean;
  filePath: string;
  backupPath?: string;
  previousColor?: string;
  updatedColor?: string;
  diff?: string;
  error?: string;
};

function computeSha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Infrastructure Saver Integration for Solid Fill Color Writeback:
 * Connects pure domain color writeback logic (`applyColorWritebackContent`) to Node.js filesystem.
 * Generates pre-edit rollback backup copy before writing to disk.
 */
export async function saveColorWritebackToFile(
  options: SaveColorWritebackOptions
): Promise<SaveColorWritebackResult> {
  const { filePath, mappingEntry, newFillColor, targetProperty, expectedSourceHash, backupDir, dryRun = false, forceOverride = false } = options;

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

  const colorParams: ColorWritebackParams = {
    fileContent,
    mappingEntry,
    newFillColor,
    ...(targetProperty ? { targetProperty } : {}),
    ...(expectedSourceHash && !forceOverride ? { expectedSourceHash } : {}),
    computeHash: computeSha256,
  };

  const domainResult = applyColorWritebackContent(colorParams);

  if (!domainResult.success || !domainResult.updatedContent) {
    return {
      success: false,
      filePath: absoluteFilePath,
      error: domainResult.error ?? 'Color writeback validation failed',
    };
  }

  if (dryRun) {
    return {
      success: true,
      filePath: absoluteFilePath,
      ...(domainResult.previousColor ? { previousColor: domainResult.previousColor } : {}),
      ...(domainResult.updatedColor ? { updatedColor: domainResult.updatedColor } : {}),
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
    ...(domainResult.previousColor ? { previousColor: domainResult.previousColor } : {}),
    ...(domainResult.updatedColor ? { updatedColor: domainResult.updatedColor } : {}),
    ...(domainResult.diff ? { diff: domainResult.diff } : {}),
  };
}
