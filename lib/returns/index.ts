import { shopConfig } from "@/lib/config";
import type { Money } from "@/lib/money/types";

import type {
  ExchangeProduct,
  ReturnableItem,
  ReturnContext,
  ReturnRefundMethod,
  ReturnResolution,
  ReturnSelectedOption,
} from "./types";

export const POLICY_RETURN_REASONS = [
  "Fit is not right",
  "Size is too small",
  "Size is too large",
  "Item is not as described",
  "Colour is not as expected",
  "Item arrived damaged or faulty",
  "Wrong item received",
  "Changed my mind",
] as const;

const MAX_CUSTOMER_NOTE_LENGTH = 300;

const ISSUE_REASON_PATTERN = /damag|defect|fault|wrong|not as described|missing|broken/i;

export function formatReturnDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat(shopConfig.localization.locale, { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

export function formatReturnItemOptions(options: ReturnSelectedOption[]): string {
  return options.map((option) => option.value).join(" / ");
}

export function getReturnItemMeta(item: ReturnableItem): string {
  const options = formatReturnItemOptions(item.options);
  return options ? `${options} · Qty ${item.availableQuantity}` : `Qty ${item.availableQuantity}`;
}

export function getOtherItemsSummary(
  context: ReturnContext,
  selectedId: string,
): { count: number; total: Money | null } {
  const others = context.orderLineItems.filter((item) => item.id !== selectedId);
  const currencyCode = others.find((item) => item.totalPrice)?.totalPrice?.currencyCode;
  if (!currencyCode) return { count: others.length, total: null };

  const total = others.reduce(
    (sum, item) =>
      item.totalPrice?.currencyCode === currencyCode ? sum + Number(item.totalPrice.amount) : sum,
    0,
  );
  return { count: others.length, total: { amount: total.toFixed(2), currencyCode } };
}

export function getReturnReasonOptions(item: ReturnableItem): Array<{
  id: string | null;
  label: string;
}> {
  if (item.reasons.length > 0) return item.reasons;
  return POLICY_RETURN_REASONS.map((label) => ({ id: null, label }));
}

export function isIssueReason(reasonLabel: string): boolean {
  return ISSUE_REASON_PATTERN.test(reasonLabel);
}

export function getNonReturnableMessage(reasons: string[]): string | null {
  if (reasons.includes("RETURN_WINDOW_EXPIRED")) {
    return "The return window for this order has expired.";
  }
  if (reasons.includes("FINAL_SALE")) {
    return "One or more items are final sale and cannot be returned.";
  }
  if (reasons.includes("RETURNED")) {
    return "The returnable quantity has already been returned.";
  }
  if (reasons.includes("UNFULFILLED")) {
    return "The order has not been fulfilled yet.";
  }
  if (reasons.includes("OTHER")) {
    return "One or more items are not eligible for return.";
  }
  return null;
}

export function isActiveReturnStatus(status: string): boolean {
  return status === "OPEN" || status === "REQUESTED";
}

export function getReturnStatusLabel(status: string): string {
  switch (status) {
    case "CANCELED":
      return "Canceled";
    case "CLOSED":
      return "Completed";
    case "DECLINED":
      return "Declined";
    case "OPEN":
      return "In progress";
    case "REQUESTED":
      return "Requested";
    default:
      return "Return";
  }
}

export function getRefundMethodLabel(method: ReturnRefundMethod): string {
  return method === "original" ? "Original payment method" : "Account Balance wallet";
}

function appendNotePart(parts: string[], part: string): void {
  if (part.trim()) parts.push(part.trim());
}

export function buildReturnCustomerNote({
  note,
  reasonLabel,
  refundMethod,
  replacementLabel,
  resolution,
}: {
  note?: string;
  reasonLabel: string;
  refundMethod?: ReturnRefundMethod;
  replacementLabel?: string;
  resolution: ReturnResolution;
}): string {
  const parts: string[] = [];
  if (resolution === "exchange") {
    appendNotePart(parts, `Exchange request: ${replacementLabel ?? "replacement to confirm"}.`);
  }
  appendNotePart(parts, `Reason: ${reasonLabel}.`);
  if (resolution === "return" && refundMethod) {
    appendNotePart(parts, `Refund preference: ${getRefundMethodLabel(refundMethod)}.`);
  }
  appendNotePart(parts, note ?? "");

  return parts.join(" ").slice(0, MAX_CUSTOMER_NOTE_LENGTH);
}

export function getInitialExchangeOptions(
  product: ExchangeProduct,
  original: ReturnSelectedOption[],
): Record<string, string> {
  const originalOptions = Object.fromEntries(original.map((option) => [option.name, option.value]));
  const initial: Record<string, string> = {};

  for (const option of product.options) {
    const originalValue = originalOptions[option.name];
    initial[option.name] =
      originalValue && option.values.includes(originalValue)
        ? originalValue
        : (option.values[0] ?? "");
  }

  return initial;
}

export function findExchangeVariant(product: ExchangeProduct, options: Record<string, string>) {
  return product.variants.find((variant) =>
    variant.selectedOptions.every((option) => options[option.name] === option.value),
  );
}

export function isOptionValueAvailable(
  product: ExchangeProduct,
  options: Record<string, string>,
  optionName: string,
  value: string,
): boolean {
  return product.variants.some(
    (variant) =>
      variant.availableForSale &&
      variant.selectedOptions.every((option) =>
        option.name === optionName ? option.value === value : options[option.name] === option.value,
      ),
  );
}

export function getExchangeSelectionLabel(
  product: ExchangeProduct,
  options: Record<string, string>,
): string {
  const variant = findExchangeVariant(product, options);
  if (!variant) return "Select an available combination";

  return product.options
    .map((option) => options[option.name])
    .filter(Boolean)
    .join(" / ");
}
