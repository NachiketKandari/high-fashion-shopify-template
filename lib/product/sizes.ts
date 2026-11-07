const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"] as const;

function tokenRank(token: string): number {
  const normalized = token.trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(normalized as (typeof SIZE_ORDER)[number]);
  if (index >= 0) return index;
  const numeric = Number.parseFloat(normalized);
  return Number.isFinite(numeric) ? SIZE_ORDER.length + numeric : Number.POSITIVE_INFINITY;
}

function compareTokens(a: string, b: string): number {
  const rankA = tokenRank(a);
  const rankB = tokenRank(b);
  if (rankA === rankB) return 0;
  if (rankA === Number.POSITIVE_INFINITY) return 1;
  if (rankB === Number.POSITIVE_INFINITY) return -1;
  return rankA - rankB;
}

export function compareSizeNames(a: string, b: string): number {
  const partsA = a.split(/[/-]/);
  const partsB = b.split(/[/-]/);
  const length = Math.max(partsA.length, partsB.length);
  for (let index = 0; index < length; index += 1) {
    const result = compareTokens(partsA[index] ?? "", partsB[index] ?? "");
    if (result !== 0) return result;
  }
  return 0;
}

export function isSizeOption(name: string): boolean {
  return name.toLowerCase().includes("size");
}

// Shopify preserves admin order; this keeps XS before S even when the option values were entered out of order.
export function sortSizeValues<T extends { name: string }>(values: readonly T[]): T[] {
  return values
    .map((value, index) => ({ index, value }))
    .sort((a, b) => compareSizeNames(a.value.name, b.value.name) || a.index - b.index)
    .map(({ value }) => value);
}
