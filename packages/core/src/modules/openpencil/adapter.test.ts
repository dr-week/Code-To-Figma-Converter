import { describe, it, expect } from 'vitest';
import {
  convertSceneToOpenPencil,
  serializeOpenPencil,
  deserializeOpenPencil,
  editOpenPencilWorkingCopy,
} from './adapter';
import type { Scene } from '@code-to-figma/contracts';

describe('OpenPencil Adapter', () => {
  const sampleScene: Scene = {
    schemaVersion: '0.1',
    source: { projectId: 'test-app', route: '/', viewport: { width: 960, height: 900 } },
    nodes: [
      {
        id: 'source:canvas',
        parentId: null,
        name: 'Portfolio/Overview',
        nameOrigin: 'explicit',
        kind: 'frame',
        x: 0,
        y: 0,
        width: 960,
        height: 900,
        opacity: 1,
        fill: { r: 0.9, g: 0.9, b: 0.9, a: 1 },
        border: { r: 0, g: 0, b: 0, a: 0 },
        borderWidth: 0,
        radius: 0,
        clipsContent: true,
      },
      {
        id: 'text:source:title',
        parentId: 'source:canvas',
        name: 'Introduction/Title',
        nameOrigin: 'explicit',
        kind: 'text',
        x: 40,
        y: 40,
        width: 400,
        height: 50,
        opacity: 1,
        text: 'Every element has a name.',
        color: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
        fontFamily: 'Inter',
        fontStyle: 'Bold',
        fontSize: 23,
        lineHeight: 30,
        letterSpacing: 0,
        align: 'LEFT',
      },
      {
        id: 'image:source:hero',
        parentId: 'source:canvas',
        name: 'Project/Image',
        nameOrigin: 'explicit',
        kind: 'image',
        x: 40,
        y: 100,
        width: 288,
        height: 176,
        opacity: 1,
        assetId: 'asset_png_123',
        fit: 'FILL',
        fill: { r: 1, g: 1, b: 1, a: 1 },
        border: { r: 0, g: 0, b: 0, a: 0 },
        borderWidth: 0,
        radius: 0,
      },
    ],
    assets: [
      {
        id: 'asset_png_123',
        bytes: [137, 80, 78, 71, 13, 10, 26, 10], // Sample PNG header bytes
      },
    ],
    warnings: [],
  };



  it('converts Scene contract into valid prototype OpenPencil document structure', () => {
    const doc = convertSceneToOpenPencil(sampleScene);
    expect(doc.version).toBe('0.14.0');
    expect(doc.schema).toBe('openpencil-scenegraph');
    expect(doc.nodes.length).toBe(1); // Root canvas frame
    expect(doc.nodes[0]?.children?.length).toBe(2); // Title text node & image child
    expect(doc.nodes[0]?.children?.[0]?.characters).toBe('Every element has a name.');
  });

  it('serializes and deserializes cleanly (save and reopen verification)', () => {
    const doc = convertSceneToOpenPencil(sampleScene);
    const serialized = serializeOpenPencil(doc);
    const reopened = deserializeOpenPencil(serialized);

    expect(reopened.version).toBe(doc.version);
    expect(reopened.nodes[0]?.id).toBe(doc.nodes[0]?.id);
    expect(reopened.nodes[0]?.children?.[0]?.characters).toBe('Every element has a name.');
  });

  it('edits working document copy without altering original', () => {
    const originalDoc = convertSceneToOpenPencil(sampleScene);
    const workingCopy = editOpenPencilWorkingCopy(originalDoc, {
      targetId: 'text:source:title',
      newCharacters: 'Edited element text title.',
      newFillColor: { r: 1, g: 0, b: 0, a: 1 },
    });

    expect(originalDoc.nodes[0]?.children?.[0]?.characters).toBe('Every element has a name.');
    expect(workingCopy.nodes[0]?.children?.[0]?.characters).toBe('Edited element text title.');

    // Save and reopen working copy
    const savedWorking = serializeOpenPencil(workingCopy);
    const reopenedWorking = deserializeOpenPencil(savedWorking);
    expect(reopenedWorking.nodes[0]?.children?.[0]?.characters).toBe('Edited element text title.');
  });
});
