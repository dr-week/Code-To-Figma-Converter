import { describe, expect, it } from 'vitest';
import { parseScene } from './index';
import { sampleScene } from './test-fixture';

describe('scene contract', () => {
  it('preserves names and text without normalization', () => expect(parseScene(sampleScene())).toEqual(sampleScene()));
  it('rejects duplicate IDs', () => { const scene = sampleScene(); scene.nodes[1]!.id = 'root'; expect(() => parseScene(scene)).toThrow('Duplicate'); });
  it('rejects missing and cyclic parents', () => { const scene = sampleScene(); scene.nodes[1]!.parentId = 'title'; expect(() => parseScene(scene)).toThrow('Parent'); });
  it('rejects non-finite geometry', () => { const scene = sampleScene(); scene.nodes[0]!.width = Infinity; expect(() => parseScene(scene)).toThrow(); });
  it('rejects unsupported versions', () => expect(() => parseScene({ ...sampleScene(), schemaVersion: '9.0' })).toThrow());
  it('rejects a second root', () => { const scene = sampleScene(); scene.nodes[1]!.parentId = null; expect(() => parseScene(scene)).toThrow('Parent'); });
});

