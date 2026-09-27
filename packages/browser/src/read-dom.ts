import type { Color, Scene, SceneNode } from "@code-to-figma/contracts";
function resolveName(explicit: string | null, tag: string, ordinal: number) {
  if (explicit !== null) {
    if (
      explicit.length === 0 ||
      explicit.length > 300 ||
      Array.from(explicit).some((character) => character.charCodeAt(0) < 32)
    )
      throw new Error("Invalid explicit layer name");
    return { name: explicit, nameOrigin: "explicit" as const };
  }
  return {
    name: `${tag.toLowerCase()}/${ordinal}`,
    nameOrigin: "inferred" as const,
  };
}

/** Runs inside Chromium; bundled separately to avoid Node runtime dependencies. */
export function readDom(selector: string) {
  const root = document.querySelector(selector);
  if (!(root instanceof HTMLElement))
    throw new Error(`Capture root not found: ${selector}`);
  const nodes: SceneNode[] = [];
  const warnings: Scene["warnings"] = [];
  const images: { id: string; url: string }[] = [];
  const transparent: Color = { r: 0, g: 0, b: 0, a: 0 };
  const number = (value: string) => Number.parseFloat(value) || 0;
  function color(value: string, id: string): Color {
    const match = /^rgba?\(([^)]+)\)$/.exec(value);
    if (!match) {
      if (value !== "transparent")
        warnings.push({
          code: "COLOR",
          nodeId: id,
          message: `Unsupported color: ${value}`,
        });
      return transparent;
    }
    const channels = match[1]!.split(",").map(Number);
    return {
      r: channels[0]! / 255,
      g: channels[1]! / 255,
      b: channels[2]! / 255,
      a: channels[3] ?? 1,
    };
  }
  function visit(
    element: Element,
    parent: { id: string; rect: DOMRect } | null,
    depth: number,
  ) {
    if (nodes.length >= 990 || depth > 90)
      throw new Error("Capture node/depth limit reached");
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const provenance = {
      htmlId: element.getAttribute("id"),
      htmlClass: element.getAttribute("class"),
      sourceId: element.getAttribute("data-source-id"),
      sourceFile: element.getAttribute("data-source-file"),
      sourceComponent: element.getAttribute("data-source-component"),
    };
    const explicitId =
      element.getAttribute("data-figma-id") ?? provenance.sourceId;
    const id =
      explicitId !== null ? `source:${explicitId}` : `node:${nodes.length}`;
    const name = resolveName(
      element.getAttribute("data-figma-name"),
      element.tagName,
      nodes.length,
    );
    const warn = (code: string, message: string) =>
      warnings.push({ code, nodeId: id, message });
    if (!(element instanceof HTMLElement)) {
      warn("ELEMENT", `Unsupported element: ${element.tagName}`);
      return;
    }
    if (
      ["CANVAS", "VIDEO", "IFRAME", "INPUT", "TEXTAREA", "SELECT"].includes(
        element.tagName,
      )
    ) {
      warn("ELEMENT", `No native mapping for ${element.tagName}`);
      return;
    }
    if (
      style.transform !== "none" ||
      style.rotate !== "none" ||
      style.scale !== "none" ||
      style.translate !== "none"
    )
      warn("TRANSFORM", "Transforms are approximated by bounding boxes");
    if (
      style.boxShadow !== "none" ||
      style.filter !== "none" ||
      style.backgroundImage !== "none"
    )
      warn("EFFECT", "Shadow, filter or CSS background image omitted");
    if (
      style.zIndex !== "auto" ||
      style.position === "fixed" ||
      style.position === "sticky"
    )
      warn(
        "STACKING",
        "Stacking/fixed/sticky behavior is captured in DOM order at the current scroll position",
      );
    if (style.mixBlendMode !== "normal" || style.clipPath !== "none")
      warn("COMPOSITING", "Blend mode or clip path omitted");
    if (element.shadowRoot)
      warn("SHADOW_DOM", "Shadow DOM contents are not supported");
    for (const pseudo of ["::before", "::after"]) {
      const content = getComputedStyle(element, pseudo).content;
      if (content !== "none" && content !== "normal" && content !== '""')
        warn("PSEUDO", `${pseudo} content omitted`);
    }
    const borders = [
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth,
    ];
    if (
      new Set(borders).size > 1 ||
      new Set([
        style.borderTopColor,
        style.borderRightColor,
        style.borderBottomColor,
        style.borderLeftColor,
      ]).size > 1
    )
      warn("BORDER", "Unequal borders approximated using the top border");
    if (number(style.borderTopWidth) > 0 && style.borderTopStyle !== "solid")
      warn("BORDER_STYLE", "Non-solid border approximated as solid");
    const radii = [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius,
    ];
    if (new Set(radii).size > 1 || radii.some((value) => /%| /.test(value)))
      warn("RADIUS", "Complex radii approximated using the top-left value");
    const base = {
      ...provenance,
      id,
      parentId: parent?.id ?? null,
      ...name,
      x: parent ? rect.x - parent.rect.x : 0,
      y: parent ? rect.y - parent.rect.y : 0,
      width: rect.width,
      height: rect.height,
      opacity: number(style.opacity),
    };
    const box = {
      fill: color(style.backgroundColor, id),
      border: color(style.borderTopColor, id),
      borderWidth: number(style.borderTopWidth),
      radius: number(style.borderTopLeftRadius),
    };
    if (element instanceof HTMLImageElement) {
      if (!element.complete || element.naturalWidth === 0)
        throw new Error(`Image not loaded: ${name.name}`);
      if (
        number(style.paddingTop) ||
        number(style.paddingLeft) ||
        number(style.paddingRight) ||
        number(style.paddingBottom)
      )
        warn("IMAGE_PADDING", "Image padding is not supported");
      if (style.objectPosition !== "50% 50%")
        warn(
          "IMAGE_POSITION",
          "Image object-position is approximated as centered",
        );
      const assetId = `asset:${images.length}`;
      images.push({ id: assetId, url: element.currentSrc });
      nodes.push({
        ...base,
        ...box,
        kind: "image",
        assetId,
        fit:
          style.objectFit === "contain"
            ? "FIT"
            : style.objectFit === "cover"
              ? "CROP"
              : "FILL",
      });
      return;
    }
    nodes.push({
      ...base,
      ...box,
      kind: "frame",
      clipsContent: ["hidden", "clip", "scroll", "auto"].includes(
        style.overflow,
      ),
    });
    const meaningfulChildren = Array.from(element.children).filter(
      (child) => child.tagName !== "BR",
    );
    if (meaningfulChildren.length === 0 && element.innerText.length > 0) {
      const left = number(style.paddingLeft) + number(style.borderLeftWidth);
      const right = number(style.paddingRight) + number(style.borderRightWidth);
      const top = number(style.paddingTop) + number(style.borderTopWidth);
      const bottom =
        number(style.paddingBottom) + number(style.borderBottomWidth);
      const bold = number(style.fontWeight) >= 600;
      const italic = style.fontStyle === "italic";
      if (![400, 700].includes(number(style.fontWeight)))
        warn("FONT_WEIGHT", "Font weight mapped to Regular or Bold");
      if (style.lineHeight === "normal")
        warn(
          "LINE_HEIGHT",
          "Normal line height approximated as 1.2 times font size",
        );
      if (style.textDecorationLine !== "none" || style.textShadow !== "none")
        warn("TEXT_EFFECT", "Text decoration/shadow omitted");
      const fontFamily = style.fontFamily
        .split(",")[0]!
        .trim()
        .replaceAll('"', "")
        .replaceAll("'", "");
      nodes.push({
        ...provenance,
        id: `text:${id}`,
        parentId: id,
        name: `${name.name}/Text`,
        nameOrigin: "inferred",
        kind: "text",
        x: left,
        y: top,
        width: Math.max(0, rect.width - left - right),
        height: Math.max(0, rect.height - top - bottom),
        opacity: 1,
        text: element.innerText,
        color: color(style.color, id),
        fontFamily,
        fontStyle: bold
          ? italic
            ? "Bold Italic"
            : "Bold"
          : italic
            ? "Italic"
            : "Regular",
        fontSize: number(style.fontSize),
        lineHeight: number(style.lineHeight) || number(style.fontSize) * 1.2,
        letterSpacing: number(style.letterSpacing),
        align:
          style.textAlign === "center"
            ? "CENTER"
            : ["right", "end"].includes(style.textAlign)
              ? "RIGHT"
              : style.textAlign === "justify"
                ? "JUSTIFIED"
                : "LEFT",
      });
    } else {
      if (
        Array.from(element.childNodes).some(
          (child) =>
            child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
        )
      )
        warn(
          "MIXED_TEXT",
          "Direct text mixed with element children omitted; use leaf elements for this prototype",
        );
      for (const child of meaningfulChildren)
        visit(child, { id, rect }, depth + 1);
    }
  }
  visit(root, null, 0);
  return { nodes, warnings, images };
}
