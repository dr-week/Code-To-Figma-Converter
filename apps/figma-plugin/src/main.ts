import { parseSceneJson } from '@code-to-figma/contracts';
import { importScene } from '@code-to-figma/core';
import { createFigmaEditor } from '@code-to-figma/figma';

declare const __html__: string;
figma.showUI(__html__, { width: 420, height: 540, themeColors: true });
let busy = false;
let cancelled = false;
let lastRoot: string | null = null;

figma.ui.onmessage = async (message: unknown) => {
  if (!message || typeof message !== 'object' || !('type' in message)) return;
  if (message.type === 'cancel') { cancelled = true; return; }
  if (busy) return;
  busy = true;
  try {
    if (message.type === 'import' && 'json' in message && typeof message.json === 'string') {
      cancelled = false;
      const scene = parseSceneJson(message.json);
      const result = await importScene(scene, createFigmaEditor(figma), () => cancelled);
      lastRoot = result.rootId;
      figma.ui.postMessage({ type: 'done', result, warnings: scene.warnings });
    } else if (message.type === 'export' && lastRoot !== null) {
      const node = await figma.getNodeByIdAsync(lastRoot);
      if (!node || !('exportAsync' in node)) throw new Error('Imported root no longer exists');
      const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
      figma.ui.postMessage({ type: 'exported', bytes });
    }
  } catch (error) { figma.ui.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) }); }
  finally { busy = false; }
};
