/**
 * CLI Entry Point
 *
 * Parses arguments and dispatches to the appropriate command module:
 *   commands/capture.ts   — default capture flow
 *   commands/writeback.ts — writeback <package-dir> flow
 *
 * Adding a new command: create commands/<name>.ts and add one import +
 * one dispatch branch here. No business logic lives in this file.
 */
import { parseArgs } from 'node:util';
import { runCaptureCommand } from './commands/capture';
import { runWritebackCommand } from './commands/writeback';

try {
  const { values, positionals } = parseArgs({
    options: {
      url: { type: 'string', default: 'http://127.0.0.1:4173' },
      selector: { type: 'string', default: '[data-figma-root]' },
      output: { type: 'string', default: '.artifacts/capture' },
      width: { type: 'string', default: '960' },
      height: { type: 'string', default: '900' },
      milestone: { type: 'string', default: '1' },
      force: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean' },
    },
    allowPositionals: true,
  });

  const isWritebackCommand = positionals.includes('writeback');

  if (values.help) {
    console.log('Capture:   pnpm capture --url http://127.0.0.1:4174 --selector "[data-figma-root]" --output .artifacts/milestone-01/latest --width 960 --height 900');
    console.log('Writeback: pnpm writeback .artifacts/milestone-01/<capture-id> [--force] [--dry-run]');
  } else if (isWritebackCommand) {
    const targetDir = positionals.find(p => p !== 'writeback') ??
      (values.output !== '.artifacts/capture' ? values.output : undefined);
    if (!targetDir) {
      throw new Error('Missing <package-dir> argument for writeback command. Usage: pnpm writeback <package-dir> [--force] [--dry-run]');
    }

    await runWritebackCommand({
      packageDir: targetDir,
      dryRun: Boolean(values['dry-run']),
      forceOverride: Boolean(values.force),
    });
  } else {
    const width = Number(values.width);
    const height = Number(values.height);
    if (![width, height].every(value => Number.isInteger(value) && value >= 100 && value <= 4096)) {
      throw new Error('Viewport must be between 100 and 4096 pixels');
    }

    await runCaptureCommand({
      url: values.url,
      selector: values.selector,
      output: values.output,
      width,
      height,
      milestone: values.milestone,
    });
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
