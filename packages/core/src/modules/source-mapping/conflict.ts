export type SourceStalenessCheckOptions = {
  fileContent: string;
  expectedSourceHash: string;
  computeHash: (content: string) => string;
};

export type SourceStalenessResult = {
  isStale: boolean;
  currentHash: string;
  expectedHash: string;
  conflictType: 'STALE_SOURCE_CONFLICT' | 'CLEAN';
  message?: string;
};

/**
 * Pure Domain Staleness & Conflict Detection Engine:
 * Validates whether a source file's current SHA-256 hash matches the expected hash
 * recorded during initial capture. Prevents overwriting external modifications.
 */
export function checkSourceStaleness(options: SourceStalenessCheckOptions): SourceStalenessResult {
  const { fileContent, expectedSourceHash, computeHash } = options;

  const currentHash = computeHash(fileContent);
  const isStale = currentHash !== expectedSourceHash;

  if (isStale) {
    return {
      isStale: true,
      currentHash,
      expectedHash: expectedSourceHash,
      conflictType: 'STALE_SOURCE_CONFLICT',
      message: `Source file hash mismatch (STALE_SOURCE_CONFLICT). Expected ${expectedSourceHash}, found ${currentHash}. File was modified after initial capture.`,
    };
  }

  return {
    isStale: false,
    currentHash,
    expectedHash: expectedSourceHash,
    conflictType: 'CLEAN',
  };
}

