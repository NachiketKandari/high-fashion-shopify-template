"use client";

import { useSyncExternalStore } from "react";

import type { ProductCard } from "@/lib/product/types";

const STORAGE_KEY = "wishlist";
const CHANGE_EVENT = "wishlist-change";
const EMPTY: WishlistItem[] = [];

export interface WishlistItem {
  addedAt: number;
  product: ProductCard;
}

let cache: WishlistItem[] | null = null;

function read(): WishlistItem[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = Array.isArray(parsed) ? (parsed as WishlistItem[]) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(items: WishlistItem[]) {
  cache = items;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(listener: () => void) {
  const onStorage = () => {
    cache = null;
    listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleWishlist(product: ProductCard) {
  const items = read();
  const exists = items.some((item) => item.product.handle === product.handle);
  write(
    exists
      ? items.filter((item) => item.product.handle !== product.handle)
      : [{ addedAt: Date.now(), product }, ...items],
  );
  return !exists;
}

export function useWishlist() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
