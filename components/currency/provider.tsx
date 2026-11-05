"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_DISPLAY_CURRENCY,
  type DisplayCurrencyCode,
  formatDisplayPrice,
  isDisplayCurrency,
} from "@/lib/money/display";
import type { Money } from "@/lib/money/types";

const STORAGE_KEY = "ps_display_currency";

interface CurrencyContextValue {
  currency: DisplayCurrencyCode;
  setCurrency: (currency: DisplayCurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrencyCode>(DEFAULT_DISPLAY_CURRENCY);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // Read after mount so the server and client initial markup agree.
      // oxlint-disable-next-line react/set-state-in-effect -- hydrate the saved display currency after mount.
      if (stored && isDisplayCurrency(stored)) setCurrencyState(stored);
    } catch {
      // Storage can be unavailable in private browsing; the store currency remains the default.
    }
  }, []);

  const setCurrency = useCallback((nextCurrency: DisplayCurrencyCode) => {
    setCurrencyState(nextCurrency);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextCurrency);
    } catch {
      // Display conversion still works without persistence.
    }
  }, []);

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}

export function useDisplayPrice() {
  const { currency } = useCurrency();
  return useCallback((money: Money) => formatDisplayPrice(money, currency), [currency]);
}
