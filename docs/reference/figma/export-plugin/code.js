// Runs inside the Figma plugin API, which has no REST quota. Exports every page as the same
// trimmed node shape the specs are written from, so figma-cache.mjs can read it unchanged.
const WEIGHTS = {
  black: 900,
  bold: 700,
  extrabold: 800,
  extralight: 200,
  light: 300,
  medium: 500,
  regular: 400,
  semibold: 600,
  thin: 100,
};

function numeric(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value.unit !== "PERCENT") return value.value;
  return undefined;
}

function paint(fill) {
  if (fill.type === "SOLID") {
    return { color: fill.color, opacity: fill.opacity ?? 1, type: "SOLID" };
  }
  if (fill.type === "IMAGE") {
    return { imageRef: fill.imageHash, scaleMode: fill.scaleMode, type: "IMAGE" };
  }
  return { type: fill.type };
}

function trimNode(node) {
  const out = { id: node.id, name: node.name, type: node.type };
  if (node.absoluteBoundingBox) out.absoluteBoundingBox = node.absoluteBoundingBox;
  for (const key of [
    "counterAxisAlignItems",
    "cornerRadius",
    "itemSpacing",
    "layoutMode",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "primaryAxisAlignItems",
  ]) {
    if (node[key] !== undefined && node[key] !== null) out[key] = node[key];
  }
  if (Array.isArray(node.fills) && node.fills.length) {
    out.fills = node.fills.filter((fill) => fill.visible !== false).map(paint);
  }
  if (Array.isArray(node.strokes) && node.strokes.length) {
    out.strokes = node.strokes.filter((stroke) => stroke.type === "SOLID").map(paint);
    if (node.strokeWeight) out.strokeWeight = node.strokeWeight;
  }
  if (node.type === "TEXT") {
    const font = node.fontName && node.fontName !== figma.mixed ? node.fontName : null;
    out.characters = node.characters;
    out.style = {
      fontFamily: font ? font.family : undefined,
      fontSize: node.fontSize === figma.mixed ? undefined : node.fontSize,
      fontWeight: font
        ? (WEIGHTS[String(font.style).toLowerCase().replace(/\s+/g, "")] ?? 400)
        : undefined,
      letterSpacing: numeric(node.letterSpacing),
      lineHeightPx: numeric(node.lineHeight),
      textAlignHorizontal: node.textAlignHorizontal,
    };
  }
  if ("children" in node) out.children = node.children.map(trimNode);
  return out;
}

const document = {
  exportedAt: new Date().toISOString(),
  file: { name: figma.root.name },
  pages: figma.root.children.map((page) => ({
    children: page.children.map(trimNode),
    id: page.id,
    name: page.name,
  })),
};

figma.showUI(__html__, { height: 300, width: 560 });
figma.ui.postMessage({ payload: JSON.stringify(document), type: "export" });
