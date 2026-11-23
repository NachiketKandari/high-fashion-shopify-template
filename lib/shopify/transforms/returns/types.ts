import type {
  CALCULATED_RETURN_FRAGMENT,
  RETURN_FRAGMENT,
  RETURN_SUMMARY_FRAGMENT,
  RETURNABLE_LINE_ITEM_FRAGMENT,
} from "@/lib/shopify/fragments/customer-return";
import type { CustomerAccountResultOf } from "@/lib/shopify/types";

export type ShopifyCalculatedReturn = CustomerAccountResultOf<typeof CALCULATED_RETURN_FRAGMENT>;
export type ShopifyReturn = CustomerAccountResultOf<typeof RETURN_FRAGMENT>;
export type ShopifyReturnSummary = CustomerAccountResultOf<typeof RETURN_SUMMARY_FRAGMENT>;
export type ShopifyReturnableLineItem = CustomerAccountResultOf<
  typeof RETURNABLE_LINE_ITEM_FRAGMENT
>;
