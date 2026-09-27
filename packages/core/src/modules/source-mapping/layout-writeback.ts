import type { SourceMappingEntry } from './index';

export type LayoutPadding = number | { top?: number; right?: number; bottom?: number; left?: number };

export type LayoutProps = {
  padding?: LayoutPadding;
  gap?: number;
};

export type LayoutWritebackParams = {
  fileContent: string;
  mappingEntry: SourceMappingEntry;
  layoutProps: LayoutProps;
  expectedSourceHash?: string;
  computeHash?: (content: string) => string;
};

export type LayoutWritebackContentResult = {
  success: boolean;
  updatedContent?: string | undefined;
  previousLayout?: string | undefined;
  updatedLayout?: string | undefined;
  diff?: string | undefined;
  error?: string | undefined;
};

export function formatPaddingCss(padding: LayoutPadding): string {
  if (typeof padding === 'number') {
    return `${padding}px`;
  }
  const top = padding.top ?? 0;
  const right = padding.right ?? 0;
  const bottom = padding.bottom ?? 0;
  const left = padding.left ?? 0;

  if (top === right && right === bottom && bottom === left) {
    return `${top}px`;
  }
  if (top === bottom && right === left) {
    return `${top}px ${right}px`;
  }
  return `${top}px ${right}px ${bottom}px ${left}px`;
}

/**
 * Pure domain logic for controlled layout & spacing writeback (padding, gap) into Vue SFC content string (.vue).
 * Updates or adds inline style attributes (padding, gap) on target SFC element.
 * 0 Node.js/Browser runtime dependencies.
 */
export function applyLayoutWritebackContent(
  params: LayoutWritebackParams
): LayoutWritebackContentResult {
  const { fileContent, mappingEntry, layoutProps, expectedSourceHash, computeHash } = params;

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

  const sourceId = mappingEntry.domId || mappingEntry.layerId.replace(/^(frame:)?(text:)?source:/, '');

  // 2. Locate target element opening tag by data-source-id, data-figma-id, or id
  const openingTagRegex = new RegExp(
    `(<[a-z0-9-]+[^>]*?(?:data-source-id="${sourceId}"|data-figma-id="${sourceId}"|id="${sourceId}")[^>]*?>)`,
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
  const layoutRules: string[] = [];

  if (layoutProps.padding !== undefined) {
    layoutRules.push(`padding: ${formatPaddingCss(layoutProps.padding)}`);
  }
  if (layoutProps.gap !== undefined) {
    layoutRules.push(`gap: ${layoutProps.gap}px`);
  }

  if (layoutRules.length === 0) {
    return {
      success: false,
      error: 'No layout properties provided for writeback',
    };
  }

  const newLayoutCss = layoutRules.join('; ');
  let previousLayout = '';

  // Check if style attribute exists
  const styleAttrRegex = /style=(["'])([\s\S]*?)\1/i;
  const styleMatch = fullOpeningTag.match(styleAttrRegex);

  if (styleMatch) {
    const quote = styleMatch[1]!;
    let currentStyleContent = styleMatch[2]!;

    for (const rule of layoutRules) {
      const [propName, propValue] = rule.split(':').map(s => s.trim());
      const propRegex = new RegExp(`(${propName}\\s*:\\s*)([^;]+)`, 'i');
      if (propRegex.test(currentStyleContent)) {
        const propMatch = currentStyleContent.match(propRegex);
        if (propMatch) previousLayout += (previousLayout ? '; ' : '') + `${propName}: ${propMatch[2]!.trim()}`;
        currentStyleContent = currentStyleContent.replace(propRegex, `$1${propValue}`);
      } else {
        const separator = currentStyleContent.trim().length === 0 ? '' : currentStyleContent.trim().endsWith(';') ? ' ' : '; ';
        currentStyleContent = `${currentStyleContent}${separator}${propName}: ${propValue};`;
      }
    }

    updatedOpeningTag = fullOpeningTag.replace(styleAttrRegex, `style=${quote}${currentStyleContent}${quote}`);
  } else {
    // Insert new style attribute before tag closing '>'
    const insertStyleAttr = ` style="${newLayoutCss};"`;
    if (fullOpeningTag.endsWith('/>')) {
      updatedOpeningTag = fullOpeningTag.slice(0, -2) + insertStyleAttr + ' />';
    } else {
      updatedOpeningTag = fullOpeningTag.slice(0, -1) + insertStyleAttr + '>';
    }
  }

  const updatedContent = fileContent.replace(fullOpeningTag, updatedOpeningTag);
  const diff = `- ${previousLayout || '(none)'}\n+ ${newLayoutCss}`;

  return {
    success: true,
    updatedContent,
    previousLayout: previousLayout || undefined,
    updatedLayout: newLayoutCss,
    diff,
  };
}
