import type { ConfirmationLineItem, ConfirmationOrder } from "@/lib/checkout/types";
import type { Image } from "@/lib/media/types";
import type { Money } from "@/lib/money/types";
import { adminGraphql } from "@/lib/shopify/admin/server";

const ORDER_CONFIRMATION_QUERY = `#graphql
  query OrderConfirmation($id: ID!) {
    order(id: $id) {
      id
      name
      email
      processedAt
      displayFinancialStatus
      displayFulfillmentStatus
      statusPageUrl
      discountCodes
      customer {
        id
        state
      }
      shippingAddress {
        address1
        address2
        city
        country
        countryCodeV2
        formatted(withName: false)
        name
        province
        zip
      }
      subtotalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalTaxSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalShippingPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      lineItems(first: 50) {
        nodes {
          id
          name
          quantity
          variantTitle
          image {
            altText
            height
            url
            width
          }
          originalTotalSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          variant {
            selectedOptions {
              name
              value
            }
          }
        }
      }
      fulfillments(first: 10) {
        estimatedDeliveryAt
        status
        trackingInfo(first: 5) {
          company
          number
          url
        }
      }
    }
  }
`;

interface ShopMoney {
  amount: string;
  currencyCode: string;
}

interface MoneyBag {
  shopMoney?: ShopMoney | null;
}

interface AdminOrder {
  customer?: { id: string; state?: string | null } | null;
  discountCodes?: string[];
  displayFinancialStatus?: string | null;
  displayFulfillmentStatus: string;
  email?: string | null;
  fulfillments?: Array<{
    estimatedDeliveryAt?: string | null;
    status?: string | null;
    trackingInfo?: Array<{
      company?: string | null;
      number?: string | null;
      url?: string | null;
    }>;
  }>;
  id: string;
  lineItems: {
    nodes: Array<{
      id: string;
      image?: {
        altText?: string | null;
        height?: number | null;
        url: string;
        width?: number | null;
      } | null;
      name: string;
      originalTotalSet?: MoneyBag | null;
      quantity: number;
      variantTitle?: string | null;
      variant?: {
        selectedOptions?: Array<{ name: string; value: string }>;
      } | null;
    }>;
  };
  name: string;
  processedAt: string;
  shippingAddress?: {
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    country?: string | null;
    countryCodeV2?: string | null;
    formatted?: string[];
    name?: string | null;
    province?: string | null;
    zip?: string | null;
  } | null;
  statusPageUrl: string;
  subtotalPriceSet?: MoneyBag | null;
  totalPriceSet?: MoneyBag | null;
  totalShippingPriceSet?: MoneyBag | null;
  totalTaxSet?: MoneyBag | null;
}

function toMoney(bag?: MoneyBag | null): Money | null {
  const money = bag?.shopMoney;
  return money ? { amount: money.amount, currencyCode: money.currencyCode } : null;
}

function toImage(
  image?: {
    altText?: string | null;
    height?: number | null;
    url: string;
    width?: number | null;
  } | null,
): Image | null {
  if (!image) return null;
  return {
    altText: image.altText ?? "",
    height: image.height ?? 0,
    url: image.url,
    width: image.width ?? 0,
  };
}

function toLineItem(line: AdminOrder["lineItems"]["nodes"][number]): ConfirmationLineItem {
  return {
    id: line.id,
    image: toImage(line.image),
    options:
      line.variant?.selectedOptions?.filter((option) => option.value !== "Default Title") ?? [],
    quantity: line.quantity,
    title: line.name,
    total: toMoney(line.originalTotalSet),
  };
}

export async function fetchConfirmationOrder(orderId: string): Promise<ConfirmationOrder | null> {
  if (!orderId.startsWith("gid://shopify/Order/")) return null;

  const data = await adminGraphql<{ order: AdminOrder | null }>(ORDER_CONFIRMATION_QUERY, {
    id: orderId,
  });
  const order = data?.order;
  if (!order) return null;

  const total = toMoney(order.totalPriceSet);
  if (!total) return null;

  const tracking = order.fulfillments
    ?.flatMap((fulfillment) => fulfillment.trackingInfo ?? [])
    .find((info) => info.url || info.number);

  const estimatedDeliveryAt =
    order.fulfillments?.find((fulfillment) => fulfillment.estimatedDeliveryAt)
      ?.estimatedDeliveryAt ?? null;

  return {
    discountCodes: order.discountCodes ?? [],
    email: order.email ?? null,
    estimatedDeliveryAt,
    financialStatus: order.displayFinancialStatus ?? "UNKNOWN",
    fulfillmentStatus: order.displayFulfillmentStatus,
    hasCustomerAccount: order.customer ? order.customer.state !== "DISABLED" : false,
    id: order.id,
    lineItems: order.lineItems.nodes.map(toLineItem),
    name: order.name,
    paymentReference: null,
    processedAt: order.processedAt,
    shipping: toMoney(order.totalShippingPriceSet),
    shippingAddress: order.shippingAddress
      ? {
          area: [
            order.shippingAddress.city,
            order.shippingAddress.province,
            order.shippingAddress.zip,
          ]
            .filter(Boolean)
            .join(", "),
          lines: order.shippingAddress.formatted ?? [],
          name: order.shippingAddress.name ?? null,
          street: order.shippingAddress.address1 ?? "",
          unit: order.shippingAddress.address2 ?? "",
        }
      : null,
    statusPageUrl: order.statusPageUrl,
    subtotal: toMoney(order.subtotalPriceSet),
    tax: toMoney(order.totalTaxSet),
    total,
    tracking: tracking
      ? {
          company: tracking.company ?? null,
          number: tracking.number ?? null,
          url: tracking.url ?? null,
        }
      : null,
  };
}
