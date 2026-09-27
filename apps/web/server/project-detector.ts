import { access, readFile, stat } from 'node:fs/promises';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';

export type Framework = 'nuxt' | 'vue' | 'react' | 'unknown';

export type ProjectDetection = {
  rootPath: string;
  projectName: string;
  framework: Framework;
  packageManager: 'pnpm' | 'npm' | 'yarn' | 'bun' | 'unknown';
  devScript: string | null;
  entryFiles: Array<{ relative: string; absolute: string }>;
  styleFiles: Array<{ relative: string; absolute: string }>;
};

type PackageJson = {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

async function existingFiles(rootPath: string, candidates: string[]): Promise<ProjectDetection['entryFiles']> {
  const matches = await Promise.all(candidates.map(async candidate => {
    const absolute = join(rootPath, candidate);
    try { await access(absolute); return { relative: relative(rootPath, absolute).replaceAll('\\', '/'), absolute }; }
    catch { return null; }
  }));
  return matches.filter((file): file is { relative: string; absolute: string } => file !== null);
}

export async function detectProject(inputPath: string): Promise<ProjectDetection> {
  const rootPath = resolve(inputPath.trim());
  if (!inputPath.trim()) throw new Error('Project folder is required.');
  if (!isAbsolute(rootPath)) throw new Error('Project folder must resolve to an absolute path.');
  const folder = await stat(rootPath).catch(() => null);
  if (!folder?.isDirectory()) throw new Error('Project folder does not exist or is not a directory.');

  const packagePath = join(rootPath, 'package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8').catch(() => {
    throw new Error('No readable package.json was found in the project folder.');
  })) as PackageJson;
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const framework: Framework = dependencies.nuxt ? 'nuxt' : dependencies.vue ? 'vue' : dependencies.react ? 'react' : 'unknown';
  const lockFiles: Array<[ProjectDetection['packageManager'], string]> = [
    ['pnpm', 'pnpm-lock.yaml'], ['bun', 'bun.lock'], ['bun', 'bun.lockb'], ['yarn', 'yarn.lock'], ['npm', 'package-lock.json'],
  ];
  let packageManager: ProjectDetection['packageManager'] = 'unknown';
  for (const [manager, lockFile] of lockFiles) {
    try { await access(join(rootPath, lockFile)); packageManager = manager; break; } catch { /* try next */ }
  }
  const entryCandidates = framework === 'nuxt'
    ? ['app.vue', 'pages/index.vue', 'src/app.vue', 'src/pages/index.vue']
    : framework === 'react'
      ? ['src/App.tsx', 'src/App.jsx', 'src/main.tsx', 'src/main.jsx']
      : ['src/App.vue', 'App.vue', 'src/main.ts'];
  return {
    rootPath,
    projectName: packageJson.name ?? basename(rootPath),
    framework,
    packageManager,
    devScript: packageJson.scripts?.dev ?? null,
    entryFiles: await existingFiles(rootPath, entryCandidates),
    styleFiles: await existingFiles(rootPath, ['src/style.css', 'src/styles.css', 'assets/css/main.css', 'app.css']),
  };
}
