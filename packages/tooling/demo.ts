import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { captureProject } from '@code-to-figma/browser';

const server = await createServer({ root: resolve('tests/fixtures/react'), server: { host: '127.0.0.1', port: 4173, strictPort: true } });
try {
  await server.listen();
  const started = performance.now();
  const result = await captureProject({ url: 'http://127.0.0.1:4173', selector: '[data-figma-root]', projectId: 'react-fixture', width: 960, height: 900 });
  await mkdir('.artifacts/demo', { recursive: true });
  const json = JSON.stringify(result.scene, null, 2);
  await Promise.all([writeFile('.artifacts/demo/scene.json', json), writeFile('.artifacts/demo/reference.png', result.screenshot), writeFile('.artifacts/demo/report.json', JSON.stringify({ nodes: result.scene.nodes.length, assets: result.scene.assets.length, warnings: result.scene.warnings, milliseconds: Math.round(performance.now() - started), sceneSha256: createHash('sha256').update(json).digest('hex'), editorVerified: false }, null, 2))]);
  console.log(`Demo captured ${result.scene.nodes.length} nodes, ${result.scene.assets.length} images, ${result.scene.warnings.length} warnings.\nImport .artifacts/demo/scene.json with the Figma plugin.\nBrowser closed and fixture server stopped automatically.`);
} finally { await server.close(); }
