import type { Money } from "@/lib/money/types";

// Store-currency threshold. Update it when the pricing model changes.
export const FREE_SHIPPING_THRESHOLD = 50_000;

export function getFreeShippingStatus(
  subtotal: string,
  currencyCode: string,
  format: (money: Money) => string,
) {
  const value = Number(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - value);
  return {
    message:
      remaining === 0
        ? "Congratulations! You qualify for free shipping."
        : `You're ${format({ amount: remaining.toFixed(2), currencyCode })} away from free shipping.`,
    progress: Math.min(100, (value / FREE_SHIPPING_THRESHOLD) * 100),
    remaining,
  };
}
