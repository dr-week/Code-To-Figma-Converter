/**
 * Fidelity — HTML Preview Builder
 *
 * Renders the captured Scene graph into a self-contained HTML page and takes
 * a Playwright screenshot at the exact viewport dimensions.
 *
 * This module is responsible for exactly one thing: producing design-preview.png.
 * It does NOT compare screenshots, write JSON, or format reports.
 */
import { chromium } from 'playwright';
import type { Scene } from '@code-to-figma/contracts';
import { formatRgba } from './types';

/**
 * Renders the Scene graph into a pixel-accurate HTML design preview inside Playwright
 * and captures design-preview.png at the exact viewport dimensions.
 */
export async function generateDesignPreviewScreenshot(
  scene: Scene,
  width: number,
  height: number,
): Promise<Buffer> {
  const assetMap = new Map<string, string>();
  for (const asset of scene.assets) {
    const base64 = Buffer.from(asset.bytes).toString('base64');
    assetMap.set(asset.id, `data:image/png;base64,${base64}`);
  }

  const nodesHtml = scene.nodes
    .map(node => {
      const style = `position: absolute; left: ${node.x}px; top: ${node.y}px; width: ${node.width}px; height: ${node.height}px; opacity: ${node.opacity}; box-sizing: border-box;`;

      if (node.kind === 'frame') {
        const fillCss = formatRgba(node.fill);
        const borderCss = node.borderWidth > 0 ? `${node.borderWidth}px solid ${formatRgba(node.border)}` : 'none';
        const overflowCss = node.clipsContent ? 'hidden' : 'visible';
        return `<div style="${style} background: ${fillCss}; border: ${borderCss}; border-radius: ${node.radius}px; overflow: ${overflowCss};"></div>`;
      }

      if (node.kind === 'text') {
        const colorCss = formatRgba(node.color);
        const alignCss = node.align.toLowerCase();
        return `<div style="${style} color: ${colorCss}; font-family: '${node.fontFamily}', sans-serif; font-size: ${node.fontSize}px; line-height: ${node.lineHeight}px; letter-spacing: ${node.letterSpacing}px; text-align: ${alignCss}; white-space: pre-wrap; margin: 0; padding: 0;">${node.text}</div>`;
      }

      // image node
      const src = assetMap.get(node.assetId) ?? '';
      return `<img src="${src}" style="${style} object-fit: cover; border-radius: ${node.radius}px;" />`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #ffffff; width: ${width}px; height: ${height}px; overflow: hidden; }
    #canvas { position: relative; width: ${width}px; height: ${height}px; }
  </style>
</head>
<body>
  <div id="canvas">
    ${nodesHtml}
  </div>
</body>
</html>`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map(img => img.decode().catch(() => {})));
    });
    const screenshot = await page.locator('#canvas').screenshot({ animations: 'disabled' });
    return screenshot;
  } finally {
    await browser.close();
  }
}
