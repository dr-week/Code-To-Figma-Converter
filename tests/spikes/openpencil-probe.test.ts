import { describe, expect, it } from 'vitest';
import {
  runProbe,
  testDuplicateNames,
  extractAndValidateSourceMap,
  SOURCE_ANCHOR_NAMESPACE,
  SOURCE_ANCHOR_KEY,
} from './openpencil/probe';

describe('Task 1.2 — Stable Source Identity & Mapping Probe Across 2 Cycles', () => {
  it('reconstructs sourceAnchor -> current editor ID across two native .fig save/reopen cycles', async () => {
    const result = await runProbe();

    expect(result.sourceAnchorsResolvedCycle1).toBe(true);
    expect(result.sourceAnchorsResolvedCycle2).toBe(true);
    expect(result.namesRetainedBothCycles).toBe(true);
    expect(result.textRetainedBothCycles).toBe(true);
    expect(result.hierarchyRetainedBothCycles).toBe(true);
    expect(result.imageBytesRetainedBothCycles).toBe(true);
    expect(result.archiveImages).toBe(1);

    expect(result.fileHashes.cycle1Sha256).toBeDefined();
    expect(result.fileHashes.cycle2Sha256).toBeDefined();
    expect(typeof result.fileHashes.cycle1Sha256).toBe('string');
    expect(typeof result.fileHashes.cycle2Sha256).toBe('string');

    expect(result.cycle1Ids.frame).toBeDefined();
    expect(result.cycle1Ids.text).toBeDefined();
    expect(result.cycle1Ids.image).toBeDefined();

    expect(result.cycle2Ids.frame).toBeDefined();
    expect(result.cycle2Ids.text).toBeDefined();
    expect(result.cycle2Ids.image).toBeDefined();
  }, 180_000);

  it('correctly maps nodes with duplicate display names using distinct sourceAnchors', async () => {
    const result = await testDuplicateNames();

    expect(result.success).toBe(true);
    expect(result.headerId).toBeDefined();
    expect(result.footerId).toBeDefined();
    expect(result.headerId).not.toBe(result.footerId);
    expect(result.headerText).toBe('First Text Content');
    expect(result.footerText).toBe('Second Text Content');
  });

  describe('Negative Validator Test Cases', () => {
    it('fails when an expected sourceAnchor is missing', () => {
      const nodes = [
        {
          id: '0:1',
          name: 'Card',
          pluginData: [
            { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:card' },
          ],
        },
      ];

      expect(() =>
        extractAndValidateSourceMap(nodes, ['App.vue:card', 'App.vue:missing-title'])
      ).toThrowError(/Missing expected sourceAnchor "App.vue:missing-title"/);
    });

    it('fails when a sourceAnchor value is empty', () => {
      const nodes = [
        {
          id: '0:1',
          name: 'Card',
          pluginData: [
            { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: '   ' },
          ],
        },
      ];

      expect(() => extractAndValidateSourceMap(nodes, [])).toThrowError(
        /Empty sourceAnchor on layer "Card"/
      );
    });

    it('fails when duplicate sourceAnchors exist across different layers', () => {
      const nodes = [
        {
          id: '0:1',
          name: 'First Card',
          pluginData: [
            { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:card' },
          ],
        },
        {
          id: '0:2',
          name: 'Second Card',
          pluginData: [
            { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:card' },
          ],
        },
      ];

      expect(() => extractAndValidateSourceMap(nodes, ['App.vue:card'])).toThrowError(
        /Duplicate sourceAnchor "App.vue:card" across layers/
      );
    });

    it('fails when duplicate sourceAnchor entries exist on a single layer', () => {
      const nodes = [
        {
          id: '0:1',
          name: 'Card',
          pluginData: [
            { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:card-1' },
            { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:card-2' },
          ],
        },
      ];

      expect(() => extractAndValidateSourceMap(nodes, [])).toThrowError(
        /Duplicate sourceAnchor entries on single layer "Card"/
      );
    });

    it('fails when conflicting sourceAnchors map to the same node ID', () => {
      // Create node array where node IDs are duplicate with distinct anchors
      const nodes = [
        {
          id: '0:1',
          name: 'Layer A',
          pluginData: [
            { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:anchor-1' },
          ],
        },
        {
          id: '0:1',
          name: 'Layer B',
          pluginData: [
            { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:anchor-2' },
          ],
        },
      ];

      expect(() =>
        extractAndValidateSourceMap(nodes, ['App.vue:anchor-1', 'App.vue:anchor-2'])
      ).toThrowError(/Conflicting sourceAnchor mapping on node ID "0:1"/);
    });

    it('ignores unrelated plugin namespaces and does not fulfill expected anchors', () => {
      const nodes = [
        {
          id: '0:1',
          name: 'Card',
          pluginData: [
            { pluginId: 'unrelated-plugin', key: 'sourceAnchor', value: 'App.vue:card' },
          ],
        },
      ];

      expect(() => extractAndValidateSourceMap(nodes, ['App.vue:card'])).toThrowError(
        /Missing expected sourceAnchor "App.vue:card"/
      );
    });
  });
});
