import type { Scene, Color } from '@code-to-figma/contracts';

export const SOURCE_ANCHOR_NAMESPACE = 'code-to-design';
export const SOURCE_ANCHOR_KEY = 'sourceAnchor';

export type OpenPencilNode = {
  id: string;
  name: string;
  type: 'FRAME' | 'TEXT' | 'RECTANGLE' | 'IMAGE';
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  children?: OpenPencilNode[];
  fills?: { type: 'SOLID'; color: Color }[];
  strokes?: { type: 'SOLID'; color: Color }[];
  strokeWeight?: number;
  cornerRadius?: number;
  characters?: string;
  style?: {
    fontFamily: string;
    fontWeight: string;
    fontSize: number;
    lineHeight: number;
    textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    color: Color;
  };
  imageHash?: string;
  sourceAnchor?: string;
};

export type OpenPencilDocument = {
  version: '0.14.0';
  generator: 'code-to-design@0.1.0';
  schema: 'openpencil-scenegraph';
  title: string;
  nodes: OpenPencilNode[];
  assets: { hash: string; bytes: number[] }[];
  metadata: {
    capturedAt: string;
    viewport: { width: number; height: number };
    nodeCount: number;
  };
};

/**
 * Legacy prototype JSON converter functions retained for inactive Milestone 2 writeback
 * reference modules. These are NOT the active OpenPencil native I/O path.
 * Native .fig export/import lives in packages/tooling/openpencil-io.ts.
 */
export function convertSceneToOpenPencil(scene: Scene): OpenPencilDocument {
  const nodeMap = new Map<string, OpenPencilNode>();
  const rootNodes: OpenPencilNode[] = [];

  for (const sceneNode of scene.nodes) {
    let opNode: OpenPencilNode;

    if (sceneNode.kind === 'frame') {
      opNode = {
        id: sceneNode.id,
        name: sceneNode.name,
        type: 'FRAME',
        x: sceneNode.x,
        y: sceneNode.y,
        width: sceneNode.width,
        height: sceneNode.height,
        opacity: sceneNode.opacity,
        children: [],
        fills: sceneNode.fill.a > 0 ? [{ type: 'SOLID', color: sceneNode.fill }] : [],
        strokes: sceneNode.borderWidth > 0 ? [{ type: 'SOLID', color: sceneNode.border }] : [],
        strokeWeight: sceneNode.borderWidth,
        cornerRadius: sceneNode.radius,
        sourceAnchor: sceneNode.id,
      };
    } else if (sceneNode.kind === 'text') {
      opNode = {
        id: sceneNode.id,
        name: sceneNode.name,
        type: 'TEXT',
        x: sceneNode.x,
        y: sceneNode.y,
        width: sceneNode.width,
        height: sceneNode.height,
        opacity: sceneNode.opacity,
        characters: sceneNode.text,
        style: {
          fontFamily: sceneNode.fontFamily,
          fontWeight: sceneNode.fontStyle,
          fontSize: sceneNode.fontSize,
          lineHeight: sceneNode.lineHeight,
          textAlignHorizontal: sceneNode.align,
          color: sceneNode.color,
        },
        sourceAnchor: sceneNode.id,
      };
    } else {
      opNode = {
        id: sceneNode.id,
        name: sceneNode.name,
        type: 'IMAGE',
        x: sceneNode.x,
        y: sceneNode.y,
        width: sceneNode.width,
        height: sceneNode.height,
        opacity: sceneNode.opacity,
        imageHash: sceneNode.assetId,
        sourceAnchor: sceneNode.id,
      };
    }

    nodeMap.set(sceneNode.id, opNode);

    if (sceneNode.parentId === null) {
      rootNodes.push(opNode);
    } else {
      const parentOpNode = nodeMap.get(sceneNode.parentId);
      if (parentOpNode) {
        if (!parentOpNode.children) parentOpNode.children = [];
        parentOpNode.children.push(opNode);
      } else {
        rootNodes.push(opNode);
      }
    }
  }

  const assets = scene.assets.map(a => ({
    hash: a.id,
    bytes: a.bytes,
  }));

  return {
    version: '0.14.0',
    generator: 'code-to-design@0.1.0',
    schema: 'openpencil-scenegraph',
    title: scene.nodes[0]?.name ?? 'OpenPencil Capture',
    nodes: rootNodes,
    assets,
    metadata: {
      capturedAt: new Date().toISOString(),
      viewport: scene.source.viewport,
      nodeCount: scene.nodes.length,
    },
  };
}

export function serializeOpenPencil(document: OpenPencilDocument): string {
  return JSON.stringify(document, null, 2);
}

export function deserializeOpenPencil(jsonString: string): OpenPencilDocument {
  const doc = JSON.parse(jsonString) as OpenPencilDocument;
  if (doc.schema !== 'openpencil-scenegraph' || !Array.isArray(doc.nodes)) {
    throw new Error('Invalid OpenPencil document structure');
  }
  return doc;
}

export function editOpenPencilWorkingCopy(
  document: OpenPencilDocument,
  edits: {
    targetId: string;
    newCharacters?: string;
    newFillColor?: Color;
    newStrokeColor?: Color;
  }
): OpenPencilDocument {
  const copy: OpenPencilDocument = JSON.parse(JSON.stringify(document));

  function findAndEdit(nodes: OpenPencilNode[]): boolean {
    for (const node of nodes) {
      if (node.id === edits.targetId) {
        if (edits.newCharacters !== undefined && node.type === 'TEXT') {
          node.characters = edits.newCharacters;
        }
        if (edits.newFillColor !== undefined) {
          node.fills = [{ type: 'SOLID', color: edits.newFillColor }];
        }
        if (edits.newStrokeColor !== undefined) {
          node.strokes = [{ type: 'SOLID', color: edits.newStrokeColor }];
        }
        return true;
      }
      if (node.children && findAndEdit(node.children)) {
        return true;
      }
    }
    return false;
  }

  findAndEdit(copy.nodes);
  return copy;
}
