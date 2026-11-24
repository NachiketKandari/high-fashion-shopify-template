import type {
  CustomerAddress,
  CustomerOrder,
  CustomerOrderSummary,
  CustomerProfile,
  CustomerStoreCreditAccount,
  CustomerStoreCreditTransaction,
  OrderLineItem,
} from "@/lib/customer/types";
import type { Money } from "@/lib/money/types";
import type { ReturnSelectedOption } from "@/lib/returns/types";
import type {
  ShopifyCustomerAddress,
  ShopifyCustomerProfile,
  ShopifyLineItem,
  ShopifyMoney,
  ShopifyOrder,
  ShopifyOrderSummary,
  ShopifyStoreCreditAccount,
} from "@/lib/shopify/transforms/customer/types";
import { transformImage } from "@/lib/shopify/transforms/product";
import { transformReturnSummary } from "@/lib/shopify/transforms/returns";

function transformMoney(money: ShopifyMoney): Money {
  return { amount: money.amount, currencyCode: money.currencyCode };
}

export function transformCustomerAddress(
  address: ShopifyCustomerAddress,
  defaultAddressId?: string | null,
): CustomerAddress {
  return {
    address1: address.address1 ?? null,
    address2: address.address2 ?? null,
    city: address.city ?? null,
    company: address.company ?? null,
    countryCode: address.countryCode ?? null,
    firstName: address.firstName ?? null,
    formatted: address.formatted,
    id: address.id,
    isDefault: defaultAddressId != null && address.id === defaultAddressId,
    lastName: address.lastName ?? null,
    phoneNumber: address.phoneNumber ?? null,
    zip: address.zip ?? null,
    zoneCode: address.zoneCode ?? null,
  };
}

export function transformOrderSummary(order: ShopifyOrderSummary): CustomerOrderSummary {
  return {
    financialStatus: order.financialStatus ?? null,
    fulfillmentStatus: order.fulfillmentStatus,
    id: order.id,
    name: order.name,
    number: order.number,
    previewLineItems: order.previewLineItems.nodes.map((item) => ({
      quantity: item.quantity,
      title: item.title,
      variantTitle: item.variantTitle ?? null,
    })),
    processedAt: order.processedAt,
    returns: order.returns.nodes.map((entry) => ({
      createdAt: entry.createdAt ?? null,
      itemCount: entry.returnLineItemsCount?.count ?? 0,
      name: entry.name,
      status: entry.status,
    })),
    statusPageUrl: order.statusPageUrl,
    totalPrice: transformMoney(order.totalPrice),
  };
}

function transformLineItemOptions(
  options: ShopifyLineItem["variantOptions"],
): ReturnSelectedOption[] {
  return options?.map((option) => ({ name: option.name, value: option.value })) ?? [];
}

function transformLineItem(item: ShopifyLineItem): OrderLineItem {
  return {
    id: item.id,
    image: transformImage(item.image),
    options: transformLineItemOptions(item.variantOptions),
    productId: item.productId ?? null,
    quantity: item.quantity,
    title: item.title,
    totalPrice: item.totalPrice ? transformMoney(item.totalPrice) : null,
    variantId: item.variantId ?? null,
    variantTitle: item.variantTitle ?? null,
  };
}

export function transformOrder(order: ShopifyOrder): CustomerOrder {
  return {
    ...transformOrderSummary(order),
    lineItems: order.lineItems.nodes.map(transformLineItem),
    nonReturnableSummary: order.returnInformation.nonReturnableSummary
      ? {
          reasons: order.returnInformation.nonReturnableSummary.nonReturnableReasons,
        }
      : null,
    returnableLineItemCount: order.returnInformation.returnableLineItems.nodes.length,
    returns: order.returns.nodes.map(transformReturnSummary),
    shippingAddress: order.shippingAddress ? transformCustomerAddress(order.shippingAddress) : null,
    subtotal: order.subtotal ? transformMoney(order.subtotal) : null,
    totalShipping: order.totalShipping ? transformMoney(order.totalShipping) : null,
    totalTax: order.totalTax ? transformMoney(order.totalTax) : null,
  };
}

export function transformCustomerProfile(customer: ShopifyCustomerProfile): CustomerProfile {
  return {
    email: customer.emailAddress?.emailAddress ?? "",
    emailMarketingState: customer.emailAddress?.marketingState ?? "NOT_SUBSCRIBED",
    firstName: customer.firstName ?? null,
    lastName: customer.lastName ?? null,
    marketCurrencyCode: customer.marketCurrencyCode,
    phoneNumber: customer.phoneNumber?.phoneNumber ?? null,
  };
}

function transactionType(typename: string): CustomerStoreCreditTransaction["type"] {
  if (typename.endsWith("DebitRevertTransaction")) return "revert";
  if (typename.endsWith("ExpirationTransaction")) return "expiration";
  if (typename.endsWith("DebitTransaction")) return "debit";
  return "credit";
}

export function transformStoreCreditAccount(
  account: ShopifyStoreCreditAccount,
): CustomerStoreCreditAccount {
  return {
    balance: transformMoney(account.balance),
    id: account.id,
    transactions: account.transactions.nodes.map((transaction) => ({
      amount: transformMoney(transaction.amount),
      balanceAfterTransaction: transformMoney(transaction.balanceAfterTransaction),
      createdAt: transaction.createdAt,
      event: transaction.event,
      orderName: transaction.origin?.order?.name ?? null,
      type: transactionType(transaction.__typename),
    })),
  };
}
