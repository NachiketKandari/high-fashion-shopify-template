export type OrderStage = "cancelled" | "delivered" | "dispatched" | "packed" | "processing";

export type TrackingStepState = "complete" | "current" | "upcoming";

export interface TrackingStep {
  label: string;
  state: TrackingStepState;
  sublabel: string;
}

export type CancellationWindow = "card" | "wallet";

export type OrderCancellation =
  | { status: "available"; window: CancellationWindow }
  | { status: "cancelled" }
  | { status: "closed" }
  | { status: "declined"; requestId: string }
  | { status: "pending"; requestId: string };

export interface OrderTrackingView {
  cancellation: OrderCancellation;
  carrier: string | null;
  deliveredAt: string | null;
  dispatchedAt: string | null;
  stage: OrderStage;
  statusDetail: string;
  statusTitle: string;
  steps: TrackingStep[];
  trackingNumber: string | null;
  trackingUrl: string | null;
}

export type OrderCancellationResult =
  | { status: "requested" }
  | { status: "error"; message: string }
  | { status: "unavailable" };

export interface OrderLookupFieldErrors {
  email?: string;
  orderReference?: string;
}

export type OrderLookupResult =
  | { fieldErrors: OrderLookupFieldErrors; status: "invalid" }
  | { status: "unavailable" };
