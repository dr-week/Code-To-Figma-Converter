export type CssRuleUpdateParams = {
  fileContent: string;
  className: string;
  cssProperties: Record<string, string>;
};

export type CssRuleUpdateResult = {
  success: boolean;
  updatedContent?: string | undefined;
  previousRule?: string | undefined;
  error?: string | undefined;
};

/**
 * Pure Domain Scoped CSS & <style> Block Writeback Engine:
 * Updates or appends CSS declarations inside Vue SFC <style> / <style scoped> blocks
 * matching class selectors.
 */
export function applySfcCssRuleUpdate(params: CssRuleUpdateParams): CssRuleUpdateResult {
  const { fileContent, className, cssProperties } = params;

  const normalizedClass = className.startsWith('.') ? className.slice(1) : className;
  const selectorPattern = new RegExp(`(\\.${normalizedClass}\\s*\\{)([\\s\\S]*?)(\\})`, 'g');

  const styleOpenMatch = /<style[^>]*>/i.exec(fileContent);
  const styleCloseMatch = /<\/style>/i.exec(fileContent);

  if (!styleOpenMatch || !styleCloseMatch || styleCloseMatch.index <= styleOpenMatch.index) {
    return {
      success: false,
      error: `No valid <style> block found in Vue SFC file.`,
    };
  }

  const styleBlockStart = styleOpenMatch.index + styleOpenMatch[0].length;
  const styleBlockEnd = styleCloseMatch.index;
  const styleContent = fileContent.slice(styleBlockStart, styleBlockEnd);

  const ruleMatch = selectorPattern.exec(styleContent);

  if (ruleMatch) {
    const fullRule = ruleMatch[0];
    const rulePrefix = ruleMatch[1]!;
    const declarationsText = ruleMatch[2]!;
    const ruleSuffix = ruleMatch[3]!;

    const propMap = new Map<string, string>();
    const decLines = declarationsText.split(';').map(l => l.trim()).filter(Boolean);

    for (const dec of decLines) {
      const parts = dec.split(':');
      if (parts.length >= 2) {
        propMap.set(parts[0]!.trim(), parts.slice(1).join(':').trim());
      }
    }

    for (const [k, v] of Object.entries(cssProperties)) {
      propMap.set(k, v);
    }

    const updatedDeclarations = Array.from(propMap.entries())
      .map(([k, v]) => `\n  ${k}: ${v};`)
      .join('') + '\n';

    const updatedRule = `${rulePrefix}${updatedDeclarations}${ruleSuffix}`;

    const updatedStyleContent =
      styleContent.slice(0, ruleMatch.index) +
      updatedRule +
      styleContent.slice(ruleMatch.index + fullRule.length);

    const updatedContent =
      fileContent.slice(0, styleBlockStart) +
      updatedStyleContent +
      fileContent.slice(styleBlockEnd);

    return {
      success: true,
      updatedContent,
      previousRule: fullRule,
    };
  }

  // If CSS rule does not exist in <style> block, append it before </style>
  const newRuleDeclarations = Object.entries(cssProperties)
    .map(([k, v]) => `\n  ${k}: ${v};`)
    .join('') + '\n';

  const newRule = `\n.${normalizedClass} {${newRuleDeclarations}}\n`;

  const updatedContent =
    fileContent.slice(0, styleBlockEnd) +
    newRule +
    fileContent.slice(styleBlockEnd);

  return {
    success: true,
    updatedContent,
  };
}
