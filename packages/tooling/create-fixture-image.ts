import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';

// Original procedural fixture artwork: no downloaded or third-party image.
const png = new PNG({ width: 288, height: 176 });
for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
  const circle = (x - 144) ** 2 + (y - 88) ** 2 < 64 ** 2;
  const stripe = x > 216 || x < 36;
  const rgb = circle ? [182, 55, 39] : stripe ? [222, 216, 199] : [239, 234, 219];
  const offset = (y * png.width + x) * 4;
  png.data[offset] = rgb[0]!; png.data[offset + 1] = rgb[1]!; png.data[offset + 2] = rgb[2]!; png.data[offset + 3] = 255;
}
await mkdir('tests/fixtures/react/public', { recursive: true });
await writeFile('tests/fixtures/react/public/study.png', PNG.sync.write(png));
