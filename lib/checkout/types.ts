import type { Image } from "@/lib/media/types";
import type { Money } from "@/lib/money/types";

export interface DeliveryDraft {
  address1: string;
  address2: string;
  city: string;
  email: string;
  name: string;
  phone: string;
  postcode: string;
}

export interface DeliverySelection {
  addressId: string | null;
  draft: DeliveryDraft;
  mode: "new" | "saved";
}

export type DeliveryErrors = Partial<Record<keyof DeliveryDraft, string>>;

export type ConfirmationPolicyState = "active" | "expired" | "pending";

export interface ConfirmationLineItem {
  id: string;
  image: Image | null;
  options: Array<{ name: string; value: string }>;
  quantity: number;
  title: string;
  total: Money | null;
}

export interface ConfirmationAddress {
  area: string;
  lines: string[];
  name: string | null;
  street: string;
  unit: string;
}

export interface ConfirmationTracking {
  company: string | null;
  number: string | null;
  url: string | null;
}

export interface ConfirmationOrder {
  discountCodes: string[];
  email: string | null;
  estimatedDeliveryAt: string | null;
  financialStatus: string;
  fulfillmentStatus: string;
  hasCustomerAccount: boolean;
  id: string;
  lineItems: ConfirmationLineItem[];
  name: string;
  paymentReference: string | null;
  processedAt: string;
  shipping: Money | null;
  shippingAddress: ConfirmationAddress | null;
  statusPageUrl: string;
  subtotal: Money | null;
  tax: Money | null;
  total: Money;
  tracking: ConfirmationTracking | null;
}
