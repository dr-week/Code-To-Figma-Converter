import { readFile, writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [referencePath, actualPath, outputPath = '.artifacts/diff.png'] = process.argv.slice(2);
if (!referencePath || !actualPath) throw new Error('Usage: pnpm compare <reference.png> <figma-export.png> [diff.png]');
const reference = PNG.sync.read(await readFile(referencePath));
const actual = PNG.sync.read(await readFile(actualPath));
if (reference.width !== actual.width || reference.height !== actual.height) throw new Error(`Dimensions differ: reference ${reference.width}×${reference.height}, actual ${actual.width}×${actual.height}`);
const diff = new PNG({ width: reference.width, height: reference.height });
const changed = pixelmatch(reference.data, actual.data, diff.data, reference.width, reference.height, { threshold: 0.1, includeAA: true });
await writeFile(outputPath, PNG.sync.write(diff));
console.log(JSON.stringify({ changedPixels: changed, changedRatio: changed / (reference.width * reference.height), threshold: 0.1, includeAntialiasing: true, diff: outputPath }, null, 2));
