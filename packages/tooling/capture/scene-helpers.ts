/**
 * Capture — Scene Helpers for Milestone 1
 *
 * Pure scene-manipulation helpers used during the capture phase.
 * These functions do not perform any I/O; they operate on immutable
 * Scene objects and return new Scene objects.
 *
 * Kept separate from the orchestrator so they can be tested in isolation
 * and reused in future milestones.
 */
import type { Scene, Color } from '../../contracts/src/index';

/** Find the first text node in the flat scene node list. */
export function findFirstTextNode(scene: Scene) {
  return scene.nodes.find(n => n.kind === 'text');
}

/** Find the root frame node in the flat scene node list. */
export function findRootFrameNode(scene: Scene) {
  return scene.nodes.find(n => n.kind === 'frame' && n.parentId === null);
}

/**
 * Clone the scene with the first text node's content replaced and root frame
 * fill color edited. Node IDs are unchanged so the anchorMap remains valid.
 */
export function buildWorkingScene(
  scene: Scene,
  newText: string,
  updatedFillColor: Color = { r: 0.1, g: 0.2, b: 0.8, a: 1 },
): Scene {
  const targetText = findFirstTextNode(scene);
  const targetFrame = findRootFrameNode(scene);
  return {
    ...scene,
    nodes: scene.nodes.map(n => {
      if (n === targetText && n.kind === 'text') {
        return { ...n, text: newText };
      }
      if (n === targetFrame && n.kind === 'frame') {
        return { ...n, fill: updatedFillColor };
      }
      return n;
    }),
  };
}
