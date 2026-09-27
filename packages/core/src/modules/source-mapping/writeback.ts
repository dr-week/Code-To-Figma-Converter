import type { SourceMappingEntry } from './index';

export type TextWritebackParams = {
  fileContent: string;
  mappingEntry: SourceMappingEntry;
  newText: string;
  expectedSourceHash?: string;
  computeHash?: (content: string) => string;
};

export type TextWritebackContentResult = {
  success: boolean;
  updatedContent?: string;
  previousText?: string;
  updatedText?: string;
  diff?: string;
  error?: string;
};

/**
 * Pure domain logic for controlled text writeback into a Vue 3 SFC component string (.vue).
 * Enforces hash validation, dynamic binding rejection (`{{ ... }}`), and formatted string replacement.
 * Pure and environment-agnostic (0 Node.js/Browser runtime dependencies).
 */
export function applyTextWritebackContent(
  params: TextWritebackParams
): TextWritebackContentResult {
  const { fileContent, mappingEntry, newText, expectedSourceHash, computeHash } = params;

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

  // Extract sourceId from mapping entry
  const sourceId = mappingEntry.domId || mappingEntry.layerId.replace(/^(text:)?source:/, '');

  // 2. Locate element in Vue template by data-source-id or data-figma-id
  const targetAttrRegex = new RegExp(
    `(data-source-id="${sourceId}"|data-figma-id="${sourceId}"|id="${sourceId}")([^>]*>)([\\s\\S]*?)(<\\/[a-z0-9]+>)`,
    'i'
  );

  const match = fileContent.match(targetAttrRegex);
  if (!match) {
    return {
      success: false,
      error: `Could not anchor target element with sourceId '${sourceId}' in component template`,
    };
  }

  const fullMatch = match[0];
  const openingAttr = match[1];
  const tagClose = match[2];
  const currentInnerContent = match[3] ?? '';
  const closingTag = match[4];

  // 3. Reject dynamic Vue interpolation {{ ... }}
  if (/\{\{[\s\S]*?\}\}/.test(currentInnerContent)) {
    return {
      success: false,
      error: `Dynamic template binding detected inside target node '${sourceId}'. Controlled writeback supports static literal text only.`,
    };
  }

  // Format new text for template (preserving <br /> if replacing multiline text with newlines)
  const formattedNewText = newText.includes('\n')
    ? newText.replace(/\n/g, '<br />')
    : newText;

  const updatedElementBlock = `${openingAttr}${tagClose}${formattedNewText}${closingTag}`;
  const updatedContent = fileContent.replace(fullMatch, updatedElementBlock);
  const diff = `- ${currentInnerContent}\n+ ${formattedNewText}`;

  return {
    success: true,
    updatedContent,
    previousText: currentInnerContent,
    updatedText: formattedNewText,
    diff,
  };
}
