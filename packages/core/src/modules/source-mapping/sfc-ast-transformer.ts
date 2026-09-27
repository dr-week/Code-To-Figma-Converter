export type SfcAttributeAst = {
  name: string;
  value: string | null;
  raw: string;
  start: number;
  end: number;
};

export type SfcElementAstNode = {
  tagName: string;
  attributes: Map<string, SfcAttributeAst>;
  rawAttributes: string;
  startOffset: number;
  endOffset: number;
  openTagEndOffset: number;
  closeTagStartOffset: number;
  innerText: string;
};

export type VueSfcSections = {
  templateContent: string | null;
  templateStart: number;
  templateEnd: number;
  scriptContent: string | null;
  styleContent: string | null;
};

/**
 * Pure Domain AST Parser for Vue SFC Files:
 * Extracts top-level SFC blocks (<template>, <script>, <style>) and template element AST nodes.
 */
export function parseVueSfcSections(fileContent: string): VueSfcSections {
  const templateMatch = /<template[\s>]/i.exec(fileContent);
  const templateEndMatch = /<\/template>/i.exec(fileContent);

  const scriptMatch = /<script[\s>]/i.exec(fileContent);
  const styleMatch = /<style[\s>]/i.exec(fileContent);

  return {
    templateContent: templateMatch && templateEndMatch ? fileContent.slice(templateMatch.index, templateEndMatch.index + 11) : null,
    templateStart: templateMatch ? templateMatch.index : -1,
    templateEnd: templateEndMatch ? templateEndMatch.index + 11 : -1,
    scriptContent: scriptMatch ? fileContent.slice(scriptMatch.index) : null,
    styleContent: styleMatch ? fileContent.slice(styleMatch.index) : null,
  };
}

/**
 * Parses element attributes into structured AST records.
 */
export function parseAttributesAst(rawAttrs: string, baseOffset: number): Map<string, SfcAttributeAst> {
  const map = new Map<string, SfcAttributeAst>();
  const attrRegex = /([:\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const attrName = match[1]!;
    const attrValue = match[2] ?? match[3] ?? match[4] ?? null;
    const start = baseOffset + match.index;
    const end = start + match[0].length;

    map.set(attrName, {
      name: attrName,
      value: attrValue,
      raw: match[0],
      start,
      end,
    });
  }

  return map;
}

/**
 * Locates an element in Vue SFC source by target ID (`data-source-id`, `data-figma-id`, or `id`).
 *
 * **Known limitation — nested same-tag elements:**
 * The closing tag is located with `String.indexOf(closeTagString, openTagEndOffset)`, which
 * returns the FIRST occurrence of `</tagName>` after the opening tag. For a template like:
 *
 * ```vue
 * <div data-source-id="card">
 *   <div>Inner content</div>   ← first </div> found here
 *   Footer text
 * </div>
 * ```
 *
 * The function will identify the inner `</div>` as the card's closing tag, producing a
 * truncated innerText and incorrect endOffset. Callers that rely on these offsets for
 * text replacement will corrupt the file when the target element contains a child of the
 * same tag.
 *
 * Safe cases: target element does not contain direct children of the same HTML tag.
 * Unsafe cases: any nested `<div>` inside `<div>`, `<span>` inside `<span>`, etc.
 *
 * A future implementation should use `@vue/compiler-dom` for correct offset resolution.
 */
export function findSfcElementBySourceId(fileContent: string, targetId: string): SfcElementAstNode | null {
  const escapedTargetId = targetId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const openTagRegex = new RegExp(`<([a-zA-Z0-9-]+)\\s+([^>]*?(?:data-source-id|data-figma-id|id)=["']${escapedTargetId}["'][^>]*?)>`, 'i');

  const match = openTagRegex.exec(fileContent);
  if (!match) return null;

  const tagName = match[1]!;
  const rawAttrs = match[2]!;
  const startOffset = match.index;
  const openTagEndOffset = startOffset + match[0].length;

  const closeTagString = `</${tagName}>`;
  // LIMITATION: returns the first </tagName> after the opening tag, not the matching one.
  // Incorrect for nested same-tag elements. See docstring above.
  const closeTagIndex = fileContent.indexOf(closeTagString, openTagEndOffset);
  const closeTagStartOffset = closeTagIndex !== -1 ? closeTagIndex : openTagEndOffset;
  const endOffset = closeTagIndex !== -1 ? closeTagIndex + closeTagString.length : openTagEndOffset;
  const innerText = fileContent.slice(openTagEndOffset, closeTagStartOffset);


  const attrs = parseAttributesAst(rawAttrs, startOffset + tagName.length + 1);

  return {
    tagName,
    attributes: attrs,
    rawAttributes: rawAttrs,
    startOffset,
    endOffset,
    openTagEndOffset,
    closeTagStartOffset,
    innerText,
  };
}

export type SfcTextUpdateResult = {
  success: boolean;
  updatedContent?: string | undefined;
  previousText?: string | undefined;
  error?: string | undefined;
};

export type SfcStyleUpdateResult = {
  success: boolean;
  updatedContent?: string | undefined;
  previousStyle?: string | undefined;
  error?: string | undefined;
};

/**
 * Pure Domain AST Mutation Engine: Text Update
 */
export function applySfcAstTextUpdate(
  fileContent: string,
  targetId: string,
  newText: string
): SfcTextUpdateResult {
  const astNode = findSfcElementBySourceId(fileContent, targetId);

  if (!astNode) {
    return {
      success: false,
      error: `AST Node with source target ID '${targetId}' not found in Vue SFC template.`,
    };
  }

  const previousText = astNode.innerText;
  const updatedContent =
    fileContent.slice(0, astNode.openTagEndOffset) +
    newText +
    fileContent.slice(astNode.closeTagStartOffset);

  return {
    success: true,
    updatedContent,
    previousText,
  };
}

/**
 * Pure Domain AST Mutation Engine: Inline Style Property Updates (Color, Padding, Gap)
 */
export function applySfcAstStyleUpdate(
  fileContent: string,
  targetId: string,
  styleProperties: Record<string, string>
): SfcStyleUpdateResult {
  const astNode = findSfcElementBySourceId(fileContent, targetId);

  if (!astNode) {
    return {
      success: false,
      error: `AST Node with source target ID '${targetId}' not found in Vue SFC template.`,
    };
  }

  const existingStyleAttr = astNode.attributes.get('style');
  let newStyleContent: string;

  if (existingStyleAttr && existingStyleAttr.value) {
    const declarations = existingStyleAttr.value
      .split(';')
      .map(d => d.trim())
      .filter(Boolean);

    const propMap = new Map<string, string>();
    for (const dec of declarations) {
      const parts = dec.split(':');
      if (parts.length >= 2) {
        propMap.set(parts[0]!.trim(), parts.slice(1).join(':').trim());
      }
    }

    for (const [key, val] of Object.entries(styleProperties)) {
      propMap.set(key, val);
    }

    newStyleContent =
      Array.from(propMap.entries())
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ') + ';';
  } else {
    newStyleContent =
      Object.entries(styleProperties)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ') + ';';
  }

  let updatedContent: string;

  if (existingStyleAttr) {
    updatedContent =
      fileContent.slice(0, existingStyleAttr.start) +
      `style="${newStyleContent}"` +
      fileContent.slice(existingStyleAttr.end);
  } else {
    // Insert style attribute inside open tag right before closing >
    const insertOffset = astNode.openTagEndOffset - 1;
    updatedContent =
      fileContent.slice(0, insertOffset) +
      ` style="${newStyleContent}"` +
      fileContent.slice(insertOffset);
  }

  return {
    success: true,
    updatedContent,
    previousStyle: existingStyleAttr?.value ?? undefined,
  };
}
