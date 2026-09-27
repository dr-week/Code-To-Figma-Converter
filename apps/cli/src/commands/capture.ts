/**
 * CLI Command — capture
 *
 * Implements the default capture flow for both:
 *   - Milestone 1 full package build (--milestone=1 or default)
 *   - Generic scene capture (any other URL)
 *
 * This module is responsible for exactly one thing: running the capture
 * command and printing its result to stdout.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { captureProject } from '../../../../packages/browser/src/index';
import { buildMilestone1Package } from '../../../../packages/tooling/milestone1';

export type CaptureCommandOptions = {
  url: string;
  selector: string;
  output: string;
  width: number;
  height: number;
  milestone: string;
};

export async function runCaptureCommand(opts: CaptureCommandOptions): Promise<void> {
  const { url, selector, output, width, height, milestone } = opts;

  if (milestone === '1' || url.includes('4174')) {
    const result = await buildMilestone1Package({
      url,
      selector,
      projectId: 'vue-fixture',
      width,
      height,
      outputBaseDir: output.includes('.artifacts/capture')
        ? `.artifacts/milestone-01/capture-${Date.now()}`
        : output,
    });

    console.log(`\nMilestone 1 package built successfully!`);
    console.log(`Package location: ${result.packageDir}`);
    console.log(`Capture ID: ${result.captureId}`);
    console.log(`Nodes: ${result.validationReport.sceneNodeCount}, Explicit names: ${result.validationReport.explicitNamesCount}, Images: ${result.validationReport.assetsCount}`);
    console.log(`Source Mappings: ${result.validationReport.sourceMappingsCount}`);
    console.log(`Save/Reopen Edit Verified: ${result.validationReport.editorVerified}`);
  } else {
    const start = performance.now();
    const { scene, screenshot } = await captureProject({
      url,
      selector,
      projectId: 'local',
      width,
      height,
    });
    const outputDir = resolve(output);
    await mkdir(outputDir, { recursive: true });
    const json = JSON.stringify(scene, null, 2);
    const report = {
      status: 'captured',
      editorVerified: false,
      schemaVersion: scene.schemaVersion,
      nodes: scene.nodes.length,
      explicitNames: scene.nodes.filter(node => node.nameOrigin === 'explicit').length,
      assets: scene.assets.length,
      warnings: scene.warnings,
      sceneSha256: createHash('sha256').update(json).digest('hex'),
      captureMilliseconds: Math.round(performance.now() - start),
    };
    await Promise.all([
      writeFile(resolve(outputDir, 'scene.json'), json),
      writeFile(resolve(outputDir, 'reference.png'), screenshot),
      writeFile(resolve(outputDir, 'report.json'), JSON.stringify(report, null, 2)),
    ]);
    console.log(
      `Captured ${report.nodes} nodes and ${report.assets} images in ${report.captureMilliseconds} ms.\n${outputDir}\nWarnings: ${report.warnings.length}. Figma editor verification is still required.`
    );
  }
}
