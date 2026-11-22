import type {
  CustomerAddress,
  CustomerOrder,
  CustomerOrderListRow,
  CustomerOrderSummary,
  CustomerProfile,
  OrderFulfillment,
  OrderLineItem,
} from "@/lib/customer/types";
import type { Money } from "@/lib/money/types";
import type {
  ShopifyCustomerAddress,
  ShopifyCustomerProfile,
  ShopifyFulfillment,
  ShopifyLineItem,
  ShopifyMoney,
  ShopifyOrder,
  ShopifyOrderList,
  ShopifyOrderSummary,
} from "@/lib/shopify/transforms/customer/types";
import { transformImage } from "@/lib/shopify/transforms/product";

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
    processedAt: order.processedAt,
    totalPrice: transformMoney(order.totalPrice),
  };
}

function transformLineItem(item: ShopifyLineItem): OrderLineItem {
  return {
    image: transformImage(item.image),
    quantity: item.quantity,
    title: item.title,
    totalPrice: item.totalPrice ? transformMoney(item.totalPrice) : null,
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

export function transformOrder(order: ShopifyOrder): CustomerOrder {
  return {
    ...transformOrderSummary(order),
    cancelReason: order.cancelReason ?? null,
    createdAt: order.createdAt,
    editableLineItems: order.requestedEditInformation.editableLineItems.nodes.map((item) => ({
      lineItemId: item.lineItem.id,
      quantity: item.quantity,
    })),
    hasEditableLineItems: order.requestedEditInformation.hasEditableLineItems,
    lineItems: order.lineItems.nodes.map(transformLineItem),
    requestedEdits: order.requestedOrderEdits.nodes.map((request) => ({
      id: request.id,
      status: request.status,
    })),
    shippingAddress: order.shippingAddress ? transformCustomerAddress(order.shippingAddress) : null,
    statusPageUrl: order.statusPageUrl,
    subtotal: order.subtotal ? transformMoney(order.subtotal) : null,
    totalRefunded: transformMoney(order.totalRefunded),
    totalShipping: order.totalShipping ? transformMoney(order.totalShipping) : null,
    totalTax: order.totalTax ? transformMoney(order.totalTax) : null,
  };
}

export function transformCustomerProfile(customer: ShopifyCustomerProfile): CustomerProfile {
  return {
    email: customer.emailAddress?.emailAddress ?? "",
    firstName: customer.firstName ?? null,
    lastName: customer.lastName ?? null,
  };
}
