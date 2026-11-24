"use client";

import { useSyncExternalStore } from "react";

import type { Money } from "@/lib/money/types";
import type { ProductCard, SelectedOption } from "@/lib/product/types";
import type { WishlistItem } from "@/lib/wishlist/types";

const EMPTY: WishlistItem[] = [];
const LEGACY_SAVED_AT = new Date(0).toISOString();
const PRODUCT_ID = /^gid:\/\/shopify\/Product\/\d+$/;
const STORAGE_KEY = "wishlist";

let cache: WishlistItem[] | null = null;
const listeners = new Set<() => void>();
let listening = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMoney(value: unknown): value is Money {
  return (
    isRecord(value) && typeof value.amount === "string" && typeof value.currencyCode === "string"
  );
}

function isImage(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.altText === "string" &&
    typeof value.height === "number" &&
    typeof value.url === "string" &&
    typeof value.width === "number"
  );
}

function isOptionGroup(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    Array.isArray(value.values) &&
    value.values.every(
      (optionValue) => isRecord(optionValue) && typeof optionValue.name === "string",
    )
  );
}

function isProductCard(value: unknown): value is ProductCard {
  return (
    isRecord(value) &&
    typeof value.availableForSale === "boolean" &&
    typeof value.handle === "string" &&
    typeof value.id === "string" &&
    value.id.length <= 128 &&
    PRODUCT_ID.test(value.id) &&
    typeof value.isGiftCard === "boolean" &&
    isMoney(value.maxPrice) &&
    isMoney(value.price) &&
    typeof value.title === "string" &&
    (value.compareAtPrice === undefined || isMoney(value.compareAtPrice)) &&
    (value.featuredImage === undefined ||
      value.featuredImage === null ||
      isImage(value.featuredImage)) &&
    (value.hoverImage === undefined || value.hoverImage === null || isImage(value.hoverImage)) &&
    (value.options === undefined ||
      (Array.isArray(value.options) && value.options.every(isOptionGroup))) &&
    (value.productType === undefined || typeof value.productType === "string") &&
    (value.vendor === undefined || typeof value.vendor === "string")
  );
}

function toSelectedOptions(value: unknown): SelectedOption[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap((option) => {
    if (isRecord(option) && typeof option.name === "string" && typeof option.value === "string") {
      return [{ name: option.name, value: option.value }];
    }
    return [];
  });
}

function normalizeStoredItem(value: unknown): WishlistItem[] {
  if (!isRecord(value) || !isProductCard(value.product)) return [];
  const product = value.product;
  return [
    {
      product,
      savedAt: typeof value.savedAt === "string" ? value.savedAt : LEGACY_SAVED_AT,
      selectedOptions:
        toSelectedOptions(value.selectedOptions) ??
        toSelectedOptions(product.defaultVariantSelectedOptions) ??
        [],
    },
  ];
}

function read(): WishlistItem[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  let items = EMPTY;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(parsed)) items = parsed.flatMap(normalizeStoredItem);
  } catch {
    items = EMPTY;
  }
  cache = items;
  return items;
}

function notify() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  cache = null;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!listening) {
    window.addEventListener("storage", onStorage);
    listening = true;
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      listening = false;
    }
  };
}

function write(items: WishlistItem[]) {
  cache = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // The in-memory cache keeps the current tab working when storage is unavailable.
  }
  notify();
}

function isSameProduct(a: ProductCard, b: ProductCard): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (
      JSON.stringify(a[key as keyof ProductCard]) !== JSON.stringify(b[key as keyof ProductCard])
    ) {
      return false;
    }
  }
  return true;
}

export function mergeWishlistProducts(products: ProductCard[], options: { prune?: boolean } = {}) {
  const liveById = new Map(products.map((product) => [product.id, product]));
  const prune = options.prune ?? false;
  let changed = false;
  const merged = read()
    .filter((item) => {
      if (!prune || liveById.has(item.product.id)) return true;
      changed = true;
      return false;
    })
    .map((item) => {
      const live = liveById.get(item.product.id);
      if (!live) return item;
      const product =
        live.options === undefined && item.product.options !== undefined
          ? { ...live, options: item.product.options }
          : live;
      if (isSameProduct(product, item.product)) return item;
      changed = true;
      return { ...item, product };
    });
  if (changed) write(merged);
}

export function removeWishlist(id: string) {
  const items = read();
  const remaining = items.filter((item) => item.product.id !== id);
  if (remaining.length !== items.length) write(remaining);
}

export function toggleWishlist(product: ProductCard) {
  const items = read();
  const exists = items.some((item) => item.product.id === product.id);
  if (exists) {
    write(items.filter((item) => item.product.id !== product.id));
    return;
  }
  write([
    {
      product,
      savedAt: new Date().toISOString(),
      selectedOptions: product.defaultVariantSelectedOptions ?? [],
    },
    ...items,
  ]);
}

export function useIsWishlisted(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => read().some((item) => item.product.id === id),
    () => false,
  );
}

export function useWishlistItems(): WishlistItem[] | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
