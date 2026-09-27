import { createReadStream } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { buildMilestone1Package } from '../../../packages/tooling/milestone1';
import type { ConversionRequest, ConversionResponse } from './types';
import { detectProject } from './project-detector';

const generatedFiles = new Map<string, string>();

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > 64_000) throw new Error('Request is too large.');
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

function parseRequest(value: unknown): ConversionRequest {
  if (!value || typeof value !== 'object') throw new Error('Request body is required.');
  const input = value as Record<string, unknown>;
  const url = String(input.url ?? '');
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(parsedUrl.hostname)) {
    throw new Error('Only a running local HTTP application is supported.');
  }
  const width = Number(input.width);
  const height = Number(input.height);
  if (![width, height].every(dimension => Number.isInteger(dimension) && dimension >= 100 && dimension <= 4096)) {
    throw new Error('Viewport dimensions must be whole numbers from 100 to 4096.');
  }
  const optional = (key: string): string | undefined => {
    const field = input[key];
    return typeof field === 'string' && field.trim() ? field.trim() : undefined;
  };
  const sourceFileRelative = optional('sourceFileRelative');
  const sourceFileAbsolute = optional('sourceFileAbsolute');
  const styleCssAbsolute = optional('styleCssAbsolute');
  const imageAbsolute = optional('imageAbsolute');
  return {
    url,
    selector: optional('selector') ?? '[data-figma-root]',
    projectId: optional('projectId') ?? 'local-vue-project',
    width,
    height,
    ...(sourceFileRelative ? { sourceFileRelative } : {}),
    ...(sourceFileAbsolute ? { sourceFileAbsolute } : {}),
    ...(styleCssAbsolute ? { styleCssAbsolute } : {}),
    ...(imageAbsolute ? { imageAbsolute } : {}),
  };
}

async function convert(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const input = parseRequest(await readJson(request));
  const result = await buildMilestone1Package({
    url: input.url,
    selector: input.selector,
    projectId: input.projectId,
    width: input.width,
    height: input.height,
    ...(input.sourceFileRelative ? { sourceFileRelative: input.sourceFileRelative } : {}),
    ...(input.sourceFileAbsolute ? { sourceFileAbsolute: input.sourceFileAbsolute } : {}),
    ...(input.styleCssAbsolute ? { styleCssAbsolute: input.styleCssAbsolute } : {}),
    ...(input.imageAbsolute ? { studyPngAbsolute: input.imageAbsolute } : {}),
  });
  generatedFiles.set(result.captureId, resolve(result.packageDir, 'design/original.fig'));
  const body: ConversionResponse = {
    captureId: result.captureId,
    packageDir: result.packageDir,
    downloadUrl: `/api/conversions/${encodeURIComponent(result.captureId)}/download`,
    nodes: result.validationReport.sceneNodeCount,
    images: result.validationReport.assetsCount,
    mappings: result.validationReport.sourceMappingsCount,
    warnings: result.validationReport.warningsCount,
    editorVerified: false,
  };
  sendJson(response, 201, body);
}

function download(captureId: string, response: ServerResponse): void {
  const file = generatedFiles.get(captureId);
  if (!file) return sendJson(response, 404, { error: 'Generated file is unavailable. Run the conversion again.' });
  response.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${captureId}.fig"`,
  });
  createReadStream(file).on('error', () => sendJson(response, 404, { error: 'Generated file was not found.' })).pipe(response);
}

export async function handleApi(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
  if (request.method === 'POST' && request.url === '/api/projects/detect') {
    try {
      const body = await readJson(request);
      const rootPath = body && typeof body === 'object' ? String((body as Record<string, unknown>).rootPath ?? '') : '';
      sendJson(response, 200, await detectProject(rootPath));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Project detection failed.' });
    }
    return true;
  }
  if (request.method === 'POST' && request.url === '/api/conversions') {
    try {
      await convert(request, response);
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Conversion failed.' });
    }
    return true;
  }
  const match = request.method === 'GET' ? request.url?.match(/^\/api\/conversions\/([^/]+)\/download$/) : null;
  if (match?.[1]) {
    download(decodeURIComponent(match[1]), response);
    return true;
  }
  if (request.url?.startsWith('/api/')) {
    sendJson(response, 404, { error: 'API route not found.' });
    return true;
  }
  return false;
}
