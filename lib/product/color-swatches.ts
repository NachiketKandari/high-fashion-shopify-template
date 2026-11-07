// The reference theme maps colour names to flat swatches; Shopify exposes no swatch value for these products.
const COLOR_SWATCHES: Record<string, string> = {
  ALMOND: "#F2F1E8",
  ASH: "#BCBCBC",
  BEIGE: "#E8D7C8",
  "BEIGE GOLD": "#C8A96A",
  BERRY: "#9a9a9a",
  BLACK: "#000000",
  BLUE: "#005BD3",
  "BLUE HOUNDSTOOTH": "#DCEDF8",
  "BLUE KNIT": "#466A97",
  BROWN: "#4e3628",
  "BURNT ORANGE": "#BB5F26",
  BUTTERSCOTCH: "#FEE5C2",
  "BUTTER YELLOW": "#F5E6A8",
  CERULEAN: "#0189E8",
  CHARCOAL: "#4a4a4a",
  CLOUD: "#CEE1F4",
  COCOA: "#2E2E2E",
  CORTADO: "#7E614F",
  CREME: "#FCF8EB",
  "DARK ASH": "#787276",
  "DARK DENIM": "#35485E",
  "DARK GREEN": "#3A645F",
  DENIM: "#5B7695",
  ECRU: "#EAE7E3",
  GREEN: "#688660",
  GREY: "#9a9a9a",
  "INDIGO BLUE": "#9a9a9a",
  "INK BLUE": "#1B2436",
  "JET BLACK": "#0A0A0A",
  "KHAKI BROWN": "#523C1B",
  "LEHERIYA BLUE": "#93C3C8",
  "LEMON YELLOW": "#F3E5A0",
  "LIGHT BLUE": "#CEE1F4",
  LIMON: "#F3F7E0",
  MERLOT: "#3F0711",
  MOSS: "#76863B",
  NAVY: "#1F4573",
  "OAK BROWN": "#684D45",
  OAT: "#DEC9A8",
  "OFF WHITE": "#F5F2EA",
  OLIVE: "#636B2F",
  "ONION PINK": "#D9A6A0",
  ORANGE: "#e6742a",
  PINK: "#FFC0CB",
  "POWDER BLUE": "#BFD4E6",
  "LOREM BLUE": "#005BD3",
  PURPLE: "#5b3a6e",
  RED: "#C1323C",
  "RED KNIT": "#B24A49",
  TAUPE: "#7C6B5F",
  TEAL: "#2F6F6A",
  "TOASTED OAT": "#DEC0A1",
  "TUXEDO BLACK": "#9a9a9a",
  VANILLA: "#F2E7CA",
  WHITE: "#FFFFFF",
  WINE: "#5C1F26",
};

export function getColorSwatch(name: string): string | undefined {
  const normalized = name.trim().toUpperCase();
  const exact = COLOR_SWATCHES[normalized];
  if (exact) return exact;

  // Combined and reversible names ("BLUE & WHITE", "TEAL / BROWN (REVERSIBLE)") use their first known colour.
  for (const token of normalized.split(/[/&,+]/)) {
    const match = COLOR_SWATCHES[token.replace(/\(.*?\)/g, "").trim()];
    if (match) return match;
  }
  return undefined;
}
