import { shopConfig } from "@/lib/config";
import type {
  CustomerOrder,
  CustomerOrderListRow,
  OrderFulfillment,
  OrderTransaction,
} from "@/lib/customer/types";
import type {
  CancellationRefund,
  OrderCancellation,
  OrderStage,
  OrderTrackingView,
  TrackingStep,
} from "@/lib/orders/types";

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;
const DELIVERED_STATUSES = new Set(["DELIVERED", "PICKED_UP"]);
const DISPATCH_STATUSES = new Set([
  "ATTEMPTED_DELIVERY",
  "CARRIER_PICKED_UP",
  "IN_TRANSIT",
  "LABEL_PRINTED",
  "LABEL_PURCHASED",
  "OUT_FOR_DELIVERY",
]);

export const ORDER_CAPABILITIES = {
  addressChange: "unavailable",
  cancellation: "available",
  invoices: "unavailable",
  returns: "unavailable",
} as const satisfies Record<string, "available" | "unavailable">;

export type OrderCapability = keyof typeof ORDER_CAPABILITIES;

export function isOrderCapabilityAvailable(capability: OrderCapability): boolean {
  return ORDER_CAPABILITIES[capability] === "available";
}

export function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat(shopConfig.localization.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function humanizeCancelReason(reason: string): string {
  const labels: Record<string, string> = {
    CUSTOMER: "Cancelled by you",
    DECLINED: "Payment was declined",
    FRAUD: "Cancelled as a precaution",
    INVENTORY: "Cancelled because an item was unavailable",
    OTHER: "Cancelled",
    STAFF: "Cancelled by our team",
  };
  return labels[reason] ?? "Cancelled";
}

const PAYMENT_KINDS = new Set(["AUTHORIZATION", "CAPTURE", "SALE"]);

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  ACH: "Bank transfer",
  BANK_DEPOSIT: "Bank deposit",
  CARD: "Card",
  CASH_ON_DELIVERY: "Cash on delivery",
  CUSTOM: "Custom payment",
  GIFT_CARD: "Gift card",
  MANUAL: "Manual payment",
  MONEY_ORDER: "Money order",
  SHOPIFY_INSTALLMENTS: "Installments",
  STORE_CREDIT: "Account Balance wallet",
};

const TRANSACTION_KIND_LABELS: Record<string, string> = {
  AUTHORIZATION: "Authorization",
  CAPTURE: "Capture",
  CARD_APPROVAL: "Card approval",
  CARD_DECLINE: "Card declined",
  CHANGE: "Adjustment",
  REFUND: "Refund",
  SALE: "Payment",
  SUGGESTED_REFUND: "Suggested refund",
  VOID: "Void",
};

export function getOrderPayments(order: CustomerOrder): OrderTransaction[] {
  return order.transactions.filter(
    (transaction) =>
      transaction.status === "SUCCESS" &&
      transaction.kind !== null &&
      PAYMENT_KINDS.has(transaction.kind) &&
      Number(transaction.amount.amount) > 0,
  );
}

export function getPaymentTypeLabel(type: string): string {
  return PAYMENT_TYPE_LABELS[type] ?? "Payment";
}

export function getTransactionKindLabel(kind: string | null): string {
  return kind ? (TRANSACTION_KIND_LABELS[kind] ?? "Transaction") : "Transaction";
}

function getGiftCardLabel(payments: OrderTransaction[]): string {
  const last4s = [
    ...new Set(payments.map((payment) => payment.giftCardLast4).filter(Boolean)),
  ] as string[];

  if (last4s.length === 0) return "Gift card";
  if (last4s.length === 1) return `Gift card ••••${last4s[0]}`;
  return `Gift cards ${last4s.map((last4) => `••••${last4}`).join(", ")}`;
}

function findDeliveredAt(fulfillments: OrderFulfillment[]): string | null {
  const events = fulfillments.flatMap((fulfillment) =>
    fulfillment.events.filter((event) => DELIVERED_STATUSES.has(event.status)),
  );
  if (events.length === 0) return null;
  return events.reduce(
    (latest, event) => (new Date(event.happenedAt) > new Date(latest) ? event.happenedAt : latest),
    events[0].happenedAt,
  );
}

function findDispatchedAt(fulfillments: OrderFulfillment[]): string | null {
  const events = fulfillments.flatMap((fulfillment) =>
    fulfillment.events.filter((event) => DISPATCH_STATUSES.has(event.status)),
  );
  if (events.length === 0) {
    return (
      fulfillments.find((fulfillment) => fulfillment.trackingNumber || fulfillment.trackingUrl)
        ?.createdAt ?? null
    );
  }
  return events.reduce(
    (earliest, event) =>
      new Date(event.happenedAt) < new Date(earliest) ? event.happenedAt : earliest,
    events[0].happenedAt,
  );
}

export function getOrderStage(order: CustomerOrder | CustomerOrderListRow): OrderStage {
  if (order.cancelledAt) return "cancelled";

  const fulfillments = order.fulfillments;
  if (
    findDeliveredAt(fulfillments) ||
    fulfillments.some((fulfillment) =>
      DELIVERED_STATUSES.has(fulfillment.latestShipmentStatus ?? ""),
    )
  ) {
    return "delivered";
  }

  if (fulfillments.length > 0) {
    const dispatched = fulfillments.some(
      (fulfillment) =>
        Boolean(fulfillment.trackingNumber || fulfillment.trackingUrl) ||
        DISPATCH_STATUSES.has(fulfillment.latestShipmentStatus ?? "") ||
        fulfillment.events.some((event) => DISPATCH_STATUSES.has(event.status)),
    );
    return dispatched ? "dispatched" : "packed";
  }

  return "processing";
}

function buildSteps(stage: OrderStage): TrackingStep[] {
  const labels = ["Order received", "Preparing", "Dispatched", "Delivered"];

  if (stage === "cancelled") return [];

  if (stage === "delivered") {
    return labels.map((label) => ({ label, state: "complete", sublabel: "Complete" }));
  }

  const currentIndex = stage === "dispatched" ? 2 : 1;
  const currentSublabel =
    stage === "dispatched"
      ? "In transit"
      : stage === "packed"
        ? "Packed for dispatch"
        : "In progress";

  return labels.map((label, index) => {
    if (index < currentIndex) return { label, state: "complete", sublabel: "Complete" };
    if (index === currentIndex) return { label, state: "current", sublabel: currentSublabel };
    return { label, state: "upcoming", sublabel: "Upcoming" };
  });
}

function getStatusCopy(stage: OrderStage, order: CustomerOrder): { detail: string; title: string } {
  const deliveredAt = findDeliveredAt(order.fulfillments);
  const dispatchedAt = findDispatchedAt(order.fulfillments);
  const carrier = order.fulfillments.find((fulfillment) => fulfillment.carrier)?.carrier ?? null;

  if (stage === "cancelled") {
    const cancelledAt = order.cancelledAt ? formatOrderDate(order.cancelledAt) : null;
    const reason = order.cancelReason ? humanizeCancelReason(order.cancelReason) : "Cancelled";
    return {
      detail: cancelledAt ? `${reason} on ${cancelledAt}.` : `${reason}.`,
      title: "This order was cancelled",
    };
  }

  if (stage === "delivered") {
    const date = deliveredAt ? formatOrderDate(deliveredAt) : null;
    return {
      detail: date
        ? `Delivered on ${date}${carrier ? ` by ${carrier}` : ""}.`
        : "Your order has been delivered.",
      title: "Your order has been delivered",
    };
  }

  if (stage === "dispatched") {
    const date = dispatchedAt ? formatOrderDate(dispatchedAt) : null;
    return {
      detail: date
        ? `Dispatched on ${date}${carrier ? ` with ${carrier}` : ""}.`
        : "Your parcel has left our studio.",
      title: "Your order is on its way",
    };
  }

  if (stage === "packed") {
    return {
      detail: "Your items are packed and awaiting courier hand-off.",
      title: "Order locked for dispatch",
    };
  }

  return {
    detail: "Your order is confirmed. We’re preparing your items for dispatch.",
    title: "Preparing your order",
  };
}

const CARD_REFUND: CancellationRefund = {
  cta: "Request Cancellation — Refund to Card",
  destination: "Original card",
  kind: "card",
  note: "If your cancellation is approved, the refund returns to the card used at checkout. Your bank’s processing time determines when it appears.",
  timing: "Within the 24-hour refund window",
};

const WALLET_REFUND: CancellationRefund = {
  cta: "Request Cancellation — Wallet Credit",
  destination: "Account Balance wallet",
  kind: "wallet",
  note: "If your cancellation is approved, the credit is added to the Account Balance wallet linked to your member profile. This is not a refund to your card.",
  timing: "After the 24-hour card-refund window",
};

const MANUAL_REFUND: CancellationRefund = {
  cta: "Request Cancellation",
  destination: "Original payment method",
  kind: "manual",
  note: "If your cancellation is approved, our team will confirm the refund method with you.",
  timing: null,
};

function withOutstanding(note: string, outstanding: number): string {
  return outstanding > 0
    ? `${note} Only the amount already paid can be refunded; the outstanding balance is removed.`
    : note;
}

export function getCancellationRefund(order: CustomerOrder, now = new Date()): CancellationRefund {
  const paid = Number(order.payment.paid.amount);
  const outstanding = Number(order.payment.outstanding.amount);
  const payments = getOrderPayments(order);
  const giftCardPayments = payments.filter((payment) => payment.type === "GIFT_CARD");
  const storeCreditPayments = payments.filter((payment) => payment.type === "STORE_CREDIT");
  const cardPayments = payments.filter(
    (payment) => payment.type === "CARD" || payment.type === "SHOPIFY_INSTALLMENTS",
  );
  const manualPayments = payments.filter(
    (payment) =>
      !["CARD", "GIFT_CARD", "SHOPIFY_INSTALLMENTS", "STORE_CREDIT"].includes(payment.type),
  );

  const hasCard = cardPayments.length > 0;
  const hasGiftCard = giftCardPayments.length > 0;
  const hasManual = manualPayments.length > 0;
  const hasStoreCredit = storeCreditPayments.length > 0;
  const withinCardWindow =
    now.getTime() - new Date(order.processedAt).getTime() <= CANCELLATION_WINDOW_MS;

  if (order.payment.status === "AUTHORIZED" || order.financialStatus === "AUTHORIZED") {
    return {
      cta: "Request Cancellation",
      destination: "Authorized, not captured",
      kind: "outstanding",
      note: "The payment is authorized but not captured. Cancelling releases the authorization; no refund is issued.",
      timing: null,
    };
  }

  if (payments.length === 0 && paid <= 0) {
    if (
      outstanding > 0 ||
      order.financialStatus === "PENDING" ||
      order.financialStatus === "PARTIALLY_PAID"
    ) {
      return {
        cta: "Request Cancellation",
        destination: "No payment captured",
        kind: "outstanding",
        note: "This order has an outstanding balance. Cancelling removes the amount due; no refund is issued.",
        timing: null,
      };
    }

    if (order.discounts.length > 0) {
      return {
        cta: "Request Cancellation",
        destination: "Covered by discount",
        kind: "none",
        note: "This order was covered by a discount. No payment was taken, so no refund is issued.",
        timing: null,
      };
    }

    return {
      cta: "Request Cancellation",
      destination: "No payment taken",
      kind: "none",
      note: "No payment was recorded for this order, so no refund is due.",
      timing: null,
    };
  }

  if (payments.length === 0) {
    return { ...MANUAL_REFUND, note: withOutstanding(MANUAL_REFUND.note, outstanding) };
  }

  if (hasGiftCard && !hasCard && !hasStoreCredit && !hasManual) {
    return {
      cta: "Request Cancellation — Refund to Gift Card",
      destination: getGiftCardLabel(giftCardPayments),
      kind: "gift-card",
      note: withOutstanding(
        "If your cancellation is approved, the refund returns to the gift card used at checkout.",
        outstanding,
      ),
      timing: null,
    };
  }

  if (hasStoreCredit && !hasCard && !hasGiftCard && !hasManual) {
    return {
      cta: "Request Cancellation — Wallet Credit",
      destination: "Account Balance wallet",
      kind: "wallet",
      note: withOutstanding(
        "If your cancellation is approved, the credit is added to the Account Balance wallet linked to your member profile.",
        outstanding,
      ),
      timing: null,
    };
  }

  if (hasCard && !hasGiftCard && !hasStoreCredit && !hasManual) {
    const refund = withinCardWindow ? CARD_REFUND : WALLET_REFUND;
    return { ...refund, note: withOutstanding(refund.note, outstanding) };
  }

  if (hasManual && !hasCard && !hasGiftCard && !hasStoreCredit) {
    return { ...MANUAL_REFUND, note: withOutstanding(MANUAL_REFUND.note, outstanding) };
  }

  const parts: string[] = [];
  if (hasGiftCard) parts.push(getGiftCardLabel(giftCardPayments));
  if (hasStoreCredit) parts.push("Account Balance wallet");
  if (hasCard) {
    parts.push(withinCardWindow ? "original card" : "Account Balance wallet for the card portion");
  }
  if (hasManual) parts.push("original payment method");

  return {
    cta: "Request Cancellation",
    destination: parts.join(" and "),
    kind: "mixed",
    note: withOutstanding(
      hasCard && !withinCardWindow
        ? "If approved, each part returns to the method that funded it. The card portion follows the 24-hour wallet policy."
        : "If approved, each part returns to the method that funded it.",
      outstanding,
    ),
    timing: hasCard
      ? withinCardWindow
        ? "Within the 24-hour refund window"
        : "After the 24-hour card-refund window"
      : null,
  };
}

export function getOrderCancellation(order: CustomerOrder, now = new Date()): OrderCancellation {
  if (order.cancelledAt) return { status: "cancelled" };

  const pending = order.requestedEdits.find((request) => request.status === "REQUESTED");
  if (pending) return { status: "pending", requestId: pending.id };

  if (order.hasEditableLineItems) {
    return { status: "available", refund: getCancellationRefund(order, now) };
  }

  const declined = order.requestedEdits.find((request) => request.status === "DECLINED");
  if (declined) return { status: "declined", requestId: declined.id };

  return { status: "closed" };
}

export function getTrackingDetails(order: CustomerOrder): {
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
} {
  for (const fulfillment of order.fulfillments) {
    if (fulfillment.carrier || fulfillment.trackingNumber || fulfillment.trackingUrl) {
      return {
        carrier: fulfillment.carrier,
        trackingNumber: fulfillment.trackingNumber,
        trackingUrl: fulfillment.trackingUrl ?? order.statusPageUrl,
      };
    }
  }

  return { carrier: null, trackingNumber: null, trackingUrl: null };
}

export function buildOrderTrackingView(order: CustomerOrder, now = new Date()): OrderTrackingView {
  const stage = getOrderStage(order);
  const status = getStatusCopy(stage, order);
  const tracking = getTrackingDetails(order);

  return {
    cancellation: getOrderCancellation(order, now),
    carrier: tracking.carrier,
    deliveredAt: findDeliveredAt(order.fulfillments),
    dispatchedAt: findDispatchedAt(order.fulfillments),
    stage,
    statusDetail: status.detail,
    statusTitle: status.title,
    steps: buildSteps(stage),
    trackingNumber: tracking.trackingNumber,
    trackingUrl: tracking.trackingUrl,
  };
}

export function getOrderItemSummary(order: CustomerOrderListRow): string {
  const first = order.lineItems[0];
  const countLabel = `${order.totalQuantity}${order.lineItemsTruncated ? "+" : ""} ${
    order.totalQuantity === 1 ? "item" : "items"
  }`;
  if (!first) return countLabel;

  const variant =
    first.variantOptions.length > 0
      ? first.variantOptions.map((option) => option.value).join(" / ")
      : first.variantTitle;

  const line = variant ? `${first.title} · ${variant}` : first.title;
  if (order.totalQuantity <= 1) return line;
  return `${countLabel} · ${line}`;
}

export function getOrderDeliveredAt(order: CustomerOrder | CustomerOrderListRow): string | null {
  return findDeliveredAt(order.fulfillments);
}

export function getOrderStageLabel(stage: OrderStage): string {
  if (stage === "cancelled") return "Cancelled";
  if (stage === "delivered") return "Delivered";
  if (stage === "dispatched") return "Dispatched";
  if (stage === "packed") return "Packed";
  return "Preparing";
}
