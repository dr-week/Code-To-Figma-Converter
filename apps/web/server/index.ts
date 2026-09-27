import { createServer as createHttpServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { handleApi } from './conversion-api';

const host = '127.0.0.1';
const port = 4310;
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
process.chdir(resolve(root, '../..'));
const vite = await createViteServer({ root, server: { middlewareMode: true }, appType: 'spa' });
const server = createHttpServer(async (request, response) => {
  if (await handleApi(request, response)) return;
  if (request.method === 'GET' && request.url === '/') {
    const template = await readFile(resolve(root, 'index.html'), 'utf8');
    const html = await vite.transformIndexHtml('/', template);
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(html);
    return;
  }
  vite.middlewares(request, response, () => {
    response.writeHead(404);
    response.end('Not found');
  });
});

server.listen(port, host, () => console.log(`Code to Design UI: http://${host}:${port}`));

async function close(): Promise<void> {
  await vite.close();
  server.close();
}
process.once('SIGINT', close);
process.once('SIGTERM', close);
