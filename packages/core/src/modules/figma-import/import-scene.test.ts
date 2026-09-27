import { expect, it, vi } from 'vitest';
import { importScene, type EditorPort } from './import-scene';
import { sampleScene } from '../../../../contracts/src/test-fixture';

function editor(): EditorPort {
  return { preflight: vi.fn(async () => {}), create: vi.fn(node => `figma:${node.id}`), complete: vi.fn(), remove: vi.fn(), yield: vi.fn(async () => {}) };
}
it('passes exact text and parent handles to the editor', async () => {
  const port = editor();
  const result = await importScene(sampleScene(), port);
  expect(result.rootId).toBe('figma:root');
  expect(port.create).toHaveBeenLastCalledWith(sampleScene().nodes[1], 'figma:root');
});
it('does not mutate the editor if font preflight fails', async () => {
  const port = editor(); vi.mocked(port.preflight).mockRejectedValue(new Error('Font unavailable'));
  await expect(importScene(sampleScene(), port)).rejects.toThrow('Font');
  expect(port.create).not.toHaveBeenCalled();
});
it('removes only the generated root after a partial failure', async () => {
  const port = editor(); vi.mocked(port.create).mockImplementationOnce(() => 'figma:root').mockImplementationOnce(() => { throw new Error('Editor failure'); });
  await expect(importScene(sampleScene(), port)).rejects.toThrow('Editor failure');
  expect(port.remove).toHaveBeenCalledExactlyOnceWith('figma:root');
});
it('cancels between batches and cleans up', async () => {
  const port = editor(); let cancelled = false; vi.mocked(port.yield).mockImplementation(async () => { cancelled = true; });
  await expect(importScene(sampleScene(), port, () => cancelled)).rejects.toThrow('cancelled');
  expect(port.remove).toHaveBeenCalledExactlyOnceWith('figma:root');
});
it('reports the root if cleanup also fails', async () => {
  const port = editor(); vi.mocked(port.create).mockImplementationOnce(() => 'figma:root').mockImplementationOnce(() => { throw new Error('Editor failure'); });
  vi.mocked(port.remove).mockImplementation(() => { throw new Error('Cleanup failure'); });
  await expect(importScene(sampleScene(), port)).rejects.toThrow('Remove generated root figma:root');
});

