import { formatPrice } from "@/lib/money";
import type { Money } from "@/lib/money/types";

// The store is INR-only. The conversion helpers remain for a future
// multi-currency decision; do not expose a second display currency without
// reproducing the reference's "charged in INR at checkout" note.
export const DISPLAY_CURRENCIES = [{ code: "INR", name: "Indian Rupee", rate: 1 }] as const;

export type DisplayCurrencyCode = (typeof DISPLAY_CURRENCIES)[number]["code"];

export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrencyCode = "INR";

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
