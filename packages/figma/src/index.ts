import type { Color, Scene, SceneNode as CapturedNode } from '@code-to-figma/contracts';
import type { EditorPort } from '@code-to-figma/core';

function paint(color: Color): SolidPaint {
  return { type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a };
}

export function createFigmaEditor(api: PluginAPI): EditorPort {
  const created = new Map<string, SceneNode>();
  const imageHashes = new Map<string, string>();
  return {
    async preflight(scene: Scene) {
      const fonts = new Map<string, FontName>();
      for (const node of scene.nodes) if (node.kind === 'text') fonts.set(`${node.fontFamily}/${node.fontStyle}`, { family: node.fontFamily, style: node.fontStyle });
      for (const font of fonts.values()) {
        try { await api.loadFontAsync(font); }
        catch { throw new Error(`Font unavailable: ${font.family} ${font.style}. Make it available in Figma before importing; no silent substitution is performed.`); }
      }
      for (const asset of scene.assets) imageHashes.set(asset.id, api.createImage(Uint8Array.from(asset.bytes)).hash);
    },
    create(source: CapturedNode, parentId: string | null) {
      const node = source.kind === 'text' ? api.createText() : source.kind === 'image' ? api.createRectangle() : api.createFrame();
      try {
        const parent = parentId === null ? api.currentPage : created.get(parentId);
        if (!parent || !('appendChild' in parent)) throw new Error('Import parent is not a container');
        parent.appendChild(node);
        node.name = source.name;
        node.resize(Math.max(source.width, 0.01), Math.max(source.height, 0.01));
        node.x = source.x;
        node.y = source.y;
        node.opacity = source.opacity;
        node.setPluginData('sourceId', source.id);
        node.setPluginData('nameOrigin', source.nameOrigin);
        node.setPluginData('generator', 'code-to-figma/0.1');
        if (source.kind === 'text' && node.type === 'TEXT') {
          node.fontName = { family: source.fontFamily, style: source.fontStyle };
          node.fontSize = source.fontSize;
          node.lineHeight = { unit: 'PIXELS', value: source.lineHeight };
          node.letterSpacing = { unit: 'PIXELS', value: source.letterSpacing };
          node.textAlignHorizontal = source.align;
          node.textAutoResize = 'NONE';
          node.characters = source.text;
          node.fills = [paint(source.color)];
        } else if (source.kind !== 'text' && node.type !== 'TEXT') {
          node.fills = source.kind === 'image' ? [{ type: 'IMAGE', imageHash: imageHashes.get(source.assetId)!, scaleMode: source.fit === 'CROP' ? 'FILL' : source.fit === 'FILL' ? 'CROP' : 'FIT', ...(source.fit === 'FILL' ? { imageTransform: [[1, 0, 0], [0, 1, 0]] as Transform } : {}) }] : [paint(source.fill)];
          node.strokes = source.borderWidth > 0 ? [paint(source.border)] : [];
          node.strokeWeight = source.borderWidth;
          node.strokeAlign = 'INSIDE';
          node.cornerRadius = source.radius;
          if (node.type === 'FRAME' && source.kind === 'frame') node.clipsContent = source.clipsContent;
        }
        created.set(node.id, node);
        return node.id;
      } catch (error) { node.remove(); throw error; }
    },
    complete(rootId) {
      const root = created.get(rootId);
      if (!root) throw new Error('Import root missing');
      root.x = api.viewport.center.x - root.width / 2;
      root.y = api.viewport.center.y - root.height / 2;
      api.currentPage.selection = [root];
      api.viewport.scrollAndZoomIntoView([root]);
    },
    remove(rootId) { created.get(rootId)?.remove(); },
    async yield() { await new Promise(resolve => setTimeout(resolve, 0)); },
  };
}
