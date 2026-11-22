import { shopConfig } from "@/lib/config";
import type { OrderFulfillment, CustomerOrder, CustomerOrderListRow } from "@/lib/customer/types";
import type {
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
    detail: "Your payment is confirmed. We’re preparing your items for dispatch.",
    title: "Preparing your order",
  };
}

export function getOrderCancellation(order: CustomerOrder, now = new Date()): OrderCancellation {
  if (order.cancelledAt) return { status: "cancelled" };

  const pending = order.requestedEdits.find((request) => request.status === "REQUESTED");
  if (pending) return { status: "pending", requestId: pending.id };

  if (order.hasEditableLineItems) {
    const withinCardWindow =
      now.getTime() - new Date(order.processedAt).getTime() <= CANCELLATION_WINDOW_MS;
    return { status: "available", window: withinCardWindow ? "card" : "wallet" };
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
