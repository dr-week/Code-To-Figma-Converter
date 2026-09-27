export type ConversionRequest = {
  url: string;
  selector: string;
  projectId: string;
  width: number;
  height: number;
  sourceFileRelative?: string;
  sourceFileAbsolute?: string;
  styleCssAbsolute?: string;
  imageAbsolute?: string;
};

export type ConversionResponse = {
  captureId: string;
  packageDir: string;
  downloadUrl: string;
  nodes: number;
  images: number;
  mappings: number;
  warnings: number;
  editorVerified: false;
};
