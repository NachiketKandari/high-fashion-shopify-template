import type { Image } from "@/lib/media/types";
import type { Money } from "@/lib/money/types";

export type ReturnStatus = "CANCELED" | "CLOSED" | "DECLINED" | "OPEN" | "REQUESTED";

export type ReturnResolution = "exchange" | "return";

export type ReturnRefundMethod = "original" | "wallet";

export interface ReturnReasonOption {
  id: string | null;
  label: string;
}

export interface ReturnSelectedOption {
  name: string;
  value: string;
}

export interface ReturnableItem {
  availableQuantity: number;
  deliveredAt: string | null;
  id: string;
  image: Image | null;
  options: ReturnSelectedOption[];
  productId: string | null;
  reasons: ReturnReasonOption[];
  title: string;
  totalPrice: Money | null;
  variantId: string | null;
  variantTitle: string | null;
}

export interface ReturnNonReturnableSummary {
  reasons: string[];
}

export interface ReturnSummary {
  createdAt: string | null;
  id: string;
  name: string;
  status: ReturnStatus;
  updatedAt: string | null;
}

export interface ReturnContext {
  items: ReturnableItem[];
  nonReturnableSummary: ReturnNonReturnableSummary | null;
  orderId: string;
  orderLineItems: Array<{ id: string; totalPrice: Money | null }>;
  orderName: string;
  orderNumber: number;
  returnShippingMethodNote: string | null;
  returns: ReturnSummary[];
  shippingAddressLines: string[];
}

export interface ReturnEstimate {
  currencyCode: string;
  restockingFee: Money;
  returnShippingFee: Money;
  subtotal: Money;
  tax: Money;
  total: Money;
}

export interface ReturnTimelineEvent {
  happenedAt: string;
  id: string;
  message: string | null;
  subtitle: string | null;
  title: string;
}

export interface ReturnRequestLine {
  id: string;
  image: Image | null;
  options: ReturnSelectedOption[];
  quantity: number;
  title: string;
  totalPrice: Money | null;
  variantTitle: string | null;
}

export interface ReturnReverseDelivery {
  labelUrl: string | null;
  tracking: {
    carrierName: string | null;
    number: string | null;
    url: string | null;
  } | null;
}

export interface ReturnRequest {
  createdAt: string;
  declineNote: string | null;
  exchangeItems: ReturnRequestLine[];
  id: string;
  items: ReturnRequestLine[];
  name: string;
  reverseDelivery: ReturnReverseDelivery | null;
  status: ReturnStatus;
  timeline: ReturnTimelineEvent[];
  updatedAt: string | null;
}

export interface ReturnRequestDetail {
  estimate: ReturnEstimate | null;
  orderId: string;
  orderName: string;
  orderNumber: number;
  request: ReturnRequest;
  shippingAddressLines: string[];
}

export interface ExchangeVariant {
  availableForSale: boolean;
  id: string;
  selectedOptions: ReturnSelectedOption[];
  title: string;
}

export interface ExchangeOption {
  name: string;
  values: string[];
}

export interface ExchangeProduct {
  options: ExchangeOption[];
  title: string;
  variants: ExchangeVariant[];
}

export interface ReturnActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
  returnId?: string;
  success: boolean;
}

export interface ReturnEstimateResult {
  error?: string;
  estimate?: ReturnEstimate;
  success: boolean;
}
