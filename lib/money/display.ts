import { formatPrice } from "@/lib/money";
import type { Money } from "@/lib/money/types";

// Display-only rates, relative to the store's USD prices. INR is the 5 November
// 2026 rate, 94.620171, rounded down to two decimals.
export const DISPLAY_CURRENCIES = [
  { code: "USD", name: "US Dollar", rate: 1 },
  { code: "INR", name: "Indian Rupee", rate: 94.62 },
] as const;

export type DisplayCurrencyCode = (typeof DISPLAY_CURRENCIES)[number]["code"];

export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrencyCode = "USD";

export function isDisplayCurrency(value: string): value is DisplayCurrencyCode {
  return DISPLAY_CURRENCIES.some((currency) => currency.code === value);
}

export function convertMoney(money: Money, displayCurrency: DisplayCurrencyCode): Money {
  const source = DISPLAY_CURRENCIES.find((currency) => currency.code === money.currencyCode);
  const target = DISPLAY_CURRENCIES.find((currency) => currency.code === displayCurrency);
  if (!source || !target || source.code === target.code) return money;

  const amountInUsd = Number(money.amount) / source.rate;
  return {
    amount: (amountInUsd * target.rate).toFixed(2),
    currencyCode: target.code,
  };
}

export function formatDisplayPrice(money: Money, displayCurrency: DisplayCurrencyCode): string {
  return formatPrice(convertMoney(money, displayCurrency));
}
