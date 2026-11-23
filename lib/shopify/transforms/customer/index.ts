import type {
  CustomerAddress,
  CustomerOrder,
  CustomerOrderListRow,
  CustomerOrderSummary,
  CustomerProfile,
  CustomerStoreCreditAccount,
  CustomerStoreCreditTransaction,
  OrderDiscount,
  OrderFulfillment,
  OrderLineItem,
  OrderPayment,
  OrderRefund,
  OrderTransaction,
} from "@/lib/customer/types";
import type { Money } from "@/lib/money/types";
import type { ReturnSelectedOption } from "@/lib/returns/types";
import type {
  ShopifyCustomerAddress,
  ShopifyCustomerProfile,
  ShopifyFulfillment,
  ShopifyLineItem,
  ShopifyMoney,
  ShopifyOrder,
  ShopifyOrderDiscount,
  ShopifyOrderList,
  ShopifyOrderPaymentInformation,
  ShopifyOrderRefund,
  ShopifyOrderSummary,
  ShopifyOrderTransaction,
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

function transformFulfillment(fulfillment: ShopifyFulfillment): OrderFulfillment {
  const tracking = fulfillment.trackingInformation[0];

  return {
    carrier: tracking?.company ?? null,
    createdAt: fulfillment.createdAt,
    estimatedDeliveryAt: fulfillment.estimatedDeliveryAt ?? null,
    events: fulfillment.events.nodes.map((event) => ({
      happenedAt: event.happenedAt,
      status: event.status,
    })),
    latestShipmentStatus: fulfillment.latestShipmentStatus ?? null,
    status: fulfillment.status ?? null,
    trackingNumber: tracking?.number ?? null,
    trackingUrl: tracking?.url ?? null,
  };
}

export function transformOrderSummary(order: ShopifyOrderSummary): CustomerOrderSummary {
  return {
    cancelledAt: order.cancelledAt ?? null,
    financialStatus: order.financialStatus ?? null,
    fulfillmentStatus: order.fulfillmentStatus,
    fulfillments: order.fulfillments.nodes.map(transformFulfillment),
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
    variantOptions:
      item.variantOptions?.map((option) => ({
        name: option.name,
        value: option.value,
      })) ?? [],
    variantTitle: item.variantTitle ?? null,
  };
}

export function transformOrderListRow(order: ShopifyOrderList): CustomerOrderListRow {
  const lineItems = order.lineItems.nodes.map(transformLineItem);

  return {
    ...transformOrderSummary(order),
    lineItems,
    lineItemsTruncated: order.lineItems.pageInfo.hasNextPage,
    totalQuantity: lineItems.reduce((total, item) => total + item.quantity, 0),
  };
}

function transformOrderDiscount(discount: ShopifyOrderDiscount): OrderDiscount {
  const value = discount.value;

  return {
    amount: value.__typename === "MoneyV2" ? transformMoney(value) : null,
    code: "code" in discount ? discount.code : null,
    label: "title" in discount ? discount.title : "code" in discount ? discount.code : "Discount",
    percentage: value.__typename === "PricingPercentageValue" ? value.percentage : null,
  };
}

function transformOrderPayment(payment: ShopifyOrderPaymentInformation): OrderPayment {
  return {
    outstanding: transformMoney(payment.totalOutstandingAmount),
    paid: transformMoney(payment.totalPaidAmount),
    status: payment.paymentStatus ?? null,
  };
}

function transformOrderRefund(refund: ShopifyOrderRefund): OrderRefund {
  return {
    amount: transformMoney(refund.totalRefunded),
    createdAt: refund.createdAt ?? null,
    id: refund.id,
  };
}

function transformOrderTransaction(transaction: ShopifyOrderTransaction): OrderTransaction {
  return {
    amount: transformMoney(transaction.transactionAmount.presentmentMoney),
    createdAt: transaction.createdAt,
    giftCardLast4: transaction.giftCardDetails?.last4 ?? null,
    id: transaction.id,
    kind: transaction.kind ?? null,
    status: transaction.status ?? null,
    type: transaction.type,
  };
}

export function transformOrder(order: ShopifyOrder): CustomerOrder {
  const zeroMoney: Money = { amount: "0", currencyCode: order.totalPrice.currencyCode };

  return {
    ...transformOrderSummary(order),
    cancelReason: order.cancelReason ?? null,
    createdAt: order.createdAt,
    discounts: order.discountApplications.nodes.map(transformOrderDiscount),
    editableLineItems: order.requestedEditInformation.editableLineItems.nodes.map((item) => ({
      lineItemId: item.lineItem.id,
      quantity: item.quantity,
    })),
    hasEditableLineItems: order.requestedEditInformation.hasEditableLineItems,
    lineItems: order.lineItems.nodes.map(transformLineItem),
    nonReturnableSummary: order.returnInformation.nonReturnableSummary
      ? {
          reasons: order.returnInformation.nonReturnableSummary.nonReturnableReasons,
        }
      : null,
    payment: order.paymentInformation
      ? transformOrderPayment(order.paymentInformation)
      : { outstanding: zeroMoney, paid: zeroMoney, status: null },
    refunds: order.refunds.map(transformOrderRefund),
    requestedEdits: order.requestedOrderEdits.nodes.map((request) => ({
      id: request.id,
      status: request.status,
    })),
    returnableLineItemCount: order.returnInformation.returnableLineItems.nodes.length,
    returns: order.returns.nodes.map(transformReturnSummary),
    shippingAddress: order.shippingAddress ? transformCustomerAddress(order.shippingAddress) : null,
    subtotal: order.subtotal ? transformMoney(order.subtotal) : null,
    totalRefunded: transformMoney(order.totalRefunded),
    totalShipping: order.totalShipping ? transformMoney(order.totalShipping) : null,
    totalTax: order.totalTax ? transformMoney(order.totalTax) : null,
    transactions: order.transactions.map(transformOrderTransaction),
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
