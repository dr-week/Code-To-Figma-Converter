/**
 * writeback-orchestrator.ts — Writeback Executor
 *
 * Loads the original and working .fig documents from a capture package,
 * delegates diff computation to `writeback/diff-engine.ts` (pure, I/O-free),
 * then applies each diff to the source files via the per-type adapters in
 * `writeback/`.
 *
 * This file is responsible for exactly one thing: executing writebacks and
 * writing the writeback-manifest.json result file.
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Color } from '@code-to-figma/contracts';
import {
  deserializeOpenPencil,
  type SourceMap,
} from '../core/src/index';
import {
  saveTextWritebackToFile,
  saveColorWritebackToFile,
  saveLayoutWritebackToFile,
  type SaveTextWritebackResult,
  type SaveColorWritebackResult,
  type SaveLayoutWritebackResult,
} from './file-adapter';
import { parseOpenPencilFig } from './openpencil-io';
import {
  computeDiffs,
  flattenNodes,
  mapOpenPencilNode,
  extractSourceAnchor,
  type UnifiedNode,
} from './writeback/diff-engine';

export type WritebackItemResult = {
  layerId: string;
  type: 'text' | 'color' | 'layout';
  success: boolean;
  targetFile: string;
  backupPath?: string | undefined;
  previousText?: string | undefined;
  updatedText?: string | undefined;
  previousColor?: string | undefined;
  updatedColor?: string | undefined;
  previousLayout?: string | undefined;
  updatedLayout?: string | undefined;
  diff?: string | undefined;
  error?: string | undefined;
};

export type WritebackManifest = {
  timestamp: string;
  captureId: string;
  status: 'PASSED' | 'FAILED' | 'NO_CHANGES';
  packageDir: string;
  diffSummary: {
    totalNodesCompared: number;
    modifiedNodesCount: number;
    textEditsCount: number;
    colorEditsCount: number;
    layoutEditsCount: number;
  };
  writebacks: WritebackItemResult[];
};

export type ExecutePackageWritebackOptions = {
  packageDir: string;
  backupDir?: string;
  dryRun?: boolean;
  forceOverride?: boolean;
};

// ---------------------------------------------------------------------------
// Document loading — normalises .fig and legacy .openpencil formats
// ---------------------------------------------------------------------------

async function loadDocumentNodes(packageDir: string): Promise<{
  originalNodes: UnifiedNode[];
  workingNodes: UnifiedNode[];
}> {
  const originalFigPath = resolve(packageDir, 'design/original.fig');
  const workingFigPath = resolve(packageDir, 'design/working.fig');

  let originalFigExists = false;
  try {
    await access(originalFigPath);
    originalFigExists = true;
  } catch {
    // File not found; fallback to .openpencil
  }

  if (originalFigExists) {
    const [originalBytes, workingBytes] = await Promise.all([
      readFile(originalFigPath),
      readFile(workingFigPath),
    ]);
    const originalGraph = await parseOpenPencilFig(new Uint8Array(originalBytes).buffer);
    const workingGraph = await parseOpenPencilFig(new Uint8Array(workingBytes).buffer);

    const parseGraph = (graph: typeof originalGraph): UnifiedNode[] => {
      const result: UnifiedNode[] = [];
      const nodes = Array.from(graph.nodes.values()) as unknown as {
        id: string;
        name?: string;
        type?: string;
        text?: string;
        characters?: string;
        fills?: { type: string; color: Color; opacity: number; visible: boolean }[];
        padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
        gap?: number;
        itemSpacing?: number;
        pluginData?: { pluginId: string; key: string; value: string }[];
      }[];

      for (const node of nodes) {
        result.push({
          id: node.id,
          name: node.name ?? '',
          type: node.type ?? 'FRAME',
          characters: node.text ?? node.characters,
          fills: node.fills,
          padding: node.padding,
          gap: node.gap ?? node.itemSpacing,
          sourceAnchor: extractSourceAnchor(node.pluginData),
        });
      }
      return result;
    };

    return {
      originalNodes: parseGraph(originalGraph),
      workingNodes: parseGraph(workingGraph),
    };
  }

  // Fallback to legacy .openpencil JSON files
  const originalOpenPencilPath = resolve(packageDir, 'design/original.openpencil');
  const workingOpenPencilPath = resolve(packageDir, 'design/working.openpencil');
  const [originalRaw, workingRaw] = await Promise.all([
    readFile(originalOpenPencilPath, 'utf-8'),
    readFile(workingOpenPencilPath, 'utf-8'),
  ]);
  const originalDoc = deserializeOpenPencil(originalRaw);
  const workingDoc = deserializeOpenPencil(workingRaw);

  return {
    originalNodes: flattenNodes(originalDoc.nodes).map(mapOpenPencilNode),
    workingNodes: flattenNodes(workingDoc.nodes).map(mapOpenPencilNode),
  };
}

// ---------------------------------------------------------------------------
// Main executor
// ---------------------------------------------------------------------------

export async function executePackageWriteback(
  options: ExecutePackageWritebackOptions
): Promise<WritebackManifest> {
  const packageDir = resolve(options.packageDir);

  const manifestPath = resolve(packageDir, 'manifest.json');
  const sourceMapPath = resolve(packageDir, 'source-map.json');

  const [manifestRaw, sourceMapRaw] = await Promise.all([
    readFile(manifestPath, 'utf-8'),
    readFile(sourceMapPath, 'utf-8'),
  ]);

  const manifestData = JSON.parse(manifestRaw) as { captureId?: string };
  const captureId = manifestData.captureId ?? 'unknown-capture';
  const sourceMap = JSON.parse(sourceMapRaw) as SourceMap;

  const { originalNodes, workingNodes } = await loadDocumentNodes(packageDir);

  // Delegate diff computation to the pure engine.
  const { textDiffs, colorDiffs, layoutDiffs } = computeDiffs(originalNodes, workingNodes, sourceMap);

  const writebackResults: WritebackItemResult[] = [];

  // Apply text diffs
  for (const { workingNode, mapping } of textDiffs) {
    if (!mapping) {
      writebackResults.push({ layerId: workingNode.id, type: 'text', success: false, targetFile: '', error: `No source mapping entry found for layer '${workingNode.id}'` });
    } else if (!mapping.supportsWriteback) {
      writebackResults.push({ layerId: workingNode.id, type: 'text', success: false, targetFile: mapping.sourceFile, error: `Source mapping entry for layer '${workingNode.id}' has supportsWriteback: false` });
    } else {
      const res: SaveTextWritebackResult = await saveTextWritebackToFile({
        filePath: resolve(mapping.sourceFile),
        mappingEntry: mapping,
        newText: workingNode.characters!,
        ...(options.backupDir ? { backupDir: options.backupDir } : {}),
        ...(options.dryRun !== undefined ? { dryRun: options.dryRun } : {}),
        ...(options.forceOverride !== undefined ? { forceOverride: options.forceOverride } : {}),
      });
      writebackResults.push({ layerId: workingNode.id, type: 'text', success: res.success, targetFile: res.filePath, ...(res.backupPath ? { backupPath: res.backupPath } : {}), ...(res.previousText ? { previousText: res.previousText } : {}), ...(res.updatedText ? { updatedText: res.updatedText } : {}), ...(res.diff ? { diff: res.diff } : {}), ...(res.error ? { error: res.error } : {}) });
    }
  }

  // Apply color diffs
  for (const { workingNode, workingFill, mapping } of colorDiffs) {
    if (!mapping) {
      writebackResults.push({ layerId: workingNode.id, type: 'color', success: false, targetFile: '', error: `No source mapping entry found for layer '${workingNode.id}'` });
    } else if (!mapping.supportsWriteback) {
      writebackResults.push({ layerId: workingNode.id, type: 'color', success: false, targetFile: mapping.sourceFile, error: `Source mapping entry for layer '${workingNode.id}' has supportsWriteback: false` });
    } else {
      const res: SaveColorWritebackResult = await saveColorWritebackToFile({
        filePath: resolve(mapping.sourceFile),
        mappingEntry: mapping,
        newFillColor: workingFill,
        ...(options.backupDir ? { backupDir: options.backupDir } : {}),
        ...(options.dryRun !== undefined ? { dryRun: options.dryRun } : {}),
        ...(options.forceOverride !== undefined ? { forceOverride: options.forceOverride } : {}),
      });
      writebackResults.push({ layerId: workingNode.id, type: 'color', success: res.success, targetFile: res.filePath, ...(res.backupPath ? { backupPath: res.backupPath } : {}), ...(res.previousColor ? { previousColor: res.previousColor } : {}), ...(res.updatedColor ? { updatedColor: res.updatedColor } : {}), ...(res.diff ? { diff: res.diff } : {}), ...(res.error ? { error: res.error } : {}) });
    }
  }

  // Apply layout diffs
  for (const { workingNode, hasPaddingDiff, hasGapDiff, mapping } of layoutDiffs) {
    if (!mapping) {
      writebackResults.push({ layerId: workingNode.id, type: 'layout', success: false, targetFile: '', error: `No source mapping entry found for layer '${workingNode.id}'` });
    } else if (!mapping.supportsWriteback) {
      writebackResults.push({ layerId: workingNode.id, type: 'layout', success: false, targetFile: mapping.sourceFile, error: `Source mapping entry for layer '${workingNode.id}' has supportsWriteback: false` });
    } else {
      const res: SaveLayoutWritebackResult = await saveLayoutWritebackToFile({
        filePath: resolve(mapping.sourceFile),
        mappingEntry: mapping,
        layoutProps: Object.assign(
          {} as import('../core/src/modules/source-mapping/layout-writeback').LayoutProps,
          hasPaddingDiff && workingNode.padding !== undefined ? { padding: workingNode.padding as import('../core/src/modules/source-mapping/layout-writeback').LayoutPadding } : null,
          hasGapDiff && workingNode.gap !== undefined ? { gap: workingNode.gap } : null,
        ),
        ...(options.backupDir ? { backupDir: options.backupDir } : {}),
        ...(options.dryRun !== undefined ? { dryRun: options.dryRun } : {}),
        ...(options.forceOverride !== undefined ? { forceOverride: options.forceOverride } : {}),
      });
      writebackResults.push({ layerId: workingNode.id, type: 'layout', success: res.success, targetFile: res.filePath, ...(res.backupPath ? { backupPath: res.backupPath } : {}), ...(res.previousLayout ? { previousLayout: res.previousLayout } : {}), ...(res.updatedLayout ? { updatedLayout: res.updatedLayout } : {}), ...(res.diff ? { diff: res.diff } : {}), ...(res.error ? { error: res.error } : {}) });
    }
  }

  const modifiedNodesCount = new Set([
    ...textDiffs.map(d => d.workingNode.id),
    ...colorDiffs.map(d => d.workingNode.id),
    ...layoutDiffs.map(d => d.workingNode.id),
  ]).size;

  const hasErrors = writebackResults.some(r => !r.success);
  const status: 'PASSED' | 'FAILED' | 'NO_CHANGES' =
    modifiedNodesCount === 0 ? 'NO_CHANGES' : hasErrors ? 'FAILED' : 'PASSED';

  const writebackManifest: WritebackManifest = {
    timestamp: new Date().toISOString(),
    captureId,
    status,
    packageDir,
    diffSummary: {
      totalNodesCompared: workingNodes.length,
      modifiedNodesCount,
      textEditsCount: textDiffs.length,
      colorEditsCount: colorDiffs.length,
      layoutEditsCount: layoutDiffs.length,
    },
    writebacks: writebackResults,
  };

  await writeFile(
    resolve(packageDir, 'writeback-manifest.json'),
    JSON.stringify(writebackManifest, null, 2),
    'utf-8'
  );

  return writebackManifest;
}
