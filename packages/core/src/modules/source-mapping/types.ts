/**
 * Shared domain types for the source-mapping module.
 *
 * All types used across writeback, conflict, SFC-AST and CSS modules are
 * defined here so that every collaborator has a single lookup point.
 *
 * Re-exported from the module barrel (index.ts) — do not import from this
 * file directly outside of this module.
 */

/** A single layer-to-source correspondence entry produced by generateSourceMap. */
export type SourceMappingEntry = {
  layerId: string;
  sourceAnchor: string;
  sourceFile: string;
  componentName: string;
  domId: string | null;
  domClass: string | null;
  layerName: string;
  instanceId: string;
  editableProperties: ('text' | 'fill' | 'border' | 'opacity' | 'bounds')[];
  supportsWriteback: boolean;
};

/** The full source-map document written alongside scene.json in a capture package. */
export type SourceMap = {
  schemaVersion: '0.1';
  projectId: string;
  mappings: SourceMappingEntry[];
};
