import { checkSourceStaleness, type SourceStalenessResult } from './conflict';
import type { SourceMappingEntry } from './index';

export type ConflictMergeOptions = {
  fileContent: string;
  expectedSourceHash: string;
  computeHash: (content: string) => string;
  mappingEntry: SourceMappingEntry;
  forceOverride?: boolean;
};

export type ConflictMergeResult = {
  canApply: boolean;
  resolutionStatus: 'CLEAN' | 'FORCE_OVERRIDDEN' | 'SAFE_MERGE' | 'UNRESOLVED_LINE_CONFLICT';
  staleness: SourceStalenessResult;
  message?: string;
};

/**
 * Pure-domain conflict resolution: checks whether a writeback is safe to apply
 * when the source file has changed since the last capture.
 *
 * Resolution strategy:
 * - CLEAN: source hash unchanged since capture — writeback is safe.
 * - FORCE_OVERRIDDEN: caller explicitly bypasses stale-source protection.
 * - SAFE_MERGE: source changed BUT the target element's ID attribute is still
 *   present in the file. This does NOT establish that the specific property
 *   being overwritten was not independently edited. If both the design and
 *   the source changed the same property to different values, applying the
 *   writeback will silently overwrite the developer's change.
 * - UNRESOLVED_LINE_CONFLICT: target element is missing from the stale file;
 *   the writeback is rejected.
 *
 * Known limitation: SAFE_MERGE requires property-level comparison to be safe.
 * Until that is implemented, callers should treat SAFE_MERGE as a best-effort
 * heuristic that reduces the risk of collision but does not eliminate it.
 */
export function resolveSourceConflict(options: ConflictMergeOptions): ConflictMergeResult {
  const { fileContent, expectedSourceHash, computeHash, mappingEntry, forceOverride = false } = options;

  const staleness = checkSourceStaleness({
    fileContent,
    expectedSourceHash,
    computeHash,
  });

  if (!staleness.isStale) {
    return {
      canApply: true,
      resolutionStatus: 'CLEAN',
      staleness,
    };
  }

  if (forceOverride) {
    return {
      canApply: true,
      resolutionStatus: 'FORCE_OVERRIDDEN',
      staleness,
      message: `Source file was modified after capture, but writeback proceeded via force override flag.`,
    };
  }

  // Inspect if target source ID element exists intact in modified source file
  const targetId = mappingEntry.domId ?? mappingEntry.layerId;
  const targetAttrPattern = new RegExp(`data-source-id=["']${targetId}["']|id=["']${targetId}["']`);
  const hasTargetElement = targetAttrPattern.test(fileContent);

  if (hasTargetElement) {
    return {
      canApply: true,
      resolutionStatus: 'SAFE_MERGE',
      staleness,
      // LIMITATION: element presence does not verify property value stability.
      // A developer may have independently changed the same property this writeback targets.
      // Treat this result as best-effort; property-level comparison is not implemented.
      message: `Source file hash changed. Target element '${targetId}' is present (SAFE_MERGE heuristic). Verify no conflicting property edits exist before applying.`,
    };
  }

  return {
    canApply: false,
    resolutionStatus: 'UNRESOLVED_LINE_CONFLICT',
    staleness,
    message: `Source file conflict cannot be auto-merged: Target element '${targetId}' was removed or modified in source file. Re-capture required.`,
  };
}
