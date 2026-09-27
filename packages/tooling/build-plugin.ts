import { build } from 'esbuild';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve('apps/figma-plugin/dist');
await mkdir(output, { recursive: true });
await build({
  entryPoints: ['apps/figma-plugin/src/main.ts'],
  bundle: true,
  outfile: resolve(output, 'code.js'),
  format: 'iife',
  platform: 'browser',
  target: 'es2017',
  minify: false,
  external: ['@open-pencil/*', 'canvaskit-wasm', 'undici'],
});
await copyFile('apps/figma-plugin/src/ui.html', resolve(output, 'ui.html'));
await writeFile(resolve(output, 'manifest.json'), JSON.stringify({ name: 'Code to Figma · Local', api: '1.0.0', main: 'code.js', ui: 'ui.html', editorType: ['figma'], documentAccess: 'dynamic-page', networkAccess: { allowedDomains: ['none'] } }, null, 2));
console.log(`Figma plugin built: ${output}`);
