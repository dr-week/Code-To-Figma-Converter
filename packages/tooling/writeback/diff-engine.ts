/**
 * Writeback — Diff Engine
 *
 * Pure, I/O-free functions that compute which nodes changed between the
 * original and working OpenPencil documents.
 *
 * This module is responsible for exactly one thing: detecting diffs between
 * two flat lists of UnifiedNodes. It has no file system access, no imports
 * of adapters, and no knowledge of how changes will be applied.
 *
 * Keeping this logic pure makes it independently testable and reusable
 * across future writeback strategies.
 */
import type { Color } from '@code-to-figma/contracts';
import type { OpenPencilNode, SourceMap } from '../../core/src/index';
import { SOURCE_ANCHOR_KEY, SOURCE_ANCHOR_NAMESPACE } from '../../core/src/index';

// ---------------------------------------------------------------------------
// Internal unified node shape — normalises .fig and .openpencil representations
// ---------------------------------------------------------------------------

export interface UnifiedNode {
  id: string;
  name: string;
  type: string;
  characters?: string | undefined;
  fills?: { type: string; color: Color; opacity?: number; visible?: boolean }[] | undefined;
  padding?: (number | { top?: number; right?: number; bottom?: number; left?: number }) | undefined;
  gap?: number | undefined;
  sourceAnchor?: string | undefined;
}

/** Maps the public OpenPencilNode shape to the internal UnifiedNode shape. */
export function mapOpenPencilNode(node: OpenPencilNode): UnifiedNode {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    characters: node.characters,
    fills: node.fills,
    sourceAnchor: node.sourceAnchor,
  };
}

/** Flattens a tree of OpenPencilNodes into a single ordered array. */
export function flattenNodes(nodes: OpenPencilNode[]): OpenPencilNode[] {
  const result: OpenPencilNode[] = [];
  function traverse(list: OpenPencilNode[]) {
    for (const node of list) {
      result.push(node);
      if (node.children) traverse(node.children);
    }
  }
  traverse(nodes);
  return result;
}

/** Extracts the source anchor string from a parsed .fig node's pluginData array. */
export function extractSourceAnchor(
  pluginData?: { pluginId: string; key: string; value: string }[]
): string | undefined {
  if (!Array.isArray(pluginData)) return undefined;
  const entry = pluginData.find(
    p =>
      p.key === SOURCE_ANCHOR_KEY ||
      p.pluginId === SOURCE_ANCHOR_NAMESPACE ||
      p.key === 'sourceAnchor'
  );
  return entry?.value;
}

// ---------------------------------------------------------------------------
// Color equality — avoids floating-point false positives
// ---------------------------------------------------------------------------

export function isSameColor(c1?: Color, c2?: Color): boolean {
  if (!c1 && !c2) return true;
  if (!c1 || !c2) return false;
  return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
}

// ---------------------------------------------------------------------------
// Diff result types
// ---------------------------------------------------------------------------

export type TextDiff = {
  workingNode: UnifiedNode;
  mapping: import('../../core/src/index').SourceMappingEntry | undefined;
};

export type ColorDiff = {
  workingNode: UnifiedNode;
  workingFill: Color;
  mapping: import('../../core/src/index').SourceMappingEntry | undefined;
};

export type LayoutDiff = {
  workingNode: UnifiedNode;
  hasPaddingDiff: boolean;
  hasGapDiff: boolean;
  mapping: import('../../core/src/index').SourceMappingEntry | undefined;
};

export type NodeDiffs = {
  textDiffs: TextDiff[];
  colorDiffs: ColorDiff[];
  layoutDiffs: LayoutDiff[];
};

/** Find the SourceMappingEntry for a given working node (by id or sourceAnchor). */
function findMapping(
  workingNode: UnifiedNode,
  sourceMap: SourceMap,
): import('../../core/src/index').SourceMappingEntry | undefined {
  return sourceMap.mappings.find(
    m =>
      m.layerId === workingNode.id ||
      m.sourceAnchor === workingNode.id ||
      (workingNode.sourceAnchor &&
        (m.layerId === workingNode.sourceAnchor || m.sourceAnchor === workingNode.sourceAnchor))
  );
}

/**
 * Computes which nodes changed between the original and working node lists.
 * Returns three typed diff arrays — text, color, layout — ready for the executor.
 */
export function computeDiffs(
  originalNodes: UnifiedNode[],
  workingNodes: UnifiedNode[],
  sourceMap: SourceMap,
): NodeDiffs {
  const originalMap = new Map<string, UnifiedNode>();
  for (const node of originalNodes) {
    originalMap.set(node.id, node);
    if (node.sourceAnchor) {
      originalMap.set(node.sourceAnchor, node);
    }
  }

  const textDiffs: TextDiff[] = [];
  const colorDiffs: ColorDiff[] = [];
  const layoutDiffs: LayoutDiff[] = [];

  for (const workingNode of workingNodes) {
    const origNode = originalMap.get(workingNode.id) ??
      (workingNode.sourceAnchor ? originalMap.get(workingNode.sourceAnchor) : undefined);
    if (!origNode) continue;

    // Text diff
    if (
      workingNode.type === 'TEXT' &&
      workingNode.characters !== undefined &&
      origNode.characters !== undefined &&
      workingNode.characters !== origNode.characters
    ) {
      textDiffs.push({ workingNode, mapping: findMapping(workingNode, sourceMap) });
    }

    // Color diff
    const workingFill = workingNode.fills?.[0]?.color;
    const origFill = origNode.fills?.[0]?.color;
    if (workingFill && origFill && !isSameColor(workingFill, origFill)) {
      colorDiffs.push({ workingNode, workingFill, mapping: findMapping(workingNode, sourceMap) });
    }

    // Layout diff
    const hasPaddingDiff =
      workingNode.padding !== undefined &&
      JSON.stringify(workingNode.padding) !== JSON.stringify(origNode.padding);
    const hasGapDiff =
      workingNode.gap !== undefined && workingNode.gap !== origNode.gap;

    if (hasPaddingDiff || hasGapDiff) {
      layoutDiffs.push({ workingNode, hasPaddingDiff, hasGapDiff, mapping: findMapping(workingNode, sourceMap) });
    }
  }

  return { textDiffs, colorDiffs, layoutDiffs };
}
