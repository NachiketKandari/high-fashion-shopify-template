import { shopConfig } from "@/lib/config";
import { formatPrice } from "@/lib/money";

import type {
  CustomerAddress,
  CustomerMarketingState,
  CustomerOrderSummary,
  CustomerStoreCreditTransaction,
} from "./types";

const OPEN_RETURN_STATUSES = new Set(["OPEN", "REQUESTED"]);

const ORDER_STATUS_LABELS: Record<string, string> = {
  FULFILLED: "Fulfilled",
  IN_PROGRESS: "Preparing",
  ON_HOLD: "On hold",
  OPEN: "Preparing",
  PARTIALLY_FULFILLED: "Partially fulfilled",
  PENDING_FULFILLMENT: "Preparing",
  READY_FOR_DELIVERY: "Ready for delivery",
  READY_FOR_PICKUP: "Ready for pickup",
  RESTOCKED: "Restocked",
  SCHEDULED: "Scheduled",
  UNFULFILLED: "Preparing",
};

const RETURN_STATUS_LABELS: Record<string, string> = {
  CANCELED: "Return canceled",
  CLOSED: "Return completed",
  DECLINED: "Return declined",
  OPEN: "Return in progress",
  REQUESTED: "Return requested",
};

const TRANSACTION_EVENT_LABELS: Record<string, string> = {
  ADJUSTMENT: "Account adjustment",
  ORDER_CANCELLATION: "Order cancellation",
  ORDER_PAYMENT: "Used at checkout",
  ORDER_REFUND: "Return credit",
  PAYMENT_FAILURE: "Payment reversed",
  PAYMENT_RETURNED: "Payment returned",
  RECURRING_PAYMENT: "Recurring payment",
  TAX_FINALIZATION: "Tax adjustment",
};

export function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat(shopConfig.localization.locale, { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

export function formatOrderStatus(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? humanize(status);
}

export function formatReturnStatus(status: string): string {
  return RETURN_STATUS_LABELS[status] ?? humanize(status);
}

export function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getOpenReturn(returns: CustomerOrderSummary["returns"]) {
  return returns.find((entry) => OPEN_RETURN_STATUSES.has(entry.status)) ?? null;
}

export function getClosedReturn(returns: CustomerOrderSummary["returns"]) {
  return returns.find((entry) => entry.status === "CLOSED") ?? null;
}

export function getActiveOrderCount(orders: CustomerOrderSummary[]): number {
  return orders.filter(
    (order) =>
      order.cancelledAt === null &&
      (order.fulfillmentStatus !== "FULFILLED" || getOpenReturn(order.returns)),
  ).length;
}

export function pluralizeItems(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export function getOrderMeta(order: CustomerOrderSummary, placed = false): string {
  const segments = [
    `${placed ? "Placed " : ""}${formatOrderDate(order.processedAt)}`,
    formatOrderStatus(order.fulfillmentStatus),
  ];
  const openReturn = getOpenReturn(order.returns);
  const closedReturn = getClosedReturn(order.returns);

  if (openReturn) {
    segments.push(
      `${formatReturnStatus(openReturn.status)} for ${pluralizeItems(openReturn.itemCount)}`,
    );
  } else if (closedReturn) {
    segments.push(formatReturnStatus(closedReturn.status));
  }

  return segments.join(" · ");
}

export function getOrderItemSummary(order: CustomerOrderSummary): string {
  if (order.previewLineItems.length === 1) {
    const item = order.previewLineItems[0];
    return [item.title, item.variantTitle].filter(Boolean).join(" · ");
  }

  const quantity = order.previewLineItems.reduce((total, item) => total + item.quantity, 0);
  const openReturn = getOpenReturn(order.returns);
  const closedReturn = getClosedReturn(order.returns);

  if (closedReturn) {
    return `${pluralizeItems(quantity)} · ${formatReturnStatus(closedReturn.status)}`;
  }

  if (openReturn) {
    return `${pluralizeItems(quantity)} · ${formatReturnStatus(openReturn.status)}`;
  }

  return `${pluralizeItems(quantity)} · ${formatOrderStatus(order.fulfillmentStatus)}`;
}

export interface OrderAction {
  external: boolean;
  href: string;
  label: string;
}

export function getOrderAction(order: CustomerOrderSummary): OrderAction {
  if (getOpenReturn(order.returns)) {
    return {
      external: false,
      href: `/account/orders/${encodeURIComponent(order.id)}#return`,
      label: "View return request",
    };
  }

  if (order.fulfillmentStatus === "FULFILLED") {
    return {
      external: false,
      href: `/account/orders/${encodeURIComponent(order.id)}`,
      label: "View order",
    };
  }

  return {
    external: true,
    href: order.statusPageUrl,
    label: "Track order",
  };
}

export function getTransactionLabel(transaction: CustomerStoreCreditTransaction): string {
  if (transaction.type === "expiration") return "Credit expired";
  if (transaction.type === "revert") return "Payment restored";
  return TRANSACTION_EVENT_LABELS[transaction.event] ?? "Account activity";
}

export function getTransactionTitle(transaction: CustomerStoreCreditTransaction): string {
  const label = getTransactionLabel(transaction);
  return transaction.orderName ? `${label} · Order ${transaction.orderName}` : label;
}

export function getTransactionMeta(transaction: CustomerStoreCreditTransaction): string {
  const source =
    transaction.event === "ORDER_PAYMENT"
      ? "Purchase"
      : transaction.event === "ORDER_REFUND"
        ? "Return credit"
        : transaction.type === "expiration"
          ? "Expired credit"
          : "Account credit";

  return `${formatOrderDate(transaction.createdAt)} · ${source}`;
}

export function getTransactionAmount(transaction: CustomerStoreCreditTransaction): string {
  const prefix = transaction.type === "credit" || transaction.type === "revert" ? "+" : "−";
  return `${prefix} ${formatPrice(transaction.amount)}`;
}

export function getAddressLabel(address: CustomerAddress): string {
  return address.isDefault ? "Home · Default" : "Saved address";
}

export function getAddressName(address: CustomerAddress): string {
  return [address.firstName, address.lastName].filter(Boolean).join(" ") || "Saved recipient";
}

export function maskPhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length < 4) return phoneNumber;
  const countryCode = phoneNumber.startsWith("+") ? `+${digits.slice(0, 2)} ` : "";
  return `Phone: ${countryCode}••••••${digits.slice(-4)}`;
}

export function getEmailMarketingStateLabel(state: CustomerMarketingState): string {
  if (state === "PENDING") return "Confirmation pending";
  if (state === "SUBSCRIBED") return "Subscribed";
  if (state === "UNSUBSCRIBED") return "Unsubscribed";
  return "Not subscribed";
}

export function isEmailMarketingSubscribed(state: CustomerMarketingState): boolean {
  return state === "PENDING" || state === "SUBSCRIBED";
}
