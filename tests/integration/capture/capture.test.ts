import { afterAll, beforeAll, expect, it } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { captureProject } from '../../../packages/browser/src/index';
import { PNG } from 'pngjs';

let server: ViteDevServer;
let url: string;
beforeAll(async () => {
  server = await createServer({ root: resolve('tests/fixtures/react'), server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === 'string') throw new Error('Missing fixture address');
  url = `http://127.0.0.1:${address.port}`;
}, 30000);
afterAll(async () => { await server?.close(); });

it('captures native candidates, exact names, multiline text and original image bytes repeatably', async () => {
  const options = { url, selector: '[data-figma-root]', projectId: 'test', width: 960, height: 900 };
  const first = await captureProject(options);
  const second = await captureProject(options);
  expect(first.scene).toEqual(second.scene);
  expect(first.scene.warnings).toEqual([]);
  expect(first.scene.nodes.find(node => node.id === 'source:inspect-button')?.name).toBe('Project/InspectButton');
  expect(first.scene.nodes.some(node => node.kind === 'text' && node.text === 'Good structure.\nClear outcomes.')).toBe(true);
  expect(Buffer.from(first.scene.assets[0]!.bytes)).toEqual(await readFile('tests/fixtures/react/public/study.png'));
  expect(first.scene.nodes[0]?.width).toBe(960);
  expect(PNG.sync.read(first.screenshot).width).toBe(960);
  expect(first.scene.nodes.find(node => node.name === 'Header')?.x).toBe(40);
}, 60000);
it('rejects remote capture URLs before launching a browser', async () => {
  await expect(captureProject({ url: 'https://example.com', selector: 'body', projectId: 'test', width: 960, height: 900 })).rejects.toThrow('local');
});
