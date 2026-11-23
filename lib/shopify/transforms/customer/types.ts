import type { CUSTOMER_PROFILE_FRAGMENT } from "@/lib/shopify/fragments/customer";
import type { ADDRESS_FRAGMENT } from "@/lib/shopify/fragments/customer-address";
import type {
  ORDER_FRAGMENT,
  ORDER_LIST_FRAGMENT,
  ORDER_SUMMARY_FRAGMENT,
} from "@/lib/shopify/fragments/customer-order";
import type { STORE_CREDIT_ACCOUNT_FRAGMENT } from "@/lib/shopify/fragments/customer-store-credit";
import type { CustomerAccountResultOf } from "@/lib/shopify/types";

export type ShopifyCustomerAddress = CustomerAccountResultOf<typeof ADDRESS_FRAGMENT>;
export type ShopifyOrderSummary = CustomerAccountResultOf<typeof ORDER_SUMMARY_FRAGMENT>;
export type ShopifyOrderList = CustomerAccountResultOf<typeof ORDER_LIST_FRAGMENT>;
export type ShopifyOrder = CustomerAccountResultOf<typeof ORDER_FRAGMENT>;
export type ShopifyCustomerProfile = CustomerAccountResultOf<typeof CUSTOMER_PROFILE_FRAGMENT>;
export type ShopifyLineItem = ShopifyOrder["lineItems"]["nodes"][number];
export type ShopifyFulfillment = ShopifyOrderSummary["fulfillments"]["nodes"][number];
export type ShopifyMoney = ShopifyOrderSummary["totalPrice"];
export type ShopifyOrderDiscount = ShopifyOrder["discountApplications"]["nodes"][number];
export type ShopifyOrderPaymentInformation = NonNullable<ShopifyOrder["paymentInformation"]>;
export type ShopifyOrderRefund = ShopifyOrder["refunds"][number];
export type ShopifyOrderTransaction = ShopifyOrder["transactions"][number];
export type ShopifyStoreCreditAccount = CustomerAccountResultOf<
  typeof STORE_CREDIT_ACCOUNT_FRAGMENT
>;
