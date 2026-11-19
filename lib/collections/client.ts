"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { CardDensity, CardView } from "./types";

const STORAGE_KEY = "card-view";
const CHANGE_EVENT = "card-view-change";
const DEFAULT_VIEW: CardView = "model";

const DENSITY_STORAGE_KEY = "card-density";
const DENSITY_CHANGE_EVENT = "card-density-change";
const DEFAULT_DENSITY: CardDensity = "compact";

let cache: CardView | null = null;
let densityCache: CardDensity | null = null;

function isCardView(value: unknown): value is CardView {
  return value === "image" || value === "item" || value === "model";
}

function read(): CardView {
  if (typeof window === "undefined") return DEFAULT_VIEW;
  if (cache) return cache;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    cache = isCardView(stored) ? stored : DEFAULT_VIEW;
  } catch {
    cache = DEFAULT_VIEW;
  }
  return cache;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function getServerSnapshot(): CardView {
  return DEFAULT_VIEW;
}

export function setCardView(view: CardView) {
  cache = view;
  try {
    window.localStorage.setItem(STORAGE_KEY, view);
  } catch {
    // Storage can be unavailable; the attribute below still applies for this page.
  }
  document.documentElement.dataset.cardView = view;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// The view is presentation only: it changes which caption parts render, never the fetched products.
export function useCardView(): CardView {
  const view = useSyncExternalStore(subscribe, read, getServerSnapshot);
  useEffect(() => {
    document.documentElement.dataset.cardView = view;
  }, [view]);
  return view;
}

function isCardDensity(value: unknown): value is CardDensity {
  return value === "compact" || value === "gallery";
}

function readDensity(): CardDensity {
  if (typeof window === "undefined") return DEFAULT_DENSITY;
  if (densityCache) return densityCache;
  try {
    const stored = window.localStorage.getItem(DENSITY_STORAGE_KEY);
    densityCache = isCardDensity(stored) ? stored : DEFAULT_DENSITY;
  } catch {
    densityCache = DEFAULT_DENSITY;
  }
  return densityCache;
}

function subscribeDensity(onChange: () => void) {
  window.addEventListener(DENSITY_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(DENSITY_CHANGE_EVENT, onChange);
}

function getDensityServerSnapshot(): CardDensity {
  return DEFAULT_DENSITY;
}

export function setCardDensity(density: CardDensity) {
  densityCache = density;
  try {
    window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
  } catch {
    // Storage can be unavailable; the attribute below still applies for this page.
  }
  document.documentElement.dataset.cardDensity = density;
  window.dispatchEvent(new Event(DENSITY_CHANGE_EVENT));
}

export function useCardDensity(): CardDensity {
  const density = useSyncExternalStore(subscribeDensity, readDensity, getDensityServerSnapshot);
  useEffect(() => {
    document.documentElement.dataset.cardDensity = density;
  }, [density]);
  return density;
}
