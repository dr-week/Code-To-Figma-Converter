import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { SceneGraph } from '@open-pencil/scene-graph';
import { exportFigFile, parseFigFile } from '@open-pencil/core/io/formats/fig';
import { parseFigBuffer } from '@open-pencil/fig';
import { initCodec } from '@open-pencil/kiwi/fig/codec';
import { parsePenFile } from '@open-pencil/pen';
import { htmlToSceneGraph } from '@open-pencil/dom-css';

export const SOURCE_ANCHOR_NAMESPACE = 'code-to-design';
export const SOURCE_ANCHOR_KEY = 'sourceAnchor';

export interface PluginDataEntry {
  pluginId: string;
  key: string;
  value: string;
}

export interface NodeWithPluginData {
  id: string;
  name: string;
  pluginData?: PluginDataEntry[];
}

export interface MappingValidationResult {
  anchorToNodeId: Map<string, string>;
  nodeIdToAnchor: Map<string, string>;
}

export function extractAndValidateSourceMap(
  nodes: Iterable<NodeWithPluginData>,
  expectedAnchors: string[]
): MappingValidationResult {
  const anchorToNodeId = new Map<string, string>();
  const nodeIdToAnchor = new Map<string, string>();

  for (const node of nodes) {
    if (!node.pluginData || !Array.isArray(node.pluginData)) continue;

    const layerAnchors: string[] = [];

    for (const entry of node.pluginData) {
      if (entry.pluginId === SOURCE_ANCHOR_NAMESPACE && entry.key === SOURCE_ANCHOR_KEY) {
        if (!entry.value || entry.value.trim() === '') {
          throw new Error(`Invalid source mapping: Empty sourceAnchor on layer "${node.name}" (${node.id})`);
        }
        layerAnchors.push(entry.value);
      }
    }

    if (layerAnchors.length > 1) {
      throw new Error(
        `Duplicate sourceAnchor entries on single layer "${node.name}" (${node.id}): [${layerAnchors.join(', ')}]`
      );
    }

    if (layerAnchors.length === 1) {
      const anchor = layerAnchors[0];
      if (!anchor) continue;

      const existingNodeId = anchorToNodeId.get(anchor);
      if (existingNodeId !== undefined) {
        throw new Error(
          `Duplicate sourceAnchor "${anchor}" across layers: node "${node.name}" (${node.id}) and node ID "${existingNodeId}"`
        );
      }

      const existingAnchor = nodeIdToAnchor.get(node.id);
      if (existingAnchor !== undefined && existingAnchor !== anchor) {
        throw new Error(
          `Conflicting sourceAnchor mapping on node ID "${node.id}": already mapped to "${existingAnchor}", cannot map to "${anchor}"`
        );
      }

      anchorToNodeId.set(anchor, node.id);
      nodeIdToAnchor.set(node.id, anchor);
    }
  }

  for (const expected of expectedAnchors) {
    if (!anchorToNodeId.has(expected)) {
      throw new Error(`Missing expected sourceAnchor "${expected}" in document nodes`);
    }
  }

  return { anchorToNodeId, nodeIdToAnchor };
}

export async function runProbe() {
  assert.equal(typeof parsePenFile, 'function');
  assert.equal(typeof htmlToSceneGraph, 'function');
  await initCodec();

  const graph = new SceneGraph();
  const page = graph.getPages()[0];
  assert.ok(page);

  const frameAnchorValue = 'App.vue:probe-card';
  const textAnchorValue = 'App.vue:probe-title';
  const imageAnchorValue = 'App.vue:probe-image';

  const expectedAnchors = [frameAnchorValue, textAnchorValue, imageAnchorValue];

  const frame = graph.createNode('FRAME', page.id, {
    name: 'Probe Card',
    width: 300,
    height: 200,
    pluginData: [
      {
        pluginId: SOURCE_ANCHOR_NAMESPACE,
        key: SOURCE_ANCHOR_KEY,
        value: frameAnchorValue,
      },
    ],
  });

  const text = graph.createNode('TEXT', frame.id, {
    name: 'Probe Title',
    text: 'Hello OpenPencil',
    x: 16,
    y: 16,
    width: 200,
    height: 30,
    fontFamily: 'Inter',
    fontSize: 16,
    pluginData: [
      {
        pluginId: SOURCE_ANCHOR_NAMESPACE,
        key: SOURCE_ANCHOR_KEY,
        value: textAnchorValue,
      },
    ],
  });

  const imageBytes = new Uint8Array(
    await readFile(resolve('tests/fixtures/vue/public/study.png'))
  );
  const imageHash = createHash('sha1').update(imageBytes).digest('hex');
  graph.images.set(imageHash, imageBytes);

  const picture = graph.createNode('RECTANGLE', frame.id, {
    name: 'Probe Image',
    x: 16,
    y: 60,
    width: 100,
    height: 100,
    fills: [
      {
        type: 'IMAGE',
        color: { r: 1, g: 1, b: 1, a: 1 },
        opacity: 1,
        visible: true,
        imageHash,
        imageScaleMode: 'FILL',
      },
    ],
    pluginData: [
      {
        pluginId: SOURCE_ANCHOR_NAMESPACE,
        key: SOURCE_ANCHOR_KEY,
        value: imageAnchorValue,
      },
    ],
  });

  const output = resolve('.artifacts/openpencil-spike');
  await mkdir(output, { recursive: true });

  // === CYCLE 1 ===
  const bytesCycle1 = await exportFigFile(graph);
  await writeFile(resolve(output, 'probe-cycle1.fig'), bytesCycle1);
  const diskBytes1 = new Uint8Array(await readFile(resolve(output, 'probe-cycle1.fig')));
  const reopened1 = await parseFigFile(diskBytes1.buffer as ArrayBuffer);
  const archive1 = parseFigBuffer(diskBytes1.buffer as ArrayBuffer);

  const cycle1Hash = createHash('sha256').update(diskBytes1).digest('hex');

  const map1 = extractAndValidateSourceMap(reopened1.nodes.values(), expectedAnchors);

  const c1FrameId = map1.anchorToNodeId.get(frameAnchorValue)!;
  const c1TextId = map1.anchorToNodeId.get(textAnchorValue)!;
  const c1ImageId = map1.anchorToNodeId.get(imageAnchorValue)!;

  const c1Frame = reopened1.nodes.get(c1FrameId)!;
  const c1Text = reopened1.nodes.get(c1TextId)!;
  const c1Image = reopened1.nodes.get(c1ImageId)!;

  assert.ok(c1Frame && c1Text && c1Image);
  assert.equal(c1Frame.name, frame.name);
  assert.equal(c1Text.name, text.name);
  assert.equal(c1Image.name, picture.name);
  assert.equal(c1Text.text, text.text);
  assert.equal(c1Text.parentId, c1Frame.id);
  assert.equal(c1Image.parentId, c1Frame.id);

  const c1RestoredHash = c1Image.fills.find((f) => f.type === 'IMAGE')?.imageHash;
  assert.ok(c1RestoredHash);
  assert.deepEqual(reopened1.images.get(c1RestoredHash), imageBytes);

  // === CYCLE 2 ===
  const bytesCycle2 = await exportFigFile(reopened1);
  await writeFile(resolve(output, 'probe-cycle2.fig'), bytesCycle2);
  const diskBytes2 = new Uint8Array(await readFile(resolve(output, 'probe-cycle2.fig')));
  const reopened2 = await parseFigFile(diskBytes2.buffer as ArrayBuffer);

  const cycle2Hash = createHash('sha256').update(diskBytes2).digest('hex');

  const map2 = extractAndValidateSourceMap(reopened2.nodes.values(), expectedAnchors);

  const c2FrameId = map2.anchorToNodeId.get(frameAnchorValue)!;
  const c2TextId = map2.anchorToNodeId.get(textAnchorValue)!;
  const c2ImageId = map2.anchorToNodeId.get(imageAnchorValue)!;

  const c2Frame = reopened2.nodes.get(c2FrameId)!;
  const c2Text = reopened2.nodes.get(c2TextId)!;
  const c2Image = reopened2.nodes.get(c2ImageId)!;

  assert.ok(c2Frame && c2Text && c2Image);
  assert.equal(c2Frame.name, frame.name);
  assert.equal(c2Text.name, text.name);
  assert.equal(c2Image.name, picture.name);
  assert.equal(c2Text.text, text.text);
  assert.equal(c2Text.parentId, c2Frame.id);
  assert.equal(c2Image.parentId, c2Frame.id);

  const c2RestoredHash = c2Image.fills.find((f) => f.type === 'IMAGE')?.imageHash;
  assert.ok(c2RestoredHash);
  assert.deepEqual(reopened2.images.get(c2RestoredHash), imageBytes);

  const result = {
    runtime: process.version,
    format: '.fig',
    cycle1Bytes: bytesCycle1.length,
    cycle2Bytes: bytesCycle2.length,
    fileHashes: {
      cycle1Sha256: cycle1Hash,
      cycle2Sha256: cycle2Hash,
    },
    archiveImages: archive1.images.length,
    expectedAnchors,
    originalIds: {
      frame: frame.id,
      text: text.id,
      image: picture.id,
    },
    cycle1Ids: {
      frame: c1FrameId,
      text: c1TextId,
      image: c1ImageId,
    },
    cycle2Ids: {
      frame: c2FrameId,
      text: c2TextId,
      image: c2ImageId,
    },
    sourceAnchorsResolvedCycle1: true,
    sourceAnchorsResolvedCycle2: true,
    namesRetainedBothCycles:
      c1Frame.name === frame.name &&
      c1Text.name === text.name &&
      c1Image.name === picture.name &&
      c2Frame.name === frame.name &&
      c2Text.name === text.name &&
      c2Image.name === picture.name,
    textRetainedBothCycles: c1Text.text === text.text && c2Text.text === text.text,
    hierarchyRetainedBothCycles:
      c1Text.parentId === c1Frame.id &&
      c1Image.parentId === c1Frame.id &&
      c2Text.parentId === c2Frame.id &&
      c2Image.parentId === c2Frame.id,
    imageBytesRetainedBothCycles:
      reopened1.images.get(c1RestoredHash!) !== undefined &&
      reopened2.images.get(c2RestoredHash!) !== undefined,
    editorVerified: false,
    visualFidelityVerified: false,
  };

  await writeFile(
    resolve(output, 'result-task-01-2.json'),
    JSON.stringify(result, (_key, value) => (value instanceof Map ? Object.fromEntries(value) : value), 2)
  );

  return result;
}

export async function testDuplicateNames() {
  await initCodec();
  const graph = new SceneGraph();
  const page = graph.getPages()[0];
  if (!page) throw new Error('No default page found in SceneGraph');

  const frame = graph.createNode('FRAME', page.id, {
    name: 'Card Container',
    width: 400,
    height: 300,
    pluginData: [
      { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:card' },
    ],
  });

  graph.createNode('TEXT', frame.id, {
    name: 'Same Name Text',
    text: 'First Text Content',
    x: 10,
    y: 10,
    pluginData: [
      { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:header-text' },
    ],
  });

  graph.createNode('TEXT', frame.id, {
    name: 'Same Name Text',
    text: 'Second Text Content',
    x: 10,
    y: 50,
    pluginData: [
      { pluginId: SOURCE_ANCHOR_NAMESPACE, key: SOURCE_ANCHOR_KEY, value: 'App.vue:footer-text' },
    ],
  });

  const bytes = await exportFigFile(graph);
  const reopened = await parseFigFile(bytes.buffer as ArrayBuffer);

  const expected = ['App.vue:card', 'App.vue:header-text', 'App.vue:footer-text'];
  const map = extractAndValidateSourceMap(reopened.nodes.values(), expected);

  const headerId = map.anchorToNodeId.get('App.vue:header-text')!;
  const footerId = map.anchorToNodeId.get('App.vue:footer-text')!;

  const headerNode = reopened.nodes.get(headerId)!;
  const footerNode = reopened.nodes.get(footerId)!;

  return {
    headerId,
    footerId,
    headerText: headerNode.text,
    footerText: footerNode.text,
    success: headerId !== footerId && headerNode.text === 'First Text Content' && footerNode.text === 'Second Text Content',
  };
}
