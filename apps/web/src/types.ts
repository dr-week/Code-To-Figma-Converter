export type ConversionForm = {
  url: string;
  selector: string;
  projectId: string;
  width: number;
  height: number;
  sourceFileRelative: string;
  sourceFileAbsolute: string;
  styleCssAbsolute: string;
  imageAbsolute: string;
};

export type ProjectDetection = {
  rootPath: string;
  projectName: string;
  framework: 'nuxt' | 'vue' | 'react' | 'unknown';
  packageManager: 'pnpm' | 'npm' | 'yarn' | 'bun' | 'unknown';
  devScript: string | null;
  entryFiles: Array<{ relative: string; absolute: string }>;
  styleFiles: Array<{ relative: string; absolute: string }>;
};

export type ConversionResult = {
  captureId: string;
  packageDir: string;
  downloadUrl: string;
  nodes: number;
  images: number;
  mappings: number;
  warnings: number;
  editorVerified: false;
};
