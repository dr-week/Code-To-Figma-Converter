import { describe, it, expect } from 'vitest';
import { checkSourceStaleness } from '../conflict';

describe('Milestone 4 Task 4.1 — Source SHA-256 Staleness & Conflict Detection Engine', () => {
  function simpleHash(content: string): string {
    let hashVal = 0;
    for (let i = 0; i < content.length; i++) {
      hashVal = (hashVal << 5) - hashVal + content.charCodeAt(i);
      hashVal |= 0;
    }
    return `hash-${hashVal}`;
  }

  it('detects a clean match when source file content hash equals expected capture hash', () => {
    const content = '<template><div>Clean Vue File</div></template>';
    const expectedHash = simpleHash(content);

    const result = checkSourceStaleness({
      fileContent: content,
      expectedSourceHash: expectedHash,
      computeHash: simpleHash,
    });

    expect(result.isStale).toBe(false);
    expect(result.conflictType).toBe('CLEAN');
    expect(result.currentHash).toBe(expectedHash);
    expect(result.message).toBeUndefined();
  });

  it('detects STALE_SOURCE_CONFLICT when source file has been modified externally', () => {
    const originalContent = '<template><div>Original Vue File</div></template>';
    const expectedHash = simpleHash(originalContent);

    const modifiedContent = '<template><div>Modified Vue File by Developer</div></template>';

    const result = checkSourceStaleness({
      fileContent: modifiedContent,
      expectedSourceHash: expectedHash,
      computeHash: simpleHash,
    });

    expect(result.isStale).toBe(true);
    expect(result.conflictType).toBe('STALE_SOURCE_CONFLICT');
    expect(result.currentHash).toBe(simpleHash(modifiedContent));
    expect(result.expectedHash).toBe(expectedHash);
    expect(result.message).toContain('STALE_SOURCE_CONFLICT');
  });

  it('supports custom hashing function injection', () => {
    const customHash = (content: string) => `custom-${content.length}`;

    const result = checkSourceStaleness({
      fileContent: '12345',
      expectedSourceHash: 'custom-5',
      computeHash: customHash,
    });

    expect(result.isStale).toBe(false);
    expect(result.conflictType).toBe('CLEAN');
  });
});
