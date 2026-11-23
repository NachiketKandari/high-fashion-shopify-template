import type { CustomerAddressInput as ShopifyCustomerAddressInput } from "@shopify/hydrogen/customer-account-api-types";

import type { Image } from "@/lib/media/types";
import type { Money } from "@/lib/money/types";
import type { PageInfo } from "@/lib/pagination/types";
import type {
  ReturnNonReturnableSummary,
  ReturnSelectedOption,
  ReturnSummary,
} from "@/lib/returns/types";

export interface AccountActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
  success: boolean;
}

export type CustomerMarketingState =
  | "INVALID"
  | "NOT_SUBSCRIBED"
  | "PENDING"
  | "REDACTED"
  | "SUBSCRIBED"
  | "UNSUBSCRIBED";

export interface CustomerProfile {
  email: string;
  emailMarketingState: CustomerMarketingState;
  firstName: string | null;
  lastName: string | null;
  marketCurrencyCode: string;
  phoneNumber: string | null;
}

export interface OrderLinePreview {
  quantity: number;
  title: string;
  variantTitle: string | null;
}

export interface OrderFulfillmentEvent {
  happenedAt: string;
  status: string;
}

export interface OrderFulfillment {
  carrier: string | null;
  createdAt: string;
  estimatedDeliveryAt: string | null;
  events: OrderFulfillmentEvent[];
  latestShipmentStatus: string | null;
  status: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
}

export interface OrderLineItem {
  id: string;
  image: Image | null;
  options: ReturnSelectedOption[];
  productId: string | null;
  quantity: number;
  title: string;
  totalPrice: Money | null;
  variantId: string | null;
  variantOptions: Array<{ name: string; value: string }>;
  variantTitle: string | null;
}

export interface CustomerOrderReturn {
  createdAt: string | null;
  itemCount: number;
  name: string;
  status: string;
}

export interface CustomerOrderSummary {
  cancelledAt: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string;
  fulfillments: OrderFulfillment[];
  id: string;
  name: string;
  number: number;
  previewLineItems: OrderLinePreview[];
  processedAt: string;
  returns: CustomerOrderReturn[];
  statusPageUrl: string;
  totalPrice: Money;
}

export interface CustomerOrderListRow extends CustomerOrderSummary {
  lineItems: OrderLineItem[];
  lineItemsTruncated: boolean;
  totalQuantity: number;
}

export interface OrderEditableLineItem {
  lineItemId: string;
  quantity: number;
}

export interface OrderRequestedEdit {
  id: string;
  status: string;
}

export interface OrderDiscount {
  amount: Money | null;
  code: string | null;
  label: string;
  percentage: number | null;
}

export interface OrderPayment {
  outstanding: Money;
  paid: Money;
  status: string | null;
}

export interface OrderRefund {
  amount: Money;
  createdAt: string | null;
  id: string;
}

export interface OrderTransaction {
  amount: Money;
  createdAt: string;
  giftCardLast4: string | null;
  id: string;
  kind: string | null;
  status: string | null;
  type: string;
}

export interface CustomerOrder extends Omit<CustomerOrderSummary, "returns"> {
  cancelReason: string | null;
  createdAt: string;
  discounts: OrderDiscount[];
  editableLineItems: OrderEditableLineItem[];
  hasEditableLineItems: boolean;
  lineItems: OrderLineItem[];
  nonReturnableSummary: ReturnNonReturnableSummary | null;
  payment: OrderPayment;
  refunds: OrderRefund[];
  requestedEdits: OrderRequestedEdit[];
  returnableLineItemCount: number;
  returns: ReturnSummary[];
  shippingAddress: CustomerAddress | null;
  subtotal: Money | null;
  totalRefunded: Money;
  totalShipping: Money | null;
  totalTax: Money | null;
  transactions: OrderTransaction[];
}

export interface CustomerOrdersPage {
  orders: CustomerOrderListRow[];
  pageInfo: PageInfo;
}

export interface CustomerAddress {
  address1: string | null;
  address2: string | null;
  city: string | null;
  company: string | null;
  countryCode: string | null;
  firstName: string | null;
  formatted: string[];
  id: string;
  isDefault: boolean;
  lastName: string | null;
  phoneNumber: string | null;
  zip: string | null;
  zoneCode: string | null;
}

export interface CustomerStoreCreditTransaction {
  amount: Money;
  balanceAfterTransaction: Money;
  createdAt: string;
  event: string;
  orderName: string | null;
  type: "credit" | "debit" | "expiration" | "revert";
}

export interface CustomerStoreCreditAccount {
  balance: Money;
  id: string;
  transactions: CustomerStoreCreditTransaction[];
}

export interface CustomerStoreCredit {
  account: CustomerStoreCreditAccount | null;
  error: boolean;
  marketCurrencyCode: string;
}

// Form values keyed by Shopify's input, so renamed or removed fields fail typecheck.
export type CustomerAddressInput = Partial<Record<keyof ShopifyCustomerAddressInput, string>>;
