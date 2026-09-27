import type { Color } from '@code-to-figma/contracts';
import type { SourceMappingEntry } from './index';

export type ColorWritebackParams = {
  fileContent: string;
  mappingEntry: SourceMappingEntry;
  newFillColor: Color;
  targetProperty?: 'background-color' | 'color' | 'background';
  expectedSourceHash?: string;
  computeHash?: (content: string) => string;
};

export type ColorWritebackContentResult = {
  success: boolean;
  updatedContent?: string;
  previousColor?: string;
  updatedColor?: string;
  diff?: string;
  error?: string;
};

export function colorToHexOrRgba(color: Color): string {
  const r = Math.round(Math.max(0, Math.min(1, color.r)) * 255);
  const g = Math.round(Math.max(0, Math.min(1, color.g)) * 255);
  const b = Math.round(Math.max(0, Math.min(1, color.b)) * 255);
  const a = Math.max(0, Math.min(1, color.a));

  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`;
  }
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Pure domain logic for controlled solid fill color writeback into Vue SFC content string (.vue).
 * Updates or adds inline style attributes (background-color or color) on target SFC element.
 * 0 Node.js/Browser runtime dependencies.
 */
export function applyColorWritebackContent(
  params: ColorWritebackParams
): ColorWritebackContentResult {
  const { fileContent, mappingEntry, newFillColor, targetProperty, expectedSourceHash, computeHash } = params;

  // 1. Hash Validation
  if (expectedSourceHash && computeHash) {
    const currentHash = computeHash(fileContent);
    if (currentHash !== expectedSourceHash) {
      return {
        success: false,
        error: `Source hash mismatch (Expected ${expectedSourceHash.slice(0, 8)}, got ${currentHash.slice(0, 8)}). File was modified out-of-band.`,
      };
    }
  }

  const sourceId = mappingEntry.domId || mappingEntry.layerId.replace(/^(text:)?source:/, '');
  const isText = mappingEntry.layerId.startsWith('text:') || mappingEntry.layerName.endsWith('/Text');
  const cssProp = targetProperty ?? (isText ? 'color' : 'background-color');
  const newColorStr = colorToHexOrRgba(newFillColor);

  // 2. Locate target element opening tag by data-source-id or data-figma-id
  const openingTagRegex = new RegExp(
    `(<[a-z0-9-]+[^>]*?(?:data-source-id="${sourceId}"|data-figma-id="${sourceId}")[^>]*?>)`,
    'i'
  );

  const match = fileContent.match(openingTagRegex);
  if (!match) {
    return {
      success: false,
      error: `Could not anchor target element with sourceId '${sourceId}' in component template`,
    };
  }

  const fullOpeningTag = match[0]!;
  let updatedOpeningTag: string;
  let previousColor = 'transparent';

  // Check if style attribute exists
  const styleAttrRegex = /style=(["'])([\s\S]*?)\1/i;
  const styleMatch = fullOpeningTag.match(styleAttrRegex);

  if (styleMatch) {
    const quote = styleMatch[1]!;
    const currentStyleContent = styleMatch[2]!;

    // Check if the css property is already inside style
    const propRegex = new RegExp(`(${cssProp}\\s*:\\s*)([^;]+)`, 'i');
    if (propRegex.test(currentStyleContent)) {
      const propMatch = currentStyleContent.match(propRegex);
      if (propMatch) previousColor = propMatch[2]!.trim();
      const updatedStyleContent = currentStyleContent.replace(propRegex, `$1${newColorStr}`);
      updatedOpeningTag = fullOpeningTag.replace(styleAttrRegex, `style=${quote}${updatedStyleContent}${quote}`);
    } else {
      const separator = currentStyleContent.trim().endsWith(';') || currentStyleContent.trim().length === 0 ? '' : '; ';
      const updatedStyleContent = `${currentStyleContent}${separator}${cssProp}: ${newColorStr};`;
      updatedOpeningTag = fullOpeningTag.replace(styleAttrRegex, `style=${quote}${updatedStyleContent}${quote}`);
    }
  } else {
    // Insert new style attribute before tag closing '>'
    const closeIndex = fullOpeningTag.lastIndexOf('>');
    const isSelfClosing = fullOpeningTag.endsWith('/>');
    const insertPos = isSelfClosing ? fullOpeningTag.length - 2 : closeIndex;

    const beforeClose = fullOpeningTag.slice(0, insertPos).trimEnd();
    const afterClose = fullOpeningTag.slice(insertPos);

    updatedOpeningTag = `${beforeClose} style="${cssProp}: ${newColorStr};"${afterClose}`;
  }

  const updatedContent = fileContent.replace(fullOpeningTag, updatedOpeningTag);
  const diff = `- ${cssProp}: ${previousColor}\n+ ${cssProp}: ${newColorStr}`;

  return {
    success: true,
    updatedContent,
    previousColor,
    updatedColor: newColorStr,
    diff,
  };
}
