import type { Money } from "@/lib/money/types";
import type {
  ReturnContext,
  ReturnEstimate,
  ReturnReasonOption,
  ReturnRequest,
  ReturnRequestDetail,
  ReturnRequestLine,
  ReturnSelectedOption,
  ReturnStatus,
  ReturnSummary,
  ReturnableItem,
} from "@/lib/returns/types";
import { transformImage } from "@/lib/shopify/transforms/product";
import type {
  ShopifyCalculatedReturn,
  ShopifyReturn,
  ShopifyReturnSummary,
  ShopifyReturnableLineItem,
} from "@/lib/shopify/transforms/returns/types";

function transformMoney(money: { amount: string; currencyCode: string }): Money {
  return { amount: money.amount, currencyCode: money.currencyCode };
}

function transformReturnMoney(money: { amount: string; currencyCode: string }): Money {
  return {
    amount: Math.abs(Number(money.amount)).toFixed(2),
    currencyCode: money.currencyCode,
  };
}

function transformOptions(
  options: Array<{ name: string; value: string }> | null | undefined,
): ReturnSelectedOption[] {
  return options?.map((option) => ({ name: option.name, value: option.value })) ?? [];
}

function transformReasons(
  reasons: Array<{ deleted: boolean; id: string; name: string }> | null | undefined,
): ReturnReasonOption[] {
  return (
    reasons
      ?.filter((reason) => !reason.deleted)
      .map((reason) => ({ id: reason.id, label: reason.name })) ?? []
  );
}

function transformReturnLine(
  node: ShopifyReturn["returnLineItems"]["nodes"][number],
): ReturnRequestLine {
  return {
    id: node.lineItem.id,
    image: transformImage(node.lineItem.image),
    options: transformOptions(node.lineItem.variantOptions),
    quantity: node.quantity,
    title: node.lineItem.presentmentTitle ?? node.lineItem.name,
    totalPrice: node.lineItem.totalPrice ? transformMoney(node.lineItem.totalPrice) : null,
    variantTitle: node.lineItem.variantTitle ?? null,
  };
}

export function transformReturnSummary(summary: ShopifyReturnSummary): ReturnSummary {
  return {
    createdAt: summary.createdAt ?? null,
    id: summary.id,
    name: summary.name,
    status: summary.status as ReturnStatus,
    updatedAt: summary.updatedAt ?? null,
  };
}

export function transformReturnableItem(
  item: ShopifyReturnableLineItem,
  deliveredAt: string | null,
): ReturnableItem {
  const lineItem = item.lineItem;
  return {
    availableQuantity: item.quantity,
    deliveredAt,
    id: lineItem.id,
    image: transformImage(lineItem.image),
    options: transformOptions(lineItem.variantOptions),
    productId: lineItem.productId ?? null,
    reasons: transformReasons(lineItem.suggestedReturnReasonDefinitions?.nodes),
    title: lineItem.presentmentTitle ?? lineItem.name,
    totalPrice: lineItem.totalPrice ? transformMoney(lineItem.totalPrice) : null,
    variantId: lineItem.variantId ?? null,
    variantTitle: lineItem.variantTitle ?? null,
  };
}

export function transformReturn(request: ShopifyReturn): ReturnRequest {
  const reverseDelivery = request.reverseDeliveries.nodes[0];
  const tracking = reverseDelivery?.deliverable?.tracking;

  return {
    createdAt: request.createdAt ?? "",
    declineNote: null,
    exchangeItems: request.exchangeLineItems.nodes.map((item) => ({
      id: item.id,
      image: transformImage(item.image),
      options: [],
      quantity: item.quantity,
      title: item.title ?? "",
      totalPrice: null,
      variantTitle: item.variantTitle ?? null,
    })),
    id: request.id,
    items: request.returnLineItems.nodes.map(transformReturnLine),
    name: request.name,
    reverseDelivery: reverseDelivery
      ? {
          labelUrl: reverseDelivery.deliverable?.label?.publicFileUrl ?? null,
          tracking: tracking
            ? {
                carrierName: tracking.carrierName ?? null,
                number: tracking.trackingNumber ?? null,
                url: tracking.trackingUrl ?? null,
              }
            : null,
        }
      : null,
    status: request.status as ReturnStatus,
    timeline: [],
    updatedAt: request.updatedAt ?? null,
  };
}

export function transformReturnEstimate(calculated: ShopifyCalculatedReturn): ReturnEstimate {
  const summary = calculated.financialSummary;
  const total = summary.returnTotalSet.presentmentMoney;

  return {
    currencyCode: total.currencyCode,
    restockingFee: transformReturnMoney(summary.restockingFeeSubtotalSet.presentmentMoney),
    returnShippingFee: transformReturnMoney(summary.returnShippingFeeSubtotalSet.presentmentMoney),
    subtotal: transformReturnMoney(summary.returnSubtotalSet.presentmentMoney),
    tax: transformReturnMoney(summary.returnTotalTaxSet.presentmentMoney),
    total: transformReturnMoney(total),
  };
}

function getDeliveredDatesByLineItem(order: {
  fulfillments: {
    nodes: Array<{
      events: { nodes: Array<{ happenedAt: string; status: string }> };
      fulfillmentLineItems: { nodes: Array<{ lineItem: { id: string } }> };
    }>;
  };
}): Record<string, string> {
  const dates: Record<string, string> = {};

  for (const fulfillment of order.fulfillments.nodes) {
    const deliveredAt = fulfillment.events.nodes
      .filter((event) => event.status === "DELIVERED")
      .map((event) => event.happenedAt)
      .sort()
      .at(-1);
    if (!deliveredAt) continue;

    for (const item of fulfillment.fulfillmentLineItems.nodes) {
      const current = dates[item.lineItem.id];
      if (!current || deliveredAt > current) dates[item.lineItem.id] = deliveredAt;
    }
  }

  return dates;
}

export function transformReturnContext({
  order,
  returnableItems,
}: {
  order: {
    fulfillments: {
      nodes: Array<{
        events: { nodes: Array<{ happenedAt: string; status: string }> };
        fulfillmentLineItems: { nodes: Array<{ lineItem: { id: string } }> };
      }>;
    };
    id: string;
    lineItems: {
      nodes: Array<{ id: string; totalPrice: { amount: string; currencyCode: string } | null }>;
    };
    name: string;
    number: number;
    returnInformation: {
      nonReturnableSummary: {
        nonReturnableReasons: string[];
      } | null;
      returnShippingMethodNote: string | null;
    };
    returns: { nodes: ShopifyReturnSummary[] };
    shippingAddress: { formatted: string[] } | null;
  };
  returnableItems: ShopifyReturnableLineItem[];
}): ReturnContext {
  const deliveredDates = getDeliveredDatesByLineItem(order);

  return {
    items: returnableItems.map((item) =>
      transformReturnableItem(item, deliveredDates[item.lineItem.id] ?? null),
    ),
    nonReturnableSummary: order.returnInformation.nonReturnableSummary
      ? {
          reasons: order.returnInformation.nonReturnableSummary.nonReturnableReasons,
        }
      : null,
    orderId: order.id,
    orderLineItems: order.lineItems.nodes.map((item) => ({
      id: item.id,
      totalPrice: item.totalPrice ? transformMoney(item.totalPrice) : null,
    })),
    orderName: order.name,
    orderNumber: order.number,
    returnShippingMethodNote: order.returnInformation.returnShippingMethodNote,
    returns: order.returns.nodes.map(transformReturnSummary),
    shippingAddressLines: order.shippingAddress?.formatted ?? [],
  };
}

export function transformReturnRequestDetail({
  estimate,
  order,
  request,
}: {
  estimate: ReturnEstimate | null;
  order: {
    id: string;
    name: string;
    number: number;
    shippingAddress: { formatted: string[] } | null;
  };
  request: ShopifyReturn;
}): ReturnRequestDetail {
  return {
    estimate,
    orderId: order.id,
    orderName: order.name,
    orderNumber: order.number,
    request: transformReturn(request),
    shippingAddressLines: order.shippingAddress?.formatted ?? [],
  };
}
