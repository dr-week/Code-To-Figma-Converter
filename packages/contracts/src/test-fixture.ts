import type { Scene } from './index';

export function sampleScene(): Scene {
  return { schemaVersion: '0.1', source: { projectId: 'test', route: '/', viewport: { width: 960, height: 900 } }, assets: [], warnings: [], nodes: [
    { kind: 'frame', id: 'root', parentId: null, name: 'Root', nameOrigin: 'explicit', x: 0, y: 0, width: 960, height: 900, opacity: 1, fill: { r: 1, g: 1, b: 1, a: 1 }, border: { r: 0, g: 0, b: 0, a: 0 }, borderWidth: 0, radius: 0, clipsContent: false },
    { kind: 'text', id: 'title', parentId: 'root', name: 'Title', nameOrigin: 'explicit', x: 20, y: 20, width: 200, height: 24, opacity: 1, text: 'Keep  these spaces', color: { r: 0, g: 0, b: 0, a: 1 }, fontFamily: 'Inter', fontStyle: 'Regular', fontSize: 16, lineHeight: 24, letterSpacing: 0, align: 'LEFT' },
  ] };
}


