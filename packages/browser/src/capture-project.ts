import { chromium } from 'playwright';
import { build, type Plugin } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { parseScene, type Scene } from '@code-to-figma/contracts';
import type { readDom } from './read-dom';

export type CaptureOptions = { url: string; projectId: string; selector: string; width: number; height: number };

const nodeExternalPlugin: Plugin = {
  name: 'node-external',
  setup(buildPlugin) {
    buildPlugin.onResolve({ filter: /.*/ }, (args) => {
      if (args.path.endsWith('read-dom.ts') || args.path.startsWith('.') || args.path.includes('contracts') || args.path === 'zod') {
        return undefined;
      }
      return { path: args.path, external: true };
    });
  },
};

export async function captureProject(options: CaptureOptions): Promise<{ scene: Scene; screenshot: Buffer }> {
  const url = new URL(options.url);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password) throw new Error('Only an owned local HTTP app is supported');
  const bundle = await build({ entryPoints: [fileURLToPath(new URL('./read-dom.ts', import.meta.url))], bundle: true, write: false, format: 'iife', globalName: 'CaptureReader', platform: 'browser', target: 'es2020', plugins: [nodeExternalPlugin] });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: options.width, height: options.height }, deviceScaleFactor: 1, locale: 'en-GB', timezoneId: 'UTC', colorScheme: 'light', reducedMotion: 'reduce', serviceWorkers: 'block' });
    page.setDefaultTimeout(15000);
    const networkWarnings = new Set<string>();
    await page.route('**/*', async route => {
      const request = new URL(route.request().url());
      if (request.origin === url.origin || request.protocol === 'data:') await route.continue();
      else { networkWarnings.add(request.origin); await route.abort(); }
    });
    const response = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
    if (!response?.ok()) throw new Error(`App returned HTTP ${response?.status()}`);
    await page.locator(options.selector).waitFor({ state: 'visible' });
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map(image => image.decode()));
      window.scrollTo(0, 0);
    });
    const root = page.locator(options.selector);
    let previous = '';
    let stable = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      const current = JSON.stringify(await root.evaluate(element => [element, ...element.querySelectorAll('*')].map(node => { const rect = node.getBoundingClientRect(); return [rect.x, rect.y, rect.width, rect.height, node.textContent]; })));
      if (current === previous) { stable = true; break; }
      previous = current;
      await page.waitForTimeout(100);
    }
    if (!stable) throw new Error('UI did not stabilize; provide deterministic fixture data');
    await page.addScriptTag({ content: bundle.outputFiles[0]!.text });
    const raw: ReturnType<typeof readDom> = await page.evaluate(`CaptureReader.readDom(${JSON.stringify(options.selector)})`);
    const assets: Scene['assets'] = [];
    for (const image of raw.images) {
      const assetUrl = new URL(image.url);
      if (assetUrl.origin !== url.origin) throw new Error('Only same-origin PNG/JPEG assets are supported');
      const result = await page.request.get(assetUrl.href, { maxRedirects: 0, timeout: 15000 });
      if (!result.ok()) throw new Error(`Asset returned HTTP ${result.status()}`);
      const contentType = result.headers()['content-type']?.split(';')[0];
      if (contentType !== 'image/png' && contentType !== 'image/jpeg') throw new Error(`Unsupported image type: ${contentType}`);
      const bytes = await result.body();
      if (bytes.length > 2_000_000) throw new Error('Image exceeds 2 MB');
      assets.push({ id: image.id, bytes: [...bytes] });
    }
    for (const origin of networkWarnings) raw.warnings.push({ code: 'BLOCKED_ORIGIN', nodeId: raw.nodes[0]?.id ?? 'root', message: `Blocked external requests to ${origin}` });
    const scene = parseScene({ schemaVersion: '0.1', source: { projectId: options.projectId, route: url.pathname, viewport: { width: options.width, height: options.height } }, nodes: raw.nodes, assets, warnings: raw.warnings });
    const screenshot = await root.screenshot({ animations: 'disabled', timeout: 15000 });
    return { scene, screenshot };
  } finally { await browser.close(); }
}
