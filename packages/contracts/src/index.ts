import { z } from "zod";

const coordinate = z.number().finite().min(-100000).max(100000);
const dimension = z.number().finite().min(0).max(10000);
export const colorSchema = z
  .object({
    r: z.number().min(0).max(1),
    g: z.number().min(0).max(1),
    b: z.number().min(0).max(1),
    a: z.number().min(0).max(1),
  })
  .strict();
const base = {
  id: z.string().min(1).max(200),
  parentId: z.string().nullable(),
  name: z
    .string()
    .min(1)
    .max(300)
    .refine(
      (value) =>
        Array.from(value).every((character) => character.charCodeAt(0) >= 32),
      "Control characters are not allowed",
    ),
  nameOrigin: z.enum(["explicit", "inferred"]),
  x: coordinate,
  y: coordinate,
  width: dimension,
  height: dimension,
  opacity: z.number().min(0).max(1),
  htmlId: z.string().max(1000).nullable().optional(),
  htmlClass: z.string().max(10000).nullable().optional(),
  sourceId: z.string().max(1000).nullable().optional(),
  sourceFile: z.string().max(2000).nullable().optional(),
  sourceComponent: z.string().max(300).nullable().optional(),
};
const box = {
  fill: colorSchema,
  border: colorSchema,
  borderWidth: z.number().min(0).max(100),
  radius: z.number().min(0).max(10000),
};
export const nodeSchema = z.discriminatedUnion("kind", [
  z
    .object({
      ...base,
      ...box,
      kind: z.literal("frame"),
      clipsContent: z.boolean(),
    })
    .strict(),
  z
    .object({
      ...base,
      ...box,
      kind: z.literal("image"),
      assetId: z.string(),
      fit: z.enum(["FILL", "FIT", "CROP"]),
    })
    .strict(),
  z
    .object({
      ...base,
      kind: z.literal("text"),
      text: z.string().max(100000),
      color: colorSchema,
      fontFamily: z.string().min(1).max(100),
      fontStyle: z.enum(["Regular", "Bold", "Italic", "Bold Italic"]),
      fontSize: z.number().positive().max(500),
      lineHeight: z.number().positive().max(1000),
      letterSpacing: z.number().min(-100).max(100),
      align: z.enum(["LEFT", "CENTER", "RIGHT", "JUSTIFIED"]),
    })
    .strict(),
]);
export const warningSchema = z
  .object({ code: z.string(), nodeId: z.string(), message: z.string() })
  .strict();
export const sceneSchema = z
  .object({
    schemaVersion: z.literal("0.1"),
    source: z
      .object({
        projectId: z.string(),
        route: z.string(),
        viewport: z.object({ width: dimension, height: dimension }).strict(),
      })
      .strict(),
    nodes: z.array(nodeSchema).min(1).max(1000),
    assets: z
      .array(
        z
          .object({
            id: z.string(),
            bytes: z
              .array(z.number().int().min(0).max(255))
              .min(8)
              .max(2_000_000),
          })
          .strict(),
      )
      .max(50),
    warnings: z.array(warningSchema).max(10000),
  })
  .strict();

export type Scene = z.infer<typeof sceneSchema>;
export type SceneNode = z.infer<typeof nodeSchema>;
export type Color = z.infer<typeof colorSchema>;
export type ConversionWarning = z.infer<typeof warningSchema>;

export function parseScene(input: unknown): Scene {
  const scene = sceneSchema.parse(input);
  const seen = new Map<string, SceneNode>();
  const depths = new Map<string, number>();
  const assets = new Set<string>();
  let byteCount = 0;
  for (const asset of scene.assets) {
    if (assets.has(asset.id)) throw new Error(`Duplicate asset: ${asset.id}`);
    assets.add(asset.id);
    byteCount += asset.bytes.length;
  }
  if (byteCount > 4_000_000)
    throw new Error("Scene exceeds 4 MB of image bytes");
  for (const [index, node] of scene.nodes.entries()) {
    if (seen.has(node.id)) throw new Error(`Duplicate node: ${node.id}`);
    if (index === 0) {
      if (
        node.parentId !== null ||
        node.kind !== "frame" ||
        node.x !== 0 ||
        node.y !== 0
      )
        throw new Error("First node must be a frame at the origin");
    } else if (
      node.parentId === null ||
      seen.get(node.parentId)?.kind !== "frame"
    ) {
      throw new Error(`Parent must be an earlier frame: ${node.id}`);
    }
    const depth =
      node.parentId === null ? 0 : (depths.get(node.parentId) ?? 0) + 1;
    if (depth > 100) throw new Error("Scene exceeds depth 100");
    depths.set(node.id, depth);
    if (node.kind === "image" && !assets.has(node.assetId))
      throw new Error(`Missing image asset: ${node.assetId}`);
    seen.set(node.id, node);
  }
  return scene;
}

export function parseSceneJson(text: string): Scene {
  if (text.length > 16_000_000) throw new Error("Scene JSON exceeds 16 MB");
  return parseScene(JSON.parse(text) as unknown);
}
