import type { ConfirmationOrder, ConfirmationPolicyState } from "@/lib/checkout/types";
import { shopConfig } from "@/lib/config";

export const CONFIRMATION_POLICY_WINDOW_MS = 24 * 60 * 60 * 1000;

const PENDING_FINANCIAL_STATUSES = new Set([
  "AUTHORIZED",
  "EXPIRED",
  "PARTIALLY_PAID",
  "PENDING",
  "VOIDED",
]);

export function getConfirmationPolicyState(
  order: ConfirmationOrder,
  now = Date.now(),
): ConfirmationPolicyState {
  if (PENDING_FINANCIAL_STATUSES.has(order.financialStatus)) return "pending";
  const processedAt = Date.parse(order.processedAt);
  if (!Number.isFinite(processedAt)) return "active";
  return now - processedAt > CONFIRMATION_POLICY_WINDOW_MS ? "expired" : "active";
}

export function getPolicyDeadline(order: ConfirmationOrder): Date {
  return new Date(Date.parse(order.processedAt) + CONFIRMATION_POLICY_WINDOW_MS);
}

export function formatPolicyDeadline(order: ConfirmationOrder): string {
  return new Intl.DateTimeFormat(shopConfig.localization.locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(getPolicyDeadline(order));
}

export function getEstimatedDispatchLabel(order: ConfirmationOrder): string {
  if (order.estimatedDeliveryAt) {
    return new Intl.DateTimeFormat(shopConfig.localization.locale, {
      dateStyle: "medium",
    }).format(new Date(order.estimatedDeliveryAt));
  }
  return order.fulfillmentStatus === "FULFILLED" ? "Dispatched" : "After confirmation";
}

export function getCourierLabel(order: ConfirmationOrder): string {
  return order.tracking?.company ?? "Not assigned yet";
}

export function getPaymentStatusCopy(order: ConfirmationOrder) {
  if (order.financialStatus === "PENDING" || order.financialStatus === "AUTHORIZED") {
    return {
      body: "Your order reference is saved. We are waiting for your bank to confirm the payment.",
      title: "Payment confirmation pending",
    };
  }
  return {
    body: "Your order is confirmed. A receipt has been sent to your email address.",
    title: "Your order has been received",
  };
}

export function buildSupportHref(order: ConfirmationOrder, subject: string): string {
  const params = new URLSearchParams({
    body: `Order reference: ${order.name}\n\n`,
    subject: `${subject} — ${order.name}`,
  });
  return `mailto:${shopConfig.site.contact.email}?${params.toString()}`;
}
