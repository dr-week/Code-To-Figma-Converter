import { parseScene, type Scene, type SceneNode } from '@code-to-figma/contracts';

export interface EditorPort {
  preflight(scene: Scene): Promise<void>;
  create(node: SceneNode, parentHandle: string | null): string;
  complete(rootHandle: string): void;
  remove(rootHandle: string): void;
  yield(): Promise<void>;
}
export type ImportResult = { rootId: string; nodeIds: Record<string, string> };

export async function importScene(input: unknown, editor: EditorPort, cancelled: () => boolean = () => false): Promise<ImportResult> {
  const scene = parseScene(input);
  await editor.preflight(scene);
  const handles = new Map<string, string>();
  let root: string | undefined;
  try {
    for (const [index, node] of scene.nodes.entries()) {
      if (cancelled()) throw new Error('Import cancelled');
      const parent = node.parentId === null ? null : handles.get(node.parentId);
      if (parent === undefined) throw new Error(`Missing parent: ${node.id}`);
      const handle = editor.create(node, parent);
      if (root === undefined) root = handle;
      handles.set(node.id, handle);
      if (index % 25 === 0) await editor.yield();
    }
    if (root === undefined) throw new Error('Empty import');
    if (cancelled()) throw new Error('Import cancelled');
    editor.complete(root);
    return { rootId: root, nodeIds: Object.fromEntries(handles) };
  } catch (error) {
    if (root !== undefined) {
      try { editor.remove(root); }
      catch { throw new Error(`Import failed; cleanup also failed. Remove generated root ${root}. Original error: ${String(error)}`); }
    }
    throw error;
  }
}
