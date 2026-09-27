/**
 * CLI Command — writeback
 *
 * Implements the `writeback <package-dir>` command.
 * Loads the capture package, executes the writeback orchestrator,
 * and prints a structured report to stdout.
 *
 * This module is responsible for exactly one thing: running the writeback
 * command and printing its result.
 */
import { resolve } from 'node:path';
import { executePackageWriteback } from '../../../../packages/tooling/index';

export type WritebackCommandOptions = {
  packageDir: string;
  dryRun: boolean;
  forceOverride: boolean;
};

export async function runWritebackCommand(opts: WritebackCommandOptions): Promise<void> {
  const { packageDir, dryRun, forceOverride } = opts;

  const result = await executePackageWriteback({
    packageDir,
    dryRun,
    forceOverride,
  });

  console.log(`\n======================================================`);
  console.log(`Writeback Orchestration Completed! ${dryRun ? '(DRY RUN)' : ''} ${forceOverride ? '(FORCE OVERRIDE)' : ''}`);
  console.log(`======================================================`);
  console.log(`Package Directory : ${result.packageDir}`);
  console.log(`Capture ID        : ${result.captureId}`);
  console.log(`Status            : ${result.status}`);
  console.log(`Total Nodes       : ${result.diffSummary.totalNodesCompared}`);
  console.log(`Modified Nodes    : ${result.diffSummary.modifiedNodesCount}`);
  console.log(`Text Edits        : ${result.diffSummary.textEditsCount}`);
  console.log(`Color Edits       : ${result.diffSummary.colorEditsCount}`);
  console.log(`Layout Edits      : ${result.diffSummary.layoutEditsCount}`);
  console.log(`Manifest Location : ${resolve(result.packageDir, 'writeback-manifest.json')}`);
  console.log(`======================================================`);

  for (const wb of result.writebacks) {
    console.log(`\n- [${wb.type.toUpperCase()}] Layer '${wb.layerId}' -> ${wb.success ? 'SUCCESS' : 'FAILED'}`);
    if (wb.targetFile) console.log(`  Target File : ${wb.targetFile}`);
    if (wb.backupPath) console.log(`  Backup File : ${wb.backupPath}`);
    if (wb.diff) {
      console.log(`  Diff:`);
      for (const line of wb.diff.split('\n')) {
        console.log(`    ${line}`);
      }
    }
    if (wb.error) console.log(`  Error       : ${wb.error}`);
  }

  console.log(`\n`);
}
